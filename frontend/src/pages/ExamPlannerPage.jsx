import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { examsAPI, studyPlansAPI, subjectsAPI, dateSheetsAPI } from '../services/api';
import DateSheetUploadModal from '../components/exams/DateSheetUploadModal';
import PracticalExamModal from '../components/exams/PracticalExamModal';
import ExamModal from '../components/exams/ExamModal';
import ExamCountdown from '../components/exams/ExamCountdown';
import ExamCalendarView from '../components/exams/ExamCalendarView';
import StudyPlanView from '../components/exams/StudyPlanView';
import {
  Calendar,
  Clock,
  Plus,
  Sparkles,
  BookOpen,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trash2,
  Edit3,
  Search,
  Filter,
  Layers,
  TrendingUp,
  BrainCircuit,
  CalendarDays,
  Target,
  UploadCloud,
  Beaker,
  FileText,
  MapPin,
  ChevronRight,
  ArrowRight,
  CheckCheck,
  Award,
} from 'lucide-react';

const ExamPlannerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialExamId = searchParams.get('examId');
  const initialTab = searchParams.get('tab') || 'overview';

  // Navigation tab state: 'overview' | 'university' | 'practical' | 'calendar' | 'completed' | 'schedules'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data states
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [overviewStats, setOverviewStats] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || null);
  const [activePlan, setActivePlan] = useState(null);

  // Loading & Action states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isRegeneratingPlan, setIsRegeneratingPlan] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isDateSheetModalOpen, setIsDateSheetModalOpen] = useState(false);
  const [isPracticalModalOpen, setIsPracticalModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  // Search filter inside lists
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Initial Data Fetching
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [examsRes, subjectsRes, overviewRes] = await Promise.allSettled([
        examsAPI.getAll(),
        subjectsAPI.getAll(),
        examsAPI.getOverview(),
      ]);

      if (examsRes.status === 'fulfilled' && examsRes.value.data?.success) {
        const fetchedExams = examsRes.value.data.data || [];
        setExams(fetchedExams);

        if (initialExamId && fetchedExams.some((e) => e._id === initialExamId)) {
          setSelectedExamId(initialExamId);
        } else if (fetchedExams.length > 0 && !selectedExamId) {
          setSelectedExamId(fetchedExams[0]._id);
        }
      }

      if (subjectsRes.status === 'fulfilled' && subjectsRes.value.data?.success) {
        setSubjects(subjectsRes.value.data.data || []);
      }

      if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.success) {
        setOverviewStats(overviewRes.value.data.data);
      }
    } catch (err) {
      console.error('Error loading smart exam planner data:', err);
      setError('Failed to load examination schedules. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Sync selected exam from URL query
  useEffect(() => {
    if (initialExamId && exams.some((e) => e._id === initialExamId)) {
      setSelectedExamId(initialExamId);
    }
  }, [initialExamId, exams]);

  // Selected Exam Object
  const selectedExam = useMemo(() => {
    return exams.find((e) => e._id === selectedExamId) || null;
  }, [exams, selectedExamId]);

  // 2. Fetch Study Plan when selectedExamId changes
  useEffect(() => {
    let isMounted = true;

    const fetchPlanForExam = async (examId) => {
      if (!examId) {
        setActivePlan(null);
        return;
      }

      try {
        setIsLoadingPlan(true);
        const res = await studyPlansAPI.getByExam(examId);
        if (isMounted) {
          if (res.data?.success && res.data.data) {
            setActivePlan(res.data.data);
          } else {
            setActivePlan(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status === 404) {
            setActivePlan(null);
          } else {
            setActivePlan(null);
          }
        }
      } finally {
        if (isMounted) setIsLoadingPlan(false);
      }
    };

    fetchPlanForExam(selectedExamId);

    return () => {
      isMounted = false;
    };
  }, [selectedExamId]);

  // 3. Categorized Examination Collections
  const {
    upcomingExams,
    universityExams,
    practicalExams,
    completedExams,
    nextExam,
  } = useMemo(() => {
    const now = new Date();

    const isUpcoming = (e) => {
      if (e.status === 'completed') return false;
      const d = new Date(e.examDate);
      if (e.endTime) {
        const [h, m] = e.endTime.split(':').map(Number);
        if (!Number.isNaN(h)) {
          d.setHours(h, m || 0, 0, 0);
          return now <= d;
        }
      }
      d.setHours(23, 59, 59, 999);
      return now <= d;
    };

    const upcoming = [];
    const completed = [];
    const uni = [];
    const practical = [];

    exams.forEach((exam) => {
      const up = isUpcoming(exam);
      if (up) {
        upcoming.push(exam);
        if (exam.examCategory === 'UNIVERSITY_THEORY') {
          uni.push(exam);
        } else {
          practical.push(exam);
        }
      } else {
        completed.push(exam);
      }
    });

    upcoming.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
    uni.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
    practical.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
    completed.sort((a, b) => new Date(b.examDate) - new Date(a.examDate));

    return {
      upcomingExams: upcoming,
      universityExams: uni,
      practicalExams: practical,
      completedExams: completed,
      nextExam: upcoming.length > 0 ? upcoming[0] : null,
    };
  }, [exams]);

  // Filter list by searchTerm
  const applySearch = (list) => {
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (e) =>
        e.examName?.toLowerCase().includes(q) ||
        e.subjectCode?.toLowerCase().includes(q) ||
        e.subjectId?.subjectName?.toLowerCase().includes(q) ||
        e.examType?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
    );
  };

  // 4. Handlers
  const handleDateSheetComplete = (data) => {
    setSuccessMsg(
      `University Date Sheet processed! Added ${data.createdCount} examinations to your calendar.`
    );
    setTimeout(() => setSuccessMsg(''), 5000);
    fetchAllData();
    setActiveTab('university');
  };

  const handleCreatePracticalSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (editingExam) {
        const res = await examsAPI.updatePractical(editingExam._id, formData);
        if (res.data?.success) {
          setIsPracticalModalOpen(false);
          setEditingExam(null);
          setSuccessMsg('Practical examination updated successfully.');
          setTimeout(() => setSuccessMsg(''), 4000);
          fetchAllData();
        }
      } else {
        const res = await examsAPI.createPractical(formData);
        if (res.data?.success) {
          setIsPracticalModalOpen(false);
          setSuccessMsg('Practical examination scheduled.');
          setTimeout(() => setSuccessMsg(''), 4000);
          fetchAllData();
          setActiveTab('practical');
        }
      }
    } catch (err) {
      console.error('Error saving practical exam:', err);
      setError(err.response?.data?.message || 'Failed to save practical exam.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGeneralExamSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (editingExam) {
        const res = await examsAPI.update(editingExam._id, formData);
        if (res.data?.success) {
          setIsExamModalOpen(false);
          setEditingExam(null);
          setSuccessMsg('Examination updated successfully.');
          setTimeout(() => setSuccessMsg(''), 4000);
          fetchAllData();
        }
      } else {
        const res = await examsAPI.create(formData);
        if (res.data?.success) {
          setIsExamModalOpen(false);
          setSelectedExamId(res.data.data._id);
          setSuccessMsg('Exam scheduled! You can now generate an AI study schedule.');
          setTimeout(() => setSuccessMsg(''), 4000);
          fetchAllData();
          setActiveTab('schedules');
        }
      }
    } catch (err) {
      console.error('Error saving exam:', err);
      setError(err.response?.data?.message || 'Failed to save examination.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!examToDelete) return;
    try {
      const res = await examsAPI.delete(examToDelete._id);
      if (res.data?.success) {
        setExamToDelete(null);
        setSuccessMsg('Examination and associated study plan removed.');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      setError(err.response?.data?.message || 'Failed to delete exam.');
    }
  };

  // Study Plan Generation
  const handleGeneratePlan = async () => {
    if (!selectedExamId) return;
    try {
      setIsGeneratingPlan(true);
      setError('');

      const res = await studyPlansAPI.generate(selectedExamId);
      if (res.data?.success) {
        setActivePlan(res.data.data);
        setSuccessMsg('AI Study Schedule generated with diagnostic analytics!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error generating plan:', err);
      setError(err.response?.data?.message || 'Failed to generate study schedule.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Task Toggle
  const handleTaskToggle = async (taskId, currentStatus) => {
    if (!activePlan) return;
    const newStatus = !currentStatus;

    // Optimistic Update
    setActivePlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        schedule: prev.schedule.map((day) => ({
          ...day,
          tasks: day.tasks.map((task) =>
            task._id === taskId ? { ...task, completed: newStatus } : task
          ),
        })),
      };
    });

    try {
      await studyPlansAPI.updateTask(activePlan._id, taskId, newStatus);
    } catch (err) {
      console.error('Error toggling task:', err);
      // Revert optimistic update
      setActivePlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          schedule: prev.schedule.map((day) => ({
            ...day,
            tasks: day.tasks.map((task) =>
              task._id === taskId ? { ...task, completed: currentStatus } : task
            ),
          })),
        };
      });
      setError('Failed to update task progress.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Regenerate Plan
  const handleRegeneratePlan = async () => {
    if (!activePlan) return;
    try {
      setIsRegeneratingPlan(true);
      setError('');

      const res = await studyPlansAPI.regenerate(activePlan._id);
      if (res.data?.success) {
        setActivePlan(res.data.data);
        setSuccessMsg('Study schedule regenerated! Completed tasks preserved.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Error regenerating plan:', err);
      setError(err.response?.data?.message || 'Failed to regenerate study schedule.');
    } finally {
      setIsRegeneratingPlan(false);
    }
  };

  // Open Edit based on category
  const handleOpenEdit = (exam, e) => {
    if (e) e.stopPropagation();
    setEditingExam(exam);
    if (exam.examCategory === 'PRACTICAL_INTERNAL') {
      setIsPracticalModalOpen(true);
    } else {
      setIsExamModalOpen(true);
    }
  };

  // Quick navigation to Study Schedule for an exam
  const handleOpenStudySchedule = (exam, e) => {
    if (e) e.stopPropagation();
    setSelectedExamId(exam._id);
    setActiveTab('schedules');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. HERO COMMAND CENTER & STATS */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-28 -mb-16 w-48 h-48 rounded-full bg-blue-500/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                Smart Exam Planner & Date Sheet Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              University & Practical Examination Planner
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Upload your official university date sheet PDF to automatically extract dates, timings, and live countdowns,
              or manually schedule laboratory practicals, vivas, and class quizzes.
            </p>
          </div>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsDateSheetModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs sm:text-sm font-extrabold shadow-lg shadow-amber-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <UploadCloud className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Upload University Date Sheet</span>
            </button>

            <button
              onClick={() => {
                setEditingExam(null);
                setIsPracticalModalOpen(true);
              }}
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold backdrop-blur-xs flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Beaker className="w-4 h-4 text-purple-200" />
              <span>+ Practical / Internal</span>
            </button>
          </div>
        </div>

        {/* Hero 5-Stats Metric Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
              Total Upcoming
            </p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {upcomingExams.length}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
              University Theory
            </p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {universityExams.length}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
              Practical & Lab
            </p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {practicalExams.length}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
            <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
              Nearest Exam
            </p>
            <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
              {overviewStats?.nearestDays !== null && overviewStats?.nearestDays !== undefined
                ? `${overviewStats.nearestDays}d`
                : upcomingExams.length > 0
                ? 'Scheduled'
                : 'None'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 col-span-2 sm:col-span-1">
            <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
              Completed
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
              {completedExams.length}
            </p>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-emerald-500 hover:text-emerald-700 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* NEXT UPCOMING EXAMINATION SPOTLIGHT (If available) */}
      {nextExam && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  Next Upcoming Examination
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {nextExam.examCategory === 'UNIVERSITY_THEORY' ? 'University Theory' : nextExam.examType}
                </span>
                {nextExam.subjectCode && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                    {nextExam.subjectCode}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {nextExam.examName}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-3">
                <span>
                  {new Date(nextExam.examDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {nextExam.startTime && (
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {nextExam.startTime} {nextExam.endTime ? `- ${nextExam.endTime}` : ''}
                  </span>
                )}
                {nextExam.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {nextExam.location}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 text-center">
                Live Countdown
              </p>
              <ExamCountdown
                examDate={nextExam.examDate}
                startTime={nextExam.startTime}
                endTime={nextExam.endTime}
              />
            </div>

            <button
              onClick={() => handleOpenStudySchedule(nextExam)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Prepare Study Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'overview', label: 'Overview', icon: Target, count: upcomingExams.length },
            { id: 'university', label: 'University Exams', icon: BookOpen, count: universityExams.length },
            { id: 'practical', label: 'Practical & Internal', icon: Beaker, count: practicalExams.length },
            { id: 'calendar', label: 'Calendar View', icon: Calendar },
            { id: 'completed', label: 'Completed Exams', icon: CheckCheck, count: completedExams.length },
            { id: 'schedules', label: 'Adaptive Study Plans', icon: BrainCircuit, badge: 'Phase 6' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Search Box for Lists */}
        {['overview', 'university', 'practical', 'completed'].includes(activeTab) && (
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by subject, code, type..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 outline-hidden"
            />
          </div>
        )}
      </div>

      {/* 3. TAB VIEWS CONTENT */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Upcoming University Theory Sessions */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Upcoming University Theory Exams
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Official semester date sheet papers
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDateSheetModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Upload PDF</span>
                </button>
              </div>

              {applySearch(universityExams).length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">No theory exams scheduled</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                    Upload your university date sheet PDF to auto-populate your theory timetable.
                  </p>
                  <button
                    onClick={() => setIsDateSheetModalOpen(true)}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors"
                  >
                    Upload Date Sheet
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {applySearch(universityExams).map((exam) => (
                    <ExamCardItem
                      key={exam._id}
                      exam={exam}
                      onEdit={(e) => handleOpenEdit(exam, e)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        setExamToDelete(exam);
                      }}
                      onStudySchedule={(e) => handleOpenStudySchedule(exam, e)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Upcoming Practicals, Labs, Vivas & Quizzes */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Beaker className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Upcoming Practicals & Internal Assessments
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Independent lab vivas, class quizzes & assignments
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingExam(null);
                    setIsPracticalModalOpen(true);
                  }}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Practical</span>
                </button>
              </div>

              {applySearch(practicalExams).length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                    <Beaker className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">No practical exams scheduled</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                    Keep lab exams, project vivas, and internal class tests organized separately.
                  </p>
                  <button
                    onClick={() => {
                      setEditingExam(null);
                      setIsPracticalModalOpen(true);
                    }}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs hover:bg-purple-700 transition-colors"
                  >
                    Schedule Practical
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {applySearch(practicalExams).map((exam) => (
                    <ExamCardItem
                      key={exam._id}
                      exam={exam}
                      onEdit={(e) => handleOpenEdit(exam, e)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        setExamToDelete(exam);
                      }}
                      onStudySchedule={(e) => handleOpenStudySchedule(exam, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UNIVERSITY EXAMS */}
      {activeTab === 'university' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Official University Theory Timetable
              </h3>
              <p className="text-xs text-slate-500">
                Sessions extracted from university date sheet PDF or entered manually.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDateSheetModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload New Date Sheet</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applySearch(universityExams).map((exam) => (
              <ExamCardItem
                key={exam._id}
                exam={exam}
                onEdit={(e) => handleOpenEdit(exam, e)}
                onDelete={(e) => {
                  e.stopPropagation();
                  setExamToDelete(exam);
                }}
                onStudySchedule={(e) => handleOpenStudySchedule(exam, e)}
              />
            ))}
          </div>

          {applySearch(universityExams).length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No university exams found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Upload your university PDF date sheet to have Gemini automatically extract and verify your schedule.
              </p>
              <button
                onClick={() => setIsDateSheetModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700"
              >
                Upload Date Sheet
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRACTICAL & INTERNAL EXAMS */}
      {activeTab === 'practical' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Practical, Lab, Viva, and Internal Assessment Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Independent schedules typically not found on university theory date sheets.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingExam(null);
                setIsPracticalModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Practical</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applySearch(practicalExams).map((exam) => (
              <ExamCardItem
                key={exam._id}
                exam={exam}
                onEdit={(e) => handleOpenEdit(exam, e)}
                onDelete={(e) => {
                  e.stopPropagation();
                  setExamToDelete(exam);
                }}
                onStudySchedule={(e) => handleOpenStudySchedule(exam, e)}
              />
            ))}
          </div>

          {applySearch(practicalExams).length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Beaker className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No practical examinations scheduled</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Schedule your laboratory practicals, project vivas, and mid-semester quizzes independently.
              </p>
              <button
                onClick={() => {
                  setEditingExam(null);
                  setIsPracticalModalOpen(true);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs hover:bg-purple-700"
              >
                Schedule Practical
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <ExamCalendarView
          exams={exams}
          onSelectExam={(exam) => handleOpenStudySchedule(exam)}
        />
      )}

      {/* TAB 5: COMPLETED EXAMS */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Completed Examinations Archive</h3>
            <p className="text-xs text-slate-500">
              Past university and internal assessments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {applySearch(completedExams).map((exam) => (
              <ExamCardItem
                key={exam._id}
                exam={exam}
                isCompleted={true}
                onEdit={(e) => handleOpenEdit(exam, e)}
                onDelete={(e) => {
                  e.stopPropagation();
                  setExamToDelete(exam);
                }}
                onStudySchedule={(e) => handleOpenStudySchedule(exam, e)}
              />
            ))}
          </div>

          {applySearch(completedExams).length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <CheckCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No completed exams recorded yet</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: AI STUDY SCHEDULES WORKSPACE */}
      {activeTab === 'schedules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Exams Selector */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Select Target Exam
              </h3>
              <button
                onClick={() => {
                  setEditingExam(null);
                  setIsExamModalOpen(true);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Exam</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {upcomingExams.map((exam) => {
                const isSelected = selectedExamId === exam._id;
                return (
                  <div
                    key={exam._id}
                    onClick={() => setSelectedExamId(exam._id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {exam.examCategory === 'UNIVERSITY_THEORY' ? 'Theory' : exam.examType}
                          </span>
                          {exam.subjectCode && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                              {exam.subjectCode}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {exam.examName}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(exam.examDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })} • {exam.dailyAvailableHours}h/day
                        </p>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-blue-600 translate-x-1' : 'text-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Study Plan Workspace */}
          <div className="lg:col-span-7">
            {!selectedExam ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center flex flex-col items-center justify-center min-h-[380px]">
                <CalendarDays className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-800">No examination selected</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Pick an exam from the left list to review its day-by-day plan or generate a fresh schedule with AI.
                </p>
              </div>
            ) : isLoadingPlan ? (
              <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center flex flex-col items-center justify-center min-h-[380px] gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-xs text-slate-500">Loading study schedule...</p>
              </div>
            ) : isGeneratingPlan ? (
              <div className="bg-white rounded-3xl p-12 border border-blue-200 text-center flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Generating Adaptive Study Schedule
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Gemini AI is pacing your syllabus across available days and weighting topics based on diagnostic quiz results.
                  </p>
                </div>
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            ) : activePlan ? (
              <StudyPlanView
                plan={activePlan}
                exam={selectedExam}
                onTaskToggle={handleTaskToggle}
                onRegenerate={handleRegeneratePlan}
                isRegenerating={isRegeneratingPlan}
                onPlanUpdate={setActivePlan}
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                      Target Exam
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {selectedExam.examName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Date:{' '}
                      {new Date(selectedExam.examDate).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <button
                    onClick={handleGeneratePlan}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Study Schedule</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <p className="font-bold text-slate-800">What this generates:</p>
                  <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                    <li>Day-by-day tasks fitting your {selectedExam.dailyAvailableHours}h daily target</li>
                    <li>Reinforcement blocks for weak areas diagnosed in multi-quiz attempts</li>
                    <li>Practice tests, concept review, and buffer revision before the exam date</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MODALS */}

      {/* Upload Date Sheet Modal */}
      <DateSheetUploadModal
        isOpen={isDateSheetModalOpen}
        onClose={() => setIsDateSheetModalOpen(false)}
        onComplete={handleDateSheetComplete}
      />

      {/* Practical Exam Modal */}
      <PracticalExamModal
        isOpen={isPracticalModalOpen}
        onClose={() => {
          setIsPracticalModalOpen(false);
          setEditingExam(null);
        }}
        onSubmit={handleCreatePracticalSubmit}
        subjects={subjects}
        initialData={editingExam}
        isSubmitting={isSubmitting}
      />

      {/* General Manual Exam Modal */}
      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => {
          setIsExamModalOpen(false);
          setEditingExam(null);
        }}
        onSubmit={handleCreateGeneralExamSubmit}
        subjects={subjects}
        initialData={editingExam}
        isSubmitting={isSubmitting}
      />

      {/* Delete Exam Confirmation Modal */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Examination?
                </h3>
                <p className="text-xs text-slate-500">
                  This will remove the exam and its study plan from your schedule.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Are you sure you want to delete <span className="font-bold">{examToDelete.examName}</span>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExam}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Delete Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Exam Card Item
const ExamCardItem = ({
  exam,
  isCompleted = false,
  onEdit,
  onDelete,
  onStudySchedule,
}) => {
  const isUni = exam.examCategory === 'UNIVERSITY_THEORY';

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-3 group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          {/* Badge Row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                isUni
                  ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                  : 'bg-purple-50 text-purple-700 border-purple-200/60'
              }`}
            >
              {isUni ? 'University Theory' : exam.examType || 'Practical'}
            </span>

            {exam.subjectCode && (
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 uppercase">
                {exam.subjectCode}
              </span>
            )}

            {exam.verificationStatus === 'NEEDS_REVIEW' && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Review Needed
              </span>
            )}
          </div>

          {/* Exam Name */}
          <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
            {exam.examName}
          </h4>

          {/* Date, Timing & Location */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(exam.examDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>

            {exam.startTime && (
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {exam.startTime} {exam.endTime ? `- ${exam.endTime}` : ''}
              </span>
            )}

            {exam.location && (
              <span className="flex items-center gap-1 font-medium text-slate-600 truncate max-w-[150px]">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                {exam.location}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons (Edit & Delete) */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            title="Edit exam"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
            title="Delete exam"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Footer: Live Countdown ticker & Study Plan Button */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 gap-2">
        <div className="min-w-0">
          <ExamCountdown
            examDate={exam.examDate}
            startTime={exam.startTime}
            endTime={exam.endTime}
            compact={true}
          />
        </div>

        <button
          onClick={onStudySchedule}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0 transition-colors"
        >
          <span>Study Plan</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default ExamPlannerPage;
