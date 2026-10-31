import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

const ExamPreviewTable = ({
  exams = [],
  onConfirmSchedule,
  isConfirming = false,
  onBack,
}) => {
  const [examRows, setExamRows] = useState(() =>
    exams.map((exam, index) => ({
      ...exam,
      id: exam._id || `temp-${index}`,
      selected: exam.selected !== false,
      isEditing: false,
    }))
  );

  const [newRowModalOpen, setNewRowModalOpen] = useState(false);
  const [newExamData, setNewExamData] = useState({
    subjectName: '',
    subjectCode: '',
    examDate: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '12:00',
    examType: 'THEORY',
    semester: '',
    branch: '',
    instructions: '',
  });

  // Toggle selection
  const handleToggleSelect = (id) => {
    setExamRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  // Toggle Select All
  const allSelected = examRows.length > 0 && examRows.every((r) => r.selected);
  const handleToggleSelectAll = () => {
    const nextVal = !allSelected;
    setExamRows((prev) => prev.map((r) => ({ ...r, selected: nextVal })));
  };

  // Remove row
  const handleRemoveRow = (id) => {
    setExamRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Start inline editing
  const handleStartEdit = (id) => {
    setExamRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEditing: true } : r))
    );
  };

  // Cancel inline editing
  const handleCancelEdit = (id) => {
    setExamRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEditing: false } : r))
    );
  };

  // Field change during edit
  const handleFieldChange = (id, field, value) => {
    setExamRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Save edit
  const handleSaveEdit = (id) => {
    setExamRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, isEditing: false, verificationStatus: 'CONFIRMED' }
          : r
      )
    );
  };

  // Add Missing Exam
  const handleAddMissingExam = () => {
    if (!newExamData.subjectName.trim() || !newExamData.examDate) return;

    const newRow = {
      ...newExamData,
      id: `manual-${Date.now()}`,
      selected: true,
      verificationStatus: 'CONFIRMED',
      applicability: 'BRANCH_SPECIFIC',
      confidence: 1.0,
      sourcePage: 1,
      isEditing: false,
    };

    setExamRows((prev) => [...prev, newRow]);
    setNewRowModalOpen(false);
    setNewExamData({
      subjectName: '',
      subjectCode: '',
      examDate: new Date().toISOString().slice(0, 10),
      startTime: '09:00',
      endTime: '12:00',
      examType: 'THEORY',
      semester: '',
      branch: '',
      instructions: '',
    });
  };

  const selectedCount = examRows.filter((r) => r.selected).length;

  const handleFinalConfirm = () => {
    const selectedExams = examRows.filter((r) => r.selected);
    onConfirmSchedule(selectedExams);
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Step 3: Verification & Preview
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({selectedCount} of {examRows.length} sessions selected)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review the extracted date sheet. You can edit dates, timings, or add any missing examination before saving.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNewRowModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Missing Exam</span>
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div className="overflow-x-auto border border-slate-200/80 rounded-2xl shadow-2xs max-h-[460px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold sticky top-0 z-10 backdrop-blur-xs">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleSelectAll}
                  className="rounded text-blue-600 focus:ring-blue-500/20"
                />
              </th>
              <th className="py-3 px-3">Subject & Code</th>
              <th className="py-3 px-3">Exam Date & Day</th>
              <th className="py-3 px-3">Timing (24H)</th>
              <th className="py-3 px-3">Type & Branch</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {examRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  No examinations found for this semester/branch. Click "Add Missing Exam" to add manually.
                </td>
              </tr>
            ) : (
              examRows.map((row) => {
                const isUncertain =
                  row.verificationStatus === 'NEEDS_REVIEW' ||
                  row.applicability === 'UNCERTAIN' ||
                  !row.examDate;

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      row.selected
                        ? isUncertain
                          ? 'bg-amber-50/40 hover:bg-amber-50/70'
                          : 'hover:bg-slate-50/80'
                        : 'bg-slate-50/30 opacity-60'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={() => handleToggleSelect(row.id)}
                        className="rounded text-blue-600 focus:ring-blue-500/20"
                      />
                    </td>

                    {/* Subject Name & Code */}
                    <td className="py-3 px-3 min-w-[180px]">
                      {row.isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={row.subjectName}
                            onChange={(e) =>
                              handleFieldChange(row.id, 'subjectName', e.target.value)
                            }
                            placeholder="Subject name"
                            className="w-full px-2 py-1 text-xs border rounded-md"
                          />
                          <input
                            type="text"
                            value={row.subjectCode}
                            onChange={(e) =>
                              handleFieldChange(row.id, 'subjectCode', e.target.value)
                            }
                            placeholder="Code (e.g. EC301)"
                            className="w-full px-2 py-0.5 text-[11px] border rounded-md text-slate-500 uppercase"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-slate-900 truncate max-w-[220px]">
                            {row.subjectName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {row.subjectCode && (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                {row.subjectCode}
                              </span>
                            )}
                            {row.sourcePage && (
                              <span className="text-[10px] text-slate-400">
                                p. {row.sourcePage}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Exam Date & Day */}
                    <td className="py-3 px-3 min-w-[130px]">
                      {row.isEditing ? (
                        <input
                          type="date"
                          value={row.examDate}
                          onChange={(e) =>
                            handleFieldChange(row.id, 'examDate', e.target.value)
                          }
                          className="px-2 py-1 text-xs border rounded-md"
                        />
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-800">
                            {row.examDate
                              ? new Date(row.examDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Date not found'}
                          </p>
                          <p className="text-[10px] text-slate-400">{row.day || '-'}</p>
                        </div>
                      )}
                    </td>

                    {/* Timing */}
                    <td className="py-3 px-3 min-w-[120px]">
                      {row.isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={row.startTime}
                            onChange={(e) =>
                              handleFieldChange(row.id, 'startTime', e.target.value)
                            }
                            placeholder="09:00"
                            className="w-14 px-1.5 py-1 text-xs border rounded-md"
                          />
                          <span>-</span>
                          <input
                            type="text"
                            value={row.endTime}
                            onChange={(e) =>
                              handleFieldChange(row.id, 'endTime', e.target.value)
                            }
                            placeholder="12:00"
                            className="w-14 px-1.5 py-1 text-xs border rounded-md"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-600 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {row.startTime ? `${row.startTime} - ${row.endTime || 'End'}` : 'Time TBD'}
                        </span>
                      )}
                    </td>

                    {/* Type & Branch */}
                    <td className="py-3 px-3 min-w-[110px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-700 uppercase">
                          {row.examType || 'THEORY'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {row.branch || 'Common'}
                        </span>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3 px-3">
                      {isUncertain ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Review</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Confirmed</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      {row.isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(row.id)}
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                            title="Save edits"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelEdit(row.id)}
                            className="p-1 rounded-md text-slate-400 hover:bg-slate-100"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(row.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                            title="Remove from schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            ← Back to Academic Filters
          </button>
        )}

        <div className="flex items-center justify-end gap-3 ml-auto">
          <button
            type="button"
            onClick={handleFinalConfirm}
            disabled={selectedCount === 0 || isConfirming}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isConfirming
                ? 'Creating Examination Schedule...'
                : `Confirm & Add ${selectedCount} Examinations to Schedule`}
            </span>
          </button>
        </div>
      </div>

      {/* Modal: Add Missing Exam */}
      {newRowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Add Missing Examination
              </h3>
              <button
                type="button"
                onClick={() => setNewRowModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Subject / Course Name *
                </label>
                <input
                  type="text"
                  value={newExamData.subjectName}
                  onChange={(e) =>
                    setNewExamData({ ...newExamData, subjectName: e.target.value })
                  }
                  placeholder="e.g. Distributed Operating Systems"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={newExamData.subjectCode}
                    onChange={(e) =>
                      setNewExamData({ ...newExamData, subjectCode: e.target.value })
                    }
                    placeholder="e.g. CS402"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    value={newExamData.examDate}
                    onChange={(e) =>
                      setNewExamData({ ...newExamData, examDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Start Time (24h)
                  </label>
                  <input
                    type="text"
                    value={newExamData.startTime}
                    onChange={(e) =>
                      setNewExamData({ ...newExamData, startTime: e.target.value })
                    }
                    placeholder="09:00"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    End Time (24h)
                  </label>
                  <input
                    type="text"
                    value={newExamData.endTime}
                    onChange={(e) =>
                      setNewExamData({ ...newExamData, endTime: e.target.value })
                    }
                    placeholder="12:00"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewRowModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMissingExam}
                disabled={!newExamData.subjectName.trim() || !newExamData.examDate}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                Add Examination
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPreviewTable;
