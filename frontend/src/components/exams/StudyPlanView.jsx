import { useState, useMemo } from 'react';
import MathRenderer from '../common/MathRenderer';
import { studyPlansAPI } from '../../services/api';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Filter,
  CheckCheck,
  AlertCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
  Award,
  Lock,
  Unlock,
  Sliders,
  History,
  AlertTriangle,
  ArrowRight,
  X,
  Info,
  Flame,
  Check,
  Wand2,
  RefreshCw,
} from 'lucide-react';

const TASK_TYPE_STYLES = {
  study: {
    label: 'Study',
    badge: 'bg-[#FAF8F5] text-[#2D4354] border-[#2D4354]/30',
    dot: 'bg-[#2D4354]',
  },
  revision: {
    label: 'Revision',
    badge: 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]',
    dot: 'bg-[#9E6752]',
  },
  practice: {
    label: 'Practice',
    badge: 'bg-[#F1F0ED] text-[#73766A] border-slate-300',
    dot: 'bg-[#73766A]',
  },
  buffer: {
    label: 'Buffer Time',
    badge: 'bg-[#FFF7EC] text-[#20212B] border-[#FED7A5]',
    dot: 'bg-[#FED7A5]',
  },
};

const PRIORITY_BADGES = {
  high: 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]',
  medium: 'bg-[#FAF8F5] text-[#73766A] border-slate-200',
  low: 'bg-[#FAF8F5] text-[#77756F] border-slate-200',
};

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', short: 'S' },
  { id: 1, label: 'Mon', short: 'M' },
  { id: 2, label: 'Tue', short: 'T' },
  { id: 3, label: 'Wed', short: 'W' },
  { id: 4, label: 'Thu', short: 'T' },
  { id: 5, label: 'Fri', short: 'F' },
  { id: 6, label: 'Sat', short: 'S' },
];

const StudyPlanView = ({
  plan,
  exam,
  onTaskToggle,
  onRegenerate,
  isRegenerating = false,
  onPlanUpdate,
}) => {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'pending' | 'completed' | 'locked'
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [lockLoadingTaskId, setLockLoadingTaskId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Preference form states
  const [prefDailyHours, setPrefDailyHours] = useState(plan?.dailyStudyHours || 2);
  const [prefDays, setPrefDays] = useState(
    Array.isArray(plan?.availableDaysOfWeek) && plan.availableDaysOfWeek.length > 0
      ? plan.availableDaysOfWeek
      : [0, 1, 2, 3, 4, 5, 6]
  );
  const [prefAutoAdjust, setPrefAutoAdjust] = useState(
    plan?.autoAdjustEnabled !== undefined ? plan.autoAdjustEnabled : true
  );

  // Today in YYYY-MM-DD
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = today.toISOString().slice(0, 10);

  // Flattened tasks metrics & overdue detection
  const {
    totalTasks,
    completedTasks,
    percentComplete,
    totalMinutes,
    overdueTasksCount,
    lockedTasksCount,
    rescheduledTasksCount,
  } = useMemo(() => {
    if (!plan || !Array.isArray(plan.schedule)) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        percentComplete: 0,
        totalMinutes: 0,
        overdueTasksCount: 0,
        lockedTasksCount: 0,
        rescheduledTasksCount: 0,
      };
    }

    let total = 0;
    let completed = 0;
    let minutes = 0;
    let overdue = 0;
    let locked = 0;
    let rescheduled = 0;

    plan.schedule.forEach((day) => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      const isPast = dayDate < today;

      day.tasks.forEach((t) => {
        total++;
        if (t.completed) completed++;
        if (t.isLocked) locked++;
        if (t.rescheduled) rescheduled++;
        if (isPast && !t.completed && !t.isLocked) overdue++;
        minutes += Number(t.duration) || 0;
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalTasks: total,
      completedTasks: completed,
      percentComplete: percent,
      totalMinutes: minutes,
      overdueTasksCount: overdue,
      lockedTasksCount: locked,
      rescheduledTasksCount: rescheduled,
    };
  }, [plan, today]);

  // Handle Trigger Plan Adjustment
  const handleTriggerAdjustment = async (customOptions = {}) => {
    if (!plan) return;
    try {
      setIsAdjusting(true);
      setActionMessage(null);

      const res = await studyPlansAPI.adjust(plan._id, {
        dailyStudyHours: customOptions.dailyStudyHours || plan.dailyStudyHours,
        availableDaysOfWeek: customOptions.availableDaysOfWeek || plan.availableDaysOfWeek,
        reason: customOptions.reason || 'Manual smart adjustment',
      });

      if (res.data?.success) {
        if (onPlanUpdate) onPlanUpdate(res.data.data);
        setActionMessage({
          type: 'success',
          text: res.data.message || 'Study plan successfully re-balanced!',
          summary: res.data.summary,
        });
      }
    } catch (err) {
      console.error('Error adjusting plan:', err);
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to adjust study plan.',
      });
    } finally {
      setIsAdjusting(false);
    }
  };

  // Handle Toggle Task Lock
  const handleToggleTaskLock = async (taskId, currentLockedState) => {
    if (!plan) return;
    try {
      setLockLoadingTaskId(taskId);
      const newLocked = !currentLockedState;

      // Optimistic update
      if (onPlanUpdate) {
        onPlanUpdate({
          ...plan,
          schedule: plan.schedule.map((day) => ({
            ...day,
            tasks: day.tasks.map((task) =>
              task._id === taskId ? { ...task, isLocked: newLocked } : task
            ),
          })),
        });
      }

      const res = await studyPlansAPI.toggleTaskLock(plan._id, taskId, newLocked);
      if (res.data?.success && onPlanUpdate) {
        onPlanUpdate(res.data.data);
      }
    } catch (err) {
      console.error('Error toggling task lock:', err);
      // Revert optimistic update
      if (onPlanUpdate) {
        onPlanUpdate({
          ...plan,
          schedule: plan.schedule.map((day) => ({
            ...day,
            tasks: day.tasks.map((task) =>
              task._id === taskId ? { ...task, isLocked: currentLockedState } : task
            ),
          })),
        });
      }
    } finally {
      setLockLoadingTaskId(null);
    }
  };

  // Handle Toggle Auto-Adjust Preference
  const handleToggleAutoAdjust = async () => {
    if (!plan) return;
    const newSetting = !plan.autoAdjustEnabled;
    try {
      const res = await studyPlansAPI.updatePreferences(plan._id, {
        autoAdjustEnabled: newSetting,
      });
      if (res.data?.success && onPlanUpdate) {
        onPlanUpdate(res.data.data);
      }
    } catch (err) {
      console.error('Error toggling auto adjust:', err);
    }
  };

  // Save Preferences from Modal
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    if (!plan) return;
    try {
      setIsAdjusting(true);
      const res = await studyPlansAPI.updatePreferences(plan._id, {
        dailyStudyHours: Number(prefDailyHours),
        availableDaysOfWeek: prefDays,
        autoAdjustEnabled: prefAutoAdjust,
        triggerImmediateAdjust: true,
      });

      if (res.data?.success) {
        if (onPlanUpdate) onPlanUpdate(res.data.data);
        setShowPreferencesModal(false);
        setActionMessage({
          type: 'success',
          text: 'Preferences saved and study schedule re-balanced!',
          summary: res.data.summary,
        });
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setIsAdjusting(false);
    }
  };

  const toggleDayPreference = (dayId) => {
    if (prefDays.includes(dayId)) {
      if (prefDays.length === 1) return; // Keep at least 1 day
      setPrefDays(prefDays.filter((d) => d !== dayId));
    } else {
      setPrefDays([...prefDays, dayId].sort());
    }
  };

  const latestHistory = plan?.adjustmentHistory?.[0];

  if (!plan) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Study Plan Header & Overall Progress Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-sm relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Adaptive Study Plan</span>
              <span className="text-white/40">•</span>
              <button
                type="button"
                onClick={handleToggleAutoAdjust}
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                title="Toggle automatic schedule adjustments"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    plan.autoAdjustEnabled ? 'bg-emerald-400' : 'bg-slate-400'
                  }`}
                />
                <span>Auto-Adjust {plan.autoAdjustEnabled ? 'On' : 'Off'}</span>
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {exam?.examName || 'Upcoming Exam'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
              <span>{exam?.subjectId?.subjectName || 'Academic Course'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                Exam on{' '}
                {new Date(exam.examDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-300" />
                {plan.dailyStudyHours || exam.dailyAvailableHours}h daily target
              </span>
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Smart Adjust Button */}
            <button
              onClick={() => handleTriggerAdjustment({ reason: 'Student triggered schedule re-balance' })}
              disabled={isAdjusting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-60"
              title="Automatically redistribute overdue tasks & prioritize weak topics"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isAdjusting ? 'animate-spin' : ''}`} />
              <span>{isAdjusting ? 'Adjusting...' : 'Auto-Adjust'}</span>
            </button>

            {/* Availability Preferences Button */}
            <button
              onClick={() => {
                setPrefDailyHours(plan.dailyStudyHours || 2);
                setPrefDays(plan.availableDaysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
                setPrefAutoAdjust(plan.autoAdjustEnabled !== undefined ? plan.autoAdjustEnabled : true);
                setShowPreferencesModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs transition-all"
              title="Set available study hours & study days"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Availability</span>
            </button>

            {/* Adjustment History Button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs transition-all"
              title="View plan adjustment history and change log"
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>

            {/* Existing Full Regenerate Action */}
            <button
              onClick={() => setShowRegenConfirm(true)}
              disabled={isRegenerating}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs transition-all disabled:opacity-60"
              title="Regenerate full syllabus from scratch with Gemini AI"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Key Plan Stats */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              Completion Rate
            </p>
            <p className="text-xl font-extrabold text-white mt-0.5">{percentComplete}%</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              Tasks Finished
            </p>
            <p className="text-xl font-extrabold text-white mt-0.5">
              {completedTasks} / {totalTasks}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              Total Preparation
            </p>
            <p className="text-xl font-extrabold text-white mt-0.5">
              {Math.round(totalMinutes / 60)} hrs
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              Locked Tasks
            </p>
            <p className="text-xl font-extrabold text-white mt-0.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-300" />
              <span>{lockedTasksCount}</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              Rescheduled
            </p>
            <p className="text-xl font-extrabold text-indigo-300 mt-0.5">
              {rescheduledTasksCount}
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="relative z-10 mt-4 w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-indigo-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* 2. AUTOMATIC ADJUSTMENT NOTIFICATIONS & OVERDUE BANNER */}
      {/* A. Overdue Tasks Alert Banner */}
      {overdueTasksCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                {overdueTasksCount} Incomplete Topic{overdueTasksCount > 1 ? 's' : ''} Need Rescheduling
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Some planned study dates have passed. The automatic adjustment engine can bring these topics forward into upcoming available days without overloading your daily hours.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleTriggerAdjustment({ reason: 'Catch-up overdue tasks' })}
            disabled={isAdjusting}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shrink-0 shadow-xs flex items-center gap-1.5 transition-all self-end sm:self-center"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isAdjusting ? 'animate-spin' : ''}`} />
            <span>{isAdjusting ? 'Re-balancing...' : 'Redistribute Overdue Work'}</span>
          </button>
        </div>
      )}

      {/* B. Action Result Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-xs ${
            actionMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {actionMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <p className="font-bold">{actionMessage.text}</p>
              {actionMessage.summary?.details?.length > 0 && (
                <ul className="text-[11px] opacity-90 list-disc list-inside space-y-0.5 mt-1">
                  {actionMessage.summary.details.slice(0, 3).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* C. Overload Warning from Latest Adjustment */}
      {latestHistory?.hasOverloadWarning && !actionMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-950">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Workload Capacity Notice</h4>
            <p className="text-rose-800 leading-relaxed">
              Your remaining syllabus tasks exceed the total available study hours before your examination date. The adjustment engine prioritized weak topics and critical revision first. Consider increasing your daily study hours in Availability settings.
            </p>
          </div>
        </div>
      )}

      {/* 3. Schedule Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Daily Study Timeline</h4>
          <p className="text-xs text-slate-500">
            Check off study tasks as you complete them, or pin critical topics with the lock icon.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs font-semibold flex-wrap">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Days ({plan.schedule?.length || 0})
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'pending'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({totalTasks - completedTasks})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'completed'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedTasks})
          </button>
          <button
            onClick={() => setFilterMode('locked')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              filterMode === 'locked'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Locked ({lockedTasksCount})</span>
          </button>
        </div>
      </div>

      {/* 4. Daily Schedule Cards List */}
      <div className="space-y-4">
        {plan.schedule.map((day, dayIdx) => {
          const dayDate = new Date(day.date);
          const dayDateStr = dayDate.toISOString().slice(0, 10);
          const isToday = dayDateStr === todayStr;
          const isPast = dayDate < today;

          // Day tasks filtering
          const displayedTasks = day.tasks.filter((t) => {
            if (filterMode === 'pending') return !t.completed;
            if (filterMode === 'completed') return t.completed;
            if (filterMode === 'locked') return t.isLocked;
            return true;
          });

          if (displayedTasks.length === 0 && filterMode !== 'all') {
            return null;
          }

          const dayCompleted = day.tasks.filter((t) => t.completed).length;
          const dayTotal = day.tasks.length;
          const dayDone = dayTotal > 0 && dayCompleted === dayTotal;
          const dayMinutes = day.tasks.reduce((sum, t) => sum + (Number(t.duration) || 0), 0);
          const hasOverduePending = isPast && day.tasks.some((t) => !t.completed && !t.isLocked);

          return (
            <div
              key={day._id || dayIdx}
              className={`rounded-3xl border transition-all overflow-hidden ${
                isToday
                  ? 'border-indigo-400 bg-white shadow-md ring-2 ring-indigo-500/10'
                  : hasOverduePending
                  ? 'border-amber-300 bg-white shadow-xs'
                  : 'border-slate-200/90 bg-white shadow-xs'
              }`}
            >
              {/* Day Header Banner */}
              <div
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                  isToday
                    ? 'bg-indigo-50/60 border-indigo-100'
                    : hasOverduePending
                    ? 'bg-amber-50/60 border-amber-100'
                    : 'bg-slate-50/70 border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bold text-center shrink-0 ${
                      dayDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : isToday
                        ? 'bg-indigo-600 text-white'
                        : hasOverduePending
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] uppercase leading-none">
                      {dayDate.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span className="text-base font-extrabold leading-none mt-0.5">
                      {dayDate.getDate()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        Day {dayIdx + 1} –{' '}
                        {dayDate.toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h4>

                      {isToday && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white tracking-wider">
                          Today
                        </span>
                      )}

                      {dayDone && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCheck className="w-3 h-3" /> Done
                        </span>
                      )}

                      {hasOverduePending && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" /> Overdue Tasks
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {dayMinutes} minutes planned study workload ({dayCompleted}/{dayTotal} tasks completed)
                    </p>
                  </div>
                </div>

                {/* Day Mini Progress */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        dayDone ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{
                        width: `${dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    {dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0}%
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="p-4 sm:p-5 space-y-2.5">
                {displayedTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2 text-center">
                    No tasks match the current filter.
                  </p>
                ) : (
                  displayedTasks.map((task) => {
                    const typeStyle = TASK_TYPE_STYLES[task.taskType] || TASK_TYPE_STYLES.study;
                    const prioStyle = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
                    const isTaskLockLoading = lockLoadingTaskId === task._id;
                    const isWeakTopicBoosted =
                      task.priority === 'high' &&
                      task.rescheduleReason &&
                      task.rescheduleReason.toLowerCase().includes('weak');

                    return (
                      <div
                        key={task._id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          task.completed
                            ? 'bg-slate-50/80 border-slate-200/70 opacity-75'
                            : task.isLocked
                            ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-300 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Interactive Task Checkbox & Topic Details */}
                        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => onTaskToggle(plan._id, task._id, !task.completed)}
                            className={`p-1 rounded-lg transition-transform hover:scale-110 shrink-0 mt-0.5 sm:mt-0 ${
                              task.completed
                                ? 'text-emerald-600 hover:text-emerald-700'
                                : 'text-slate-300 hover:text-indigo-600'
                            }`}
                            title={task.completed ? 'Mark as pending' : 'Mark as completed'}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Task Type Badge */}
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeStyle.badge}`}
                              >
                                {typeStyle.label}
                              </span>

                              {/* Priority Badge */}
                              <span
                                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${prioStyle}`}
                              >
                                {task.priority} Priority
                              </span>

                              {/* Locked Indicator Badge */}
                              {task.isLocked && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                                  <Lock className="w-3 h-3 text-amber-700" /> Locked Date
                                </span>
                              )}

                              {/* Weak-Topic Priority Boost Badge */}
                              {isWeakTopicBoosted && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                                  <Flame className="w-3 h-3 text-rose-500" /> Weak Topic Focus
                                </span>
                              )}

                              {/* Rescheduled Badge */}
                              {task.rescheduled && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200"
                                  title={
                                    task.originalDate
                                      ? `Originally scheduled for ${new Date(task.originalDate).toLocaleDateString()}. Reason: ${task.rescheduleReason || 'Balanced'}`
                                      : task.rescheduleReason || 'Rescheduled'
                                  }
                                >
                                  <RefreshCw className="w-2.5 h-2.5 text-indigo-500" />
                                  <span>
                                    Rescheduled
                                    {task.originalDate && (
                                      <span className="opacity-75">
                                        {' '}
                                        (was {new Date(task.originalDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                                      </span>
                                    )}
                                  </span>
                                </span>
                              )}
                            </div>

                            {/* Task Topic with MathRenderer */}
                            <p
                              className={`text-xs sm:text-sm font-semibold truncate ${
                                task.completed
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900'
                              }`}
                            >
                              <MathRenderer text={task.topic} />
                            </p>

                            {/* Reschedule Reason explanation text if present */}
                            {task.rescheduleReason && !task.completed && (
                              <p className="text-[11px] text-slate-500 italic">
                                Reason: {task.rescheduleReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Duration Badge & Task Lock Toggle Button */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{task.duration}m</span>
                          </div>

                          {/* Pin / Lock Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleTaskLock(task._id, task.isLocked)}
                            disabled={isTaskLockLoading || task.completed}
                            className={`p-1.5 rounded-xl border transition-all ${
                              task.isLocked
                                ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            } disabled:opacity-40`}
                            title={
                              task.completed
                                ? 'Completed tasks cannot be locked'
                                : task.isLocked
                                ? 'Locked: Auto-adjust will not move this task. Click to unlock.'
                                : 'Lock task to this date so auto-adjust never moves it'
                            }
                          >
                            {isTaskLockLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                            ) : task.isLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. MODAL: Student Availability & Preferences */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Study Availability & Adjustments
                  </h4>
                  <p className="text-xs text-slate-500">
                    Configure your pacing limits and active study days.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4">
              {/* Daily Study Hours Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-800">
                    Target Daily Study Time:
                  </label>
                  <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                    {prefDailyHours} hour{prefDailyHours > 1 ? 's' : ''} ({Math.round(prefDailyHours * 60)} mins)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={prefDailyHours}
                  onChange={(e) => setPrefDailyHours(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>30 mins (Light)</span>
                  <span>4 hours (Intensive)</span>
                  <span>12 hours (Full-time)</span>
                </div>
              </div>

              {/* Study Days of the Week Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 block">
                  Active Study Days of the Week:
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = prefDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDayPreference(d.id)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400">
                  Selected days ({prefDays.length} days/week): Workload will only be scheduled on these active study days.
                </p>
              </div>

              {/* Automatic Adjustment Enabled Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">
                    Enable Automatic Study Plan Adjustments
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Automatically balance missed or delayed tasks into future available study days.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefAutoAdjust(!prefAutoAdjust)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    prefAutoAdjust ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      prefAutoAdjust ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPreferencesModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isAdjusting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save & Re-balance Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Adjustment History Audit Trail */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Adjustment History Log
                  </h4>
                  <p className="text-xs text-slate-500">
                    Audit trail of deterministic adjustments made to your study schedule.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {(!plan.adjustmentHistory || plan.adjustmentHistory.length === 0) ? (
                <div className="text-center py-8 text-slate-400">
                  <Info className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p>No adjustments have been recorded yet for this study plan.</p>
                </div>
              ) : (
                plan.adjustmentHistory.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {item.reason || 'Automatic Plan Adjustment'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.adjustedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed font-medium">
                      {item.summary}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {item.tasksRescheduled || 0} tasks moved
                      </span>
                      {item.weakTopicsBoosted > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 border border-rose-200 text-rose-800 font-bold">
                          {item.weakTopicsBoosted} weak topics boosted
                        </span>
                      )}
                      {item.hasOverloadWarning && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">
                          Capacity warning
                        </span>
                      )}
                    </div>

                    {item.details?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Key Changes:
                        </p>
                        <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                          {item.details.map((d, dIdx) => (
                            <li key={dIdx}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: Confirmation Modal for Full Plan Regeneration */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Regenerate Entire Study Plan?</h4>
                <p className="text-xs text-slate-500">
                  Re-balances remaining tasks using your latest performance metrics.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/60">
              <span className="font-bold text-amber-800">Safety Guarantee: </span>
              Your <strong>{completedTasks} completed task(s)</strong> will NOT be lost. Gemini AI will re-allocate remaining syllabus topics across days leading up to your exam.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRegenConfirm(false);
                  onRegenerate(plan._id);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                Yes, Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanView;
