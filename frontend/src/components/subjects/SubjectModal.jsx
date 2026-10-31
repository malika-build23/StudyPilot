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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialData ? 'Edit Subject Workspace' : 'Create Subject Workspace'}
              </h3>
              <p className="text-xs text-slate-500">
                {initialData
                  ? 'Update your academic course details'
                  : 'Add a new academic course to start tracking'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject / Course Name <span className="text-red-500">*</span>
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
              />
            </div>
          </div>

          <SemesterSelect
            id="subject-semester-select"
            label="Semester / Term / Course Code (Optional)"
            value={formData.semester}
            onChange={(val) => setFormData({ ...formData, semester: val })}
            helperText="Choose Semester 1–8 or select Other to enter terms like Fall 2026 or Course Codes."
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Learning Goals (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of modules, textbook references, or study targets..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none resize-none"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs shadow-blue-500/30 transition-all disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? 'Save Changes' : 'Create Subject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectModal;
