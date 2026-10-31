import { useState, useEffect } from 'react';
import { subjectsAPI, cleanNotesAPI } from '../../services/api';
import {
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Layers,
  Loader2,
  AlertCircle,
  Trash2
} from 'lucide-react';

const CleanNotesUploadModal = ({
  isOpen,
  onClose,
  onUploadSuccess,
  preselectedSubjectId = '',
}) => {
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [subjectId, setSubjectId] = useState(preselectedSubjectId || '');
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const res = await subjectsAPI.getAll();
        if (res.data?.success) {
          const list = res.data.data || [];
          setSubjects(list);
          if (!subjectId && list.length > 0) {
            setSubjectId(list[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
    setSelectedFiles([]);
    setError('');
    setUploadProgress(0);
  }, [isOpen]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray].slice(0, 10)); // up to 10 files
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select at least one handwritten image (JPG/PNG) or PDF file.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('subjectId', subjectId);
      if (title.trim()) formData.append('title', title.trim());
      if (chapter.trim()) formData.append('chapter', chapter.trim());

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const res = await cleanNotesAPI.upload(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      if (res.data?.success) {
        if (onUploadSuccess) onUploadSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Upload clean notes failed:', err);
      setError(
        err.response?.data?.message ||
          'Failed to transcribe and convert notes. Please ensure your files are clear and under 25MB.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Convert Handwritten Notes</h3>
              <p className="text-xs text-slate-500">
                OCR transcription & structured digital notes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Subject Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Subject</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={isUploading || loadingSubjects}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subjectName} ({sub.semester || 'Workspace'})
                </option>
              ))}
            </select>
          </div>

          {/* Title & Chapter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Notes Title</label>
              <input
                type="text"
                placeholder="e.g. Thermodynamics Lecture 3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Chapter / Topic</label>
              <input
                type="text"
                placeholder="e.g. Carnot Cycle & Entropy"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                disabled={isUploading}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* File Upload Drop Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Upload Handwritten Notes (JPG, PNG, or PDF)
            </label>

            <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all text-center">
              <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-xs font-bold text-slate-800">
                Click to browse or drop images / PDF
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Supports multiple pages/images (up to 10 files, 25MB total)
              </span>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Selected Pages ({selectedFiles.length})
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1.5">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {file.name.endsWith('.pdf') ? (
                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                      <span className="truncate font-medium text-slate-700">{file.name}</span>
                      <span className="text-[10px] text-slate-400">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>

                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Transcribing & Structuring Notes...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || selectedFiles.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-xs shadow-xs transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing with OCR...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Convert & Structure</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CleanNotesUploadModal;
