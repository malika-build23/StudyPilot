import {
  CalendarDays,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  BarChart3,
  HelpCircle
} from 'lucide-react';

const RevisionDashboard = ({ overview, onStartRevision }) => {
  if (!overview) return null;

  const {
    dueToday = 0,
    overdue = 0,
    upcoming = 0,
    totalFlashcards = 0,
    difficultCards = 0,
    completedReviews = 0,
    streakDays = 0,
    subjectProgress = [],
  } = overview;

  return (
    <div className="space-y-6">
      {/* Hero Action Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white">
                Spaced Repetition System
              </span>
              {streakDays > 0 && (
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-slate-900" />
                  <span>{streakDays} Day Streak!</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {dueToday > 0 ? (
                <>You have <span className="underline decoration-amber-400">{dueToday} cards</span> due for review today</>
              ) : (
                <>All caught up for today! 🎉</>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Based on the SM-2 spaced repetition algorithm. Review cards at optimal intervals to lock
              formulas, definitions, and concepts into long-term memory.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onStartRevision()}
              disabled={dueToday === 0 && totalFlashcards === 0}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-sm transition-all hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{dueToday > 0 ? 'Start Daily Revision' : 'Practice Revision'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative backdrop blobs */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 -top-20 w-52 h-52 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Due Today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Due Today</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{dueToday}</div>
            <p className="text-[11px] text-slate-400 mt-1">Cards ready for recall</p>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overdue</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              overdue > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold ${overdue > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {overdue}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {overdue > 0 ? 'Urgent reviews pending' : 'Zero overdue cards'}
            </p>
          </div>
        </div>

        {/* Difficult Cards */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Difficult Cards</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{difficultCards}</div>
            <p className="text-[11px] text-slate-400 mt-1">Low retention concepts</p>
          </div>
        </div>

        {/* Reviews Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{completedReviews}</div>
            <p className="text-[11px] text-slate-400 mt-1">{upcoming} scheduled upcoming</p>
          </div>
        </div>
      </div>

      {/* Subject-wise Revision Progress */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Subject-wise Revision Mastery</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {subjectProgress.length} Subjects Active
          </span>
        </div>

        {subjectProgress.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No subjects configured yet. Add subjects to start organizing flashcards.
          </div>
        ) : (
          <div className="space-y-4">
            {subjectProgress.map((sub) => {
              const progressPct =
                sub.totalCards > 0
                  ? Math.min(100, Math.round(((sub.totalCards - sub.dueCards) / sub.totalCards) * 100))
                  : 0;

              return (
                <div key={sub.subjectId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{sub.subjectName}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {sub.semester || 'Semester'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {sub.dueCards > 0 && (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {sub.dueCards} Due
                        </span>
                      )}
                      <span className="font-semibold text-slate-500">
                        {sub.totalCards} cards ({progressPct}% retained)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progressPct >= 80
                          ? 'bg-emerald-500'
                          : progressPct >= 40
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionDashboard;
