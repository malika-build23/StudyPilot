
const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const StudyPlan = require('../models/StudyPlan');
const QuizEvaluation = require('../models/QuizEvaluation');
const { generateStudySchedule } = require('../services/geminiService');
const { computeMultiAttemptWeakTopics } = require('../services/evaluationService');
const { adjustStudyPlan } = require('../services/studyPlanAdjustmentService');

const getUserId = (req) => req.user._id;

const buildSchedule = async (exam) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const examDate = new Date(exam.examDate);
  examDate.setHours(0, 0, 0, 0);

  if (examDate <= today) {
    throw new Error('The exam date must be in the future to generate a study plan.');
  }

  let weakTopics = [];
  if (exam.subjectId) {
    const evaluations = await QuizEvaluation.find({
      userId: exam.userId,
      subjectId: exam.subjectId,
    });
    const weakTopicAnalysis = computeMultiAttemptWeakTopics(evaluations);
    weakTopics = weakTopicAnalysis?.weakTopics || [];
  }

  const schedule = await generateStudySchedule({
    examName: exam.examName,
    startDate: today.toISOString().slice(0, 10),
    examDate: examDate.toISOString().slice(0, 10),
    syllabusTopics: exam.syllabusTopics,
    dailyAvailableHours: exam.dailyAvailableHours,
    weakTopics,
  });

  if (!Array.isArray(schedule) || schedule.length === 0) {
    throw new Error('The AI did not return a valid study schedule. Please try again.');
  }

  return {
    startDate: today,
    endDate: examDate,
    dailyStudyHours: exam.dailyAvailableHours,
    schedule,
  };
};

const generatePlan = async (req, res) => {
  try {
    const { examId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid exam ID is required.',
      });
    }

    const exam = await Exam.findOne({
      _id: examId,
      userId: getUserId(req),
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.',
      });
    }

    const existingPlan = await StudyPlan.findOne({
      examId: exam._id,
      userId: getUserId(req),
    });

    if (existingPlan) {
      return res.status(409).json({
        success: false,
        message: 'A study plan already exists for this exam. Use the regenerate endpoint to update it.',
        data: { planId: existingPlan._id },
      });
    }

    const generated = await buildSchedule(exam);

    const plan = await StudyPlan.create({
      userId: getUserId(req),
      examId: exam._id,
      subjectId: exam.subjectId,
      ...generated,
    });

    const populatedPlan = await StudyPlan.findById(plan._id)
      .populate('subjectId', 'subjectName');

    return res.status(201).json({
      success: true,
      message: 'Study plan generated successfully.',
      data: populatedPlan,
    });
  } catch (error) {
    console.error('[Study Plan Generation]', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate study plan.',
    });
  }
};

const getPlanByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID.',
      });
    }

    const plan = await StudyPlan.findOne({
      examId,
      userId: getUserId(req),
    }).populate('subjectId', 'subjectName');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found.',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let overdueCount = 0;
    for (const day of plan.schedule || []) {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      if (dayDate < today) {
        for (const t of day.tasks || []) {
          if (!t.completed && !t.isLocked) overdueCount++;
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: plan,
      meta: {
        hasOverdueTasks: overdueCount > 0,
        overdueCount,
      },
    });
  } catch (error) {
    console.error('[Get Study Plan]', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch study plan.',
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { planId, taskId } = req.params;
    const { completed } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(planId) ||
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan or task ID.',
      });
    }

    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Completed must be true or false.',
      });
    }

    const plan = await StudyPlan.findOne({
      _id: planId,
      userId: getUserId(req),
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found.',
      });
    }

    let taskFound = false;

    for (const day of plan.schedule) {
      const task = day.tasks.id(taskId);

      if (task) {
        task.completed = completed;
        taskFound = true;
        break;
      }
    }

    if (!taskFound) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const allTasks = plan.schedule.flatMap((day) => day.tasks);
    plan.status =
      allTasks.length > 0 && allTasks.every((task) => task.completed)
        ? 'completed'
        : 'active';

    await plan.save();

    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully.',
      data: plan,
    });
  } catch (error) {
    console.error('[Update Study Task]', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update task status.',
    });
  }
};

const regeneratePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study plan ID.',
      });
    }

    const existingPlan = await StudyPlan.findOne({
      _id: planId,
      userId: getUserId(req),
    });

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found.',
      });
    }

    const exam = await Exam.findOne({
      _id: existingPlan.examId,
      userId: getUserId(req),
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Associated exam not found.',
      });
    }

    const generated = await buildSchedule(exam);

    const completedTasks = existingPlan.schedule.flatMap((day) =>
      day.tasks
        .filter((task) => task.completed)
        .map((task) => ({
          date: day.date,
          task: task.toObject(),
        }))
    );

    const newSchedule = generated.schedule.map((day) => ({
      date: day.date,
      tasks: day.tasks.map((task) => ({
        ...task.toObject?.() || task,
      })),
    }));

    for (const completedItem of completedTasks) {
      const existingDay = newSchedule.find(
        (day) =>
          new Date(day.date).toISOString().slice(0, 10) ===
          new Date(completedItem.date).toISOString().slice(0, 10)
      );

      if (existingDay) {
        const duplicate = existingDay.tasks.some(
          (task) =>
            task.topic === completedItem.task.topic &&
            task.taskType === completedItem.task.taskType &&
            task.completed
        );

        if (!duplicate) {
          existingDay.tasks.push(completedItem.task);
        }
      } else {
        newSchedule.push({
          date: completedItem.date,
          tasks: [completedItem.task],
        });
      }
    }

    newSchedule.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    existingPlan.startDate = generated.startDate;
    existingPlan.endDate = generated.endDate;
    existingPlan.dailyStudyHours = generated.dailyStudyHours;
    existingPlan.schedule = newSchedule;

    const allTasks = newSchedule.flatMap((day) => day.tasks);
    existingPlan.status =
      allTasks.length > 0 && allTasks.every((task) => task.completed)
        ? 'completed'
        : 'active';

    await existingPlan.save();

    return res.status(200).json({
      success: true,
      message: 'Study plan regenerated. Previously completed tasks were preserved.',
      data: existingPlan,
    });
  } catch (error) {
    console.error('[Regenerate Study Plan]', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to regenerate study plan.',
    });
  }
};

/**
 * Phase 6 Part B: Automatic Study Plan Adjustment
 * Triggers deterministic rescheduling, weak-topic prioritization, and availability balancing.
 */
const adjustPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { dailyStudyHours, availableDaysOfWeek, reason, dryRun } = req.body;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study plan ID.',
      });
    }

    const plan = await StudyPlan.findOne({
      _id: planId,
      userId: getUserId(req),
    }).populate('subjectId', 'subjectName');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found or unauthorized.',
      });
    }

    const result = await adjustStudyPlan(plan, {
      dailyStudyHours,
      availableDaysOfWeek,
      reason: reason || 'Manual user-triggered adjustment',
      dryRun: Boolean(dryRun),
    });

    return res.status(200).json({
      success: true,
      message: result.adjustmentSummary.summary,
      data: result.plan,
      summary: result.adjustmentSummary,
    });
  } catch (error) {
    console.error('[Adjust Study Plan]', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to adjust study plan.',
    });
  }
};

/**
 * Phase 6 Part B: Lock or Unlock an individual Study Task
 * Locked tasks are never moved during automatic plan adjustments.
 */
const toggleTaskLock = async (req, res) => {
  try {
    const { planId, taskId } = req.params;
    const { isLocked } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(planId) ||
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan or task ID.',
      });
    }

    const plan = await StudyPlan.findOne({
      _id: planId,
      userId: getUserId(req),
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found or unauthorized.',
      });
    }

    let targetTask = null;
    let targetDay = null;

    for (const day of plan.schedule) {
      const task = day.tasks.id(taskId);
      if (task) {
        targetTask = task;
        targetDay = day;
        task.isLocked = typeof isLocked === 'boolean' ? isLocked : !task.isLocked;
        break;
      }
    }

    if (!targetTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in study plan schedule.',
      });
    }

    await plan.save();

    return res.status(200).json({
      success: true,
      message: `Task "${targetTask.topic}" ${targetTask.isLocked ? 'locked to date' : 'unlocked'}.`,
      data: plan,
      task: targetTask,
      date: targetDay.date,
    });
  } catch (error) {
    console.error('[Toggle Task Lock]', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update task lock state.',
    });
  }
};

/**
 * Phase 6 Part B: Update Student Availability & Auto-Adjustment Preferences
 */
const updatePlanPreferences = async (req, res) => {
  try {
    const { planId } = req.params;
    const { autoAdjustEnabled, dailyStudyHours, availableDaysOfWeek, triggerImmediateAdjust } = req.body;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study plan ID.',
      });
    }

    const plan = await StudyPlan.findOne({
      _id: planId,
      userId: getUserId(req),
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found.',
      });
    }

    if (typeof autoAdjustEnabled === 'boolean') {
      plan.autoAdjustEnabled = autoAdjustEnabled;
    }

    if (dailyStudyHours !== undefined) {
      const hours = Number(dailyStudyHours);
      if (hours >= 0.5 && hours <= 16) {
        plan.dailyStudyHours = hours;
      }
    }

    if (Array.isArray(availableDaysOfWeek) && availableDaysOfWeek.length > 0) {
      plan.availableDaysOfWeek = availableDaysOfWeek.map(Number);
    }

    let adjustmentSummary = null;
    if (triggerImmediateAdjust || plan.autoAdjustEnabled) {
      const result = await adjustStudyPlan(plan, {
        dailyStudyHours: plan.dailyStudyHours,
        availableDaysOfWeek: plan.availableDaysOfWeek,
        reason: 'Preferences & availability update',
      });
      adjustmentSummary = result.adjustmentSummary;
    } else {
      await plan.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Plan preferences updated successfully.',
      data: plan,
      summary: adjustmentSummary,
    });
  } catch (error) {
    console.error('[Update Plan Preferences]', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update plan preferences.',
    });
  }
};

/**
 * Phase 6 Part B: Retrieve Study Plan Adjustment History
 */
const getAdjustmentHistory = async (req, res) => {
  try {
    const { planId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study plan ID.',
      });
    }

    const plan = await StudyPlan.findOne(
      { _id: planId, userId: getUserId(req) },
      { adjustmentHistory: 1, lastAdjustedAt: 1, autoAdjustEnabled: 1 }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        autoAdjustEnabled: plan.autoAdjustEnabled,
        lastAdjustedAt: plan.lastAdjustedAt,
        history: plan.adjustmentHistory || [],
      },
    });
  } catch (error) {
    console.error('[Get Adjustment History]', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch adjustment history.',
    });
  }
};

module.exports = {
  generatePlan,
  getPlanByExam,
  updateTaskStatus,
  regeneratePlan,
  adjustPlan,
  toggleTaskLock,
  updatePlanPreferences,
  getAdjustmentHistory,
};
