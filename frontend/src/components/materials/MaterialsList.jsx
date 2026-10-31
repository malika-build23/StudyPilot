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
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500">Loading study materials...</p>
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
            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isSelected
                ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                : 'bg-white border-slate-200/80 hover:border-blue-200 shadow-xs'
            }`}
          >
            {/* Left: Icon & File Info */}
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                  mat.fileType === 'pdf'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}
              >
                <FileText className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {mat.fileName}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {mat.fileType?.toUpperCase()}
                  </span>
                  {mat.ocrRequired && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      OCR Required (Scanned)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
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
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 shadow-blue-500/20'
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
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete Material"
              >
                {deletingId === mat._id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
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
