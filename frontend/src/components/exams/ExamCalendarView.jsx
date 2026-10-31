import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  BookOpen,
  Beaker,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const ExamCalendarView = ({ exams = [], onSelectExam }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayExams, setSelectedDayExams] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayExams(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayExams(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDayExams(null);
  };

  // Build grid calendar days
  const { calendarDays, examsByDate } = useMemo(() => {
    // Map exams to YYYY-MM-DD
    const map = {};
    exams.forEach((exam) => {
      const d = new Date(exam.examDate);
      const dateKey = d.toISOString().slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(exam);
    });

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sunday
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        dateKey: null,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const padM = String(month + 1).padStart(2, '0');
      const padD = String(i).padStart(2, '0');
      const dateKey = `${year}-${padM}-${padD}`;
      days.push({
        dayNumber: i,
        isCurrentMonth: true,
        dateKey,
        exams: map[dateKey] || [],
      });
    }

    // Next month filler days to complete rows (multiples of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateKey: null,
      });
    }

    return { calendarDays: days, examsByDate: map };
  }, [exams, year, month]);

  const todayKey = new Date().toISOString().slice(0, 10);

  const getExamBadge = (exam) => {
    const isUni = exam.examCategory === 'UNIVERSITY_THEORY';
    if (isUni) {
      return {
        bg: 'bg-blue-100 text-blue-800 border-blue-200',
        dot: 'bg-blue-600',
        label: 'Theory',
      };
    }
    const type = (exam.examType || '').toLowerCase();
    if (type.includes('lab')) {
      return {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600',
        label: 'Lab',
      };
    }
    if (type.includes('viva')) {
      return {
        bg: 'bg-amber-100 text-amber-800 border-amber-200',
        dot: 'bg-amber-600',
        label: 'Viva',
      };
    }
    if (type.includes('quiz')) {
      return {
        bg: 'bg-rose-100 text-rose-800 border-rose-200',
        dot: 'bg-rose-600',
        label: 'Quiz',
      };
    }
    return {
      bg: 'bg-purple-100 text-purple-800 border-purple-200',
      dot: 'bg-purple-600',
      label: 'Practical',
    };
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5 animate-in fade-in">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {MONTH_NAMES[month]} {year}
            </h3>
            <p className="text-xs text-slate-400">
              Interactive unified schedule of university theory and practical assessments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-1 pb-1">
        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
          Indicators:
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>University Theory</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <span>Practical Exam</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>Lab Exam</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
          <span>Viva</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
          <span>Class Quiz</span>
        </span>
      </div>

      {/* Grid: Day of Week Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 py-1 border-b border-slate-100">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((d, index) => {
          if (!d.isCurrentMonth) {
            return (
              <div
                key={`empty-${index}`}
                className="h-24 sm:h-28 rounded-2xl bg-slate-50/50 p-2 text-slate-300 text-xs select-none"
              >
                <span>{d.dayNumber}</span>
              </div>
            );
          }

          const isToday = d.dateKey === todayKey;
          const hasExams = d.exams && d.exams.length > 0;
          const isSelected = selectedDayExams?.dateKey === d.dateKey;

          return (
            <div
              key={d.dateKey}
              onClick={() => {
                if (hasExams) {
                  setSelectedDayExams(isSelected ? null : { dateKey: d.dateKey, exams: d.exams });
                }
              }}
              className={`h-24 sm:h-28 rounded-2xl p-2 border transition-all flex flex-col justify-between overflow-hidden group ${
                hasExams ? 'cursor-pointer hover:shadow-xs' : 'cursor-default'
              } ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20'
                  : isToday
                  ? 'bg-blue-50/30 border-blue-300'
                  : 'bg-white border-slate-200/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isToday
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700'
                  }`}
                >
                  {d.dayNumber}
                </span>

                {hasExams && (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100/60 px-1.5 py-0.2 rounded">
                    {d.exams.length}
                  </span>
                )}
              </div>

              {/* Exam Badges preview */}
              <div className="space-y-1 overflow-hidden">
                {d.exams?.slice(0, 2).map((exam) => {
                  const badge = getExamBadge(exam);
                  return (
                    <div
                      key={exam._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectExam) onSelectExam(exam);
                      }}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold truncate flex items-center gap-1 border ${badge.bg}`}
                      title={`${exam.examName} (${exam.startTime || 'TBD'})`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                      <span className="truncate">{exam.subjectCode || exam.examName}</span>
                    </div>
                  );
                })}

                {d.exams?.length > 2 && (
                  <p className="text-[9px] font-bold text-slate-400 pl-1">
                    +{d.exams.length - 2} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Details Panel */}
      {selectedDayExams && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Examinations on{' '}
              {new Date(selectedDayExams.dateKey).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h4>
            <button
              onClick={() => setSelectedDayExams(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedDayExams.exams.map((exam) => {
              const badge = getExamBadge(exam);
              return (
                <div
                  key={exam._id}
                  onClick={() => onSelectExam && onSelectExam(exam)}
                  className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-blue-300 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {exam.startTime ? `${exam.startTime} - ${exam.endTime || 'End'}` : 'Time TBD'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 truncate">
                    {exam.examName}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    {exam.subjectCode && <span>Code: {exam.subjectCode}</span>}
                    {exam.location && (
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {exam.location}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamCalendarView;
