import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, subjectsAPI, examsAPI } from '../services/api';
import WorkflowBanner from '../components/common/WorkflowBanner';
import SubjectModal from '../components/subjects/SubjectModal';
import PerformanceAnalyticsView from '../components/analytics/PerformanceAnalyticsView';
import SmartResourceFinder from '../components/resources/SmartResourceFinder';
import deskDashboardImg from '../assets/illustrations/student_desk_dashboard.jpg';
import {
  BookOpen,
  FileText,
  TrendingUp,
  CalendarDays,
  Plus,
  UploadCloud,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle,
  GraduationCap,
  Star,
  Target
} from 'lucide-react';

// Smooth Number Counter Hook
const AnimatedCounter = ({ value, duration = 800 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const end = typeof value === 'number' ? value : parseFloat(value) || 0;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(end * ease));
      if (progress < 1) requestAnimationFrame(update);
    };
    const req = requestAnimationFrame(update);
    return () => cancelAnimationFrame(req);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Subject Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingSubject, setIsSubmittingSubject] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, examsRes] = await Promise.allSettled([
        dashboardAPI.getStats(),
        examsAPI.getAll(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.data);
      }
      if (examsRes.status === 'fulfilled' && examsRes.value.data?.success) {
        setExams(examsRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Could not load dashboard statistics. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCreateSubject = async (formData) => {
    try {
      setIsSubmittingSubject(true);
      const res = await subjectsAPI.create(formData);
      if (res.data?.success) {
        setIsModalOpen(false);
        fetchStats(); // Refresh dashboard counts and activities
      }
    } catch (err) {
      console.error('Error creating subject:', err);
      alert(err.response?.data?.message || 'Failed to create subject.');
    } finally {
      setIsSubmittingSubject(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#FED7A5]/30 text-[#2D4354] flex items-center justify-center shadow-xs">
          <Loader2 className="w-6 h-6 animate-spin text-[#2D4354]" />
        </div>
        <p className="text-xs text-[#77756F] font-semibold">Loading academic overview...</p>
      </div>
    );
  }

  const prepProgress = stats?.metrics?.preparationProgress ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {error && (
        <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#9E6752]/30 text-[#9E6752] text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#9E6752]" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Academic Desk Welcome Banner with Illustration (SCREEN 06) */}
      <div className="bg-gradient-to-r from-[#2D4354] via-[#534145] to-[#9E6752] rounded-3xl p-6 sm:p-8 text-white shadow-[0_12px_36px_-6px_rgba(45,67,84,0.28)] relative overflow-hidden">
        {/* Soft Peach & Terracotta decorative glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#FED7A5]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-36 -mb-16 w-56 h-56 rounded-full bg-[#FED7A5]/20 blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#FED7A5] text-xs font-bold backdrop-blur-md border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-[#FED7A5]" />
                <span>Academic Command Center</span>
              </div>
              {user?.semester && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20">
                  <GraduationCap className="w-3.5 h-3.5 text-[#FED7A5]" />
                  <span>{user.semester}</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Welcome back, {user?.name || 'Student'}! 👋
            </h2>
            <p className="mt-2.5 text-[#FAF8F5]/90 text-sm sm:text-base leading-relaxed font-normal max-w-xl">
              Organise your study materials, prepare concepts with structured repetition, and track your readiness for upcoming exams.
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#2D4354] font-bold text-xs sm:text-sm hover:bg-[#FFF7EC] shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-[#9E6752]" />
                <span>Create Subject</span>
              </button>
              <button
                onClick={() => navigate('/subjects')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all hover:scale-[1.02]"
              >
                <BookOpen className="w-4 h-4 text-[#FED7A5]" />
                <span>Explore Subjects</span>
              </button>
              <button
                onClick={() => navigate('/subjects')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all hover:scale-[1.02]"
              >
                <UploadCloud className="w-4 h-4 text-[#FED7A5]" />
                <span>Upload Study Material</span>
              </button>
            </div>
          </div>

          {/* Academic Desk 3D Illustration Graphic */}
          <div className="hidden lg:flex lg:col-span-4 justify-end">
            <div className="relative rounded-2xl overflow-hidden border-2 border-white/40 shadow-xl bg-white/10 animate-float-gentle max-w-[260px]">
              <img
                src={deskDashboardImg}
                alt="Student academic desk with laptop and books"
                className="w-full h-auto object-cover max-h-[190px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row with Count-ups & Visual Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1: Total Subjects */}
        <div className="bg-white rounded-3xl p-6 border border-[#73766A]/15 shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(45,67,84,0.12)] hover:border-[#2D4354]/40 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#77756F]">
              Total Subjects
            </span>
            <div className="w-11 h-11 rounded-2xl bg-[#2D4354]/10 text-[#2D4354] flex items-center justify-center border border-[#2D4354]/25 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#20212B]">
              <AnimatedCounter value={stats?.metrics?.totalSubjects ?? 0} />
            </span>
            <span className="text-xs font-semibold text-[#77756F]">active courses</span>
          </div>
          <p className="mt-2 text-xs text-[#77756F] flex items-center gap-1 font-medium">
            <span className="text-[#2D4354] font-bold">Workspaces</span> created in StudyPilot
          </p>
        </div>

        {/* Metric 2: Uploaded Study Materials */}
        <div className="bg-white rounded-3xl p-6 border border-[#73766A]/15 shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(115,118,106,0.12)] hover:border-[#73766A]/40 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#77756F]">
                Study Materials
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#73766A] border border-[#73766A]/30">
                Active
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#73766A]/15 text-[#73766A] flex items-center justify-center border border-[#73766A]/30 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#20212B]">
              <AnimatedCounter value={stats?.metrics?.totalStudyMaterials ?? 0} />
            </span>
            <span className="text-xs font-semibold text-[#77756F]">documents</span>
          </div>
          <p className="mt-2 text-xs text-[#77756F] font-medium">
            Course textbooks & notes analyzed
          </p>
        </div>

        {/* Metric 3: Overall Preparation Progress */}
        <div className="bg-white rounded-3xl p-6 border border-[#73766A]/15 shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(158,103,82,0.12)] hover:border-[#9E6752]/40 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#77756F]">
                Prep Progress
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FED7A5]/30 text-[#9E6752] border border-[#FED7A5]">
                Live
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#FED7A5]/30 text-[#9E6752] flex items-center justify-center border border-[#9E6752]/30 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-[#20212B]">
              <AnimatedCounter value={prepProgress} />%
            </span>
            <span className="text-xs font-semibold text-[#77756F]">syllabus mastery</span>
          </div>
          <div className="mt-3.5 w-full bg-[#FAF8F5] rounded-full h-2.5 overflow-hidden p-0.5 border border-[#73766A]/10">
            <div
              className="bg-gradient-to-r from-[#2D4354] via-[#9E6752] to-[#FED7A5] h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${prepProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. The StudyPilot Method Workflow Banner (SCREEN 02) */}
      <WorkflowBanner />

      {/* 3.5. Smart Resource Finder (SCREEN 07) */}
      <SmartResourceFinder />

      {/* 4. Bottom Grid: Upcoming Examinations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Examinations Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#73766A]/15 shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#73766A]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2D4354]/10 text-[#2D4354] flex items-center justify-center border border-[#2D4354]/20">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-[#20212B] text-base">
                  Upcoming Examinations
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#2D4354] bg-[#FED7A5]/30 px-3 py-1 rounded-full border border-[#FED7A5] shadow-2xs">
                Live DateSheet
              </span>
            </div>

            {exams && exams.length > 0 ? (
              <div className="py-3 divide-y divide-[#73766A]/10">
                {exams.slice(0, 3).map((exam) => {
                  const now = new Date();
                  const examDate = new Date(exam.examDate);
                  const diffDays = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
                  const subjectName = exam.subjectId?.subjectName || exam.subjectName || exam.examName || 'Subject';
                  const subjectCode = exam.subjectCode || exam.subjectId?.subjectCode || '';

                  let badgeColor = 'bg-[#FAF8F5] text-[#2D4354] border-[#73766A]/20';
                  let badgeText = `In ${diffDays}d`;
                  if (diffDays < 0) {
                    badgeColor = 'bg-[#FAF8F5] text-[#77756F] border-[#73766A]/20';
                    badgeText = 'Past';
                  } else if (diffDays === 0) {
                    badgeColor = 'bg-[#FFF7EC] text-[#9E6752] border-[#9E6752]/40 font-bold animate-pulse';
                    badgeText = 'Today!';
                  } else if (diffDays === 1) {
                    badgeColor = 'bg-[#FED7A5]/40 text-[#9E6752] border-[#FED7A5] font-bold';
                    badgeText = 'Tomorrow';
                  }

                  return (
                    <div
                      key={exam._id}
                      onClick={() => navigate(`/exams?examId=${exam._id}`)}
                      className="py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#FAF8F5] -mx-2 px-3 rounded-2xl transition-all duration-200 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#77756F] truncate max-w-[130px]">
                            {subjectCode ? `${subjectCode} • ` : ''}{subjectName}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                            {badgeText}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#20212B] group-hover:text-[#2D4354] truncate transition-colors">
                          {exam.examName}
                        </p>
                        <p className="text-[11px] text-[#77756F] mt-0.5 font-medium">
                          {examDate.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })} • {exam.dailyAvailableHours}h daily prep
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/exams?examId=${exam._id}`);
                        }}
                        className="p-2 rounded-xl text-[#77756F] group-hover:text-[#2D4354] group-hover:bg-white shadow-2xs transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="py-9 px-4 text-center flex flex-col items-center">
                <div className="w-13 h-13 rounded-2xl bg-[#FED7A5]/30 text-[#2D4354] flex items-center justify-center mb-3 border border-[#FED7A5] shadow-2xs">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#20212B]">
                  No examinations scheduled yet
                </h4>
                <p className="text-xs text-[#77756F] max-w-sm mt-1 leading-relaxed">
                  Schedule your upcoming midterms and finals to unlock personalized AI study schedules.
                </p>
                <button
                  onClick={() => navigate('/exams')}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all transform hover:scale-[1.02]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FED7A5]" />
                  <span>Schedule Exam</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#73766A]/10 flex items-center justify-between text-xs text-[#77756F] font-medium">
            <span>Automated AI study timelines</span>
            <button
              onClick={() => navigate('/exams')}
              className="text-[#2D4354] hover:text-[#9E6752] font-bold flex items-center gap-1 transition-colors"
            >
              <span>View Exam Planner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#73766A]/15 shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#73766A]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#73766A]/15 text-[#73766A] flex items-center justify-center border border-[#73766A]/25">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-[#20212B] text-base">
                  Recent Activity
                </h3>
              </div>
              <span className="text-xs text-[#77756F] font-semibold">Live stream</span>
            </div>

            <div className="py-3 divide-y divide-[#73766A]/10">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="py-3.5 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-[#FED7A5]/30 text-[#9E6752] flex items-center justify-center shrink-0 mt-0.5 border border-[#FED7A5]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#20212B] truncate">
                        {activity.title}
                      </p>
                      <p className="text-[11px] text-[#77756F] truncate font-medium">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#77756F] shrink-0 font-medium">
                      {activity.timestamp
                        ? new Date(activity.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Just now'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-9 text-center text-xs text-[#77756F] font-medium">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#73766A]/10">
            <button
              onClick={() => navigate('/subjects')}
              className="text-xs font-bold text-[#2D4354] hover:text-[#9E6752] flex items-center gap-1 transition-colors"
            >
              <span>View all subject workspaces</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4.5. Core Study Tools Suite */}
      <div className="space-y-4 pt-4 border-t border-[#73766A]/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#20212B]">
                Core Study Tools & Assessment Suite
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#2D4354] border border-[#2D4354]/30">
                Active & Ready
              </span>
            </div>
            <p className="text-xs text-[#77756F] font-medium">
              Interactive quizzes, mistake diagnostics, and automated exam readiness planning
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#2D4354] bg-[#FED7A5]/35 border border-[#FED7A5] px-3 py-1 rounded-full self-start sm:self-auto shadow-2xs">
            Comprehensive Suite Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Quizzes & Mock Tests */}
          <div className="bg-white rounded-3xl p-6 border border-[#73766A]/15 shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] flex flex-col justify-between hover:border-[#2D4354]/40 hover:shadow-[0_12px_28px_-4px_rgba(45,67,84,0.12)] transition-all duration-300 transform hover:-translate-y-1.5 group">
            <div>
              <div className="flex items-start justify-between mb-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#2D4354]/10 text-[#2D4354] border border-[#2D4354]/20 flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#2D4354] border border-[#2D4354]/25">
                  Assessments
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-[#20212B] group-hover:text-[#2D4354] transition-colors">
                Interactive Quizzes & Mock Tests
              </h4>
              <p className="text-xs text-[#77756F] mt-1.5 leading-relaxed font-normal">
                Adaptive mock exams and topic-wise practice tests synthesized from your course materials with instant scoring.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[#73766A]/10 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#77756F]">
                <span>Evaluated</span>
                <span className="text-[#2D4354] font-bold bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#73766A]/20">
                  {stats?.metrics?.totalQuizzes ?? 0} Quizzes
                </span>
              </div>
              <button
                onClick={() => navigate('/subjects')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <span>Launch Quiz in Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Mistake Analysis & Weak Topics */}
          <div className="bg-white rounded-3xl p-6 border border-[#73766A]/15 shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] flex flex-col justify-between hover:border-[#9E6752]/40 hover:shadow-[0_12px_28px_-4px_rgba(158,103,82,0.12)] transition-all duration-300 transform hover:-translate-y-1.5 group">
            <div>
              <div className="flex items-start justify-between mb-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FED7A5]/30 text-[#9E6752] border border-[#9E6752]/30 flex items-center justify-center shadow-xs">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#9E6752]/30">
                  Diagnostics
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-[#20212B] group-hover:text-[#9E6752] transition-colors">
                Mistake Analysis & Weak Topics
              </h4>
              <p className="text-xs text-[#77756F] mt-1.5 leading-relaxed font-normal">
                Diagnostic mistake tracking, topic accuracy benchmarks, and rule-based weak area recommendations.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[#73766A]/10 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#77756F]">
                <span>Diagnostic Engine</span>
                <span className="text-[#9E6752] font-bold bg-[#FFF7EC] px-2 py-0.5 rounded-md border border-[#9E6752]/30">
                  Active & Tracking
                </span>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('dashboard-diagnostic');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#20212B] hover:bg-[#2D4354] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <span>View Performance Diagnostics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Study Planner & Readiness Analytics */}
          <div className="bg-white rounded-3xl p-6 border border-[#73766A]/15 shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] flex flex-col justify-between hover:border-[#73766A]/40 hover:shadow-[0_12px_28px_-4px_rgba(115,118,106,0.12)] transition-all duration-300 transform hover:-translate-y-1.5 group">
            <div>
              <div className="flex items-start justify-between mb-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#73766A]/15 text-[#73766A] border border-[#73766A]/30 flex items-center justify-center shadow-xs">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#73766A] border border-[#73766A]/30">
                  Adaptive Routine
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-[#20212B] group-hover:text-[#2D4354] transition-colors">
                Study Planner & Readiness Analytics
              </h4>
              <p className="text-xs text-[#77756F] mt-1.5 leading-relaxed font-normal">
                Live exam countdowns, automated day-by-day study schedules, syllabus coverage tracking, and dynamic plan adjustment.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[#73766A]/10 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#77756F]">
                <span>Upcoming Exams</span>
                <span className="text-[#2D4354] font-bold bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#73766A]/20">
                  {stats?.metrics?.totalExams ?? 0} Scheduled
                </span>
              </div>
              <button
                onClick={() => navigate('/exams?tab=schedules')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(45,67,84,0.3)] transition-all"
              >
                <span>Open Study Planner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Diagnostic Performance & Topic Mastery Analytics (SCREEN 08) */}
      <div id="dashboard-diagnostic" className="space-y-4 pt-4 border-t border-[#73766A]/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2D4354] to-[#9E6752] text-[#FED7A5] flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#20212B]">
                Academic Performance & Diagnostic Mastery
              </h3>
              <p className="text-xs text-[#77756F] font-medium">
                Real-time multi-quiz accuracy, score history, and weak-topic detection
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#2D4354] bg-[#FED7A5]/30 px-3 py-1 rounded-full border border-[#FED7A5] shadow-2xs">
            Live Diagnostics
          </span>
        </div>

        <PerformanceAnalyticsView />
      </div>

      {/* Modal: Create Subject */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubject}
        isSubmitting={isSubmittingSubject}
      />
    </div>
  );
};

export default DashboardPage;
