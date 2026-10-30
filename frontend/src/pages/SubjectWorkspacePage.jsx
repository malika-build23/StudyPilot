import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { subjectsAPI } from '../services/api';
import SubjectModal from '../components/subjects/SubjectModal';
import DeleteConfirmModal from '../components/subjects/DeleteConfirmModal';
import {
  ArrowLeft,
  Calendar,
  Edit2,
  Trash2,
  FileText,
  Brain,
  HelpCircle,
  CheckCircle,
  BarChart2,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

const SubjectWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit and Delete Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      title: 'Uploaded Study Materials',
      phase: 'Phase 2',
      desc: 'Upload lecture slides, syllabus documents, and textbooks (PDF, DOCX) for automated analysis.',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Chapter Summaries',
      phase: 'Phase 2',
      desc: 'AI-generated concise summaries, key definitions, and concept breakdown cards.',
      icon: Brain,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Important Questions',
      phase: 'Phase 3',
      desc: 'Curated high-yield practice prompts and past paper problem sets.',
      icon: HelpCircle,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Diagnostic Quizzes',
      phase: 'Phase 3',
      desc: 'Adaptive mock tests to evaluate concept retention and identify weak knowledge zones.',
      icon: CheckCircle,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Performance Analytics',
      phase: 'Phase 4',
      desc: 'Readiness scores, revision schedule timers, and topic mastery matrices.',
      icon: BarChart2,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
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

      {/* Prepared Workspace Zones (Coming Soon Architecture) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Workspace Study Modules
            </h3>
            <p className="text-xs text-slate-500">
              Architecture prepared for upcoming phase integrations
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            Roadmap Aligned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {futureModules.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${mod.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60">
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

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
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

      {/* Edit Subject Modal */}
      <SubjectModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={subject}
        isSubmitting={isSubmitting}
      />

      {/* Delete Subject Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        subjectName={subject.subjectName}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default SubjectWorkspacePage;
