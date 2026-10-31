import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import studentHeroImg from '../assets/illustrations/student_study_hero.jpg';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Sparkles, BookOpen, Star, Target } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [clientError, setClientError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setClientError('');
    if (authError) setAuthError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setClientError('Please enter your email address.');
      return;
    }
    if (!formData.password) {
      setClientError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const displayedError = clientError || authError;

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#2D4354] selection:text-white">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-r from-[#FED7A5]/35 via-[#9E6752]/15 to-[#2D4354]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#FED7A5]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Academic 3D Illustration & Welcome Card */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center text-center p-6 relative">
            {/* Organic Soft Peach Background Behind Illustration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FED7A5]/40 via-[#FFF7EC]/70 to-[#2D4354]/10 rounded-3xl blur-xl pointer-events-none" />

            {/* Floating Academic Badges */}
            <div className="absolute -top-3 left-2 flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/95 border border-[#73766A]/20 shadow-md animate-float-gentle z-20">
              <BookOpen className="w-4 h-4 text-[#2D4354]" />
              <span className="text-xs font-bold text-[#20212B]">300+ Materials Synced</span>
            </div>

            <div className="absolute -bottom-2 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-[#FED7A5] text-[#9E6752] text-xs font-bold shadow-md z-20 animate-twinkle">
              <Star className="w-3.5 h-3.5 fill-[#FED7A5] text-[#9E6752]" />
              <span>Exam Ready</span>
            </div>

            {/* Illustration Frame */}
            <div className="relative z-10 w-full rounded-3xl overflow-hidden border-2 border-white shadow-[0_16px_40px_rgba(45,67,84,0.12)] bg-white animate-float-delayed">
              <img
                src={studentHeroImg}
                alt="Student studying with laptop and books"
                className="w-full h-auto object-cover max-h-[380px]"
              />
            </div>

            <div className="mt-5 relative z-10">
              <h3 className="text-lg font-extrabold text-[#20212B]">
                Your Academic Companion
              </h3>
              <p className="text-xs text-[#77756F] mt-1 max-w-xs">
                Smart document intelligence, spaced recall flashcards, and adaptive study routines.
              </p>
            </div>
          </div>

          {/* Right Column: Sign In Form Card */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto">
            {/* Brand Header */}
            <div className="text-center mb-6">
              <Link to="/" className="inline-flex items-center justify-center group mb-2">
                <div className="w-12 h-12 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-[#2D4354]/15 via-[#FED7A5]/30 to-[#9E6752]/20 border border-[#2D4354]/25 shadow-xs flex items-center justify-center group-hover:scale-105 transition-all">
                  <img src="/logo.png" alt="StudyPilot Logo" className="w-full h-full object-contain" />
                </div>
              </Link>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FED7A5]/30 border border-[#FED7A5] text-[#2D4354] text-[11px] font-bold tracking-wider uppercase mb-1.5">
                <Sparkles className="w-3 h-3 text-[#9E6752]" />
                <span>Student Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#20212B] tracking-tight">
                Sign In to StudyPilot AI
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#77756F] font-medium">
                Access your courses, preparation metrics, and study workspaces
              </p>
            </div>

            <div className="bg-white py-8 px-6 sm:px-10 shadow-[0_16px_40px_-8px_rgba(45,67,84,0.08)] border border-[#73766A]/15 rounded-3xl">
              {displayedError && (
                <div className="mb-5 p-3.5 rounded-2xl bg-[#FFF7EC] border border-[#9E6752]/30 flex items-start gap-3 text-[#9E6752] text-xs font-semibold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#9E6752]" />
                  <span>{displayedError}</span>
                </div>
              )}

              {/* Direct Google Sign-In */}
              <div className="mb-5">
                <GoogleSignInButton
                  text="Continue with Google"
                  onSuccess={() => navigate(from, { replace: true })}
                />
              </div>

              {/* Clean OR divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#73766A]/15" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-[#77756F] font-bold tracking-wider text-[10px]">
                    or sign in with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-[#20212B] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77756F] group-focus-within:text-[#2D4354] transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="alex@university.edu"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#73766A]/20 focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 text-sm font-medium text-[#20212B] placeholder:text-[#77756F]/60 transition-all outline-none bg-white shadow-2xs"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-[#20212B] uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77756F] group-focus-within:text-[#2D4354] transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#73766A]/20 focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 text-sm font-medium text-[#20212B] placeholder:text-[#77756F]/60 transition-all outline-none bg-white shadow-2xs"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-sm shadow-[0_4px_16px_rgba(45,67,84,0.3)] transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#FED7A5]" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 text-[#FED7A5]" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Switch to Register */}
              <div className="mt-6 pt-5 border-t border-[#73766A]/15 text-center">
                <p className="text-xs text-[#77756F] font-medium">
                  Don't have an account yet?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-[#2D4354] hover:text-[#9E6752] transition-colors"
                  >
                    Register as a student
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
