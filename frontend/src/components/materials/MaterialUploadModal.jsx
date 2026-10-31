import { useState, useRef } from 'react';
import { materialsAPI } from '../../services/api';
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';

const MAX_SIZE_MB = 25;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const MaterialUploadModal = ({ isOpen, onClose, subjectId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (ext === '.ppt') {
      setError('Legacy .ppt format is not directly supported. Please convert your file to .pptx or .pdf format before uploading.');
      return;
    }

    if (!['.pdf', '.pptx'].includes(ext)) {
      setError('Only PDF (.pdf) and PowerPoint (.pptx) documents are supported.');
      return;
    }

    if (selectedFile.size > MAX_SIZE_BYTES) {
      setError(`File size exceeds ${MAX_SIZE_MB}MB limit. Please upload a smaller document.`);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setIsProcessing(false);
    setUploadProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', subjectId);

    try {
      const res = await materialsAPI.upload(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
          if (percent >= 100) {
            setIsProcessing(true);
          }
        }
      });

      if (res.data?.success) {
        setFile(null);
        setUploadProgress(0);
        setIsUploading(false);
        setIsProcessing(false);
        onClose();
        if (onUploadSuccess) {
          onUploadSuccess(res.data.data || res.data.material);
        }
      }
    } catch (err) {
      setIsUploading(false);
      setIsProcessing(false);
      console.error('Upload failed:', err);
      const msg = err.response?.data?.message || err.message || 'Upload failed. Please try again.';
      setError(msg);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const dm = 1;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Upload Study Material
              </h3>
              <p className="text-xs text-slate-500">
                Upload lecture slides, chapters or notes (PDF, PPTX)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-600 bg-blue-50/60'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60 bg-slate-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-blue-600">
              <UploadCloud className="w-6 h-6" />
            </div>

            <p className="text-sm font-semibold text-slate-800">
              {dragActive ? 'Drop your document here' : 'Click to browse or drag and drop'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF (.pdf) and PowerPoint (.pptx) up to {MAX_SIZE_MB}MB
            </p>
          </div>

          {/* Selected File Details */}
          {file && (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              {!isUploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Progress / Processing Indicators */}
          {isUploading && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  {isProcessing ? 'Extracting text and structure with OfficeParser...' : 'Uploading to secure storage...'}
                </span>
                <span className="text-blue-600 font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Once uploaded, text is automatically extracted so you can generate chapter summaries, formula sheets, and practice questions via Gemini AI in Part B.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/30 transition-all disabled:opacity-50 hover:scale-101"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isProcessing ? 'Extracting text & pages...' : `Uploading (${uploadProgress}%)...`}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Extract</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialUploadModal;
