import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#73766A]/15 shadow-[0_4px_20px_-4px_rgba(45,67,84,0.06)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="StudyPilot Logo"
            className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#20212B] text-lg tracking-tight group-hover:text-[#2D4354] transition-colors">
                StudyPilot
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-[#2D4354] to-[#9E6752] text-white shadow-xs">
                AI
              </span>
            </div>
            <p className="text-[11px] text-[#77756F] font-medium hidden sm:block">
              Your Personal Academic Companion
            </p>
          </div>
        </Link>

        {/* Public Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#77756F]">
          <a
            href="#features"
            className="px-3.5 py-2 rounded-xl hover:text-[#2D4354] hover:bg-[#FED7A5]/25 transition-all duration-200"
          >
            Core Features
          </a>
          <a
            href="#workflow"
            className="px-3.5 py-2 rounded-xl hover:text-[#2D4354] hover:bg-[#FED7A5]/25 transition-all duration-200"
          >
            Study Method
          </a>
          <a
            href="#suite"
            className="px-3.5 py-2 rounded-xl hover:text-[#2D4354] hover:bg-[#FED7A5]/25 transition-all duration-200"
          >
            Platform Suite
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-sm shadow-[0_4px_16px_rgba(45,67,84,0.25)] hover:shadow-[0_6px_22px_rgba(45,67,84,0.35)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-[#FED7A5]" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-[#20212B] hover:text-[#2D4354] hover:bg-[#FED7A5]/20 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2D4354] via-[#534145] to-[#9E6752] hover:opacity-95 text-white font-bold text-sm shadow-[0_4px_16px_rgba(45,67,84,0.25)] hover:shadow-[0_6px_22px_rgba(158,103,82,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
