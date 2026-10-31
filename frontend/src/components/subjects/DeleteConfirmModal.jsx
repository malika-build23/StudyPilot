import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, subjectName, isDeleting = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B42]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-7">
          <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center mb-4 shadow-2xs">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-black text-[#202B42]">
            Delete Subject Workspace?
          </h3>
          <p className="text-xs sm:text-sm text-[#77839A] mt-2 leading-relaxed font-normal">
            Are you sure you want to delete{' '}
            <strong className="text-[#202B42] font-bold">"{subjectName}"</strong>? This will permanently remove this subject workspace and cannot be undone.
          </p>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#77839A] hover:text-[#202B42] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-[0_4px_14px_rgba(225,29,72,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Yes, Delete Subject</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
