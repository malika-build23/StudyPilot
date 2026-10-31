import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpenCheck,
  FileText,
  Bot,
  CalendarDays,
  UserCircle,
  LogOut,
  Compass,
  Sparkles,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      activeExact: true,
    },
    {
      to: '/subjects',
      label: 'My Subjects',
      icon: BookOpenCheck,
    },
    {
      label: 'Study Materials',
      icon: FileText,
      comingSoon: true,
      badge: 'Phase 2',
    },
    {
      label: 'AI Assistant',
      icon: Bot,
      comingSoon: true,
      badge: 'Phase 3',
    },
    {
      to: '/exams',
      label: 'Exam Planner',
      icon: CalendarDays,
      badge: 'Phase 4',
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: UserCircle,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-100">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-lg tracking-tight">
                  StudyPilot
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]">
                Academic Companion
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </div>

          {navItems.map((item, index) => {
            const Icon = item.icon;

            if (item.comingSoon) {
              return (
                <div
                  key={index}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-50 cursor-not-allowed group transition-colors"
                  title={`${item.label} will be available in future phases`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-500">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    Coming Soon
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Phase 1 Badge Card */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/80">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-900">
              Phase 1 Active
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Core subject management & profile workspaces enabled.
          </p>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || 'Student'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
