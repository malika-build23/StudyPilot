import { useState, useEffect } from 'react';
import { ChevronDown, GraduationCap } from 'lucide-react';

export const SEMESTER_OPTIONS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

const SemesterSelect = ({
  value = '',
  onChange,
  label = 'Academic Semester',
  required = false,
  helperText = '',
  disabled = false,
  className = '',
  id = 'semester-select',
}) => {
  const isPreset = SEMESTER_OPTIONS.includes(value);
  const [selectedOption, setSelectedOption] = useState(() => {
    if (!value) return '';
    return isPreset ? value : 'Other';
  });
  const [customValue, setCustomValue] = useState(() => {
    return isPreset ? '' : value || '';
  });

  // Sync internal state when external value changes
  useEffect(() => {
    if (!value) {
      setSelectedOption('');
      setCustomValue('');
    } else if (SEMESTER_OPTIONS.includes(value)) {
      setSelectedOption(value);
      setCustomValue('');
    } else {
      setSelectedOption('Other');
      setCustomValue(value);
    }
  }, [value]);

  const handleDropdownChange = (e) => {
    const nextOption = e.target.value;
    setSelectedOption(nextOption);

    if (nextOption === 'Other') {
      onChange(customValue || 'Other');
    } else {
      onChange(nextOption);
    }
  };

  const handleCustomChange = (e) => {
    const text = e.target.value;
    setCustomValue(text);
    onChange(text);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-[#202B42] uppercase tracking-wider"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77839A] group-focus-within:text-[#4169E1] transition-colors">
          <GraduationCap className="w-4 h-4" />
        </div>
        <select
          id={id}
          value={selectedOption}
          onChange={handleDropdownChange}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200/90 bg-white text-sm font-semibold text-[#202B42] focus:border-[#4169E1] focus:ring-4 focus:ring-blue-500/10 shadow-xs appearance-none outline-none transition-all duration-200 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
          <option value="">Select Semester or Academic Level...</option>
          {SEMESTER_OPTIONS.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
          <option value="Other">Other (Custom semester or academic status)</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#77839A]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Conditional Custom Input for "Other" */}
      {selectedOption === 'Other' && (
        <div className="pt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <label
            htmlFor={`${id}-custom`}
            className="block text-[11px] font-bold text-[#77839A] mb-1"
          >
            Enter your semester or academic status <span className="text-rose-500">*</span>
          </label>
          <input
            id={`${id}-custom`}
            type="text"
            value={customValue}
            onChange={handleCustomChange}
            placeholder="e.g. Year 1 Term 2, Postgraduate, Trimester 3, CS301"
            disabled={disabled}
            className="w-full px-4 py-2.5 rounded-xl border border-blue-200 focus:border-[#4169E1] focus:ring-4 focus:ring-blue-500/15 text-sm font-medium text-[#202B42] placeholder:text-slate-400 transition-all outline-none bg-blue-50/30"
          />
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-[#77839A] leading-relaxed font-medium">{helperText}</p>
      )}
    </div>
  );
};

export default SemesterSelect;
