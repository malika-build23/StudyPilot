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
    if (path === '/dashboard') return { title: 'Academic Dashboard', subtitle: 'Overview of your learning progress' };
    if (path === '/subjects') return { title: 'My Subjects', subtitle: 'Manage your individual subject workspaces' };
    if (path.startsWith('/subjects/')) return { title: 'Subject Workspace', subtitle: 'Dedicated study space and tools' };
    if (path === '/profile') return { title: 'Student Profile', subtitle: 'Your account credentials and academic info' };
    return { title: 'StudyPilot AI', subtitle: 'Your Personal Academic Companion' };
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenNewSubject={onOpenNewSubject}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {title}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/subjects?create=true')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-xs shadow-blue-500/30 transition-all hover:scale-102 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Subject</span>
            </button>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2.5 pl-1">
              {user?.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 hidden md:inline truncate max-w-[120px]">
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
