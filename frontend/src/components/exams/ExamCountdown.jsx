import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Reusable Live Examination Countdown Component
 * Accurately ticks every second and handles timezone, start time, and end time.
 *
 * @param {string|Date} examDate - Exam date (YYYY-MM-DD or ISO string)
 * @param {string} [startTime] - Start time in HH:mm format (e.g. "09:00")
 * @param {string} [endTime] - End time in HH:mm format (e.g. "12:00")
 * @param {boolean} [compact] - If true, displays compact inline badge
 */
const ExamCountdown = ({
  examDate,
  startTime = '',
  endTime = '',
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState('upcoming'); // 'upcoming' | 'in_progress' | 'completed'

  useEffect(() => {
    if (!examDate) return;

    const calculateTime = () => {
      const now = new Date();

      // Construct exam start Date
      const startDate = new Date(examDate);
      if (startTime && /^\d{1,2}:\d{2}$/.test(startTime)) {
        const [sh, sm] = startTime.split(':').map(Number);
        startDate.setHours(sh, sm, 0, 0);
      } else {
        startDate.setHours(9, 0, 0, 0); // Default to 9:00 AM if start time not specified
      }

      // Construct exam end Date
      const endDate = new Date(examDate);
      if (endTime && /^\d{1,2}:\d{2}$/.test(endTime)) {
        const [eh, em] = endTime.split(':').map(Number);
        endDate.setHours(eh, em, 0, 0);
      } else if (startTime && /^\d{1,2}:\d{2}$/.test(startTime)) {
        // Default duration: 3 hours after start time
        const [sh, sm] = startTime.split(':').map(Number);
        endDate.setHours(sh + 3, sm, 0, 0);
      } else {
        // Fallback to end of the day
        endDate.setHours(23, 59, 59, 999);
      }

      const diffToStart = startDate.getTime() - now.getTime();
      const diffToEnd = endDate.getTime() - now.getTime();

      if (diffToEnd <= 0) {
        setStatus('completed');
        setTimeLeft(null);
        return;
      }

      if (diffToStart <= 0 && diffToEnd > 0) {
        setStatus('in_progress');
        setTimeLeft(null);
        return;
      }

      setStatus('upcoming');

      const totalSeconds = Math.floor(diffToStart / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [examDate, startTime, endTime]);

  if (status === 'completed') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 ${
          compact ? 'text-[11px] py-0.5' : ''
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
        <span>Exam Concluded</span>
      </span>
    );
  }

  if (status === 'in_progress') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs animate-pulse ${
          compact ? 'text-[11px] py-0.5' : ''
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Exam in Progress</span>
      </span>
    );
  }

  if (!timeLeft) {
    return (
      <span className="text-xs text-slate-400 font-medium">Calculating...</span>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;
  const pad = (n) => String(n).padStart(2, '0');

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#4169E1] bg-[#4169E1]/10 px-3 py-1 rounded-full border border-[#4169E1]/20">
        <Clock className="w-3 h-3 text-[#4169E1]" />
        <span>
          {days > 0 ? `${days}d ` : ''}
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-[#202B42]">
      <div className="flex flex-col items-center justify-center min-w-[38px] px-2.5 py-1.5 bg-white rounded-xl border border-slate-100 shadow-xs">
        <span className="text-sm font-black text-[#4169E1] leading-tight">
          {pad(days)}
        </span>
        <span className="text-[9px] uppercase font-bold text-[#77839A]">Days</span>
      </div>
      <span className="text-slate-300 font-bold">:</span>

      <div className="flex flex-col items-center justify-center min-w-[38px] px-2.5 py-1.5 bg-white rounded-xl border border-slate-100 shadow-xs">
        <span className="text-sm font-black text-[#4169E1] leading-tight">
          {pad(hours)}
        </span>
        <span className="text-[9px] uppercase font-bold text-[#77839A]">Hours</span>
      </div>
      <span className="text-slate-300 font-bold">:</span>

      <div className="flex flex-col items-center justify-center min-w-[38px] px-2.5 py-1.5 bg-white rounded-xl border border-slate-100 shadow-xs">
        <span className="text-sm font-black text-[#4169E1] leading-tight">
          {pad(minutes)}
        </span>
        <span className="text-[9px] uppercase font-bold text-[#77839A]">Mins</span>
      </div>
      <span className="text-slate-300 font-bold">:</span>

      <div className="flex flex-col items-center justify-center min-w-[38px] px-2.5 py-1.5 bg-white rounded-xl border border-slate-100 shadow-xs">
        <span className="text-sm font-black text-[#9270DB] leading-tight">
          {pad(seconds)}
        </span>
        <span className="text-[9px] uppercase font-bold text-[#77839A]">Secs</span>
      </div>
    </div>
  );
};

export default ExamCountdown;
