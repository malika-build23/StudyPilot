import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/avatar';
import { Menu, Plus } from 'lucide-react';

const AppLayout = ({ onOpenNewSubject }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic header titles based on pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return { title: 'Academic Dashboard', subtitle: 'Overview of your learning progress & readiness' };
    if (path === '/subjects') return { title: 'My Subjects', subtitle: 'Manage your individual subject workspaces' };
    if (path.startsWith('/subjects/')) return { title: 'Subject Workspace', subtitle: 'Dedicated study materials and AI tools' };
    if (path === '/flashcards') return { title: 'AI Flashcards', subtitle: 'Active-recall decks and concept mastery' };
    if (path === '/revision') return { title: 'Spaced Revision', subtitle: 'SM-2 spaced repetition memory retention' };
    if (path === '/clean-notes') return { title: 'Clean Notes AI', subtitle: 'Convert handwritten notes into structured study guides' };
    if (path === '/exams') return { title: 'Exam DateSheet & Planner', subtitle: 'University schedules and adaptive prep timeline' };
    if (path === '/profile') return { title: 'Student Profile', subtitle: 'Your account credentials and academic info' };
    return { title: 'StudyPilot AI', subtitle: 'Your Personal Academic Companion' };
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenNewSubject={onOpenNewSubject}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-18 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#73766A]/15 shadow-[0_2px_15px_-3px_rgba(32,33,43,0.04)] px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#77756F] hover:text-[#20212B] hover:bg-[#FED7A5]/20 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#20212B] leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-xs text-[#77756F] font-medium hidden sm:block">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/subjects?create=true')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-xs sm:text-sm shadow-[0_4px_14px_rgba(45,67,84,0.25)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-[#FED7A5]" />
              <span className="hidden sm:inline">New Subject</span>
            </button>

            <div className="h-7 w-px bg-[#73766A]/20 mx-1 hidden sm:block" />

            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 pl-1 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#2D4354] via-[#9E6752] to-[#FED7A5]">
                {user?.avatar ? (
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user?.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover bg-white"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#2D4354] text-[#FED7A5] flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-[#20212B] hidden md:inline truncate max-w-[130px]">
                {user?.name || 'Student'}
              </span>
            </div>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
