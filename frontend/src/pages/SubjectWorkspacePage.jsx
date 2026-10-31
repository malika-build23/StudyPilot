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

  const futureModules = [
    {
      title: 'Interactive Quizzes & Mock Tests',
      phase: 'Phase 3',
      desc: 'Adaptive mock exams generated from your uploaded materials to evaluate concept retention and identify weak zones.',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Mistake Analysis & Weak Topics',
      phase: 'Phase 3',
      desc: 'Deep diagnostic feedback on test mistakes with tailored concept review recommendations.',
      icon: Brain,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Study Planner & Readiness Analytics',
      phase: 'Phase 4',
      desc: 'Exam countdown timelines, spaced repetition schedules, and overall syllabus mastery metrics.',
      icon: BarChart2,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/subjects" className="hover:text-slate-700 transition-colors">
          My Subjects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-800 font-semibold truncate max-w-[200px]">
          {subject.subjectName}
        </span>
      </nav>

      {/* Subject Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {subject.semester || 'Academic Workspace'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Created {new Date(subject.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {subject.subjectName}
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed pt-1">
              {subject.description || 'No subject description provided yet. Click "Edit Subject" to add course details, textbooks, or syllabus topics.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Subject</span>
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
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
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Course Study Materials
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Phase 2 Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Upload PDF textbooks or PowerPoint slides (.pptx). Text is automatically extracted for Gemini AI processing.
            </p>
          </div>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs shadow-blue-500/25 transition-all self-start sm:self-auto hover:scale-102"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {materials.length === 0 && !materialsLoading ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              No study materials uploaded yet
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              Upload course syllabi, lecture slides, or textbook chapters (PDF or PPTX). Gemini AI will generate chapter summaries, formula sheets, and practice question banks.
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all"
            >
              <UploadCloud className="w-4 h-4" />
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Gemini AI Document Intelligence
                </h3>
                <p className="text-xs text-slate-500">
                  Active Document: <span className="font-semibold text-slate-800">{selectedMaterial.fileName}</span>
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Part B Enabled
            </span>
          </div>

          <DocumentIntelligenceView
            material={selectedMaterial}
            onClose={() => setSelectedMaterial(null)}
          />
        </div>
      )}
      {/* PHASE 3: AI QUIZ GENERATION */}
{selectedMaterial && (
  <div className="space-y-4 pt-2">
    <QuizGenerationView
      subjectId={id}
      material={selectedMaterial}
    />
  </div>
)}

      {/* PHASE 3 PART B: SUBJECT DIAGNOSTIC ANALYTICS & WEAK TOPICS */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Course Diagnostic Analytics & Weak-Topic Detection
              </h3>
              <p className="text-xs text-slate-500">
                Live performance metrics, mistake analysis patterns, and revision directives
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Phase 3 Part B Active
          </span>
        </div>
        {/* Phase 5 - AI Mnemonics Generator */}
<MnemonicGenerator
  subjectId={id}
  selectedMaterial={selectedMaterial}
/>
{/* Phase 5 - AI Diagram Generator */}
<DiagramGenerator
  subjectId={id}
  selectedMaterial={selectedMaterial}
/>

        <PerformanceAnalyticsView subjectId={id} />
      </div>
      {/* PHASE 5 PART B: FLASHCARDS, SPACED REPETITION & CLEAN NOTES */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Phase 5: Flashcards, Spaced Revision & Clean Notes
              </h3>
              <p className="text-xs text-slate-500">
                Active recall question decks, intelligent SM-2 memory retention, and handwritten OCR conversion
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            Phase 5 Part B Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: AI Flashcards */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  AI Generator
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                AI Flashcards Generator
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Generate interactive active-recall question cards from this subject's uploaded slides or textbook chapters.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setFlashcardModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Cards</span>
              </button>
              <Link
                to={`/flashcards?subject=${id}`}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                View Decks
              </Link>
            </div>
          </div>

          {/* Card 2: Spaced Repetition */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  SM-2 Algorithm
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Spaced Repetition System
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Schedule smart revision intervals (Again, Hard, Easy) to permanently retain high-yield subject concepts.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to={`/revision?subject=${id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Subject Revision</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Clean Notes Converter */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileEdit className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  OCR & Formatter
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Clean Notes Converter
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Upload handwritten notebook photos or scanned notes to transcribe, clean, and structure with formulas.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setCleanNotesModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Notes</span>
              </button>
              <Link
                to={`/clean-notes?subject=${id}`}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                View Notes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FUTURE ROADMAP MODULES (PHASE 3 & 4) */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Future Study Tools Roadmap
            </h3>
            <p className="text-xs text-slate-500">
              Upcoming Phase 3 & Phase 4 modules built on top of your document intelligence
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Coming in Phase 3 & 4
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {futureModules.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${mod.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {mod.phase}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <span>Status</span>
                  <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
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
