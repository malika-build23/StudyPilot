import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import WorkflowBanner from '../components/common/WorkflowBanner';
import ParticleNetwork from '../components/common/ParticleNetwork';
import heroStudentImg from '../assets/illustrations/hero_student.png';
import gradCapImg from '../assets/illustrations/element_graduation_cap.png';
import stackedBooksImg from '../assets/illustrations/element_stacked_books.png';
import calendarClockImg from '../assets/illustrations/element_calendar_clock.png';
import flashcardsImg from '../assets/illustrations/element_flashcards.png';
import notebookImg from '../assets/illustrations/element_open_notebook.png';
import backpackImg from '../assets/illustrations/element_student_backpack.png';

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
    elementImg: stackedBooksImg,
    colorScheme: {
      number: 'text-[#2D4354]/10',
      iconBg: 'bg-[#2D4354]/10 text-[#2D4354] border-[#2D4354]/25',
      badge: 'border-[#2D4354]/25 text-[#2D4354] bg-[#2D4354]/5',
      borderHover: 'hover:border-[#2D4354]/40',
      shadowHover: 'hover:shadow-[0_20px_45px_rgba(45,67,84,0.12)]',
      accentText: 'text-[#2D4354]',
      cardBg: 'from-white via-[#FAF8F5] to-white',
    },
  },
  {
    number: '02',
    eyebrow: 'Concept Synthesis',
    title: 'AI Document Intelligence & Clean Notes OCR',
    description:
      'Extract high-yield chapter summaries, strict LaTeX formula sheets, and architecture diagrams directly from course materials. Convert messy handwritten class notes into clean, printable study guides.',
    tags: ['LaTeX Formula Extraction', 'Mermaid Diagrams', 'Handwritten OCR'],
    icon: BrainCircuit,
    elementImg: notebookImg,
    colorScheme: {
      number: 'text-[#9E6752]/10',
      iconBg: 'bg-[#FED7A5]/35 text-[#9E6752] border-[#9E6752]/30',
      badge: 'border-[#9E6752]/30 text-[#9E6752] bg-[#FFF7EC]',
      borderHover: 'hover:border-[#9E6752]/40',
      shadowHover: 'hover:shadow-[0_20px_45px_rgba(158,103,82,0.12)]',
      accentText: 'text-[#9E6752]',
      cardBg: 'from-white via-[#FFF7EC]/40 to-white',
    },
  },
  {
    number: '03',
    eyebrow: 'Active Retention',
    title: 'AI Flashcards & Spaced Revision',
    description:
      'Transform textbook concepts into active recall flashcard decks with one click. Leverage the proven SM-2 spaced repetition algorithm to review cards right when memory decay begins.',
    tags: ['SM-2 Spaced Repetition', '3D Interactive Flip', 'AI Mnemonics'],
    icon: Layers,
    elementImg: flashcardsImg,
    colorScheme: {
      number: 'text-[#73766A]/10',
      iconBg: 'bg-[#73766A]/15 text-[#73766A] border-[#73766A]/30',
      badge: 'border-[#73766A]/30 text-[#73766A] bg-[#FAF8F5]',
      borderHover: 'hover:border-[#73766A]/40',
      shadowHover: 'hover:shadow-[0_20px_45px_rgba(115,118,106,0.12)]',
      accentText: 'text-[#73766A]',
      cardBg: 'from-white via-[#FAF8F5] to-white',
    },
  },
  {
    number: '04',
    eyebrow: 'Strategy & Execution',
    title: 'Exam DateSheet & Adaptive Study Planner',
    description:
      'Maintain your complete university and practical exam datesheet with real-time day countdowns. Generate automated daily study routines that adjust dynamically when topics require more attention.',
    tags: ['DateSheet Countdown', 'Dynamic Schedule', 'Readiness Score'],
    icon: CalendarDays,
    elementImg: calendarClockImg,
    colorScheme: {
      number: 'text-[#534145]/10',
      iconBg: 'bg-[#534145]/10 text-[#534145] border-[#534145]/25',
      badge: 'border-[#534145]/25 text-[#534145] bg-[#FFF7EC]/50',
      borderHover: 'hover:border-[#534145]/40',
      shadowHover: 'hover:shadow-[0_20px_45px_rgba(83,65,69,0.12)]',
      accentText: 'text-[#534145]',
      cardBg: 'from-white via-[#FAF8F5] to-white',
    },
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

const LandingPage = () => {
  const [activePreviewTab, setActivePreviewTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col selection:bg-[#2D4354] selection:text-white">
      <Navbar />

      {/* Hero Section – SCREEN 01 */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#FFF7EC]/70 via-[#FAF8F5] to-white pt-10 pb-16 sm:pb-24 lg:pt-14 lg:pb-28">
        {/* Dynamic Interactive Particle Network in Official Palette */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
          <ParticleNetwork />
        </div>

        {/* Ambient Organic Brand Shapes */}
        <div className="pointer-events-none absolute -left-32 top-16 -z-10 h-96 w-96 rounded-full bg-[#FED7A5]/35 blur-[100px] sp-blob" />
        <div className="pointer-events-none absolute -right-32 top-10 -z-10 h-96 w-96 rounded-full bg-[#9E6752]/20 blur-[100px] sp-blob sp-blob-delay" />
        <div className="pointer-events-none absolute left-1/2 top-40 -translate-x-1/2 -z-10 h-72 w-[600px] rounded-full bg-[#2D4354]/10 blur-[90px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#FED7A5] text-[#2D4354] text-xs font-bold mb-6 shadow-xs backdrop-blur-md hover:scale-105 transition-transform cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-[#9E6752] animate-pulse" />
              <span>Next-Gen AI Academic Productivity Platform</span>
              <span className="rounded-full bg-[#FED7A5]/40 text-[#2D4354] px-2 py-0.5 text-[10px] font-extrabold">AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#20212B] tracking-tight leading-[1.12]">
              Master Every Course & Ace Your Exams with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D4354] via-[#9E6752] to-[#FED7A5]">
                StudyPilot AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#77756F] leading-relaxed max-w-2xl mx-auto font-normal">
              The all-in-one academic companion that turns dense lecture slides, textbooks, and Google Drive resources into active-recall flashcards, mock quizzes, and adaptive exam schedules.
            </p>

            {/* Call to Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-sm sm:text-base shadow-[0_8px_24px_rgba(45,67,84,0.3)] hover:shadow-[0_12px_32px_rgba(45,67,84,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 text-[#FED7A5]" />
              </Link>
              <a
                href="#suite"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-[#FAF8F5] text-[#20212B] border border-[#73766A]/25 font-bold text-sm sm:text-base shadow-xs hover:border-[#2D4354]/50 transition-all hover:scale-[1.02]"
              >
                <span>Explore Platform Suite</span>
                <ChevronRight className="w-4 h-4 text-[#73766A]" />
              </a>
            </div>

            {/* Trust Badges in Official Palette */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-[#77756F] font-semibold">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-[#73766A]/20 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#73766A]" />
                <span>Google Drive Cloud Indexer</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-[#73766A]/20 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#2D4354]" />
                <span>Spaced Repetition (SM-2)</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-[#73766A]/20 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#9E6752]" />
                <span>Deterministic Exam Diagnostics</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-[#73766A]/20 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#534145]" />
                <span>Private & Secure Workspace</span>
              </div>
            </div>
          </div>

          {/* Free-Standing 3D Student Character & Floating Elements – NO BOX, NO BORDER */}
          <div className="mt-8 mb-4 max-w-4xl mx-auto relative flex justify-center items-center min-h-[380px] sm:min-h-[440px]">
            {/* Soft Ambient Radial Glow Behind Character */}
            <div className="absolute w-[460px] h-[340px] bg-gradient-to-tr from-[#FED7A5]/45 via-[#FFF7EC]/70 to-[#2D4354]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Floating 3D Standalone Elements Around Character */}
            <div className="hidden sm:block absolute -top-4 -right-2 md:right-8 w-24 h-24 md:w-28 md:h-28 z-20 animate-float-delayed pointer-events-none drop-shadow-[0_15px_25px_rgba(45,67,84,0.18)]">
              <img src={gradCapImg} alt="Graduation Cap" className="w-full h-full object-contain" />
            </div>

            <div className="hidden sm:block absolute -left-4 md:left-6 bottom-4 w-24 h-24 md:w-28 md:h-28 z-20 animate-float-gentle pointer-events-none drop-shadow-[0_15px_25px_rgba(45,67,84,0.18)]">
              <img src={stackedBooksImg} alt="Stacked Books" className="w-full h-full object-contain" />
            </div>

            <div className="hidden md:block absolute -left-8 top-12 w-20 h-20 md:w-24 md:h-24 z-20 animate-float-delayed pointer-events-none drop-shadow-[0_15px_25px_rgba(45,67,84,0.18)]">
              <img src={flashcardsImg} alt="Flashcards" className="w-full h-full object-contain" />
            </div>

            <div className="hidden md:block absolute -right-6 bottom-2 w-22 h-22 md:w-26 md:h-26 z-20 animate-float-gentle pointer-events-none drop-shadow-[0_15px_25px_rgba(45,67,84,0.18)]">
              <img src={backpackImg} alt="Student Backpack" className="w-full h-full object-contain" />
            </div>

            {/* Floating Academic Badges */}
            <div className="hidden lg:flex absolute -left-8 top-1/2 -translate-y-1/2 items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/95 border border-[#73766A]/20 shadow-lg animate-float-gentle z-20">
              <div className="w-8 h-8 rounded-xl bg-[#FED7A5] text-[#2D4354] flex items-center justify-center font-bold text-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#20212B]">300+ Materials</div>
                <div className="text-[10px] text-[#77756F]">Structured Automatically</div>
              </div>
            </div>

            <div className="hidden lg:flex absolute -right-8 top-1/2 -translate-y-1/2 items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/95 border border-[#73766A]/20 shadow-lg animate-float-delayed z-20">
              <div className="w-8 h-8 rounded-xl bg-[#2D4354] text-[#FED7A5] flex items-center justify-center font-bold text-xs">
                <Target className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#20212B]">94.2% Mastery</div>
                <div className="text-[10px] text-[#77756F]">Active Recall & SM-2</div>
              </div>
            </div>

            {/* Free-Standing 3D Character (NO BOX, NO BORDER) */}
            <div className="relative z-10 w-full max-w-xl flex justify-center py-2">
              <img
                src={heroStudentImg}
                alt="Student studying with laptop, books, and stationery"
                className="w-full h-auto max-h-[440px] object-contain drop-shadow-[0_25px_45px_rgba(45,67,84,0.16)] animate-float-gentle transform hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>

          {/* Interactive Platform Preview Showcase */}
          <div className="mt-10 relative max-w-5xl mx-auto">
            {/* Ambient Backlight */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#2D4354]/15 via-[#FED7A5]/30 to-[#9E6752]/20 rounded-3xl blur-2xl opacity-75" />

            <div className="relative rounded-3xl bg-white border border-[#73766A]/20 shadow-[0_20px_60px_-15px_rgba(45,67,84,0.12)] overflow-hidden transition-all duration-300">
              {/* Window Controls & Preview Navigation Bar */}
              <div className="bg-[#20212B] px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#534145]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#9E6752] shadow-2xs" />
                  <div className="w-3 h-3 rounded-full bg-[#FED7A5] shadow-2xs" />
                  <div className="w-3 h-3 rounded-full bg-[#73766A] shadow-2xs" />
                  <span className="ml-3 text-xs font-semibold text-slate-300 hidden sm:inline tracking-tight">
                    studypilot.ai/workspace/preview
                  </span>
                </div>

                {/* Preview Tabs */}
                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
                  {previewTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activePreviewTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActivePreviewTab(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#2D4354] text-[#FED7A5] shadow-xs'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Preview Viewport in Brand Colours */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-[#FAF8F5] to-white min-h-[380px] flex flex-col justify-between">
                {activePreviewTab === 'dashboard' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#73766A]/15">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FED7A5]/30 border border-[#FED7A5] text-[#2D4354] text-xs font-bold mb-1">
                          <Sparkles className="w-3 h-3 text-[#9E6752]" />
                          <span>Academic Command Center</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-[#20212B]">
                          Welcome back, Alex! 👋
                        </h3>
                        <p className="text-xs text-[#77756F]">
                          Semester 3 • Computer Science & Engineering
                        </p>
                      </div>
                      <span className="self-start sm:self-auto text-xs font-bold text-[#2D4354] bg-[#FED7A5]/35 border border-[#FED7A5] px-3 py-1 rounded-full shadow-2xs">
                        88% Exam Preparation Index
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-[#73766A]/20 shadow-xs hover:border-[#2D4354]/40 transition-all">
                        <div className="text-xs font-bold uppercase text-[#77756F] tracking-wider">Active Workspaces</div>
                        <div className="text-2xl font-black text-[#20212B] mt-1">6 Courses</div>
                        <div className="text-[11px] text-[#2D4354] font-semibold mt-1">302 materials indexed</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-[#73766A]/20 shadow-xs hover:border-[#9E6752]/40 transition-all">
                        <div className="text-xs font-bold uppercase text-[#77756F] tracking-wider">Next University Exam</div>
                        <div className="text-2xl font-black text-[#20212B] mt-1">In 12 Days</div>
                        <div className="text-[11px] text-[#9E6752] font-semibold mt-1">Data Structures (CS-301)</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white border border-[#73766A]/20 shadow-xs hover:border-[#73766A]/40 transition-all">
                        <div className="text-xs font-bold uppercase text-[#77756F] tracking-wider">Retention Mastery</div>
                        <div className="text-2xl font-black text-[#73766A] mt-1">94.2%</div>
                        <div className="text-[11px] text-[#77756F] font-semibold mt-1">18 cards due today</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF7EC] to-[#FAF8F5] border border-[#FED7A5]/60 flex items-center justify-between gap-4 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2D4354] text-[#FED7A5] flex items-center justify-center shrink-0 shadow-xs">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#20212B]">Today's Recommended Study Milestone</div>
                          <div className="text-[11px] text-[#77756F]">Review AVL Trees & B-Tree indexing (2.5h scheduled prep)</div>
                        </div>
                      </div>
                      <Link to="/register" className="px-4 py-2 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white text-xs font-bold shrink-0 shadow-xs transition-all">
                        Launch
                      </Link>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'intelligence' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-[#73766A]/15">
                      <div>
                        <div className="text-xs font-bold text-[#9E6752] uppercase tracking-wider">AI Document Engine</div>
                        <h3 className="text-lg font-bold text-[#20212B]">Module 4: Dynamic Programming & Graphs.pdf</h3>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF8F5] text-[#2D4354] border border-[#73766A]/20">
                        Synthesized 100%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-[#73766A]/20 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#20212B]">
                          <Sparkles className="w-4 h-4 text-[#9E6752]" />
                          <span>Extracted Key Concept Hierarchy</span>
                        </div>
                        <ul className="text-xs text-[#77756F] space-y-1.5 pl-4 list-disc">
                          <li><strong className="text-[#20212B]">Bellman-Ford Algorithm:</strong> Handles negative edge weights with O(V·E) complexity.</li>
                          <li><strong className="text-[#20212B]">Floyd-Warshall:</strong> All-pairs shortest paths using dynamic programming matrix.</li>
                          <li><strong className="text-[#20212B]">Overlapping Subproblems:</strong> Memoization vs. tabulation recurrence relations.</li>
                        </ul>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-[#73766A]/20 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#20212B]">
                          <Award className="w-4 h-4 text-[#534145]" />
                          <span>Strict Formula & Derivation Sheet</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#20212B] text-[#FED7A5] font-mono text-xs shadow-xs">
                          dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
                        </div>
                        <p className="text-[11px] text-[#77756F]">
                          Verified from slide page 42. Formulas are never hallucinated.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'quizzes' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-[#73766A]/15">
                      <div>
                        <div className="text-xs font-bold text-[#73766A] uppercase tracking-wider">Adaptive Evaluation Suite</div>
                        <h3 className="text-lg font-bold text-[#20212B]">Operating Systems: Deadlock & Synchronization Mock Exam</h3>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FED7A5]/30 text-[#9E6752] border border-[#FED7A5]">
                        Score: 9/10 (90%)
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#73766A]/20 shadow-xs space-y-3">
                      <div className="text-xs font-bold text-[#20212B]">
                        Question 4: Which condition is NOT necessary for a deadlock to occur?
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl border border-[#73766A]/20 text-[#77756F]">A. Mutual exclusion</div>
                        <div className="p-2.5 rounded-xl border border-[#73766A]/20 text-[#77756F]">B. Hold and wait</div>
                        <div className="p-2.5 rounded-xl border border-[#2D4354] bg-[#FAF8F5] font-bold text-[#2D4354] flex items-center justify-between">
                          <span>C. Preemption allowed</span>
                          <CheckCircle2 className="w-4 h-4 text-[#2D4354]" />
                        </div>
                        <div className="p-2.5 rounded-xl border border-[#73766A]/20 text-[#77756F]">D. Circular wait</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#73766A]/20 text-[11px] text-[#77756F]">
                        <strong className="text-[#20212B]">AI Diagnostic Feedback:</strong> Preemption actually breaks the deadlock condition. Resource preemption is a standard avoidance strategy.
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'planner' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-[#73766A]/15">
                      <div>
                        <div className="text-xs font-bold text-[#534145] uppercase tracking-wider">Dynamic Schedule Engine</div>
                        <h3 className="text-lg font-bold text-[#20212B]">End-Semester Examination Strategy</h3>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FED7A5]/30 text-[#2D4354] border border-[#FED7A5]">
                        6 Exams Synced
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3.5 rounded-2xl bg-white border border-[#73766A]/20 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#2D4354]/10 text-[#2D4354] font-bold text-xs flex items-center justify-center border border-[#2D4354]/20">
                            D-12
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#20212B]">Data Structures & Algorithms</div>
                            <div className="text-[11px] text-[#77756F]">14 topics remaining • 2.5h daily target</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF8F5] text-[#2D4354] border border-[#73766A]/20">On Track</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-[#73766A]/20 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#9E6752]/10 text-[#9E6752] font-bold text-xs flex items-center justify-center border border-[#9E6752]/20">
                            D-16
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#20212B]">Database Management Systems</div>
                            <div className="text-[11px] text-[#77756F]">Normalization & BCNF • 2.0h daily target</div>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FED7A5]/40 text-[#9E6752] border border-[#FED7A5]">82% Prepared</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer preview CTA */}
                <div className="pt-4 border-t border-[#73766A]/15 flex items-center justify-between text-xs text-[#77756F]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9E6752] animate-pulse" />
                    <span className="font-medium">Real-time academic workflow demonstration</span>
                  </div>
                  <Link to="/register" className="font-bold text-[#2D4354] hover:text-[#9E6752] flex items-center gap-1 transition-colors">
                    <span>Try it with your courses</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workflow Section – SCREEN 02 */}
      <section id="workflow" className="relative isolate overflow-hidden bg-gradient-to-b from-[#FAF8F5] to-[#FFF7EC]/40 py-20 sm:py-24">
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#FED7A5]/25 blur-[100px] sp-blob" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#9E6752]/15 blur-[100px] sp-blob sp-blob-delay" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 w-full">
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FED7A5] bg-[#FED7A5]/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#2D4354] shadow-xs">
                <Sparkles size={14} className="text-[#9E6752]" />
                Proven Learning Methodology
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#20212B] sm:text-4xl lg:text-5xl">
                The StudyPilot{' '}
                <span className="bg-gradient-to-r from-[#2D4354] via-[#9E6752] to-[#FED7A5] bg-clip-text text-transparent">
                  7-Stage Learning Loop
                </span>
              </h2>
              <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-[#77756F]">
                From raw lecture slides to exam mastery through structured, AI-assisted progression.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="sp-workflow-panel rounded-[30px] border border-white/80 bg-white/80 p-4 shadow-[0_20px_60px_rgba(45,67,84,0.06)] backdrop-blur-xl sm:p-7 lg:p-9">
              <WorkflowBanner />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Platform Suite Pillars – SCREEN 03 */}
      <section id="suite" className="relative overflow-hidden border-y border-[#73766A]/15 bg-white py-20 sm:py-24">
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#FED7A5]/20 blur-[100px] sp-blob" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#2D4354]/10 blur-[100px] sp-blob sp-blob-delay" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
          <Reveal>
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FED7A5] bg-[#FED7A5]/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#2D4354]">
                <Layers size={14} className="text-[#2D4354]" />
                Platform Capabilities
              </span>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#20212B] sm:text-4xl lg:text-5xl">
                Engineered for Serious{' '}
                <span className="bg-gradient-to-r from-[#2D4354] via-[#9E6752] to-[#FED7A5] bg-clip-text text-transparent">
                  Academic Performance
                </span>
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#77756F] sm:text-base">
                Everything students need to organize overwhelming course materials and build deep exam confidence.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              const { colorScheme } = pillar;

              return (
                <Reveal key={pillar.eyebrow} delay={index * 120}>
                  <article
                    className={`sp-card group relative isolate overflow-hidden rounded-[28px] border border-[#73766A]/20 bg-gradient-to-br ${colorScheme.cardBg} p-7 shadow-xs hover:-translate-y-2 hover:border-[#2D4354]/40 ${colorScheme.shadowHover} transition-all duration-300 sm:p-9`}
                  >
                    <span className={`pointer-events-none absolute -right-2 -top-10 select-none text-[120px] font-black leading-none ${colorScheme.number}`}>
                      {pillar.number}
                    </span>

                    <div className="relative">
                      {/* Floating Standalone 3D Element Inside Pillar */}
                      {pillar.elementImg && (
                        <div className="absolute -top-3 right-0 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none drop-shadow-md animate-float-delayed group-hover:scale-110 transition-transform">
                          <img src={pillar.elementImg} alt={pillar.eyebrow} className="w-full h-full object-contain" />
                        </div>
                      )}

                      <div className="mb-7 flex items-center justify-between">
                        <div className={`sp-card-icon flex h-14 w-14 items-center justify-center rounded-2xl border ${colorScheme.iconBg} shadow-xs`}>
                          <Icon size={26} strokeWidth={1.8} />
                        </div>

                        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] ${colorScheme.badge} mr-14 sm:mr-16`}>
                          {pillar.eyebrow}
                        </span>
                      </div>

                      <h3 className="max-w-md text-xl font-extrabold leading-snug text-[#20212B] sm:text-2xl">
                        {pillar.title}
                      </h3>

                      <p className="mt-4 max-w-xl text-sm leading-7 text-[#77756F]">
                        {pillar.description}
                      </p>

                      <div className="mt-7 flex flex-wrap gap-2">
                        {pillar.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg border border-[#73766A]/20 bg-white px-3 py-2 text-[11px] font-semibold text-[#77756F] shadow-2xs transition-colors group-hover:border-[#2D4354]/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className={`mt-8 flex items-center gap-2 text-xs font-bold ${colorScheme.accentText}`}>
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

      {/* Bottom CTA Section */}
      <section className="relative overflow-hidden bg-[#FAF8F5] px-4 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="sp-cta-panel relative isolate overflow-hidden rounded-[34px] bg-gradient-to-r from-[#2D4354] via-[#534145] to-[#9E6752] px-6 py-16 text-center text-white shadow-[0_24px_70px_rgba(45,67,84,0.3)] sm:px-12 sm:py-20">
              <div className="pointer-events-none absolute -right-20 -top-36 -z-10 h-96 w-96 rounded-full bg-[#FED7A5]/20 blur-[90px] sp-blob" />
              <div className="pointer-events-none absolute -bottom-40 -left-20 -z-10 h-96 w-96 rounded-full bg-[#9E6752]/25 blur-[90px] sp-blob sp-blob-delay" />

              <div className="relative mx-auto max-w-3xl">
                <div className="mx-auto mb-6 w-24 h-24 drop-shadow-2xl animate-float-gentle">
                  <img src={gradCapImg} alt="Graduation Cap" className="w-full h-full object-contain" />
                </div>

                <span className="inline-flex items-center gap-2 rounded-full border border-[#FED7A5]/30 bg-white/10 px-4 py-2 text-xs font-bold text-[#FED7A5] backdrop-blur-md">
                  <Sparkles size={15} className="sp-sparkle" />
                  Your academic journey starts here
                </span>

                <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl text-white">
                  Ready to Upgrade Your Academic Performance?
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#FED7A5]/90 sm:text-base">
                  Join students using StudyPilot AI to organize courses, master complex concepts, and walk into examinations completely prepared.
                </p>

                <div className="mt-9">
                  <Link
                    to="/register"
                    className="sp-cta-button group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-extrabold text-[#2D4354] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#FFF7EC] hover:shadow-2xl sm:text-base cursor-pointer"
                  >
                    <span>Create Student Account</span>
                    <ArrowRight size={19} className="text-[#9E6752] transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <p className="mt-5 text-xs font-medium text-[#FED7A5]/70">
                  Start organizing your academic journey today. Free for students.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#73766A]/15 bg-white mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="StudyPilot Logo"
                className="h-10 w-10 shrink-0 object-contain drop-shadow-sm"
              />

              <div>
                <span className="block text-sm font-extrabold tracking-tight text-[#20212B]">
                  StudyPilot AI
                </span>
                <span className="text-xs text-[#77756F]">
                  Your Personal Academic Companion
                </span>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-semibold text-[#77756F]">
              <Link to="/login" className="transition-colors hover:text-[#2D4354]">
                Student Login
              </Link>
              <Link to="/register" className="transition-colors hover:text-[#2D4354]">
                Register
              </Link>
              <a href="#suite" className="transition-colors hover:text-[#2D4354]">
                Platform Suite
              </a>
              <a href="#workflow" className="transition-colors hover:text-[#2D4354]">
                Methodology
              </a>
            </nav>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#F1F0ED] pt-6 text-center sm:flex-row sm:text-left">
            <p className="text-[11px] font-medium text-[#77756F]">
              © 2026 StudyPilot AI. All rights reserved.
            </p>
            <p className="text-[11px] text-[#77756F]">
              Learn with clarity. Prepare with confidence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
