import { useState, useEffect } from 'react';
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
  Play
} from 'lucide-react';
import backpackImg from '../assets/illustrations/element_student_backpack.png';

const SubjectWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Study Materials state (Part A)
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Selected Material for Gemini AI Intelligence (Part B)
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Subject Edit & Delete Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Phase 5 Part B Modals
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [cleanNotesModalOpen, setCleanNotesModalOpen] = useState(false);

  // Fetch subject details
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await subjectsAPI.getById(id);
        if (res.data?.success) {
          setSubject(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching subject details:', err);
        setError(
          err.response?.data?.message || 'Failed to load subject workspace.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [id]);

  // Fetch materials for this subject
  const fetchMaterials = async () => {
    try {
      setMaterialsLoading(true);
      const res = await materialsAPI.getBySubject(id);
      if (res.data?.success) {
        const mats = res.data.data || res.data.materials || [];
        setMaterials(mats);
        // If a material was selected, update its reference; otherwise auto-select the first one
        if (selectedMaterial) {
          const updated = mats.find((m) => m._id === selectedMaterial._id);
          setSelectedMaterial(updated || (mats.length > 0 ? mats[0] : null));
        } else if (mats.length > 0) {
          setSelectedMaterial(mats[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMaterials();
    }
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      const res = await subjectsAPI.update(id, formData);
      if (res.data?.success) {
        setSubject(res.data.data);
        setEditModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await subjectsAPI.delete(id);
      if (res.data?.success) {
        navigate('/subjects');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete subject.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      const res = await materialsAPI.delete(materialId);
      if (res.data?.success) {
        if (selectedMaterial?._id === materialId) {
          setSelectedMaterial(null);
        }
        fetchMaterials();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete material.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">Opening subject workspace...</p>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-lg mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Workspace Unavailable</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          {error || 'This subject does not exist or you do not have permission to view it.'}
        </p>
        <button
          onClick={() => navigate('/subjects')}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Subjects</span>
        </button>
      </div>
    );
  }

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const studyToolsSuite = [
    {
      title: 'Interactive Quizzes & Mock Tests',
      badge: 'Assessments',
      desc: 'Adaptive mock exams and topic-wise practice tests synthesized from your course materials to evaluate concept retention and identify weak zones.',
      icon: CheckCircle,
      color: 'bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]/60',
      actionLabel: 'Take Quiz / Mock Test',
      actionType: 'scroll',
      target: 'quiz-section',
    },
    {
      title: 'Mistake Analysis & Weak Topics',
      badge: 'Diagnostics',
      desc: 'Deterministic mistake grading, multi-attempt score trends, and rule-based weak area detection with tailored revision directives.',
      icon: Brain,
      color: 'bg-[#FAF8F5] text-[#2D4354] border border-[#2D4354]/20',
      actionLabel: 'View Diagnostic Report',
      actionType: 'scroll',
      target: 'analytics-section',
    },
    {
      title: 'Study Planner & Readiness Analytics',
      badge: 'Adaptive Routine',
      desc: 'Real-time exam countdowns, automated day-by-day study schedules, syllabus coverage tracking, and dynamic plan adjustment.',
      icon: BarChart2,
      color: 'bg-[#F1F0ED] text-[#73766A] border border-slate-300',
      actionLabel: 'Open Study Planner',
      actionType: 'link',
      to: `/exams?subject=${id}&tab=schedules`,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-[#77756F]">
        <Link to="/dashboard" className="hover:text-[#2D4354] transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/subjects" className="hover:text-[#2D4354] transition-colors">
          My Subjects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-[#20212B] font-bold truncate max-w-[200px]">
          {subject.subjectName}
        </span>
      </nav>

      {/* Subject Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F1F0ED] shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] hover:shadow-md transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#2D4354]/5 via-[#FED7A5]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
                {subject.semester || 'Academic Workspace'}
              </span>
              <span className="text-xs text-[#77756F] flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#73766A]" />
                Created {new Date(subject.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20212B] tracking-tight">
              {subject.subjectName}
            </h2>
            <p className="text-sm text-[#77756F] max-w-2xl leading-relaxed">
              {subject.description || 'No subject description provided yet. Click "Edit Subject" to add course details, textbooks, or syllabus topics.'}
            </p>
          </div>

          {/* Free-Standing 3D Backpack Element – NO BOX, NO BORDER */}
          <div className="hidden md:flex items-center justify-center shrink-0">
            <img
              src={backpackImg}
              alt="Student Study Backpack"
              className="w-16 h-16 lg:w-20 lg:h-20 object-contain drop-shadow-[0_12px_24px_rgba(45,67,84,0.16)] animate-float-gentle"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#20212B] hover:bg-[#FAF8F5] hover:border-[#2D4354]/40 transition-all shadow-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#2D4354]" />
              <span>Edit Subject</span>
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50/50 text-xs font-semibold text-red-600 hover:bg-red-100/60 transition-all shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* PART A: STUDY MATERIALS SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#20212B]">
                Course Study Materials
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
                Course Library
              </span>
            </div>
            <p className="text-xs text-[#77756F] mt-0.5">
              Upload PDF textbooks or PowerPoint slides (.pptx). Text is automatically extracted for Gemini AI processing.
            </p>
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all self-start sm:self-auto hover:-translate-y-0.5 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#FED7A5]" />
            <span>Upload Document</span>
          </button>
        </div>

        {materials.length === 0 && !materialsLoading ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-dashed border-[#2D4354]/30 text-center shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] relative overflow-hidden group hover:border-[#2D4354]/60 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF7EC] text-[#9E6752] flex items-center justify-center mx-auto mb-3 shadow-inner border border-[#FED7A5]">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-[#20212B]">
              No study materials uploaded yet
            </h4>
            <p className="text-xs text-[#77756F] mt-1.5 max-w-md mx-auto leading-relaxed">
              Upload course syllabi, lecture slides, or textbook chapters (PDF or PPTX). Gemini AI will generate chapter summaries, formula sheets, and practice question banks.
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#FED7A5]" />
              <span>Upload First Document</span>
            </button>
          </div>
        ) : (
          <MaterialsList
            materials={materials}
            loading={materialsLoading}
            onDeleteMaterial={handleDeleteMaterial}
            onSelectForAnalysis={(mat) => setSelectedMaterial(mat)}
            selectedMaterialId={selectedMaterial?._id}
          />
        )}
      </div>

      {/* PART B: GEMINI AI DOCUMENT INTELLIGENCE VIEW */}
      {selectedMaterial && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D4354] to-[#534145] text-[#FED7A5] flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#20212B]">
                  Gemini AI Document Intelligence
                </h3>
                <p className="text-xs text-[#77756F]">
                  Active Document: <span className="font-semibold text-[#20212B]">{selectedMaterial.fileName}</span>
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-[#2D4354] bg-[#FAF8F5] px-3 py-1 rounded-full border border-slate-200">
              AI Analysis
            </span>
          </div>

          <DocumentIntelligenceView
            material={selectedMaterial}
            onClose={() => setSelectedMaterial(null)}
          />
        </div>
      )}

      {/* PHASE 3: AI QUIZ & MOCK TEST GENERATION */}
      <div id="quiz-section" className="space-y-4 pt-6 border-t border-[#F1F0ED]">
        <QuizGenerationView
          subjectId={id}
          material={selectedMaterial}
          materials={materials}
          onSelectMaterial={(mat) => setSelectedMaterial(mat)}
          onUploadRequest={() => setUploadModalOpen(true)}
        />
      </div>

      {/* PHASE 3 PART B: SUBJECT DIAGNOSTIC ANALYTICS & WEAK TOPICS */}
      <div id="analytics-section" className="space-y-5 pt-6 border-t border-[#F1F0ED]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2D4354] to-[#73766A] text-white flex items-center justify-center font-bold shadow-xs">
              <BarChart2 className="w-4 h-4 text-[#FED7A5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#20212B]">
                Course Diagnostic Analytics & Weak-Topic Detection
              </h3>
              <p className="text-xs text-[#77756F]">
                Live performance metrics, mistake analysis patterns, and revision directives
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#2D4354] bg-[#FFF7EC] px-3 py-1 rounded-full border border-[#FED7A5]">
            Diagnostic Engine
          </span>
        </div>

        {/* AI Mnemonics Generator */}
        <MnemonicGenerator
          subjectId={id}
          selectedMaterial={selectedMaterial}
        />

        {/* AI Diagram Generator */}
        <DiagramGenerator
          subjectId={id}
          selectedMaterial={selectedMaterial}
        />

        <PerformanceAnalyticsView subjectId={id} />
      </div>

      {/* FLASHCARDS, SPACED REPETITION & CLEAN NOTES */}
      <div className="space-y-4 pt-6 border-t border-[#F1F0ED]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#534145] to-[#9E6752] text-[#FED7A5] flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#20212B]">
                Active Recall, Spaced Revision & Clean Notes
              </h3>
              <p className="text-xs text-[#77756F]">
                Active recall question decks, intelligent SM-2 memory retention, and handwritten OCR conversion
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#9E6752] bg-[#FFF7EC] px-3 py-1 rounded-full border border-[#FED7A5]">
            Spaced Learning Suite
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: AI Flashcards */}
          <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between mb-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF7EC] text-[#2D4354] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#FED7A5]">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#2D4354] border border-slate-200">
                  AI Generator
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#20212B] group-hover:text-[#2D4354] transition-colors">
                AI Flashcards Generator
              </h4>
              <p className="text-xs text-[#77756F] mt-1.5 leading-relaxed">
                Generate interactive active-recall question cards from this subject's uploaded slides or textbook chapters.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#F1F0ED] flex items-center gap-2">
              <button
                onClick={() => setFlashcardModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs shadow-xs transition-all hover:scale-102 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FED7A5]" />
                <span>Generate Cards</span>
              </button>
              <Link
                to={`/flashcards?subject=${id}`}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-[#FAF8F5] text-[#20212B] font-semibold text-xs transition-colors"
              >
                View Decks
              </Link>
            </div>
          </div>

          {/* Card 2: Spaced Repetition */}
          <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-start justify-between mb-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F1F0ED] text-[#73766A] flex items-center justify-center group-hover:scale-105 transition-transform border border-slate-200">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F1F0ED] text-[#73766A] border border-slate-200">
                  SM-2 Algorithm
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#20212B] group-hover:text-[#73766A] transition-colors">
                Spaced Repetition System
              </h4>
              <p className="text-xs text-[#77756F] mt-1.5 leading-relaxed">
                Schedule smart revision intervals (Again, Hard, Easy) to permanently retain high-yield subject concepts.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#F1F0ED]">
              <Link
                to={`/revision?subject=${id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#73766A] hover:bg-[#534145] text-white font-semibold text-xs shadow-xs transition-all hover:scale-102"
              >
                <Play className="w-3.5 h-3.5 text-[#FED7A5]" />
                <span>Start Subject Revision</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Clean Notes Converter */}
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
              <h4 className="text-sm font-bold text-[#20212B] group-hover:text-[#9E6752] transition-colors">
                Clean Notes Converter
              </h4>
              <p className="text-xs text-[#77756F] mt-1.5 leading-relaxed">
                Upload handwritten notebook photos or scanned notes to transcribe, clean, and structure with formulas.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#F1F0ED] flex items-center gap-2">
              <button
                onClick={() => setCleanNotesModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#9E6752] hover:bg-[#534145] text-white font-semibold text-xs shadow-xs transition-all hover:scale-102 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#FED7A5]" />
                <span>Upload Notes</span>
              </button>
              <Link
                to={`/clean-notes?subject=${id}`}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-[#FAF8F5] text-[#20212B] font-semibold text-xs transition-colors"
              >
                View Notes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE STUDY TOOLS ROADMAP & ASSESSMENT SUITE */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#202B42]">
                Study Tools & Assessment Suite
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#55BFA5]/15 text-[#55BFA5] border border-[#55BFA5]/25">
                Assessment & Planning Suite
              </span>
            </div>
            <p className="text-xs text-[#77839A] mt-0.5">
              Interactive quizzes, mistake diagnostics, and automated exam readiness planning
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#55BFA5] bg-[#55BFA5]/10 border border-[#55BFA5]/25 px-3 py-1 rounded-full self-start sm:self-auto">
            Integrated Learning Loop
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {studyToolsSuite.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3.5">
                    <div className={`w-10 h-10 rounded-2xl ${mod.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-[#77839A]">
                      {mod.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#202B42] group-hover:text-[#4169E1] transition-colors">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-[#77839A] mt-1.5 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#77839A]">
                    <span>Status</span>
                    <span className="text-[#55BFA5] font-semibold bg-[#55BFA5]/10 px-2 py-0.5 rounded-md border border-[#55BFA5]/20">
                      Active & Ready
                    </span>
                  </div>

                  {mod.actionType === 'scroll' ? (
                    <button
                      onClick={() => scrollToSection(mod.target)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#202B42] hover:bg-[#4169E1] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>{mod.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Link
                      to={mod.to}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all text-center shadow-sm hover:scale-[1.01]"
                    >
                      <span>{mod.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#FED7A5]" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <MaterialUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        subjectId={id}
        onUploadSuccess={() => {
          fetchMaterials();
        }}
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
        onGenerated={() => {
          navigate(`/flashcards?subject=${id}`);
        }}
      />

      <CleanNotesUploadModal
        isOpen={cleanNotesModalOpen}
        onClose={() => setCleanNotesModalOpen(false)}
        preselectedSubjectId={id}
        onUploadSuccess={() => {
          navigate(`/clean-notes?subject=${id}`);
        }}
      />
    </div>
  );
};

export default SubjectWorkspacePage;
