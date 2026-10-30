import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subjectsAPI } from '../services/api';
import SubjectModal from '../components/subjects/SubjectModal';
import DeleteConfirmModal from '../components/subjects/DeleteConfirmModal';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  ArrowRight,
  Loader2
} from 'lucide-react';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredSubjects = subjects.filter((s) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = s.subjectName?.toLowerCase().includes(q);
    const semMatch = s.semester?.toLowerCase().includes(q);
    const descMatch = s.description?.toLowerCase().includes(q);
    return nameMatch || semMatch || descMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Subject Workspaces
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, manage and organize individual study workspaces for each course.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs shadow-blue-500/30 transition-all hover:scale-102 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Subject</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search subjects by title or semester..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200/90 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
        />
      </div>

      {/* Content: Loading, Empty, or Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-medium">Loading your subjects...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200/80 text-center shadow-xs max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {searchQuery ? 'No matching subjects found' : 'No subjects created yet'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            {searchQuery
              ? `No subject courses matched your search query "${searchQuery}". Try a different keyword.`
              : 'Create your first academic subject workspace to start organizing study materials, chapter summaries, and diagnostic tests.'}
          </p>
          <div className="mt-6">
            <button
              onClick={searchQuery ? () => setSearchQuery('') : handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs shadow-blue-500/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{searchQuery ? 'Clear Search' : 'Create First Subject'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subject) => (
            <div
              key={subject._id}
              onClick={() => navigate(`/subjects/${subject._id}`)}
              className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
            >
              <div>
                {/* Header tag and actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100/80">
                    {subject.semester || 'Workspace'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(subject, e)}
                      title="Edit Subject"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleOpenDelete(subject, e)}
                      title="Delete Subject"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subject Name */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {subject.subjectName}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed min-h-[32px]">
                  {subject.description || 'No specific description provided for this subject.'}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(subject.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>

                <span className="inline-flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
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
