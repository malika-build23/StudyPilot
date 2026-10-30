import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import WorkflowBanner from '../components/common/WorkflowBanner';
import {
  Compass,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-blue-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/70 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Phase 1 Core Platform Live</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Master Your Academic Journey with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                StudyPilot AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Your Personal AI-Powered Academic Companion. Organise course materials, understand complex concepts, evaluate your exam readiness, and plan your study routine.
            </p>

            {/* Call to Action */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-md shadow-blue-500/25 transition-all hover:scale-102"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-base shadow-xs transition-all"
              >
                <span>Student Login</span>
              </Link>
            </div>

            {/* Trust badge */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Isolated Subject Workspaces</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Built for High-Stakes Exams</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Private & Secure Session</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workflow Section */}
      <section id="workflow" className="py-16 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Methodology
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            The StudyPilot 7-Stage Learning Loop
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            From raw lecture slides to exam mastery through structured, AI-assisted progression.
          </p>
        </div>

        <WorkflowBanner />
      </section>

      {/* Features Overview */}
      <section id="features" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Platform Modules
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              Engineered for Academic Rigor
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Everything you need to turn overwhelming course syllabi into an organized, stress-free path to top grades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Subject-Specific Workspaces
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create dedicated spaces for each semester or academic course. Keep all notes, chapter summaries, and diagnostic tests segregated with guaranteed isolation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-4">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Intelligent Study Insights
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track your active courses, monitor preparation progress, and receive structured notifications on upcoming revision checkpoints.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold mb-4">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Exam Preparation Tracker
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stay ahead of high-stakes midterms and finals with structured timeline overviews and personalized preparation scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Overview */}
      <section id="roadmap" className="py-16 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Development Plan
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            The 4-Phase Roadmap
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Built systematically from core foundation to intelligent agents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-blue-50/70 border-2 border-blue-500 relative">
            <span className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase">
              Current Phase
            </span>
            <div className="text-xs font-bold text-blue-700">Phase 1</div>
            <h4 className="text-base font-bold text-slate-900 mt-1">Core & User Management</h4>
            <p className="text-xs text-slate-600 mt-2">
              JWT auth, Subject workspaces, student dashboard, and profile management.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="text-xs font-bold text-slate-400">Phase 2</div>
            <h4 className="text-base font-bold text-slate-800 mt-1">Study Materials & Notes</h4>
            <p className="text-xs text-slate-500 mt-2">
              File upload engine, chapter summaries, and concept extraction.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="text-xs font-bold text-slate-400">Phase 3</div>
            <h4 className="text-base font-bold text-slate-800 mt-1">AI Assistant & Quizzes</h4>
            <p className="text-xs text-slate-500 mt-2">
              Interactive academic chat companion, mock quizzes, and question banks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200">
            <div className="text-xs font-bold text-slate-400">Phase 4</div>
            <h4 className="text-base font-bold text-slate-800 mt-1">Planner & Analytics</h4>
            <p className="text-xs text-slate-500 mt-2">
              Exam revision timelines, topic mastery scoring, and readiness metrics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 text-sm">StudyPilot AI</span>
            <span className="text-xs text-slate-400">© 2026 StudyPilot AI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
            <Link to="/login" className="hover:text-blue-600">Login</Link>
            <Link to="/register" className="hover:text-blue-600">Register</Link>
            <span className="text-slate-400">Phase 1 Foundation</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
