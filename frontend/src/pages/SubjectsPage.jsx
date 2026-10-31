import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subjectsAPI } from '../services/api';
import SubjectModal from '../components/subjects/SubjectModal';
import DeleteConfirmModal from '../components/subjects/DeleteConfirmModal';
import stackedBooksImg from '../assets/illustrations/element_stacked_books.png';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  ArrowRight,
  Loader2,
  GraduationCap,
  Sparkles,
  X,
  Code2,
  Cpu,
  Calculator,
  Atom,
} from 'lucide-react';

const getSubjectIcon = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('math') || lower.includes('calc') || lower.includes('algebra')) {
    return Calculator;
  }
  if (lower.includes('cs') || lower.includes('computer') || lower.includes('code') || lower.includes('software') || lower.includes('data')) {
    return Code2;
  }
  if (lower.includes('physics') || lower.includes('mechanic') || lower.includes('science')) {
    return Atom;
  }
  if (lower.includes('electr') || lower.includes('circuit') || lower.includes('hardware')) {
    return Cpu;
  }
  return BookOpen;
};

const SUBJECT_ACCENTS = [
  {
    theme: 'slate-blue',
    iconBg: 'bg-[#FAF8F5] text-[#2D4354] border-[#2D4354]/20',
    badge: 'bg-[#FAF8F5] text-[#2D4354] border-[#2D4354]/20',
    borderHover: 'hover:border-[#2D4354]/40',
    shadowHover: 'hover:shadow-[0_16px_36px_-6px_rgba(45,67,84,0.14)]',
    textHover: 'group-hover:text-[#2D4354]',
  },
  {
    theme: 'terracotta',
    iconBg: 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]/80',
    badge: 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]',
    borderHover: 'hover:border-[#9E6752]/40',
    shadowHover: 'hover:shadow-[0_16px_36px_-6px_rgba(158,103,82,0.14)]',
    textHover: 'group-hover:text-[#9E6752]',
  },
  {
    theme: 'muted-olive',
    iconBg: 'bg-[#F1F0ED] text-[#73766A] border-slate-300',
    badge: 'bg-[#F1F0ED] text-[#73766A] border-slate-300',
    borderHover: 'hover:border-[#73766A]/40',
    shadowHover: 'hover:shadow-[0_16px_36px_-6px_rgba(115,118,106,0.14)]',
    textHover: 'group-hover:text-[#73766A]',
  },
  {
    theme: 'dusty-mauve',
    iconBg: 'bg-[#FAF8F5] text-[#534145] border-[#534145]/20',
    badge: 'bg-[#FAF8F5] text-[#534145] border-[#534145]/20',
    borderHover: 'hover:border-[#534145]/40',
    shadowHover: 'hover:shadow-[0_16px_36px_-6px_rgba(83,65,69,0.14)]',
    textHover: 'group-hover:text-[#534145]',
  },
  {
    theme: 'soft-peach',
    iconBg: 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]',
    badge: 'bg-[#FFF7EC] text-[#2D4354] border-[#FED7A5]',
    borderHover: 'hover:border-[#FED7A5]',
    shadowHover: 'hover:shadow-[0_16px_36px_-6px_rgba(254,215,165,0.2)]',
    textHover: 'group-hover:text-[#9E6752]',
  },
];

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await subjectsAPI.getAll();
      if (res.data?.success) {
        setSubjects(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Check if opened with ?create=true
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setEditingSubject(null);
      setModalOpen(true);
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (subject, e) => {
    e.stopPropagation();
    setEditingSubject(subject);
    setModalOpen(true);
  };

  const handleOpenDelete = (subject, e) => {
    e.stopPropagation();
    setDeletingSubject(subject);
    setDeleteModalOpen(true);
  };

  const handleSubmitSubject = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingSubject) {
        const res = await subjectsAPI.update(editingSubject._id, formData);
        if (res.data?.success) {
          setModalOpen(false);
          setEditingSubject(null);
          fetchSubjects();
        }
      } else {
        const res = await subjectsAPI.create(formData);
        if (res.data?.success) {
          setModalOpen(false);
          fetchSubjects();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubject) return;
    try {
      setIsDeleting(true);
      const res = await subjectsAPI.delete(deletingSubject._id);
      if (res.data?.success) {
        setDeleteModalOpen(false);
        setDeletingSubject(null);
        fetchSubjects();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete subject.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Distinct semesters for filter chips
  const availableSemesters = useMemo(() => {
    const sems = new Set();
    subjects.forEach((s) => {
      if (s.semester) sems.add(s.semester);
    });
    return Array.from(sems);
  }, [subjects]);

  const filteredSubjects = subjects.filter((s) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = s.subjectName?.toLowerCase().includes(q);
    const semMatch = s.semester?.toLowerCase().includes(q);
    const descMatch = s.description?.toLowerCase().includes(q);
    const queryMatches = nameMatch || semMatch || descMatch;

    const semesterMatches =
      selectedSemester === 'All' || s.semester === selectedSemester;

    return queryMatches && semesterMatches;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top action header with floating 3D element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 relative">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7EC] border border-[#FED7A5] text-[#9E6752] text-[11px] font-bold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#9E6752]" />
            <span>Academic Workspaces</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#20212B] tracking-tight">
            My Subject Directories
          </h2>
          <p className="text-xs sm:text-sm text-[#77756F] mt-0.5 font-medium">
            Create, manage and organize individual study workspaces for each course.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          {/* Floating 3D Stacked Books Element – NO BOX */}
          <div className="hidden md:block w-16 h-16 pointer-events-none drop-shadow-md animate-float-gentle">
            <img src={stackedBooksImg} alt="Subject Books" className="w-full h-full object-contain" />
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(45,67,84,0.25)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Subject</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77756F] group-focus-within:text-[#2D4354] transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search subjects by title, semester or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-[#F1F0ED] focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 text-xs sm:text-sm text-[#20212B] placeholder:text-slate-400 transition-all outline-none shadow-2xs font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Semester Filter Pills */}
        {availableSemesters.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#77756F] mr-1 shrink-0">
              Semester:
            </span>
            {['All', ...availableSemesters].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-3 py-1 rounded-full font-bold text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedSemester === sem
                    ? 'bg-[#2D4354] text-white shadow-xs'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#77756F] border border-[#F1F0ED] shadow-2xs'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content: Loading, Empty, or Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] text-[#2D4354] flex items-center justify-center shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#2D4354]" />
          </div>
          <p className="text-xs text-[#77756F] font-semibold">Loading your subject workspaces...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#F1F0ED] text-center shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-3xl bg-[#FFF7EC] text-[#9E6752] flex items-center justify-center mx-auto mb-4 border border-[#FED7A5]/60 shadow-2xs">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-[#20212B]">
            {searchQuery ? 'No matching subjects found' : 'No subjects created yet'}
          </h3>
          <p className="text-xs sm:text-sm text-[#77756F] mt-2 max-w-md mx-auto leading-relaxed font-medium">
            {searchQuery
              ? `No subject courses matched your search query "${searchQuery}". Try a different keyword or reset filters.`
              : 'Create your first academic subject workspace to start organizing study materials, chapter summaries, and diagnostic tests.'}
          </p>
          <div className="mt-6">
            <button
              onClick={searchQuery ? () => setSearchQuery('') : handleOpenCreate}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{searchQuery ? 'Clear Search' : 'Create First Subject'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subject, index) => {
            const accent = SUBJECT_ACCENTS[index % SUBJECT_ACCENTS.length];
            const SubjectIcon = getSubjectIcon(subject.subjectName);

            return (
              <div
                key={subject._id}
                onClick={() => navigate(`/subjects/${subject._id}`)}
                className={`group bg-white rounded-3xl p-6 border border-[#F1F0ED] shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] ${accent.borderHover} ${accent.shadowHover} transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer relative`}
              >
                <div>
                  {/* Header tag and actions */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform group-hover:scale-110 duration-200 ${accent.iconBg}`}>
                        <SubjectIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${accent.badge}`}>
                        {subject.semester || 'Workspace'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleOpenEdit(subject, e)}
                        title="Edit Subject"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-[#2D4354] hover:bg-[#FAF8F5] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleOpenDelete(subject, e)}
                        title="Delete Subject"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subject Name */}
                  <h3 className={`text-base font-extrabold text-[#20212B] ${accent.textHover} transition-colors line-clamp-1`}>
                    {subject.subjectName}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#77756F] mt-2 line-clamp-2 leading-relaxed min-h-[32px] font-medium">
                    {subject.description || 'No specific description provided for this subject workspace.'}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-4 border-t border-[#F1F0ED] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#77756F] font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#73766A]" />
                    {new Date(subject.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>

                  <span className="inline-flex items-center gap-1 font-bold text-[#2D4354] group-hover:translate-x-1 transition-transform">
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <SubjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSubject(null);
        }}
        onSubmit={handleSubmitSubject}
        initialData={editingSubject}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingSubject(null);
        }}
        onConfirm={handleConfirmDelete}
        subjectName={deletingSubject?.subjectName || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default SubjectsPage;
