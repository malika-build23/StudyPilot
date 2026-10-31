import { useState, useEffect } from 'react';
import { X, BookOpen, Loader2 } from 'lucide-react';
import SemesterSelect from '../common/SemesterSelect';

const SubjectModal = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    subjectName: '',
    semester: '',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        subjectName: initialData.subjectName || '',
        semester: initialData.semester || '',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        subjectName: '',
        semester: '',
        description: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subjectName.trim()) {
      setError('Please provide a subject name.');
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B42]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F1F0ED] flex items-center justify-between bg-gradient-to-r from-[#FFF7EC] via-[#FAF8F5] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D4354] text-[#FED7A5] flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#20212B]">
                {initialData ? 'Edit Subject Workspace' : 'Create Subject Workspace'}
              </h3>
              <p className="text-xs text-[#77756F] font-medium">
                {initialData
                  ? 'Update your academic course details'
                  : 'Add a new academic course to start tracking'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#202B42] rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-in fade-in">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#202B42] uppercase tracking-wider mb-1.5">
              Subject / Course Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Data Structures & Algorithms, Organic Chemistry"
                value={formData.subjectName}
                onChange={(e) =>
                  setFormData({ ...formData, subjectName: e.target.value })
                }
                className="w-full px-4 py-3 rounded-2xl border border-slate-200/90 focus:border-[#4169E1] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium text-[#202B42] placeholder:text-slate-400 transition-all outline-none bg-white shadow-2xs"
              />
            </div>
          </div>

          <SemesterSelect
            id="subject-semester-select"
            label="Semester / Term / Level (Optional)"
            value={formData.semester}
            onChange={(val) => setFormData({ ...formData, semester: val })}
            helperText="Groups this course in your semester dashboard."
          />

          <div>
            <label className="block text-xs font-bold text-[#202B42] uppercase tracking-wider mb-1.5">
              Course Description or Syllabus Focus
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Covers modules on binary trees, graph algorithms, and DP recurrence relations."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 rounded-2xl border border-slate-200/90 focus:border-[#4169E1] focus:ring-4 focus:ring-blue-500/10 text-sm font-medium text-[#202B42] placeholder:text-slate-400 transition-all outline-none bg-white shadow-2xs resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-[#77839A] hover:text-[#202B42] hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-xs shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{initialData ? 'Update Subject' : 'Create Subject Workspace'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectModal;
