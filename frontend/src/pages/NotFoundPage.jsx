import { Link } from 'react-router-dom';
import { Home, Sparkles, BookOpen } from 'lucide-react';
import student404Img from '../assets/illustrations/student_404.jpg';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Organic Shapes */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-[#FED7A5]/25 blur-3xl pointer-events-none animate-float-delayed" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-[#9E6752]/15 blur-3xl pointer-events-none animate-float-gentle" />
      <div className="absolute top-12 right-1/4 w-40 h-40 rounded-full bg-[#2D4354]/10 blur-2xl pointer-events-none" />

      {/* Floating Sparkles / Stars */}
      <div className="absolute top-1/6 left-1/4 text-[#FED7A5] text-xl animate-twinkle pointer-events-none">
        ✦
      </div>
      <div
        className="absolute bottom-1/5 left-1/3 text-[#9E6752] text-sm animate-twinkle pointer-events-none"
        style={{ animationDelay: '1.2s' }}
      >
        ★
      </div>
      <div
        className="absolute top-1/3 right-1/5 text-[#2D4354] text-lg animate-twinkle pointer-events-none"
        style={{ animationDelay: '2.1s' }}
      >
        ✦
      </div>

      <div className="relative z-10 max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl border border-[#F1F0ED] p-8 sm:p-10 shadow-xl shadow-[#2D4354]/5 flex flex-col items-center">
        {/* Floating 3D Academic Illustration */}
        <div className="relative mb-6">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-white shadow-lg shadow-[#2D4354]/10 animate-float-gentle">
            <img
              src={student404Img}
              alt="404 Academic Resource Not Found"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Small Floating Graduation Cap / Book Pill */}
          <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-[#FED7A5] text-[#20212B] text-[11px] font-bold shadow-md flex items-center gap-1.5 animate-float-delayed">
            <BookOpen className="w-3.5 h-3.5 text-[#9E6752]" />
            Lost Shelf
          </div>
        </div>

        {/* Status Pill */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Error 404 · Academic Path Lost
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#20212B] tracking-tight">
          Page Not Found
        </h1>

        <p className="text-xs sm:text-sm text-[#73766A] mt-2 max-w-sm leading-relaxed">
          The academic resource, study note, or route you requested doesn't exist or has been archived.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#2D4354]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
