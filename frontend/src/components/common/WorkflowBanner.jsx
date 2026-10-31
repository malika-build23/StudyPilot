import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  BookOpen, 
  BrainCircuit, 
  CheckSquare, 
  BarChart3, 
  CalendarClock, 
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const steps = [
  {
    step: '01',
    label: 'Upload',
    icon: UploadCloud,
    desc: 'Course materials & notes',
    path: '/subjects',
    accentColor: '#2D4354',
    bgLight: 'bg-[#2D4354]/10',
    borderLight: 'border-[#2D4354]/30',
    textAccent: 'text-[#2D4354]',
    ringAccent: 'group-hover:ring-[#2D4354]/30',
  },
  {
    step: '02',
    label: 'Understand',
    icon: BookOpen,
    desc: 'AI concept breakdowns',
    path: '/subjects',
    accentColor: '#73766A',
    bgLight: 'bg-[#73766A]/15',
    borderLight: 'border-[#73766A]/30',
    textAccent: 'text-[#73766A]',
    ringAccent: 'group-hover:ring-[#73766A]/30',
  },
  {
    step: '03',
    label: 'Learn',
    icon: BrainCircuit,
    desc: 'High-yield summaries',
    path: '/subjects',
    accentColor: '#9E6752',
    bgLight: 'bg-[#FED7A5]/30',
    borderLight: 'border-[#9E6752]/30',
    textAccent: 'text-[#9E6752]',
    ringAccent: 'group-hover:ring-[#9E6752]/30',
  },
  {
    step: '04',
    label: 'Test',
    icon: CheckSquare,
    desc: 'Adaptive diagnostic quizzes',
    path: '/subjects',
    accentColor: '#534145',
    bgLight: 'bg-[#534145]/10',
    borderLight: 'border-[#534145]/30',
    textAccent: 'text-[#534145]',
    ringAccent: 'group-hover:ring-[#534145]/30',
  },
  {
    step: '05',
    label: 'Analyse',
    icon: BarChart3,
    desc: 'Weak area performance',
    path: '/dashboard',
    accentColor: '#2D4354',
    bgLight: 'bg-[#2D4354]/10',
    borderLight: 'border-[#2D4354]/30',
    textAccent: 'text-[#2D4354]',
    ringAccent: 'group-hover:ring-[#2D4354]/30',
  },
  {
    step: '06',
    label: 'Plan',
    icon: CalendarClock,
    desc: 'Dynamic exam schedules',
    path: '/exams',
    accentColor: '#73766A',
    bgLight: 'bg-[#73766A]/15',
    borderLight: 'border-[#73766A]/30',
    textAccent: 'text-[#73766A]',
    ringAccent: 'group-hover:ring-[#73766A]/30',
  },
  {
    step: '07',
    label: 'Succeed',
    icon: Award,
    desc: 'Target grade achieved',
    accentColor: '#9E6752',
    bgLight: 'bg-[#FED7A5]/40',
    borderLight: 'border-[#FED7A5]',
    textAccent: 'text-[#9E6752]',
    ringAccent: 'group-hover:ring-[#9E6752]/30',
  },
];

const WorkflowBanner = ({ compact = false }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#73766A]/15 shadow-[0_4px_24px_-2px_rgba(45,67,84,0.05)] mb-8 relative overflow-hidden">
      {/* Subtle warm background glow */}
      <div className="absolute top-0 right-1/4 w-80 h-32 bg-gradient-to-r from-[#FED7A5]/30 via-[#FFF7EC] to-[#9E6752]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-[#73766A]/10 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FED7A5]/30 border border-[#FED7A5] text-[#2D4354] text-xs font-bold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#9E6752]" />
            <span>The StudyPilot Method</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#20212B] tracking-tight mt-1">
            Your Seven-Stage Pathway to Academic Excellence
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#77756F] max-w-sm leading-relaxed">
          A continuous loop engineered to transform lecture material into confident exam performance.
        </p>
      </div>

      {/* Connected Nodes Row */}
      <div className="relative z-10">
        {/* Animated Connecting Line (hidden on small screens) */}
        <div className="hidden lg:block absolute top-[44px] left-[6%] right-[6%] h-[2px] pointer-events-none z-0">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <line
              x1="0"
              y1="1"
              x2="100%"
              y2="1"
              stroke="#73766A"
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeOpacity="0.3"
              className="animate-dash"
            />
          </svg>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 relative z-10">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                onClick={() => step.path && navigate(step.path)}
                className={`group relative flex flex-col items-center text-center p-4 rounded-2xl bg-[#FAF8F5] hover:bg-white border border-[#73766A]/15 hover:border-[#2D4354]/40 shadow-xs hover:shadow-[0_8px_20px_-4px_rgba(45,67,84,0.12)] transition-all duration-300 transform hover:-translate-y-1.5 ${
                  step.path ? 'cursor-pointer' : ''
                }`}
              >
                {/* Step badge pill */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-2 transition-transform group-hover:scale-110 shadow-2xs ${step.bgLight} ${step.textAccent} border ${step.borderLight}`}
                >
                  {step.step}
                </div>

                {/* Node Icon Box */}
                <div
                  className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#73766A]/20 flex items-center justify-center mb-2.5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
                  style={{ color: step.accentColor }}
                >
                  <Icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
                </div>

                {/* Label */}
                <span className="text-xs font-bold text-[#20212B] group-hover:text-[#2D4354] transition-colors">
                  {step.label}
                </span>

                {/* Description */}
                {!compact && (
                  <span className="text-[11px] text-[#77756F] mt-1 leading-snug line-clamp-2">
                    {step.desc}
                  </span>
                )}

                {/* Arrow indicator on hover if clickable */}
                {step.path && (
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3 h-3 text-[#2D4354]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBanner;
