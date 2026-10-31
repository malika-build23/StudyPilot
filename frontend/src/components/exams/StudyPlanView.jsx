import { useState, useMemo } from 'react';
import MathRenderer from '../common/MathRenderer';
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
  Award
} from 'lucide-react';

const TASK_TYPE_STYLES = {
  study: {
    label: 'Study',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/60',
    dot: 'bg-blue-500',
  },
  revision: {
    label: 'Revision',
    badge: 'bg-purple-50 text-purple-700 border-purple-200/60',
    dot: 'bg-purple-500',
  },
  practice: {
    label: 'Practice',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    dot: 'bg-emerald-500',
  },
  buffer: {
    label: 'Buffer Time',
    badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
    dot: 'bg-amber-500',
  },
};

const PRIORITY_BADGES = {
  high: 'bg-rose-100/80 text-rose-800 border-rose-200',
  medium: 'bg-amber-100/80 text-amber-800 border-amber-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
};

const StudyPlanView = ({
  plan,
  exam,
  onTaskToggle,
  onRegenerate,
  isRegenerating = false,
}) => {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'pending' | 'completed'
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  // Today in YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);

  // Flattened tasks metrics
  const { totalTasks, completedTasks, percentComplete, totalMinutes } = useMemo(() => {
    if (!plan || !Array.isArray(plan.schedule)) {
      return { totalTasks: 0, completedTasks: 0, percentComplete: 0, totalMinutes: 0 };
    }

    let total = 0;
    let completed = 0;
    let minutes = 0;

    plan.schedule.forEach((day) => {
      day.tasks.forEach((t) => {
        total++;
        if (t.completed) completed++;
        minutes += Number(t.duration) || 0;
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { totalTasks: total, completedTasks: completed, percentComplete: percent, totalMinutes: minutes };
  }, [plan]);

  if (!plan) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Study Plan Header & Overall Progress Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-sm relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Personalized Adaptive Study Plan</span>
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

          {/* Action: Regenerate */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRegenConfirm(true)}
              disabled={isRegenerating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs transition-all disabled:opacity-60"
              title="Re-balance upcoming tasks while keeping completed tasks intact"
            >
              <RotateCcw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Re-optimizing...' : 'Regenerate Plan'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Key Plan Stats */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
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
              Schedule Span
            </p>
            <p className="text-xl font-extrabold text-white mt-0.5">
              {plan.schedule?.length || 0} days
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

      {/* Confirmation Modal for Plan Regeneration */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Regenerate Study Plan?</h4>
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

      {/* 2. Schedule Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Daily Study Timeline</h4>
          <p className="text-xs text-slate-500">
            Check off study tasks as you complete them to track daily progress.
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs font-semibold">
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
            Pending Tasks ({totalTasks - completedTasks})
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
        </div>
      </div>

      {/* 3. Daily Schedule Cards List */}
      <div className="space-y-4">
        {plan.schedule.map((day, dayIdx) => {
          const dayDate = new Date(day.date);
          const dayDateStr = dayDate.toISOString().slice(0, 10);
          const isToday = dayDateStr === todayStr;

          // Day tasks filtering
          const displayedTasks = day.tasks.filter((t) => {
            if (filterMode === 'pending') return !t.completed;
            if (filterMode === 'completed') return t.completed;
            return true;
          });

          if (displayedTasks.length === 0 && filterMode !== 'all') {
            return null;
          }

          const dayCompleted = day.tasks.filter((t) => t.completed).length;
          const dayTotal = day.tasks.length;
          const dayDone = dayTotal > 0 && dayCompleted === dayTotal;
          const dayMinutes = day.tasks.reduce((sum, t) => sum + (t.duration || 0), 0);

          return (
            <div
              key={day._id || dayIdx}
              className={`rounded-3xl border transition-all overflow-hidden ${
                isToday
                  ? 'border-indigo-400 bg-white shadow-md ring-2 ring-indigo-500/10'
                  : 'border-slate-200/90 bg-white shadow-xs'
              }`}
            >
              {/* Day Header Banner */}
              <div
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                  isToday
                    ? 'bg-indigo-50/60 border-indigo-100'
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
                    <div className="flex items-center gap-2">
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

                    return (
                      <div
                        key={task._id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-3 ${
                          task.completed
                            ? 'bg-slate-50/80 border-slate-200/70 opacity-75'
                            : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Interactive Task Checkbox */}
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
                          </div>
                        </div>

                        {/* Task Duration Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold shrink-0">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.duration}m</span>
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
    </div>
  );
};

export default StudyPlanView;
