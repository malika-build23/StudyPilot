import { useState, useRef } from 'react';
import { materialsAPI } from '../../services/api';
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  Loader2,
  Info,
  Sparkles
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
        onUploadSuccess(res.data.data);
        onClose();
      } else {
        setError(res.data?.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Error uploading material:', err);
      setError(
        err.response?.data?.message ||
        'Failed to upload and parse document. Please check the file format.'
      );
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B42]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#F1F0ED] flex items-center justify-between bg-gradient-to-r from-[#FFF7EC] via-[#FAF8F5] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D4354] text-[#FED7A5] flex items-center justify-center font-bold shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#20212B]">
                Upload Study Material
              </h3>
              <p className="text-xs text-[#77756F] font-medium">
                Add PDFs or PPTXs for automated concept extraction
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 text-slate-400 hover:text-[#202B42] rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
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
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? 'border-[#4169E1] bg-blue-50/70 scale-[1.01]'
                : 'border-slate-200 hover:border-[#4169E1]/60 hover:bg-blue-50/20 bg-[#F5F7FC]/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-13 h-13 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center mx-auto mb-3 text-[#4169E1]">
              <UploadCloud className="w-7 h-7" />
            </div>

            <p className="text-sm font-extrabold text-[#202B42]">
              {dragActive ? 'Drop your document here' : 'Click to browse or drag and drop'}
            </p>
            <p className="text-xs text-[#77839A] mt-1 font-medium">
              Supports PDF (.pdf) and PowerPoint (.pptx) up to {MAX_SIZE_MB}MB
            </p>
          </div>

          {/* Selected File Details */}
          {file && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#4169E1] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-extrabold text-[#202B42] truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-[#77839A] font-medium">
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
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Progress / Processing Indicators */}
          {isUploading && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#202B42] flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4169E1]" />
                  {isProcessing ? 'Extracting text and structure with OfficeParser...' : 'Uploading to secure storage...'}
                </span>
                <span className="text-[#4169E1] font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-[#4169E1] to-[#9270DB] h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-2xl bg-[#F5F7FC] text-[11px] text-[#77839A] border border-slate-200/60 font-medium">
            <Info className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
            <span>
              Once uploaded, text is automatically extracted so you can generate chapter summaries, formula sheets, and practice questions via Gemini AI.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#77839A] hover:text-[#202B42] hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 hover:scale-[1.02] cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{isProcessing ? 'Extracting text & pages...' : `Uploading (${uploadProgress}%)...`}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-[#FED7A5]" />
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
