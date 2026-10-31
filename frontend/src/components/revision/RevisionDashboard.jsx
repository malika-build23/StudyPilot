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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2D4354] via-[#534145] to-[#20212B] p-6 sm:p-8 text-white shadow-[0_16px_36px_-6px_rgba(45,67,84,0.3)] border border-white/10 hover:border-white/25 transition-all duration-300 group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[#FED7A5] border border-white/25 shadow-xs">
                Spaced Repetition System
              </span>
              {streakDays > 0 && (
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#9E6752] to-[#FED7A5] text-white flex items-center gap-1.5 shadow-xs">
                  <Flame className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{streakDays} Day Streak!</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
              {dueToday > 0 ? (
                <>You have <span className="text-[#FED7A5] font-black underline decoration-[#FED7A5] decoration-4 underline-offset-4">{dueToday} cards</span> due for review today</>
              ) : (
                <span className="text-white">All caught up for today! 🎉</span>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
              Based on the SM-2 spaced repetition algorithm. Review cards at optimal intervals to lock
              formulas, definitions, and concepts into long-term memory.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onStartRevision()}
              disabled={dueToday === 0 && totalFlashcards === 0}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-[#2D4354] hover:bg-[#FFF7EC] font-extrabold text-sm shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#9E6752]" />
              <span>{dueToday > 0 ? 'Start Daily Revision' : 'Practice Revision'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative interactive backdrop glows */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#FED7A5]/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute right-40 -top-20 w-60 h-60 bg-[#9E6752]/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Due Today */}
        <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#77756F] uppercase tracking-wider">Due Today</span>
            <div className="w-9 h-9 rounded-2xl bg-[#FFF7EC] text-[#2D4354] flex items-center justify-center border border-[#FED7A5]/60">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#20212B]">{dueToday}</div>
            <p className="text-[11px] text-[#77756F] mt-1 font-medium">Cards ready for recall</p>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#77756F] uppercase tracking-wider">Overdue</span>
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${
              overdue > 0 ? 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]' : 'bg-[#FAF8F5] text-[#77756F] border-slate-200'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-extrabold ${overdue > 0 ? 'text-[#9E6752]' : 'text-[#20212B]'}`}>
              {overdue}
            </div>
            <p className="text-[11px] text-[#77756F] mt-1 font-medium">
              {overdue > 0 ? 'Urgent reviews pending' : 'Zero overdue cards'}
            </p>
          </div>
        </div>

        {/* Difficult Cards */}
        <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#77756F] uppercase tracking-wider">Difficult Cards</span>
            <div className="w-9 h-9 rounded-2xl bg-[#FAF8F5] text-[#534145] border border-[#534145]/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#20212B]">{difficultCards}</div>
            <p className="text-[11px] text-[#77756F] mt-1 font-medium">Low retention concepts</p>
          </div>
        </div>

        {/* Reviews Completed */}
        <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#77756F] uppercase tracking-wider">Total Reviews</span>
            <div className="w-9 h-9 rounded-2xl bg-[#F1F0ED] text-[#73766A] border border-slate-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#20212B]">{completedReviews}</div>
            <p className="text-[11px] text-[#77756F] mt-1 font-medium">{upcoming} scheduled upcoming</p>
          </div>
        </div>
      </div>

      {/* Subject-wise Revision Progress */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F1F0ED] shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] text-[#2D4354] border border-[#2D4354]/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#20212B]">Subject-wise Revision Mastery</h3>
          </div>
          <span className="text-[11px] font-semibold text-[#77756F]">
            {subjectProgress.length} Subjects Active
          </span>
        </div>

        {subjectProgress.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#77756F]">
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
                <div key={sub.subjectId} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#20212B]">{sub.subjectName}</span>
                      <span className="text-[10px] text-[#77756F] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-slate-200">
                        {sub.semester || 'Semester'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {sub.dueCards > 0 && (
                        <span className="text-[11px] font-bold text-[#9E6752] bg-[#FFF7EC] px-2.5 py-0.5 rounded-full border border-[#FED7A5]">
                          {sub.dueCards} Due
                        </span>
                      )}
                      <span className="font-semibold text-[#77756F]">
                        {sub.totalCards} cards ({progressPct}% retained)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-[#F1F0ED] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#F1F0ED]">
                    <div
                      className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#2D4354] via-[#73766A] to-[#FED7A5]"
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
