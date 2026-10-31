import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Check, Search, ChevronDown } from 'lucide-react';

const SEMESTER_OPTIONS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
  'Other',
];

const BRANCH_OPTIONS = [
  { label: 'Computer Science and Engineering (CSE)', code: 'CSE' },
  { label: 'Information Technology (IT)', code: 'IT' },
  { label: 'Electronics and Communication Engineering (ECE)', code: 'ECE' },
  { label: 'Electrical Engineering (EE)', code: 'EE' },
  { label: 'Mechanical Engineering (ME)', code: 'ME' },
  { label: 'Civil Engineering (CE)', code: 'CE' },
  { label: 'Chemical Engineering', code: 'CHE' },
  { label: 'Other', code: 'OTHER' },
];

const SemesterBranchSelector = ({
  initialSemester = '',
  initialBranch = '',
  onConfirm,
  isSubmitting = false,
  submitLabel = 'Apply Academic Filters',
  onCancel = null,
  cancelLabel = 'Cancel',
}) => {
  // Semester State
  const [selectedSemester, setSelectedSemester] = useState(() => {
    if (SEMESTER_OPTIONS.includes(initialSemester)) return initialSemester;
    if (initialSemester) return 'Other';
    return 'Semester 1';
  });
  const [customSemester, setCustomSemester] = useState(
    SEMESTER_OPTIONS.includes(initialSemester) ? '' : initialSemester || ''
  );

  // Branch State
  const [selectedBranch, setSelectedBranch] = useState(() => {
    const matched = BRANCH_OPTIONS.find(
      (b) => b.code === initialBranch || b.label === initialBranch
    );
    if (matched) return matched.label;
    if (initialBranch) return 'Other';
    return BRANCH_OPTIONS[0].label;
  });
  const [customBranch, setCustomBranch] = useState(() => {
    const matched = BRANCH_OPTIONS.find(
      (b) => b.code === initialBranch || b.label === initialBranch
    );
    return matched ? '' : initialBranch || '';
  });

  const [branchSearch, setBranchSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (initialSemester) {
      if (SEMESTER_OPTIONS.includes(initialSemester)) {
        setSelectedSemester(initialSemester);
      } else {
        setSelectedSemester('Other');
        setCustomSemester(initialSemester);
      }
    }

    if (initialBranch) {
      const matched = BRANCH_OPTIONS.find(
        (b) => b.code === initialBranch || b.label === initialBranch
      );
      if (matched) {
        setSelectedBranch(matched.label);
      } else {
        setSelectedBranch('Other');
        setCustomBranch(initialBranch);
      }
    }
  }, [initialSemester, initialBranch]);

  const finalSemester =
    selectedSemester === 'Other' ? customSemester.trim() : selectedSemester;

  const finalBranch =
    selectedBranch === 'Other' ? customBranch.trim() : selectedBranch;

  const isValid = finalSemester.length > 0 && finalBranch.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    onConfirm({
      semester: finalSemester,
      branch: finalBranch,
    });
  };

  const filteredBranches = BRANCH_OPTIONS.filter((b) =>
    b.label.toLowerCase().includes(branchSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1: Semester Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-900 block">
              Which semester are you currently studying in?
            </label>
            <p className="text-xs text-slate-500">
              We will match and prioritize examination sessions for your semester.
            </p>
          </div>
        </div>

        {/* Semester Buttons Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {SEMESTER_OPTIONS.map((sem) => {
            const isSelected = selectedSemester === sem;
            return (
              <button
                type="button"
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{sem}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Semester text input if "Other" is selected */}
        {selectedSemester === 'Other' && (
          <div className="pt-2 animate-in fade-in">
            <input
              type="text"
              value={customSemester}
              onChange={(e) => setCustomSemester(e.target.value)}
              placeholder="Enter your semester or course term (e.g., Year 1, Trimester 2)"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
              required
            />
          </div>
        )}
      </div>

      {/* Step 2: Branch Selection */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-900 block">
              Which branch or department are you studying in?
            </label>
            <p className="text-xs text-slate-500">
              Filters common vs branch-specific university examinations.
            </p>
          </div>
        </div>

        {/* Searchable Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-left text-xs font-medium text-slate-800 flex items-center justify-between shadow-2xs hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <span className="truncate">{selectedBranch}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-30 mt-1 w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="relative px-1 pb-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={branchSearch}
                  onChange={(e) => setBranchSearch(e.target.value)}
                  placeholder="Search branch..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-hidden"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {filteredBranches.map((b) => {
                const isSelected = selectedBranch === b.label;
                return (
                  <button
                    type="button"
                    key={b.label}
                    onClick={() => {
                      setSelectedBranch(b.label);
                      setIsDropdownOpen(false);
                      setBranchSearch('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{b.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Branch input if "Other" is selected */}
        {selectedBranch === 'Other' && (
          <div className="pt-2 animate-in fade-in">
            <input
              type="text"
              value={customBranch}
              onChange={(e) => setCustomBranch(e.target.value)}
              placeholder="Enter your specific branch or specialization (e.g., Biotechnology, Aerospace)"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
              required
            />
          </div>
        )}
      </div>

      {/* Confirmation Submit Action */}
      <div className="pt-4 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default SemesterBranchSelector;
