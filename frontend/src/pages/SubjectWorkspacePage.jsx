import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { subjectsAPI, materialsAPI } from '../services/api';

import SubjectModal from '../components/subjects/SubjectModal';
import DeleteConfirmModal from '../components/subjects/DeleteConfirmModal';
import MaterialUploadModal from '../components/materials/MaterialUploadModal';
import MaterialsList from '../components/materials/MaterialsList';
import DocumentIntelligenceView from '../components/ai/DocumentIntelligenceView';
import QuizGenerationView from '../components/quiz/QuizGenerationView';
import PerformanceAnalyticsView from '../components/analytics/PerformanceAnalyticsView';
import FlashcardGeneratorModal from '../components/flashcards/FlashcardGeneratorModal';
import CleanNotesUploadModal from '../components/notes/CleanNotesUploadModal';
import MnemonicGenerator from '../components/ai/MnemonicGenerator';
import DiagramGenerator from '../components/ai/DiagramGenerator';

import {
  ArrowLeft,
  Calendar,
  Edit2,
  Trash2,
  UploadCloud,
  Brain,
  CheckCircle,
  BarChart2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Layers,
  RotateCcw,
  FileEdit,
  Play,
} from 'lucide-react';

import backpackImg from '../assets/illustrations/element_student_backpack.png';

const SubjectWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [cleanNotesModalOpen, setCleanNotesModalOpen] = useState(false);

  // --------------------------------------------------
  // FETCH SUBJECT
  // --------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const fetchSubject = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await subjectsAPI.getById(id);

        if (isMounted && res.data?.success) {
          setSubject(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching subject details:', err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            'Failed to load subject workspace.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSubject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // --------------------------------------------------
  // FETCH STUDY MATERIALS
  // --------------------------------------------------

  const fetchMaterials = useCallback(async () => {
    try {
      setMaterialsLoading(true);

      const res = await materialsAPI.getBySubject(id);

      if (res.data?.success) {
        const mats = res.data.data || res.data.materials || [];

        setMaterials(mats);

        setSelectedMaterial((current) => {
          if (!current) return mats[0] || null;

          return mats.find((m) => m._id === current._id) || null;
        });
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMaterials();
    }
  }, [id, fetchMaterials]);

  // --------------------------------------------------
  // UPDATE SUBJECT
  // --------------------------------------------------

  const handleUpdate = async (formData) => {
    try {
      setIsSubmitting(true);

      const res = await subjectsAPI.update(id, formData);

      if (res.data?.success) {
        setSubject(res.data.data);
        setEditModalOpen(false);
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Failed to update subject.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // DELETE SUBJECT
  // --------------------------------------------------

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const res = await subjectsAPI.delete(id);

      if (res.data?.success) {
        navigate('/subjects');
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Failed to delete subject.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // --------------------------------------------------
  // DELETE MATERIAL
  // --------------------------------------------------

  const handleDeleteMaterial = async (materialId) => {
    try {
      const res = await materialsAPI.delete(materialId);

      if (res.data?.success) {
        await fetchMaterials();
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Failed to delete material.'
      );
    }
  };

  // --------------------------------------------------
  // SCROLL NAVIGATION
  // --------------------------------------------------

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#9E6752]" />

        <p className="text-xs text-[#81786F] font-medium">
          Opening subject workspace...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (error || !subject) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-[#8A8175]/20 text-center max-w-lg mx-auto my-12">

        <div className="w-14 h-14 rounded-2xl bg-[#FFF7EC] text-[#9E6752] flex items-center justify-center mx-auto mb-4 border border-[#FED7A5]">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-[#534145]">
          Workspace Unavailable
        </h3>

        <p className="text-xs sm:text-sm text-[#81786F] mt-2">
          {error ||
            'This subject does not exist or you do not have permission to view it.'}
        </p>

        <button
          onClick={() => navigate('/subjects')}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E6752] hover:bg-[#80503F] text-white font-semibold text-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Subjects
        </button>
      </div>
    );
  }

  // --------------------------------------------------
  // STUDY TOOLS
  // --------------------------------------------------

  const studyToolsSuite = [
    {
      title: 'Interactive Quizzes & Mock Tests',
      badge: 'Assessments',
      desc: 'Adaptive mock exams and topic-wise practice tests generated from your course materials to evaluate concept retention and identify weak areas.',
      icon: CheckCircle,
      color: 'bg-[#FED7A5]/30 text-[#9E6752] border border-[#FED7A5]',
      actionLabel: 'Take Quiz / Mock Test',
      actionType: 'scroll',
      target: 'quiz-section',
    },
    {
      title: 'Mistake Analysis & Weak Topics',
      badge: 'Diagnostics',
      desc: 'Track your performance, identify recurring mistakes, and discover topics that need more attention.',
      icon: Brain,
      color: 'bg-[#9E6752]/10 text-[#9E6752] border border-[#9E6752]/20',
      actionLabel: 'View Diagnostic Report',
      actionType: 'scroll',
      target: 'analytics-section',
    },
    {
      title: 'Study Planner & Readiness Analytics',
      badge: 'Adaptive Routine',
      desc: 'Organize your preparation with exam countdowns, daily study schedules, and syllabus tracking.',
      icon: BarChart2,
      color: 'bg-[#8A8175]/15 text-[#8A8175] border border-[#8A8175]/30',
      actionLabel: 'Open Study Planner',
      actionType: 'link',
      to: `/exams?subject=${id}&tab=schedules`,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">

      {/* BREADCRUMB NAVIGATION */}

      <nav className="flex items-center gap-2 text-xs font-semibold text-[#81786F]">

        <Link
          to="/dashboard"
          className="hover:text-[#9E6752] transition-colors"
        >
          Dashboard
        </Link>

        <ChevronRight className="w-3.5 h-3.5 text-[#8A8175]/50" />

        <Link
          to="/subjects"
          className="hover:text-[#9E6752] transition-colors"
        >
          My Subjects
        </Link>

        <ChevronRight className="w-3.5 h-3.5 text-[#8A8175]/50" />

        <span className="text-[#534145] font-bold truncate max-w-[200px]">
          {subject.subjectName}
        </span>

      </nav>

      {/* SUBJECT HEADER */}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F1F0ED] shadow-[0_4px_24px_-2px_rgba(158,103,82,0.06)] hover:shadow-md transition-all duration-300 relative overflow-hidden">

        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#9E6752]/10 via-[#FED7A5]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-5">

          <div className="space-y-2.5 flex-1 min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
                {subject.semester || 'Academic Workspace'}
              </span>

              {subject.createdAt && (
                <span className="text-xs text-[#81786F] flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#9E6752]" />
                  Created {new Date(subject.createdAt).toLocaleDateString()}
                </span>
              )}

            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#534145] tracking-tight">
              {subject.subjectName}
            </h2>

            <p className="text-sm text-[#81786F] max-w-2xl leading-relaxed">
              {subject.description ||
                'No subject description provided yet. Click "Edit Subject" to add course details, textbooks, or syllabus topics.'}
            </p>

          </div>

          <div className="hidden md:flex items-center justify-center shrink-0">
            <img
              src={backpackImg}
              alt="Student Study Backpack"
              className="w-16 h-16 lg:w-20 lg:h-20 object-contain drop-shadow-[0_12px_24px_rgba(45,67,84,0.16)] animate-float-gentle"
            />
          </div>

          {/* SUBJECT ACTIONS */}

          <div className="flex items-center gap-2.5 shrink-0">

            <button
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#8A8175]/25 bg-white text-xs font-semibold text-[#534145] hover:bg-[#FFF7EC] hover:border-[#9E6752]/40 transition-all shadow-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#9E6752]" />
              Edit Subject
            </button>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#9E6752]/30 bg-[#FFF7EC] text-xs font-semibold text-[#9E6752] hover:bg-[#FED7A5]/30 transition-all shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>

          </div>

        </div>
      </div>

      {/* COURSE STUDY MATERIALS */}

      <div className="space-y-4">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          <div>
            <div className="flex items-center gap-2 flex-wrap">

              <h3 className="text-base sm:text-lg font-bold text-[#534145]">
                Course Study Materials
              </h3>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
                Course Library
              </span>

            </div>

            <p className="text-xs text-[#81786F] mt-0.5">
              Upload PDF textbooks or PowerPoint slides (.pptx). Text is automatically extracted for Gemini AI processing.
            </p>
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9E6752] hover:bg-[#80503F] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all self-start sm:self-auto hover:-translate-y-0.5 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#FED7A5]" />
            Upload Document
          </button>

        </div>

        {materials.length === 0 && !materialsLoading ? (

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-dashed border-[#9E6752]/35 text-center shadow-[0_4px_24px_-2px_rgba(158,103,82,0.06)] relative overflow-hidden group hover:border-[#9E6752]/60 transition-all">

            <div className="w-14 h-14 rounded-2xl bg-[#FFF7EC] text-[#9E6752] flex items-center justify-center mx-auto mb-3 shadow-inner border border-[#FED7A5]">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h4 className="text-sm font-bold text-[#534145]">
              No study materials uploaded yet
            </h4>

            <p className="text-xs text-[#81786F] mt-1.5 max-w-md mx-auto leading-relaxed">
              Upload course syllabi, lecture slides, or textbook chapters (PDF or PPTX). Gemini AI will generate chapter summaries, formula sheets, and practice question banks.
            </p>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#9E6752] hover:bg-[#80503F] text-white font-semibold text-xs shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#FED7A5]" />
              Upload First Document
            </button>

          </div>

        ) : (

          <MaterialsList
            materials={materials}
            loading={materialsLoading}
            onDeleteMaterial={handleDeleteMaterial}
            onSelectForAnalysis={setSelectedMaterial}
            selectedMaterialId={selectedMaterial?._id}
          />

        )}

      </div>

      {/* AI DOCUMENT INTELLIGENCE */}

      {selectedMaterial && (
        <div className="space-y-4 pt-2">

          <div className="flex items-center justify-between gap-3 flex-wrap">

            <div className="flex items-center gap-2.5">

              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9E6752] to-[#534145] text-[#FED7A5] flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#534145]">
                  Gemini AI Document Intelligence
                </h3>

                <p className="text-xs text-[#81786F]">
                  Active Document:{' '}
                  <span className="font-semibold text-[#534145]">
                    {selectedMaterial.fileName}
                  </span>
                </p>
              </div>

            </div>

            <span className="text-xs font-bold text-[#9E6752] bg-[#FFF7EC] px-3 py-1 rounded-full border border-[#FED7A5]">
              AI Analysis
            </span>

          </div>

          <DocumentIntelligenceView
            material={selectedMaterial}
            onClose={() => setSelectedMaterial(null)}
          />

        </div>
      )}

      {/* QUIZ & MOCK TEST GENERATION */}

      <div
        id="quiz-section"
        className="space-y-4 pt-6 border-t border-[#F1F0ED] scroll-mt-6"
      >
        <QuizGenerationView
          subjectId={id}
          material={selectedMaterial}
          materials={materials}
          onSelectMaterial={setSelectedMaterial}
          onUploadRequest={() => setUploadModalOpen(true)}
        />
      </div>

      {/* COURSE ANALYTICS */}

      <div
        id="analytics-section"
        className="space-y-5 pt-6 border-t border-[#F1F0ED] scroll-mt-6"
      >

        <div className="flex items-center justify-between gap-3 flex-wrap">

          <div className="flex items-center gap-2.5">

            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9E6752] to-[#8A8175] text-white flex items-center justify-center font-bold shadow-xs">
              <BarChart2 className="w-4 h-4 text-[#FED7A5]" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#534145]">
                Course Diagnostic Analytics & Weak-Topic Detection
              </h3>

              <p className="text-xs text-[#81786F]">
                Live performance metrics, mistake analysis patterns, and revision directives
              </p>
            </div>

          </div>

          <span className="text-xs font-bold text-[#9E6752] bg-[#FFF7EC] px-3 py-1 rounded-full border border-[#FED7A5]">
            Diagnostic Engine
          </span>

        </div>

        <MnemonicGenerator
          subjectId={id}
          selectedMaterial={selectedMaterial}
        />

        <DiagramGenerator
          subjectId={id}
          selectedMaterial={selectedMaterial}
        />

        <PerformanceAnalyticsView subjectId={id} />

      </div>

      {/* FLASHCARDS, SPACED REPETITION & CLEAN NOTES */}

      <div className="space-y-4 pt-6 border-t border-[#F1F0ED]">

        <div className="flex items-center justify-between gap-3 flex-wrap">

          <div className="flex items-center gap-2.5">

            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#534145] to-[#9E6752] text-[#FED7A5] flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-4 h-4" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#534145]">
                Active Recall, Spaced Revision & Clean Notes
              </h3>

              <p className="text-xs text-[#81786F]">
                Active recall question decks, intelligent SM-2 memory retention, and handwritten OCR conversion
              </p>
            </div>

          </div>

          <span className="text-xs font-bold text-[#9E6752] bg-[#FFF7EC] px-3 py-1 rounded-full border border-[#FED7A5]">
            Spaced Learning Suite
          </span>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* AI FLASHCARDS */}

          <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">

            <div>
              <div className="flex items-start justify-between mb-3.5">

                <div className="w-10 h-10 rounded-2xl bg-[#FFF7EC] text-[#9E6752] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#FED7A5]">
                  <Layers className="w-5 h-5" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
                  AI Generator
                </span>

              </div>

              <h4 className="text-sm font-bold text-[#534145] group-hover:text-[#9E6752] transition-colors">
                AI Flashcards Generator
              </h4>

              <p className="text-xs text-[#81786F] mt-1.5 leading-relaxed">
                Generate interactive active-recall question cards from this subject's uploaded slides or textbook chapters.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#F1F0ED] flex items-center gap-2">

              <button
                onClick={() => setFlashcardModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#9E6752] hover:bg-[#80503F] text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FED7A5]" />
                Generate Cards
              </button>

              <Link
                to={`/flashcards?subject=${id}`}
                className="px-3.5 py-2 rounded-xl border border-[#8A8175]/25 hover:bg-[#FFF7EC] text-[#534145] font-semibold text-xs transition-colors"
              >
                View Decks
              </Link>

            </div>
          </div>

          {/* SPACED REPETITION */}

          <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">

            <div>
              <div className="flex items-start justify-between mb-3.5">

                <div className="w-10 h-10 rounded-2xl bg-[#F1F0ED] text-[#8A8175] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#8A8175]/20">
                  <RotateCcw className="w-5 h-5" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F1F0ED] text-[#8A8175] border border-[#8A8175]/20">
                  SM-2 Algorithm
                </span>

              </div>

              <h4 className="text-sm font-bold text-[#534145] group-hover:text-[#9E6752] transition-colors">
                Spaced Repetition System
              </h4>

              <p className="text-xs text-[#81786F] mt-1.5 leading-relaxed">
                Schedule smart revision intervals (Again, Hard, Easy) to permanently retain high-yield subject concepts.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#F1F0ED]">

              <Link
                to={`/revision?subject=${id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#8A8175] hover:bg-[#534145] text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02]"
              >
                <Play className="w-3.5 h-3.5 text-[#FED7A5]" />
                Start Subject Revision
              </Link>

            </div>
          </div>

          {/* CLEAN NOTES CONVERTER */}

          <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">

            <div>
              <div className="flex items-start justify-between mb-3.5">

                <div className="w-10 h-10 rounded-2xl bg-[#FFF7EC] text-[#9E6752] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#FED7A5]">
                  <FileEdit className="w-5 h-5" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
                  OCR & Formatter
                </span>

              </div>

              <h4 className="text-sm font-bold text-[#534145] group-hover:text-[#9E6752] transition-colors">
                Clean Notes Converter
              </h4>

              <p className="text-xs text-[#81786F] mt-1.5 leading-relaxed">
                Upload handwritten notebook photos or scanned notes to transcribe, clean, and structure with formulas.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#F1F0ED] flex items-center gap-2">

              <button
                onClick={() => setCleanNotesModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#9E6752] hover:bg-[#80503F] text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#FED7A5]" />
                Upload Notes
              </button>

              <Link
                to={`/clean-notes?subject=${id}`}
                className="px-3.5 py-2 rounded-xl border border-[#8A8175]/25 hover:bg-[#FFF7EC] text-[#534145] font-semibold text-xs transition-colors"
              >
                View Notes
              </Link>

            </div>
          </div>

        </div>
      </div>

      {/* STUDY TOOLS & ASSESSMENT SUITE */}

      <div className="space-y-4 pt-6 border-t border-[#8A8175]/20">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

          <div>
            <div className="flex items-center gap-2 flex-wrap">

              <h3 className="text-base font-bold text-[#534145]">
                Study Tools & Assessment Suite
              </h3>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FED7A5]/30 text-[#9E6752] border border-[#FED7A5]">
                Assessment & Planning Suite
              </span>

            </div>

            <p className="text-xs text-[#81786F] mt-0.5">
              Interactive quizzes, mistake diagnostics, and automated exam readiness planning
            </p>
          </div>

          <span className="text-[11px] font-semibold text-[#9E6752] bg-[#FFF7EC] border border-[#FED7A5] px-3 py-1 rounded-full self-start sm:self-auto">
            Integrated Learning Loop
          </span>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {studyToolsSuite.map((mod, index) => {
            const Icon = mod.icon;

            return (
              <div
                key={mod.title}
                className="bg-white rounded-3xl p-5 border border-[#8A8175]/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >

                <div>
                  <div className="flex items-start justify-between mb-3.5">

                    <div className={`w-10 h-10 rounded-2xl ${mod.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#8A8175] border border-[#8A8175]/20">
                      {mod.badge}
                    </span>

                  </div>

                  <h4 className="text-sm font-bold text-[#534145] group-hover:text-[#9E6752] transition-colors">
                    {mod.title}
                  </h4>

                  <p className="text-xs text-[#81786F] mt-1.5 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#8A8175]/15 space-y-2.5">

                  <div className="flex items-center justify-between text-[11px] font-medium text-[#81786F]">

                    <span>Status</span>

                    <span className="text-[#73766A] font-semibold bg-[#73766A]/10 px-2 py-0.5 rounded-md border border-[#73766A]/20">
                      Active & Ready
                    </span>

                  </div>

                  {mod.actionType === 'scroll' ? (

                    <button
                      onClick={() => scrollToSection(mod.target)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#9E6752] hover:bg-[#80503F] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md"
                    >
                      {mod.actionLabel}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                  ) : (

                    <Link
                      to={mod.to}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#9E6752] hover:bg-[#80503F] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all text-center shadow-sm hover:shadow-md hover:scale-[1.01]"
                    >
                      {mod.actionLabel}
                      <ChevronRight className="w-3.5 h-3.5 text-[#FED7A5]" />
                    </Link>

                  )}

                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* MODALS */}

      <MaterialUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        subjectId={id}
        onUploadSuccess={fetchMaterials}
      />

      <SubjectModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={subject}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        subjectName={subject.subjectName}
        isDeleting={isDeleting}
      />

      <FlashcardGeneratorModal
        isOpen={flashcardModalOpen}
        onClose={() => setFlashcardModalOpen(false)}
        preselectedSubjectId={id}
        preselectedMaterialId={selectedMaterial?._id}
        onGenerated={() => navigate(`/flashcards?subject=${id}`)}
      />

      <CleanNotesUploadModal
        isOpen={cleanNotesModalOpen}
        onClose={() => setCleanNotesModalOpen(false)}
        preselectedSubjectId={id}
        onUploadSuccess={() => navigate(`/clean-notes?subject=${id}`)}
      />

    </div>
  );
};

export default SubjectWorkspacePage;
