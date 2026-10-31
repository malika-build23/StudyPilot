import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import WorkflowBanner from '../components/common/WorkflowBanner';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  FolderSync,
  Award,
  ChevronRight,
  Clock,
  Target
} from 'lucide-react';

const LandingPage = () => {
  const [activePreviewTab, setActivePreviewTab] = useState('dashboard');

  const previewTabs = [
    {
      id: 'dashboard',
      label: 'Command Center',
      icon: TrendingUp,
      title: 'Real-Time Academic Overview',
      subtitle: 'Monitor active courses, preparation benchmarks, and upcoming university examination countdowns.',
      badge: 'Interactive Dashboard',
    },
    {
      id: 'intelligence',
      label: 'AI Document Intelligence',
      icon: Sparkles,
      title: 'Instant Syllabus & Lecture Extraction',
      subtitle: 'Upload PDF textbooks, lecture slides, or connect Google Drive to synthesize formula sheets and notes.',
      badge: 'Gemini AI Powered',
    },
    {
      id: 'quizzes',
      label: 'Adaptive Quizzes & Mock Tests',
      icon: BrainCircuit,
      title: 'Automated Diagnostic Evaluations',
      subtitle: 'Practice with topic-specific mock tests featuring deterministic mistake analysis and weak-area directives.',
      badge: 'Active Evaluation',
    },
    {
      id: 'planner',
      label: 'Smart Study Planner',
      icon: CalendarDays,
      title: 'Continuous Day-by-Day Scheduling',
      subtitle: 'Dynamically balances your syllabus topics across remaining days before midterms and final exams.',
      badge: 'Adaptive Routine',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-radial-[at_50%_0%] from-blue-100/60 via-slate-50 to-slate-50">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-200/30 via-indigo-100/20 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-xs backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Next-Gen AI Academic Productivity Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Master Every Course & Ace Your Exams with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                StudyPilot AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              The all-in-one academic companion that turns dense lecture slides, textbooks, and Google Drive resources into active-recall flashcards, mock quizzes, and adaptive exam schedules.
            </p>

            {/* Call to Action */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all hover:scale-102 active:scale-98"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#suite"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-semibold text-sm sm:text-base shadow-xs transition-all hover:border-slate-300"
              >
                <span>Explore Platform Suite</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Google Drive Cloud Indexer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Spaced Repetition (SM-2)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Deterministic Exam Diagnostics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <span>Private & Secure Workspace</span>
              </div>
            </div>
          </div>

          {/* Interactive Platform Preview Showcase */}
          <div className="mt-14 relative max-w-5xl mx-auto">
            {/* Ambient Backlight */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-sky-500/20 rounded-3xl blur-xl opacity-70" />

            <div className="relative rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden">
              {/* Window Controls & Preview Navigation Bar */}
              <div className="bg-slate-900 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs font-semibold text-slate-400 hidden sm:inline">
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
                        onClick={() => setActivePreviewTab(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Preview Viewport */}
              <div className="p-6 sm:p-8 bg-slate-50/50 min-h-[380px] flex flex-col justify-between">
                {activePreviewTab === 'dashboard' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Academic Command Center</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Welcome back, Alex! 👋
                        </h3>
                        <p className="text-xs text-slate-500">
                          Semester 3 • Computer Science & Engineering
                        </p>
                      </div>
                      <span className="self-start sm:self-auto text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                        88% Exam Preparation Index
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                        <div className="text-xs font-bold uppercase text-slate-400">Active Workspaces</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">6 Courses</div>
                        <div className="text-[11px] text-blue-600 font-medium mt-1">302 materials indexed</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                        <div className="text-xs font-bold uppercase text-slate-400">Next University Exam</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">In 12 Days</div>
                        <div className="text-[11px] text-rose-600 font-medium mt-1">Data Structures (CS-301)</div>
                      </div>
                      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                        <div className="text-xs font-bold uppercase text-slate-400">Retention Mastery</div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">94.2%</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-1">18 cards due today</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Today's Recommended Study Milestone</div>
                          <div className="text-[11px] text-slate-600">Review AVL Trees & B-Tree indexing (2.5h scheduled prep)</div>
                        </div>
                      </div>
                      <Link to="/register" className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shrink-0 hover:bg-blue-700 transition-colors">
                        Launch
                      </Link>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'intelligence' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                      <div>
                        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI Document Engine</div>
                        <h3 className="text-lg font-bold text-slate-900">Module 4: Dynamic Programming & Graphs.pdf</h3>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                        Synthesized 100%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span>Extracted Key Concept Hierarchy</span>
                        </div>
                        <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                          <li><strong>Bellman-Ford Algorithm</strong>: Handles negative edge weights with O(V·E) complexity.</li>
                          <li><strong>Floyd-Warshall</strong>: All-pairs shortest paths using dynamic programming matrix.</li>
                          <li><strong>Overlapping Subproblems</strong>: Memoization vs. tabulation recurrence relations.</li>
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <Award className="w-4 h-4 text-indigo-600" />
                          <span>Strict Formula & Derivation Sheet</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 text-sky-300 font-mono text-xs">
                          dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Verified from slide page 42. Formulas are never hallucinated.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'quizzes' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                      <div>
                        <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Adaptive Evaluation Suite</div>
                        <h3 className="text-lg font-bold text-slate-900">Operating Systems: Deadlock & Synchronization Mock Exam</h3>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        Score: 9/10 (90%)
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                      <div className="text-xs font-bold text-slate-800">
                        Question 4: Which condition is NOT necessary for a deadlock to occur?
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg border border-slate-200 text-slate-600">A. Mutual exclusion</div>
                        <div className="p-2.5 rounded-lg border border-slate-200 text-slate-600">B. Hold and wait</div>
                        <div className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50 font-semibold text-emerald-900 flex items-center justify-between">
                          <span>C. Preemption allowed</span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="p-2.5 rounded-lg border border-slate-200 text-slate-600">D. Circular wait</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                        <strong>AI Diagnostic Feedback:</strong> Preemption actually breaks the deadlock condition. Resource preemption is a standard avoidance strategy.
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'planner' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                      <div>
                        <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Dynamic Schedule Engine</div>
                        <h3 className="text-lg font-bold text-slate-900">End-Semester Examination Strategy</h3>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        6 Exams Synced
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                            D-12
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">Data Structures & Algorithms</div>
                            <div className="text-[11px] text-slate-500">14 topics remaining • 2.5h daily target</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700">On Track</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            D-16
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">Database Management Systems</div>
                            <div className="text-[11px] text-slate-500">Normalization & BCNF • 2.0h daily target</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700">82% Prepared</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer preview CTA */}
                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-time academic workflow demonstration</span>
                  </div>
                  <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <span>Try it with your courses</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workflow Section */}
      <section id="workflow" className="py-20 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Proven Learning Methodology
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            The StudyPilot 7-Stage Learning Loop
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-xl mx-auto">
            From raw lecture slides to exam mastery through structured, AI-assisted progression.
          </p>
        </div>

        <WorkflowBanner />
      </section>

      {/* Platform Suite Pillars */}
      <section id="suite" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Engineered for Serious Academic Performance
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Everything students need to organize overwhelming course materials and build deep exam confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1 */}
            <div className="p-8 rounded-3xl bg-slate-50/80 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-5 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                Workspace Foundation
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Subject-Specific Workspaces & Google Drive Sync
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Keep each course strictly isolated. Sync entire semester Google Drive folders or upload local PDFs and PPTs. Automatically categorize materials into Textbooks, Notes, PYQs, and Lab Manuals.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">OAuth Drive Sync</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Regex Classifier</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Supabase Cloud</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-3xl bg-slate-50/80 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-5 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                Concept Synthesis
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                AI Document Intelligence & Clean Notes OCR
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Extract high-yield chapter summaries, strict LaTeX formula sheets, and architecture diagrams directly from course materials. Convert messy handwritten class notes into clean, printable study guides.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">LaTeX Formula Extraction</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Mermaid Diagrams</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Handwritten OCR</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-3xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-5 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                Active Retention
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                AI Flashcards & Spaced Revision
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Transform textbook concepts into active recall flashcard decks with one click. Leverage the proven SM-2 spaced repetition algorithm to review cards right when memory decay begins.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">SM-2 Spaced Repetition</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">3D Interactive Flip</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">AI Mnemonics</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-8 rounded-3xl bg-slate-50/80 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-5 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                Strategy & Execution
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Exam DateSheet & Adaptive Study Planner
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Maintain your complete university and practical exam datesheet with real-time day countdowns. Generate automated daily study routines that adjust dynamically when topics require more attention.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">DateSheet Countdown</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Dynamic Schedule</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Readiness Score</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade Your Academic Performance?
            </h2>
            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
              Join students using StudyPilot AI to organize courses, master complex concepts, and walk into examinations completely prepared.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm sm:text-base shadow-md transition-all hover:scale-102"
              >
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="StudyPilot Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block">StudyPilot AI</span>
              <span className="text-xs text-slate-400">© 2026 StudyPilot AI. Your Personal Academic Companion.</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <Link to="/login" className="hover:text-blue-600 transition-colors">Student Login</Link>
            <Link to="/register" className="hover:text-blue-600 transition-colors">Register</Link>
            <a href="#suite" className="hover:text-blue-600 transition-colors">Platform Suite</a>
            <a href="#workflow" className="hover:text-blue-600 transition-colors">Methodology</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
