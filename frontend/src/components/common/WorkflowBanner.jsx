import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  BookOpen, 
  BrainCircuit, 
  CheckSquare, 
  BarChart3, 
  CalendarClock, 
  Award
} from 'lucide-react';

const steps = [
  { label: 'Upload', icon: UploadCloud, desc: 'Course materials & notes', path: '/subjects' },
  { label: 'Understand', icon: BookOpen, desc: 'AI concept breakdowns', path: '/subjects' },
  { label: 'Learn', icon: BrainCircuit, desc: 'High-yield summaries', path: '/subjects' },
  { label: 'Test', icon: CheckSquare, desc: 'Adaptive diagnostic quizzes', path: '/subjects' },
  { label: 'Analyse', icon: BarChart3, desc: 'Weak area performance', path: '/dashboard' },
  { label: 'Plan', icon: CalendarClock, desc: 'Dynamic exam schedules', path: '/exams' },
  { label: 'Succeed', icon: Award, desc: 'Target grade achieved' },
];

const WorkflowBanner = ({ compact = false }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            The StudyPilot Method
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-2">
            Your Pathway to Academic Excellence
          </h3>
        </div>
        <p className="text-xs text-slate-500 max-w-xs">
          A continuous loop engineered to transform lecture material into confident exam performance.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.label}
              onClick={() => step.path && navigate(step.path)}
              className={`group relative flex flex-col items-center text-center p-3 rounded-xl bg-slate-50/70 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all duration-200 ${
                step.path ? 'cursor-pointer hover:shadow-xs' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-white shadow-xs border border-slate-200/60 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-900">
                {step.label}
              </span>
              {!compact && (
                <span className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {step.desc}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowBanner;
