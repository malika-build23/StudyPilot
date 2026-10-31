import { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, Clock, Plus, Tag, Loader2, AlertCircle } from 'lucide-react';

const ExamModal = ({
  isOpen,
  onClose,
  onSubmit,
  subjects = [],
  initialData = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    subjectId: '',
    examName: '',
    examDate: '',
    syllabusTopics: [],
    dailyAvailableHours: 2,
  });

  const [topicInput, setTopicInput] = useState('');
  const [error, setError] = useState('');

  // Calculate today's date formatted as YYYY-MM-DD for min date picker
  const todayISO = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (initialData) {
      let formattedDate = '';
      if (initialData.examDate) {
        formattedDate = new Date(initialData.examDate).toISOString().slice(0, 10);
      }

      setFormData({
        subjectId: initialData.subjectId?._id || initialData.subjectId || '',
        examName: initialData.examName || '',
        examDate: formattedDate,
        syllabusTopics: Array.isArray(initialData.syllabusTopics) ? [...initialData.syllabusTopics] : [],
        dailyAvailableHours: initialData.dailyAvailableHours || 2,
      });
    } else {
      setFormData({
        subjectId: subjects.length > 0 ? subjects[0]._id : '',
        examName: '',
        examDate: '',
        syllabusTopics: [],
        dailyAvailableHours: 2,
      });
    }
    setTopicInput('');
    setError('');
  }, [initialData, isOpen, subjects]);

  if (!isOpen) return null;

  const handleAddTopic = () => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;

    if (formData.syllabusTopics.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setError('This syllabus topic is already added.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      syllabusTopics: [...prev.syllabusTopics, trimmed],
    }));
    setTopicInput('');
    setError('');
  };

  const handleKeyDownTopic = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const handleRemoveTopic = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      syllabusTopics: prev.syllabusTopics.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.subjectId) {
      setError('Please select an academic subject.');
      return;
    }
    if (!formData.examName.trim()) {
      setError('Please provide an exam name.');
      return;
    }
    if (!formData.examDate) {
      setError('Please select the exam date.');
      return;
    }
    if (formData.examDate <= todayISO) {
      setError('Exam date must be in the future (tomorrow or later).');
      return;
    }
    if (formData.syllabusTopics.length === 0) {
      setError('Please add at least one syllabus topic to prepare.');
      return;
    }
    if (formData.dailyAvailableHours < 0.5 || formData.dailyAvailableHours > 16) {
      setError('Daily available study time must be between 0.5 and 16 hours.');
      return;
    }

    setError('');
    onSubmit({
      ...formData,
      examName: formData.examName.trim(),
      dailyAvailableHours: Number(formData.dailyAvailableHours),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {initialData ? 'Edit Exam Details' : 'Schedule New Exam'}
              </h3>
              <p className="text-xs text-slate-500">
                {initialData
                  ? 'Update syllabus topics or exam date'
                  : 'Define exam goals to generate an AI study schedule'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject / Course <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <select
                required
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-900 bg-white outline-none transition-all cursor-pointer"
              >
                <option value="">Select subject workspace...</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.subjectName} {sub.semester ? `(${sub.semester})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exam Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Exam / Assessment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm Examination, Final Paper, Quiz 2"
              value={formData.examName}
              onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
            />
          </div>

          {/* Exam Date & Daily Available Hours Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exam Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                min={todayISO}
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-900 outline-none transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Daily Study Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  required
                  step="0.5"
                  min="0.5"
                  max="16"
                  value={formData.dailyAvailableHours}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyAvailableHours: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-900 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {Math.round(formData.dailyAvailableHours * 60)} minutes per day available
              </p>
            </div>
          </div>

          {/* Syllabus Topics Tag Builder */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Syllabus Topics to Prepare <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Tag className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Type topic name & press Enter (e.g. Memory Hierarchy, Pipelining)..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={handleKeyDownTopic}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Rendered Topics Badges */}
            <div className="min-h-[50px] p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap gap-1.5">
              {formData.syllabusTopics.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-1">
                  No syllabus topics added yet. Add at least one topic above.
                </p>
              ) : (
                formData.syllabusTopics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold animate-in fade-in"
                  >
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(idx)}
                      className="p-0.5 hover:bg-indigo-200/60 rounded-full transition-colors"
                      title="Remove topic"
                    >
                      <X className="w-3 h-3 text-indigo-600" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {formData.syllabusTopics.length} topic(s) added. StudyPilot will distribute these across your preparation days.
            </p>
          </div>

          {/* Action Buttons */}
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs shadow-indigo-500/30 transition-all disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? 'Save Changes' : 'Schedule Exam'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamModal;
