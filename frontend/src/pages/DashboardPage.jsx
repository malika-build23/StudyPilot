import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, subjectsAPI } from '../services/api';
import WorkflowBanner from '../components/common/WorkflowBanner';
import SubjectModal from '../components/subjects/SubjectModal';
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
  AlertCircle
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Subject Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingSubject, setIsSubmittingSubject] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getStats();
      if (res.data?.success) {
        setStats(res.data.data);
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">Loading dashboard overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{error}</span>
        </div>
      )}
      {/* 1. Welcome Header Section */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-20 -mb-16 w-48 h-48 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Academic Command Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}! 👋
          </h2>
          <p className="mt-2 text-blue-100/90 text-sm sm:text-base leading-relaxed">
            Organise your study materials, prepare concepts with structured repetition, and track your readiness for upcoming exams.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-semibold text-xs sm:text-sm hover:bg-blue-50 shadow-xs transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Create Subject</span>
            </button>
            <button
              onClick={() => navigate('/subjects')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Subjects</span>
            </button>
            <button
              onClick={() => setMaterialModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Study Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1: Total Subjects */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Subjects
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.metrics?.totalSubjects ?? 0}
            </span>
            <span className="text-xs text-slate-500">active courses</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-blue-600 font-medium">Workspaces</span> created in StudyPilot
          </p>
        </div>

        {/* Metric 2: Uploaded Study Materials (0 in Phase 1) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Study Materials
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                Phase 2
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.metrics?.totalStudyMaterials ?? 0}
            </span>
            <span className="text-xs text-slate-400">documents</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Document upload engine ready in Phase 2
          </p>
        </div>

        {/* Metric 3: Overall Preparation Progress (0% in Phase 1) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Prep Progress
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                Phase 3 & 4
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.metrics?.preparationProgress ?? 0}%
            </span>
            <span className="text-xs text-slate-400">mastery</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${stats?.metrics?.preparationProgress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. The StudyPilot Method Workflow Banner */}
      <WorkflowBanner />

      {/* 4. Bottom Grid: Upcoming Examinations (Empty State) & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Examinations Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Upcoming Examinations
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                Phase 4 Planner
              </span>
            </div>

            {/* Empty State */}
            <div className="py-10 px-4 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                No examinations scheduled yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                Exam scheduling, target revision deadlines, and readiness trackers will be activated in Phase 4: Study Planner & Analytics.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated countdowns</span>
            <span className="text-blue-600 font-medium">Coming Soon</span>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Recent Activity
                </h3>
              </div>
              <span className="text-xs text-slate-400">Live stream</span>
            </div>

            <div className="py-3 divide-y divide-slate-100">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="py-3 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
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
                <div className="py-8 text-center text-xs text-slate-400">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/subjects')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all subject workspaces</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Create Subject */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSubject}
        isSubmitting={isSubmittingSubject}
      />

      {/* Placeholder Modal: Study Material Upload */}
      {materialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase mb-2">
              Coming in Phase 2
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Study Material Upload Engine
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              In Phase 2, you will be able to upload PDF textbooks, lecture slides, and handwritten notes. The platform will automatically parse, summarize, and convert them into interactive study cards.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setMaterialModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
