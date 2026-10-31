
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import WorkflowBanner from '../components/common/WorkflowBanner';
import ParticleNetwork from '../components/common/ParticleNetwork';

import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Layers,
  TrendingUp,
  ShieldCheck,
  Award,
  ChevronRight,
  Target,
  GraduationCap,
  Pencil,
  Lightbulb,
  Clock3,
  FolderOpen,
  Star,
} from 'lucide-react';

const previewTabs = [
  { id: 'dashboard', label: 'Command Center', icon: TrendingUp },
  { id: 'intelligence', label: 'AI Document Intelligence', icon: Sparkles },
  { id: 'quizzes', label: 'Adaptive Quizzes & Mock Tests', icon: BrainCircuit },
  { id: 'planner', label: 'Smart Study Planner', icon: CalendarDays },
];

const pillars = [
  {
    number: '01',
    eyebrow: 'Workspace Foundation',
    title: 'Subject-Specific Workspaces & Google Drive Sync',
    description:
      'Keep each course strictly isolated. Sync entire semester Google Drive folders or upload local PDFs and PPTs. Automatically categorize materials into Textbooks, Notes, PYQs, and Lab Manuals.',
    tags: ['OAuth Drive Sync', 'Regex Classifier', 'Supabase Cloud'],
    icon: BookOpen,
    color: 'blue',
  },
  {
    number: '02',
    eyebrow: 'Concept Synthesis',
    title: 'AI Document Intelligence & Clean Notes OCR',
    description:
      'Extract high-yield chapter summaries, strict LaTeX formula sheets, and architecture diagrams directly from course materials. Convert messy handwritten class notes into clean, printable study guides.',
    tags: ['LaTeX Formula Extraction', 'Mermaid Diagrams', 'Handwritten OCR'],
    icon: BrainCircuit,
    color: 'violet',
  },
  {
    number: '03',
    eyebrow: 'Active Retention',
    title: 'AI Flashcards & Spaced Revision',
    description:
      'Transform textbook concepts into active recall flashcard decks with one click. Leverage the proven SM-2 spaced repetition algorithm to review cards right when memory decay begins.',
    tags: ['SM-2 Spaced Repetition', '3D Interactive Flip', 'AI Mnemonics'],
    icon: Layers,
    color: 'emerald',
  },
  {
    number: '04',
    eyebrow: 'Strategy & Execution',
    title: 'Exam DateSheet & Adaptive Study Planner',
    description:
      'Maintain your complete university and practical exam datesheet with real-time day countdowns. Generate automated daily study routines that adjust dynamically when topics require more attention.',
    tags: ['DateSheet Countdown', 'Dynamic Schedule', 'Readiness Score'],
    icon: CalendarDays,
    color: 'rose',
  },
];

// Scroll reveal component
const Reveal = ({ children, className = '', delay = 0 }) => {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`sp-reveal ${visible ? 'sp-reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const AcademicIllustration = () => (
  <div className="sp-illustration relative mx-auto h-[390px] w-full max-w-[540px] sm:h-[470px]">
    <div className="absolute left-[12%] top-[8%] h-64 w-64 rounded-full bg-violet-300/40 blur-3xl sp-blob" />
    <div className="absolute bottom-[5%] right-[5%] h-64 w-64 rounded-full bg-sky-300/40 blur-3xl sp-blob sp-blob-delay" />

    <div className="absolute left-[12%] top-[18%] h-16 w-16 rounded-full border border-violet-300/60 sp-orbit" />
    <div className="absolute right-[12%] top-[13%] h-9 w-9 rounded-full bg-yellow-200/80 sp-float" />
    <div className="absolute bottom-[15%] left-[8%] h-7 w-7 rounded-full bg-pink-200 sp-float-reverse" />

    <div className="absolute inset-x-[7%] bottom-[5%] top-[8%] rounded-[42px] border border-white/80 bg-white/45 shadow-[0_30px_80px_rgba(80,83,160,0.12)] backdrop-blur-xl" />

    <div className="absolute bottom-[12%] left-[12%] h-[210px] w-[260px] rotate-[-8deg] rounded-[22px] border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-2xl shadow-blue-200/60 sp-float-card sm:h-[245px] sm:w-[300px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
            <BookOpen size={19} />
          </div>
          <span className="text-xs font-extrabold text-slate-700">MY STUDY NOTES</span>
        </div>
        <Sparkles size={18} className="text-violet-500 sp-sparkle" />
      </div>

      <div className="mt-6 space-y-3">
        <div className="h-3 w-3/4 rounded-full bg-indigo-200" />
        <div className="h-2 w-full rounded-full bg-slate-200" />
        <div className="h-2 w-5/6 rounded-full bg-slate-200" />
        <div className="mt-5 rounded-xl bg-violet-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-violet-700">
            <Lightbulb size={14} />
            Key concept
          </div>
          <div className="h-2 w-4/5 rounded-full bg-violet-200" />
          <div className="mt-2 h-2 w-3/5 rounded-full bg-violet-200" />
        </div>
      </div>

      <div className="absolute bottom-4 right-5 text-xs font-bold text-blue-500">
        Chapter 04
      </div>
    </div>

    <div className="absolute bottom-[8%] right-[8%] w-[165px] space-y-1 sm:w-[190px] sp-float-reverse">
      <div className="h-8 rotate-[-4deg] rounded-lg border border-rose-200 bg-gradient-to-r from-rose-100 to-pink-200 shadow-md" />
      <div className="h-9 rotate-[3deg] rounded-lg border border-amber-200 bg-gradient-to-r from-amber-100 to-yellow-200 shadow-md" />
      <div className="h-10 rotate-[-2deg] rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-100 to-blue-200 shadow-md" />
    </div>

    <div className="absolute right-[7%] top-[26%] flex h-[78px] w-[78px] rotate-[9deg] items-center justify-center rounded-2xl border border-white bg-white/90 text-violet-600 shadow-xl shadow-violet-200/50 sp-float">
      <FolderOpen size={36} strokeWidth={1.5} />
    </div>

    <div className="absolute right-[8%] top-[51%] flex h-[85px] w-[110px] -rotate-6 flex-col justify-center rounded-2xl border border-emerald-100 bg-white/95 p-3 shadow-xl sp-float-reverse">
      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Quick Recall</span>
      <div className="mt-2 h-2 w-full rounded-full bg-emerald-100" />
      <div className="mt-2 h-2 w-2/3 rounded-full bg-emerald-100" />
    </div>

    <div className="absolute left-[13%] top-[10%] rotate-[35deg] rounded-full bg-gradient-to-b from-amber-300 to-orange-400 px-1 py-6 shadow-lg sp-float">
      <Pencil size={19} className="text-white" />
    </div>

    <div className="absolute left-[5%] top-[37%] flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-white/90 text-blue-600 shadow-xl sp-float-reverse">
      <GraduationCap size={29} />
    </div>

    <div className="absolute right-[22%] top-[5%] flex h-14 w-14 items-center justify-center rounded-full border border-white bg-white/90 text-orange-500 shadow-lg sp-float">
      <Clock3 size={27} />
    </div>

    <div className="absolute bottom-[32%] left-[4%] flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-500 shadow-md sp-float">
      <Star size={21} />
    </div>

    <Sparkles className="absolute right-[7%] bottom-[13%] text-violet-500 sp-sparkle" size={24} />
  </div>
);

const LandingPage = () => {
  const [activePreviewTab, setActivePreviewTab] = useState('dashboard');

  const colors = {
    blue: {
      icon: 'from-blue-500 to-indigo-600',
      text: 'text-blue-600',
      tag: 'border-blue-100',
      background: 'from-white via-white to-blue-50',
      glow: 'hover:shadow-blue-100',
      number: 'text-blue-100',
    },
    violet: {
      icon: 'from-violet-500 to-purple-600',
      text: 'text-violet-600',
      tag: 'border-violet-100',
      background: 'from-white via-white to-violet-50',
      glow: 'hover:shadow-violet-100',
      number: 'text-violet-100',
    },
    emerald: {
      icon: 'from-emerald-500 to-teal-600',
      text: 'text-emerald-600',
      tag: 'border-emerald-100',
      background: 'from-white via-white to-emerald-50',
      glow: 'hover:shadow-emerald-100',
      number: 'text-emerald-100',
    },
    rose: {
      icon: 'from-rose-500 to-purple-600',
      text: 'text-rose-600',
      tag: 'border-rose-100',
      background: 'from-white via-white to-rose-50',
      glow: 'hover:shadow-rose-100',
      number: 'text-rose-100',
    },
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F8FC] text-[#202B42] selection:bg-violet-200">
      <style>{`
        @keyframes spFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes spFloatReverse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }

        @keyframes spPulse {
          0%, 100% { opacity: .45; transform: scale(1); }
          50% { opacity: .8; transform: scale(1.12); }
        }

        @keyframes spRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spShimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }

        @keyframes spFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sp-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1);
        }

        .sp-reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .sp-float { animation: spFloat 5s ease-in-out infinite; }
        .sp-float-reverse { animation: spFloatReverse 6s ease-in-out infinite; }
        .sp-float-card { animation: spFloat 7s ease-in-out infinite; }
        .sp-blob { animation: spPulse 7s ease-in-out infinite; }
        .sp-blob-delay { animation-delay: 2s; }
        .sp-orbit { animation: spRotate 22s linear infinite; }
        .sp-sparkle { animation: spPulse 2.5s ease-in-out infinite; }

        .sp-card {
          transition: transform .5s cubic-bezier(.2,.7,.2,1),
                      box-shadow .5s ease,
                      border-color .4s ease;
        }

        .sp-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.55) 48%, transparent 65%);
          transform: translateX(-120%);
          transition: transform .8s ease;
        }

        .sp-card:hover::after {
          transform: translateX(120%);
        }

        .sp-card-icon {
          transition: transform .5s cubic-bezier(.2,.8,.2,1);
        }

        .sp-card:hover .sp-card-icon {
          transform: rotate(-8deg) scale(1.12);
        }

        .sp-cta-panel {
          transition: box-shadow .5s ease, transform .5s ease;
        }

        .sp-cta-panel:hover {
          box-shadow: 0 35px 100px rgba(49,46,129,.32);
        }

        .sp-cta-button {
          animation: spFadeUp .8s ease both;
        }

        @media (prefers-reduced-motion: reduce) {
          .sp-reveal, .sp-reveal-visible {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .sp-float, .sp-float-reverse, .sp-float-card,
          .sp-blob, .sp-orbit, .sp-sparkle, .sp-cta-button {
            animation: none !important;
          }

          .sp-card, .sp-card::after {
            transition: none !important;
          }
        }
      `}</style>

      <Navbar />

      {/* HERO — PRESERVED */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#F0F1FF] via-[#FAFBFF] to-[#F5EEFF]">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <ParticleNetwork />
        </div>

        <div className="pointer-events-none absolute -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-blue-300/30 blur-[110px]" />
        <div className="pointer-events-none absolute -right-40 top-10 -z-10 h-96 w-96 rounded-full bg-violet-300/30 blur-[110px]" />

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-5 px-5 pb-14 pt-12 sm:px-8 lg:min-h-[590px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-0 lg:px-12 lg:pb-16 lg:pt-12">
          <div className="relative z-10 mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur-xl sm:text-sm">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Next-Gen AI Academic Productivity Platform
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px]">AI</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.13] tracking-tight text-slate-950 sm:text-5xl lg:text-[62px]">
              Master Every Course & Ace Your Exams with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                StudyPilot AI
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              The all-in-one academic companion that turns dense lecture slides,
              textbooks, and Google Drive resources into active-recall flashcards,
              mock quizzes, and adaptive exam schedules.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:text-base"
              >
                Get Started Free
                <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#suite"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-7 py-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:border-indigo-200 hover:text-indigo-700 sm:text-base"
              >
                Explore Platform Suite
                <ChevronRight size={17} />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-semibold text-slate-500 lg:justify-start">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500" />
                Google Drive Cloud Indexer
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-blue-600" />
                Spaced Repetition (SM-2)
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-violet-600" />
                Deterministic Exam Diagnostics
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck size={15} />
                Private & Secure Workspace
              </span>
            </div>
          </div>

          <div className="relative z-10 w-full">
            <AcademicIllustration />
          </div>
        </div>

        {/* PRODUCT PREVIEW — PRESERVED */}
        <div className="relative mx-auto -mb-1 max-w-[1250px] px-4 pb-20 sm:px-8 lg:px-12">
          <div className="absolute inset-x-10 top-5 h-48 rounded-full bg-indigo-300/20 blur-[80px]" />

          <div className="relative overflow-hidden rounded-[25px] border border-white bg-white/90 shadow-[0_30px_90px_rgba(65,80,150,0.17)] backdrop-blur-xl sm:rounded-[30px]">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 hidden text-xs font-semibold text-slate-400 sm:inline">
                  studypilot.ai/workspace/preview
                </span>
              </div>

              <div className="flex max-w-full gap-1 overflow-x-auto pb-1">
                {previewTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activePreviewTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActivePreviewTab(tab.id)}
                      aria-pressed={isActive}
                      className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-[390px] bg-gradient-to-br from-[#F8FAFF] to-[#F0F1FF] p-5 sm:p-8">
              {activePreviewTab === 'dashboard' && (
                <div key="dashboard" className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
                    <div>
                      <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                        <Sparkles size={14} />
                        Academic Command Center
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                        Welcome back, Alex! 👋
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Semester 3 • Computer Science & Engineering
                      </p>
                    </div>
                    <span className="self-start rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 sm:self-auto">
                      88% Exam Preparation Index
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                      {
                        label: 'Active Workspaces',
                        value: '6 Courses',
                        detail: '302 materials indexed',
                        color: 'text-blue-600',
                        icon: BookOpen,
                        bg: 'bg-blue-50',
                      },
                      {
                        label: 'Next University Exam',
                        value: 'In 12 Days',
                        detail: 'Data Structures (CS-301)',
                        color: 'text-rose-600',
                        icon: CalendarDays,
                        bg: 'bg-rose-50',
                      },
                      {
                        label: 'Retention Mastery',
                        value: '94.2%',
                        detail: '18 cards due today',
                        color: 'text-emerald-600',
                        icon: BrainCircuit,
                        bg: 'bg-emerald-50',
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                        >
                          <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                            <Icon size={20} />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {item.label}
                          </p>
                          <p className="mt-2 text-2xl font-black text-slate-900">
                            {item.value}
                          </p>
                          <p className={`mt-2 text-xs font-semibold ${item.color}`}>
                            {item.detail}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col justify-between gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50 to-violet-50 p-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                        <Target size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Today's Recommended Study Milestone
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          Review AVL Trees & B-Tree indexing (2.5h scheduled prep)
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/register"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                    >
                      Launch <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}

              {activePreviewTab === 'intelligence' && (
                <div key="intelligence" className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        AI Document Engine
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        Module 4: Dynamic Programming & Graphs.pdf
                      </h3>
                    </div>
                    <span className="self-start rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                      Synthesized 100%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Sparkles size={16} className="text-blue-600" />
                        Extracted Key Concept Hierarchy
                      </div>
                      <ul className="list-disc space-y-2 pl-5 text-xs leading-6 text-slate-600">
                        <li><strong>Bellman-Ford Algorithm:</strong> Handles negative edge weights with O(V·E) complexity.</li>
                        <li><strong>Floyd-Warshall:</strong> All-pairs shortest paths using dynamic programming matrix.</li>
                        <li><strong>Overlapping Subproblems:</strong> Memoization vs. tabulation recurrence relations.</li>
                      </ul>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Award size={16} className="text-indigo-600" />
                        Strict Formula & Derivation Sheet
                      </div>
                      <div className="overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-sky-300">
                        dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
                      </div>
                      <p className="text-xs leading-5 text-slate-500">
                        Verified from slide page 42. Formulas are never hallucinated.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'quizzes' && (
                <div key="quizzes" className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Adaptive Evaluation Suite
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        Operating Systems: Deadlock & Synchronization Mock Exam
                      </h3>
                    </div>
                    <span className="self-start rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                      Score: 9/10 (90%)
                    </span>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-bold text-slate-800">
                      Question 4: Which condition is NOT necessary for a deadlock to occur?
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-3 text-slate-600">A. Mutual exclusion</div>
                      <div className="rounded-xl border border-slate-200 p-3 text-slate-600">B. Hold and wait</div>
                      <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-3 font-semibold text-emerald-900">
                        C. Preemption allowed
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      </div>
                      <div className="rounded-xl border border-slate-200 p-3 text-slate-600">D. Circular wait</div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                      <strong>AI Diagnostic Feedback:</strong> Preemption actually breaks the deadlock condition. Resource preemption is a standard avoidance strategy.
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'planner' && (
                <div key="planner" className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Dynamic Schedule Engine
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        End-Semester Examination Strategy
                      </h3>
                    </div>
                    <span className="self-start rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                      6 Exams Synced
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-black text-blue-700">D-12</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Data Structures & Algorithms</p>
                          <p className="mt-1 text-xs text-slate-500">14 topics remaining • 2.5h daily target</p>
                        </div>
                      </div>
                      <span className="self-start rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 sm:self-auto">On Track</span>
                    </div>

                    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-black text-indigo-700">D-16</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Database Management Systems</p>
                          <p className="mt-1 text-xs text-slate-500">Normalization & BCNF • 2.0h daily target</p>
                        </div>
                      </div>
                      <span className="self-start rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:self-auto">82% Prepared</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-7 flex flex-col justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  Real-time academic workflow demonstration
                </div>
                <Link to="/register" className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800">
                  Try it with your courses
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section
        id="workflow"
        className="relative isolate overflow-hidden bg-[#F1F3FF] py-20 sm:py-24"
      >
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-200/40 blur-[100px] sp-blob" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-violet-200/50 blur-[100px] sp-blob sp-blob-delay" />

        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal>
            <div className="mb-12 grid items-end gap-6 lg:grid-cols-[1fr_0.7fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
                  <Sparkles size={14} />
                  Proven Learning Methodology
                </span>
                <h2 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  A smarter way to move from
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"> learning to mastery.</span>
                </h2>
              </div>

              <p className="max-w-lg text-sm leading-7 text-slate-600 lg:justify-self-end">
                StudyPilot connects your learning journey into one structured
                process — helping you organize resources, understand concepts,
                practise actively, and prepare with purpose.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="sp-workflow-panel rounded-[30px] border border-white/80 bg-white/75 p-4 shadow-[0_25px_70px_rgba(72,83,150,0.10)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_30px_85px_rgba(72,83,150,0.16)] sm:p-7 lg:p-9">
              <WorkflowBanner />
            </div>
          </Reveal>
        </div>
      </section>

      {/* PLATFORM SUITE */}
      <section
        id="suite"
        className="relative overflow-hidden border-y border-slate-200/70 bg-white py-20 sm:py-24"
      >
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-violet-100/60 blur-[100px] sp-blob" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-100/60 blur-[100px] sp-blob sp-blob-delay" />

        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal>
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <Layers size={14} />
                Platform Capabilities
              </span>

              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Everything you need to
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent"> study smarter.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                From organizing course materials to preparing for examinations,
                every capability works together to make your academic workflow
                more focused and manageable.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              const style = colors[pillar.color];

              return (
                <Reveal key={pillar.eyebrow} delay={index * 120}>
                  <article
                    className={`sp-card group relative isolate overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br ${style.background} p-7 shadow-[0_8px_30px_rgba(30,41,59,0.04)] hover:-translate-y-2 hover:border-white hover:shadow-[0_24px_55px_rgba(50,65,120,0.12)] ${style.glow} sm:p-9`}
                  >
                    <span className={`pointer-events-none absolute -right-2 -top-10 select-none text-[120px] font-black leading-none ${style.number}`}>
                      {pillar.number}
                    </span>

                    <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/70 blur-3xl transition-transform duration-700 group-hover:scale-150" />

                    <div className="relative">
                      <div className="mb-7 flex items-center justify-between">
                        <div className={`sp-card-icon flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${style.icon} text-white shadow-lg`}>
                          <Icon size={26} strokeWidth={1.8} />
                        </div>

                        <span className={`rounded-full border ${style.tag} bg-white/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] ${style.text}`}>
                          {pillar.eyebrow}
                        </span>
                      </div>

                      <h3 className="max-w-md text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">
                        {pillar.title}
                      </h3>

                      <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                        {pillar.description}
                      </p>

                      <div className="mt-7 flex flex-wrap gap-2">
                        {pillar.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-lg border ${style.tag} bg-white/80 px-3 py-2 text-[11px] font-semibold text-slate-600 transition-colors group-hover:bg-white`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className={`mt-8 flex items-center gap-2 text-xs font-bold ${style.text}`}>
                        <span className="h-px w-7 bg-current opacity-50 transition-all duration-300 group-hover:w-12" />
                        Part of your StudyPilot workspace
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="relative overflow-hidden bg-[#F7F8FC] px-5 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <div className="sp-cta-panel relative isolate overflow-hidden rounded-[34px] bg-gradient-to-br from-[#172554] via-[#3730A3] to-[#6D28D9] px-6 py-16 text-center text-white shadow-[0_30px_80px_rgba(49,46,129,0.22)] sm:px-12 sm:py-20">
              <div className="pointer-events-none absolute -right-20 -top-36 -z-10 h-96 w-96 rounded-full bg-blue-400/30 blur-[90px] sp-blob" />
              <div className="pointer-events-none absolute -bottom-40 -left-20 -z-10 h-96 w-96 rounded-full bg-fuchsia-400/25 blur-[90px] sp-blob sp-blob-delay" />
              <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

              <div className="relative mx-auto max-w-3xl">
                <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md sp-float">
                  <GraduationCap size={34} strokeWidth={1.6} />
                </div>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-indigo-100 backdrop-blur-md">
                  <Sparkles size={15} className="sp-sparkle" />
                  Your academic journey starts here
                </span>

                <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  Make every study session
                  <span className="block text-indigo-200">count towards your goals.</span>
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-indigo-100/90 sm:text-base">
                  Organize your courses, understand complex concepts, practise
                  with purpose, and walk into your examinations better prepared
                  with StudyPilot AI.
                </p>

                <div className="mt-9">
                  <Link
                    to="/register"
                    className="sp-cta-button group inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 text-sm font-extrabold text-indigo-700 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-50 hover:shadow-2xl sm:text-base"
                  >
                    Create Student Account
                    <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <p className="mt-5 text-xs font-medium text-indigo-200/80">
                  Start organizing your academic journey today.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                <img
                  src="/logo.png"
                  alt="StudyPilot Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <span className="block text-sm font-extrabold tracking-tight text-slate-800">
                  StudyPilot AI
                </span>
                <span className="text-xs text-slate-400">
                  Your Personal Academic Companion
                </span>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-semibold text-slate-500">
              <Link to="/login" className="transition-colors hover:text-indigo-600">
                Student Login
              </Link>
              <Link to="/register" className="transition-colors hover:text-indigo-600">
                Register
              </Link>
              <a href="#suite" className="transition-colors hover:text-indigo-600">
                Platform Suite
              </a>
              <a href="#workflow" className="transition-colors hover:text-indigo-600">
                Methodology
              </a>
            </nav>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-center sm:flex-row sm:text-left">
            <p className="text-[11px] font-medium text-slate-400">
              © 2026 StudyPilot AI. All rights reserved.
            </p>
            <p className="text-[11px] text-slate-400">
              Learn with clarity. Prepare with confidence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
