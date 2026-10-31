import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, FileText, Beaker, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

const PRACTICAL_EXAM_TYPES = [
  'Practical Examination',
  'Laboratory Examination',
  'Viva',
  'Class Quiz',
  'Internal Assessment',
  'Mid-Semester Examination',
  'Other',
];

const PracticalExamModal = ({
  isOpen,
  onClose,
  onSubmit,
  subjects = [],
  initialData = null,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    examName: '',
    subjectId: '',
    subjectCode: '',
    examType: 'Practical Examination',
    semester: '',
    examDate: '',
    startTime: '09:00',
    endTime: '12:00',
    location: '',
    notes: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      let formattedDate = '';
      if (initialData.examDate) {
        formattedDate = new Date(initialData.examDate).toISOString().slice(0, 10);
      }

      setFormData({
        examName: initialData.examName || '',
        subjectId: initialData.subjectId?._id || initialData.subjectId || '',
        subjectCode: initialData.subjectCode || '',
        examType: initialData.examType || 'Practical Examination',
        semester: initialData.semester || '',
        examDate: formattedDate,
        startTime: initialData.startTime || '09:00',
        endTime: initialData.endTime || '12:00',
        location: initialData.location || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        examName: '',
        subjectId: subjects.length > 0 ? subjects[0]._id : '',
        subjectCode: '',
        examType: 'Practical Examination',
        semester: '',
        examDate: '',
        startTime: '09:00',
        endTime: '12:00',
        location: '',
        notes: '',
      });
    }
    setError('');
  }, [initialData, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.examName.trim()) {
      setError('Please provide an examination name.');
      return;
    }

    if (!formData.examDate) {
      setError('Please select an examination date.');
      return;
    }

    setError('');
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Beaker className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Practical Examination' : 'Schedule Practical / Internal Exam'}
              </h3>
              <p className="text-xs text-slate-500">
                Independent laboratory, viva, internal quiz, and assessment scheduler.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Exam Name */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Examination Name *
            </label>
            <input
              type="text"
              value={formData.examName}
              onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
              placeholder="e.g. Data Structures Lab Viva, Chemistry Practical"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-hidden font-medium"
              required
            />
          </div>

          {/* Exam Type & Subject Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Examination Type
              </label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-hidden font-medium"
              >
                {PRACTICAL_EXAM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Subject Code (Optional)
              </label>
              <input
                type="text"
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                placeholder="e.g. CS202P"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-hidden font-medium uppercase"
              />
            </div>
          </div>

          {/* Associated Subject (optional) & Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Link to Subject Workspace (Optional)
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-hidden font-medium"
              >
                <option value="">-- No specific workspace --</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Semester (Optional)
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                placeholder="e.g. Semester 3"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Date & Timings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Exam Date *</span>
              </label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 outline-hidden font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Time</span>
              </label>
              <input
                type="text"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                placeholder="09:00"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>End Time</span>
              </label>
              <input
                type="text"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                placeholder="12:00"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Location / Lab */}
          <div>
            <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Laboratory / Location / Room (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Advanced Computing Lab 3, Block B - Room 204"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-hidden font-medium"
            />
          </div>

          {/* Instructions / Notes */}
          <div>
            <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Instructions / Viva Topics / Equipment Needed</span>
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Bring laboratory file signed, breadboards provided, open notebook viva"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 outline-hidden font-medium resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{initialData ? 'Update Exam' : 'Schedule Practical Exam'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PracticalExamModal;
