/**
 * StudyPilot AI - Automatic Study Plan Adjustment Service (Phase 6 Part B)
 *
 * Deterministic scheduling & prioritization engine:
 * 1. Preserves completed tasks on original dates.
 * 2. Preserves manually locked tasks on their designated dates.
 * 3. Identifies overdue, incomplete tasks and redistributes them into suitable future dates.
 * 4. Prioritizes weak topics diagnosed from quiz evaluations.
 * 5. Respects student availability (dailyStudyHours and availableDaysOfWeek).
 * 6. Enforces daily workload limits without overloading individual days.
 * 7. Adapts to upcoming exam dates and flags overload warnings if time is insufficient.
 */

const QuizEvaluation = require('../models/QuizEvaluation');
const Exam = require('../models/Exam');
const { computeMultiAttemptWeakTopics } = require('./evaluationService');

/**
 * Normalizes a date to YYYY-MM-DD string or Date at 00:00:00.000 local/UTC
 */
const toMidnight = (dateInput) => {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDateKey = (dateInput) => {
  const d = new Date(dateInput);
  return d.toISOString().slice(0, 10);
};

/**
 * Checks if a task topic matches any weak topic from quiz diagnostics.
 */
const isWeakTopicMatch = (taskTopic = '', weakTopics = []) => {
  if (!taskTopic || !Array.isArray(weakTopics) || weakTopics.length === 0) return false;
  const cleanTask = taskTopic.toLowerCase().trim();
  return weakTopics.some((wt) => {
    const cleanWeak = String(wt.topic || wt).toLowerCase().trim();
    return cleanTask.includes(cleanWeak) || cleanWeak.includes(cleanTask);
  });
};

/**
 * Checks if a task topic matches any strong topic.
 */
const isStrongTopicMatch = (taskTopic = '', strongTopics = []) => {
  if (!taskTopic || !Array.isArray(strongTopics) || strongTopics.length === 0) return false;
  const cleanTask = taskTopic.toLowerCase().trim();
  return strongTopics.some((st) => {
    const cleanStrong = String(st.topic || st).toLowerCase().trim();
    return cleanTask.includes(cleanStrong) || cleanStrong.includes(cleanTask);
  });
};

/**
 * Main Deterministic Automatic Study Plan Adjustment Engine
 *
 * @param {Object} plan - Mongoose StudyPlan document
 * @param {Object} options - Optional overrides:
 *   - dailyStudyHours: Number
 *   - availableDaysOfWeek: Array<Number> (0=Sun, 6=Sat)
 *   - reason: String
 *   - dryRun: Boolean (if true, returns adjusted schedule without saving)
 * @returns {Promise<Object>} Adjustment results including updated plan and change summary
 */
const adjustStudyPlan = async (plan, options = {}) => {
  if (!plan) {
    throw new Error('StudyPlan document is required for adjustment.');
  }

  // 1. Resolve Exam and Subject
  const exam = await Exam.findOne({ _id: plan.examId, userId: plan.userId });
  if (!exam) {
    throw new Error('Associated examination record not found for this study plan.');
  }

  const today = toMidnight(new Date());
  const examDate = toMidnight(exam.examDate);

  if (examDate < today) {
    throw new Error('Examination date is in the past. Automatic adjustment cannot plan for expired exams.');
  }

  // Update plan end date if exam date was moved in Exam Planner
  plan.endDate = examDate;

  // 2. Resolve Student Availability Preferences
  const dailyStudyHours = Number(options.dailyStudyHours || plan.dailyStudyHours || 2);
  const availableDaysOfWeek = Array.isArray(options.availableDaysOfWeek) && options.availableDaysOfWeek.length > 0
    ? options.availableDaysOfWeek.map(Number)
    : (plan.availableDaysOfWeek && plan.availableDaysOfWeek.length > 0
        ? plan.availableDaysOfWeek.map(Number)
        : [0, 1, 2, 3, 4, 5, 6]);

  const dailyCapacityMinutes = Math.max(30, Math.round(dailyStudyHours * 60));
  const adjustmentReason = options.reason || 'Automatic schedule optimization';

  // 3. Retrieve Diagnostic Weak Topics from Quiz Evaluations
  let weakTopicsList = [];
  let strongTopicsList = [];
  if (plan.subjectId || exam.subjectId) {
    const subjectId = plan.subjectId || exam.subjectId;
    const evaluations = await QuizEvaluation.find({
      userId: plan.userId,
      subjectId: subjectId,
    });
    if (evaluations.length > 0) {
      const analysis = computeMultiAttemptWeakTopics(evaluations);
      weakTopicsList = analysis?.weakTopics ? [...analysis.weakTopics] : [];
      strongTopicsList = analysis?.strongTopics ? [...analysis.strongTopics] : [];

      // Also gather any explicitly flagged weak topics on the evaluation documents
      evaluations.forEach((ev) => {
        if (Array.isArray(ev.weakTopics)) {
          ev.weakTopics.forEach((wt) => {
            if (wt && !weakTopicsList.includes(wt)) {
              weakTopicsList.push(wt);
            }
          });
        }
      });
    }
  }

  // 4. Categorize Existing Tasks
  // Preserved Map: dateKey -> { date: Date, tasks: Array }
  const preservedDaysMap = new Map();
  const movableTasks = [];

  let completedCount = 0;
  let lockedCount = 0;
  let overdueCount = 0;
  let weakTopicsBoostedCount = 0;
  const changeDetails = [];

  // Iterate through existing schedule
  for (const day of plan.schedule || []) {
    const dayDate = toMidnight(day.date);
    const dayKey = formatDateKey(dayDate);
    const isPast = dayDate < today;

    if (!preservedDaysMap.has(dayKey)) {
      preservedDaysMap.set(dayKey, {
        date: dayDate,
        tasks: [],
      });
    }

    const dayRecord = preservedDaysMap.get(dayKey);

    for (const rawTask of day.tasks || []) {
      const task = rawTask.toObject ? rawTask.toObject() : { ...rawTask };

      // Rule A: Completed tasks are strictly preserved on their date
      if (task.completed) {
        completedCount++;
        dayRecord.tasks.push(task);
        continue;
      }

      // Rule B: Manually locked pending tasks are strictly preserved on their date
      if (task.isLocked) {
        lockedCount++;
        dayRecord.tasks.push(task);
        continue;
      }

      // Rule C: Overdue pending tasks (past dates) MUST be rescheduled
      if (isPast) {
        overdueCount++;
        task.originalDate = task.originalDate || dayDate;
        task.rescheduled = true;
        task.rescheduleReason = task.rescheduleReason || 'Overdue catch-up';
        movableTasks.push({
          task,
          wasOverdue: true,
          originalDate: dayDate,
        });
        continue;
      }

      // Rule D: Future unlocked pending tasks can be re-balanced if needed
      movableTasks.push({
        task,
        wasOverdue: false,
        originalDate: dayDate,
      });
    }
  }

  // 5. Prioritize Movable Tasks (Weak Topics first, then Overdue, then Existing Priority)
  for (const item of movableTasks) {
    const task = item.task;
    const isWeak = isWeakTopicMatch(task.topic, weakTopicsList);
    const isStrong = isStrongTopicMatch(task.topic, strongTopicsList);

    if (isWeak && task.priority !== 'high') {
      task.priority = 'high';
      weakTopicsBoostedCount++;
      task.rescheduled = true;
      task.rescheduleReason = task.rescheduleReason
        ? `${task.rescheduleReason} + Weak-topic prioritized`
        : 'Prioritized due to weak quiz diagnostic';
      changeDetails.push(`Boosted priority to High for weak topic: "${task.topic}"`);
    } else if (isStrong && task.priority === 'high' && !item.wasOverdue) {
      // Avoid excessive repetition/high load for topics already mastered
      task.priority = 'medium';
    }
  }

  // Sort movable tasks so high-priority & weak topics are placed first, then overdue
  const priorityWeights = { high: 3, medium: 2, low: 1 };
  movableTasks.sort((a, b) => {
    const weightA = priorityWeights[a.task.priority] || 2;
    const weightB = priorityWeights[b.task.priority] || 2;
    if (weightA !== weightB) return weightB - weightA; // higher priority first
    if (a.wasOverdue && !b.wasOverdue) return -1; // overdue first
    if (!a.wasOverdue && b.wasOverdue) return 1;
    return (b.task.duration || 0) - (a.task.duration || 0); // longer tasks first
  });

  // 6. Build Available Future Date Windows
  // Starting from today up to examDate
  const availableFutureDates = [];
  const curr = new Date(today);

  while (curr <= examDate) {
    const dayOfWeek = curr.getDay(); // 0 = Sun, 6 = Sat
    if (availableDaysOfWeek.includes(dayOfWeek)) {
      availableFutureDates.push(new Date(curr));
    }
    curr.setDate(curr.getDate() + 1);
  }

  // If no available days found due to restrictive settings, fallback to all days
  if (availableFutureDates.length === 0) {
    const fallbackCurr = new Date(today);
    while (fallbackCurr <= examDate) {
      availableFutureDates.push(new Date(fallbackCurr));
      fallbackCurr.setDate(fallbackCurr.getDate() + 1);
    }
    changeDetails.push('Note: Extended available study days to include all calendar days before exam to fit schedule.');
  }

  // Ensure all future available dates exist in preservedDaysMap
  for (const fDate of availableFutureDates) {
    const key = formatDateKey(fDate);
    if (!preservedDaysMap.has(key)) {
      preservedDaysMap.set(key, {
        date: fDate,
        tasks: [],
      });
    }
  }

  // 7. Calculate Daily Capacities and Distribute Movable Tasks
  // Pre-calculate already used minutes on each future date by completed or locked tasks
  const dailyUsedMinutes = new Map();
  for (const fDate of availableFutureDates) {
    const key = formatDateKey(fDate);
    const dayRecord = preservedDaysMap.get(key);
    const used = (dayRecord?.tasks || []).reduce((sum, t) => sum + (Number(t.duration) || 0), 0);
    dailyUsedMinutes.set(key, used);
  }

  // Total capacity available
  let totalRemainingCapacity = 0;
  for (const fDate of availableFutureDates) {
    const key = formatDateKey(fDate);
    const used = dailyUsedMinutes.get(key) || 0;
    totalRemainingCapacity += Math.max(0, dailyCapacityMinutes - used);
  }

  const totalMovableMinutes = movableTasks.reduce((sum, item) => sum + (Number(item.task.duration) || 0), 0);
  const hasOverloadWarning = totalMovableMinutes > totalRemainingCapacity;

  if (hasOverloadWarning) {
    const shortfallHours = ((totalMovableMinutes - totalRemainingCapacity) / 60).toFixed(1);
    changeDetails.push(
      `Capacity Warning: Total pending workload (${Math.round(totalMovableMinutes / 60)}h) exceeds available study capacity by ~${shortfallHours}h before the examination. High-priority and weak topics were allocated first.`
    );
  }

  // Distribute tasks across available days
  let tasksRescheduledCount = 0;
  let dateIndex = 0;

  for (const item of movableTasks) {
    const task = item.task;
    const taskDuration = Number(task.duration) || 30;
    let placed = false;

    // Try finding a day that has enough remaining capacity
    for (let attempts = 0; attempts < availableFutureDates.length; attempts++) {
      const candidateDate = availableFutureDates[(dateIndex + attempts) % availableFutureDates.length];
      const candidateKey = formatDateKey(candidateDate);
      const used = dailyUsedMinutes.get(candidateKey) || 0;

      if (used + taskDuration <= dailyCapacityMinutes) {
        // Fits on candidateDate
        const dayRecord = preservedDaysMap.get(candidateKey);
        
        // Track whether date actually changed
        const originalDateKey = formatDateKey(item.originalDate);
        if (originalDateKey !== candidateKey) {
          task.originalDate = task.originalDate || item.originalDate;
          task.rescheduled = true;
          task.rescheduleReason = task.rescheduleReason || 'Redistributed to balance daily study hours';
          tasksRescheduledCount++;
          changeDetails.push(`Moved "${task.topic}" from ${originalDateKey} to ${candidateKey}`);
        }

        dayRecord.tasks.push(task);
        dailyUsedMinutes.set(candidateKey, used + taskDuration);
        placed = true;
        dateIndex = (dateIndex + attempts) % availableFutureDates.length;
        break;
      }
    }

    // If it doesn't fit strictly within capacity limits on any single day,
    // place it on the day with the lowest currently scheduled workload
    if (!placed) {
      let lowestDayKey = formatDateKey(availableFutureDates[0]);
      let lowestMinutes = Infinity;

      for (const fDate of availableFutureDates) {
        const key = formatDateKey(fDate);
        const used = dailyUsedMinutes.get(key) || 0;
        if (used < lowestMinutes) {
          lowestMinutes = used;
          lowestDayKey = key;
        }
      }

      const dayRecord = preservedDaysMap.get(lowestDayKey);
      const originalDateKey = formatDateKey(item.originalDate);
      if (originalDateKey !== lowestDayKey) {
        task.originalDate = task.originalDate || item.originalDate;
        task.rescheduled = true;
        task.rescheduleReason = task.rescheduleReason || 'Distributed into available capacity window';
        tasksRescheduledCount++;
        changeDetails.push(`Moved "${task.topic}" to ${lowestDayKey}`);
      }

      dayRecord.tasks.push(task);
      dailyUsedMinutes.set(lowestDayKey, (dailyUsedMinutes.get(lowestDayKey) || 0) + taskDuration);
    }
  }

  // 8. Reconstruct Clean Chronological Schedule
  // Filter out empty past days that have no tasks
  const updatedSchedule = [];
  const allDaysList = Array.from(preservedDaysMap.values());
  allDaysList.sort((a, b) => new Date(a.date) - new Date(b.date));

  for (const day of allDaysList) {
    if (day.tasks.length > 0 || toMidnight(day.date) >= today) {
      // Sort tasks within each day (high priority first, then medium, then low)
      day.tasks.sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        const wA = priorityWeights[a.priority] || 2;
        const wB = priorityWeights[b.priority] || 2;
        return wB - wA;
      });

      updatedSchedule.push({
        date: day.date,
        tasks: day.tasks,
      });
    }
  }

  // 9. Recompute Plan Status & Progress
  const allTasks = updatedSchedule.flatMap((day) => day.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const isAllCompleted = totalTasks > 0 && completedTasks === totalTasks;

  // 10. Generate Clear Human Summary
  let summaryText = '';
  if (tasksRescheduledCount === 0 && weakTopicsBoostedCount === 0 && !hasOverloadWarning) {
    summaryText = 'Schedule is already on track and balanced. No major adjustments were needed.';
  } else {
    const parts = [];
    if (overdueCount > 0) parts.push(`${overdueCount} overdue task(s) brought forward`);
    if (tasksRescheduledCount > 0) parts.push(`${tasksRescheduledCount} task(s) re-balanced across upcoming days`);
    if (weakTopicsBoostedCount > 0) parts.push(`${weakTopicsBoostedCount} weak topic(s) prioritized`);
    if (hasOverloadWarning) parts.push('workload warning noted');
    summaryText = `Automatic adjustment completed: ${parts.join(', ')}.`;
  }

  // 11. Create Adjustment History Entry
  const historyEntry = {
    adjustedAt: new Date(),
    reason: adjustmentReason,
    tasksRescheduled: tasksRescheduledCount,
    weakTopicsBoosted: weakTopicsBoostedCount,
    summary: summaryText,
    details: changeDetails.slice(0, 30), // keep top 30 detailed log lines
    hasOverloadWarning,
  };

  // 12. Apply Updates to Plan Document
  plan.schedule = updatedSchedule;
  plan.dailyStudyHours = dailyStudyHours;
  plan.availableDaysOfWeek = availableDaysOfWeek;
  plan.status = isAllCompleted ? 'completed' : 'active';
  plan.lastAdjustedAt = new Date();

  if (!Array.isArray(plan.adjustmentHistory)) {
    plan.adjustmentHistory = [];
  }
  plan.adjustmentHistory.unshift(historyEntry);

  // Keep max 20 history entries
  if (plan.adjustmentHistory.length > 20) {
    plan.adjustmentHistory = plan.adjustmentHistory.slice(0, 20);
  }

  // Save if not a dry run preview
  if (!options.dryRun) {
    await plan.save();
  }

  return {
    success: true,
    plan,
    adjustmentSummary: {
      summary: summaryText,
      tasksRescheduled: tasksRescheduledCount,
      overdueTasksRescheduled: overdueCount,
      weakTopicsBoosted: weakTopicsBoostedCount,
      completedPreserved: completedCount,
      lockedPreserved: lockedCount,
      hasOverloadWarning,
      details: changeDetails,
      adjustedAt: historyEntry.adjustedAt,
    },
  };
};

module.exports = {
  adjustStudyPlan,
  isWeakTopicMatch,
  isStrongTopicMatch,
};
