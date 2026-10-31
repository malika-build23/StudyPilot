import { useState, useRef } from 'react';
import { dateSheetsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SemesterBranchSelector from './SemesterBranchSelector';
import ExamPreviewTable from './ExamPreviewTable';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileCheck2,
  GraduationCap,
  ArrowLeft,
  ChevronRight,
  Settings2,
} from 'lucide-react';

const DateSheetUploadModal = ({ isOpen, onClose, onComplete }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Modal Step: 1: 'academic_details' | 2: 'upload' | 3: 'preview'
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Academic details (prefilled from profile)
  const [academicDetails, setAcademicDetails] = useState({
    semester: user?.semester || '',
    branch: user?.branch || '',
  });

  // Step 2: Upload state
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dateSheetData, setDateSheetData] = useState(null);
  const [error, setError] = useState('');

  // Step 3: Filtering & Preview state
  const [filteredResult, setFilteredResult] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Only official university examination PDF date sheets (.pdf) are accepted.');
        return;
      }
      if (selected.size > 20 * 1024 * 1024) {
        setError('File size exceeds 20MB limit. Please upload a smaller PDF.');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.type !== 'application/pdf' && !dropped.name.toLowerCase().endsWith('.pdf')) {
        setError('Only official university examination PDF date sheets (.pdf) are accepted.');
        return;
      }
      if (dropped.size > 20 * 1024 * 1024) {
        setError('File size exceeds 20MB limit. Please upload a smaller PDF.');
        return;
      }
      setFile(dropped);
      setError('');
    }
  };

  // 1. Step 1: Confirm Academic Details and proceed to upload
  const handleConfirmAcademicDetails = ({ semester, branch }) => {
    setAcademicDetails({ semester, branch });
    setError('');
    setCurrentStep(2); // Proceed to PDF upload with academic profile locked in
  };

  // 2. Step 2: Submit Upload with targeted semester & branch for AI
  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setError('');
      setUploadProgress(20);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('semester', academicDetails.semester);
      formData.append('branch', academicDetails.branch);

      setUploadProgress(45);
      const res = await dateSheetsAPI.upload(formData);

      setUploadProgress(100);
      if (res.data?.success && res.data.data) {
        setDateSheetData(res.data.data);
        setFilteredResult(res.data.data);
        setCurrentStep(3); // Advance directly to preview & confirmation
      }
    } catch (err) {
      console.error('Date sheet upload error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to upload and analyze date sheet. Please check the PDF formatting or try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Step 3: Confirm Schedule and Save to University Calendar
  const handleConfirmSchedule = async (selectedExams) => {
    if (!dateSheetData?._id) return;

    try {
      setIsConfirming(true);
      setError('');

      const res = await dateSheetsAPI.confirm(dateSheetData._id, {
        exams: selectedExams,
      });

      if (res.data?.success) {
        if (onComplete) {
          onComplete(res.data.data);
        }
        handleClose();
      }
    } catch (err) {
      console.error('Error confirming schedule:', err);
      setError(err.response?.data?.message || 'Failed to save university examination schedule.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCurrentStep(1);
    setDateSheetData(null);
    setFilteredResult(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header with Steps Breadcrumb */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Smart Exam Planner
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Upload University Examination Date Sheet
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { step: 1, label: '1. Academic Details', icon: GraduationCap },
            { step: 2, label: '2. Upload Date Sheet', icon: UploadCloud },
            { step: 3, label: '3. Preview & Confirm', icon: FileCheck2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <div
                key={item.step}
                className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Academic Details (Semester & Branch First) */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-start gap-3 text-xs text-blue-900">
              <GraduationCap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  First, select your Semester and Branch
                </p>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                  By specifying your semester and branch first, our AI will zero in on your applicable examination papers, ignoring non-applicable departments and preventing processing delays.
                </p>
              </div>
            </div>

            <SemesterBranchSelector
              initialSemester={academicDetails.semester || user?.semester || ''}
              initialBranch={academicDetails.branch || user?.branch || ''}
              onConfirm={handleConfirmAcademicDetails}
              isSubmitting={false}
              submitLabel="Next: Upload Date Sheet →"
              onCancel={handleClose}
              cancelLabel="Cancel"
            />
          </div>
        )}

        {/* STEP 2: PDF Upload & Targeted Gemini Extraction */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            {/* Targeted Profile Badge */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Target Academic Profile
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {academicDetails.semester} • {academicDetails.branch}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Change</span>
              </button>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                file
                  ? 'border-blue-400 bg-blue-50/40'
                  : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
                {file ? <FileText className="w-8 h-8 text-blue-600" /> : <UploadCloud className="w-8 h-8" />}
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 truncate max-w-md">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
                  </p>
                  <p className="text-[11px] text-blue-600 font-semibold pt-1">
                    Click to choose a different file
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    Drag and drop your official university date sheet PDF here
                  </p>
                  <p className="text-xs text-slate-400">
                    or click to browse from your device (Max 20MB)
                  </p>
                  <p className="text-[11px] text-slate-400 pt-2">
                    Supports multi-page date sheets, semester timetables, and scanned PDF schedules with automatic OCR.
                  </p>
                </div>
              )}
            </div>

            {/* AI Extraction Details Callout */}
            <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 flex items-start gap-3 text-xs text-slate-600">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">
                  Targeted Examination Synthesizer:
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Our Gemini engine will specifically match examination subjects, codes, dates, and timings for{' '}
                  <span className="font-bold text-blue-700">
                    {academicDetails.semester} ({academicDetails.branch})
                  </span>
                  , along with any common all-branch papers.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Academic Details</span>
              </button>

              <button
                type="button"
                onClick={handleUploadAndAnalyze}
                disabled={!file || isUploading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting {academicDetails.semester} Exams...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Upload & Extract with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Examination Preview & Confirmation Table */}
        {currentStep === 3 && filteredResult && (
          <ExamPreviewTable
            exams={filteredResult.filteredExams || filteredResult.dateSheet?.filteredExams || []}
            onConfirmSchedule={handleConfirmSchedule}
            isConfirming={isConfirming}
            onBack={() => setCurrentStep(2)}
          />
        )}
      </div>
    </div>
  );
};

export default DateSheetUploadModal;
