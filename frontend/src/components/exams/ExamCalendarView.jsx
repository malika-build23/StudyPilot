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
        bg: 'bg-[#FFF7EC] text-[#2D4354] border-[#FED7A5]',
        dot: 'bg-[#2D4354]',
        label: 'Theory',
      };
    }
    const type = (exam.examType || '').toLowerCase();
    if (type.includes('lab')) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600',
        label: 'Lab',
      };
    }
    if (type.includes('viva')) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-600',
        label: 'Viva',
      };
    }
    if (type.includes('quiz')) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-600',
        label: 'Quiz',
      };
    }
    return {
      bg: 'bg-[#FED7A5]/25 text-[#9E6752] border-[#FED7A5]',
      dot: 'bg-[#9E6752]',
      label: 'Practical',
    };
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#73766A]/20 shadow-xs space-y-5 animate-in fade-in">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#73766A]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]/60 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#20212B]">
              {MONTH_NAMES[month]} {year}
            </h3>
            <p className="text-xs text-[#73766A]">
              Interactive unified schedule of university theory and practical assessments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-xl border border-[#73766A]/20 text-xs font-bold text-[#20212B] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-[#73766A]/20 bg-[#FAF8F5] p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-[#20212B] hover:bg-white transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-[#20212B] hover:bg-white transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#20212B] pt-1 pb-1">
        <span className="font-bold text-[#73766A] uppercase tracking-wider text-[10px]">
          Indicators:
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2D4354]" />
          <span>University Theory</span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9E6752]" />
          <span>Practical Exam</span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>Lab Exam</span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
          <span>Viva</span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
          <span>Class Quiz</span>
        </span>
      </div>

      {/* Grid: Day of Week Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-[#73766A] py-1 border-b border-[#73766A]/10">
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
                className="h-24 sm:h-28 rounded-2xl bg-[#FAF8F5]/60 p-2 text-[#73766A]/40 text-xs select-none border border-transparent"
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
                  ? 'bg-[#FFF7EC] border-[#2D4354] ring-2 ring-[#FED7A5]/50 shadow-xs'
                  : isToday
                  ? 'bg-[#FFF7EC]/40 border-[#FED7A5]'
                  : 'bg-white border-[#73766A]/15 hover:border-[#2D4354]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isToday
                      ? 'bg-[#2D4354] text-[#FED7A5]'
                      : 'text-[#20212B]'
                  }`}
                >
                  {d.dayNumber}
                </span>

                {hasExams && (
                  <span className="text-[10px] font-bold text-[#2D4354] bg-[#FFF7EC] border border-[#FED7A5] px-1.5 py-0.2 rounded">
                    {d.exams.length}
                  </span>
                )}
              </div>

              {/* Exam Badges preview - Show Subject Name instead of subject code */}
              <div className="space-y-1 overflow-hidden">
                {d.exams?.slice(0, 2).map((exam) => {
                  const badge = getExamBadge(exam);
                  const subjectName = exam.subjectId?.subjectName || exam.subjectName || exam.examName || exam.subjectCode || 'Assessment';
                  return (
                    <div
                      key={exam._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectExam) onSelectExam(exam);
                      }}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold truncate flex items-center gap-1 border ${badge.bg}`}
                      title={`${subjectName}${exam.subjectCode ? ` (${exam.subjectCode})` : ''} - ${exam.startTime || 'TBD'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                      <span className="truncate">{subjectName}</span>
                    </div>
                  );
                })}

                {d.exams?.length > 2 && (
                  <p className="text-[9px] font-bold text-[#73766A] pl-1">
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
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#73766A]/20 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#73766A]/15 pb-2">
            <h4 className="text-xs font-bold text-[#20212B] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#9E6752]" />
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
              className="text-xs font-bold text-[#73766A] hover:text-[#20212B] cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {selectedDayExams.exams.map((exam) => {
              const badge = getExamBadge(exam);
              const subjectName = exam.subjectId?.subjectName || exam.subjectName || exam.examName || exam.subjectCode || 'Assessment';
              return (
                <div
                  key={exam._id}
                  onClick={() => onSelectExam && onSelectExam(exam)}
                  className="p-3.5 bg-white rounded-2xl border border-[#73766A]/15 shadow-2xs hover:border-[#2D4354] cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-semibold text-[#73766A] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#9E6752]" />
                      {exam.startTime ? `${exam.startTime} - ${exam.endTime || 'End'}` : 'Time TBD'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#20212B] truncate">
                    {subjectName}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-[#73766A]">
                    {exam.subjectCode && <span>Code: {exam.subjectCode}</span>}
                    {exam.location && (
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin className="w-3 h-3 text-[#73766A] shrink-0" />
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
