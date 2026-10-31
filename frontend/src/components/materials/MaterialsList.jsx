import { useState } from 'react';
import {
  FileText,
  Trash2,
  ExternalLink,
  Sparkles,
  Calendar,
  Loader2
} from 'lucide-react';

const MaterialsList = ({
  materials = [],
  loading = false,
  onDeleteMaterial,
  onSelectForAnalysis,
  selectedMaterialId,
}) => {
  const [deletingId, setDeletingId] = useState(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const dm = 1;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleDelete = async (id, fileName) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"? This will also remove any generated AI analysis.`)) {
      setDeletingId(id);
      await onDeleteMaterial(id);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#4169E1]" />
        <p className="text-xs text-[#77839A] font-semibold">Loading study materials...</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return null; // Parent will show clean empty state
  }

  return (
    <div className="space-y-3">
      {materials.map((mat) => {
        const isSelected = selectedMaterialId === mat._id;
        const pageOrSlideCount =
          mat.extractedContent?.pages?.length ||
          mat.extractedContent?.slides?.length ||
          0;
        const countLabel = mat.fileType === 'pdf' ? 'pages' : 'slides';

        return (
          <div
            key={mat._id}
            className={`p-4.5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isSelected
                ? 'bg-blue-50/70 border-[#4169E1] shadow-[0_4px_18px_rgba(65,105,225,0.12)]'
                : 'bg-white border-slate-200/70 hover:border-[#4169E1]/30 hover:shadow-xs'
            }`}
          >
            {/* Left: Icon & File Info */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold shadow-2xs ${
                  mat.fileType === 'pdf'
                    ? 'bg-rose-50 text-rose-500 border border-rose-200/60'
                    : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-[#202B42] truncate">
                    {mat.fileName}
                  </h4>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-[#77839A] border border-slate-200">
                    {mat.fileType?.toUpperCase()}
                  </span>
                  {mat.ocrRequired && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      OCR Required (Scanned)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#77839A] mt-1 flex-wrap font-medium">
                  <span>{formatFileSize(mat.fileSize)}</span>
                  <span>•</span>
                  <span>
                    {pageOrSlideCount} {countLabel}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(mat.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {/* Part B AI Action */}
              <button
                type="button"
                onClick={() => onSelectForAnalysis(mat)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#4169E1] text-white shadow-[0_4px_14px_rgba(65,105,225,0.3)]'
                    : 'bg-gradient-to-r from-[#4169E1] to-[#9270DB] text-white hover:opacity-95 shadow-[0_4px_14px_rgba(65,105,225,0.25)] hover:scale-[1.02]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSelected ? 'Viewing AI Intelligence' : 'Analyse with Gemini AI'}</span>
              </button>

              {/* View / Download */}
              {mat.fileUrl && (
                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-[#77839A] hover:text-[#202B42] hover:bg-slate-100 transition-colors"
                  title="View / Download Document"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {/* Delete */}
              <button
                type="button"
                onClick={() => handleDelete(mat._id, mat.fileName)}
                disabled={deletingId === mat._id}
                className="p-2 rounded-xl text-[#77839A] hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                title="Delete Material"
              >
                {deletingId === mat._id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MaterialsList;
