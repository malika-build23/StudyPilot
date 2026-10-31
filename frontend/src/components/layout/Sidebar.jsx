import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/avatar';
import {
  LayoutDashboard,
  BookOpenCheck,
  CalendarDays,
  UserCircle,
  LogOut,
  Sparkles,
  Layers,
  RotateCcw,
  FileEdit,
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
      to: '/flashcards',
      label: 'AI Flashcards',
      icon: Layers,
      badge: 'AI',
      badgeClass: 'bg-[#FED7A5]/40 text-[#9E6752] border border-[#9E6752]/30',
    },
    {
      to: '/revision',
      label: 'Spaced Revision',
      icon: RotateCcw,
      badge: 'Recall',
      badgeClass: 'bg-[#FAF8F5] text-[#73766A] border border-[#73766A]/30',
    },
    {
      to: '/clean-notes',
      label: 'Clean Notes',
      icon: FileEdit,
      badge: 'OCR',
      badgeClass: 'bg-[#FFF7EC] text-[#9E6752] border border-[#9E6752]/30',
    },
    {
      to: '/exams',
      label: 'Exam & Study Planner',
      icon: CalendarDays,
      badge: 'Planner',
      badgeClass: 'bg-[#FAF8F5] text-[#2D4354] border border-[#2D4354]/30',
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
          className="fixed inset-0 bg-[#20212B]/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#73766A]/15 shadow-[2px_0_20px_rgba(32,33,43,0.04)] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-[#73766A]/10">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden p-1 bg-gradient-to-tr from-[#2D4354]/15 via-[#FED7A5]/30 to-[#9E6752]/20 border border-[#2D4354]/20 shadow-xs flex items-center justify-center group-hover:scale-105 group-hover:border-[#2D4354]/50 transition-all shrink-0">
              <img src="/logo.png" alt="StudyPilot Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#20212B] text-lg tracking-tight group-hover:text-[#2D4354] transition-colors">
                  StudyPilot
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#2D4354] to-[#9E6752] text-white shadow-xs">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[#77756F] font-medium truncate max-w-[130px]">
                Academic Companion
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-[#77756F] hover:text-[#20212B] hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-1">
          <div className="px-3 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#77756F]">
            Workspace Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#2D4354] text-white shadow-[0_4px_14px_rgba(45,67,84,0.3)]'
                      : 'text-[#20212B] hover:text-[#2D4354] hover:bg-[#FED7A5]/20'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-[#FED7A5]' : 'text-[#77756F] group-hover:text-[#2D4354]'
                      }`}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-[#FED7A5]'
                            : item.badgeClass || 'bg-[#FED7A5]/40 text-[#2D4354]'
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

        {/* AI Learning Hub Badge Card */}
        <div className="p-3.5 mx-3 mb-3 rounded-2xl bg-gradient-to-br from-[#FFF7EC] via-[#FAF8F5] to-[#FED7A5]/30 border border-[#73766A]/15 shadow-xs relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#FED7A5]/40 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform" />
          <div className="flex items-center gap-2 mb-1.5 relative z-10">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#2D4354] to-[#9E6752] text-[#FED7A5] flex items-center justify-center shadow-xs">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-[#20212B] tracking-tight">
              StudyPilot Assistant
            </span>
          </div>
          <p className="text-[11px] text-[#77756F] leading-relaxed relative z-10">
            AI document insights, active recall, and adaptive exam planning.
          </p>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3.5 border-t border-[#73766A]/15 bg-[#FAF8F5]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#2D4354] via-[#9E6752] to-[#FED7A5] shrink-0">
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
              <div className="truncate">
                <p className="text-xs font-bold text-[#20212B] truncate">
                  {user?.name || 'Student'}
                </p>
                <p className="text-[11px] text-[#77756F] truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-[#77756F] hover:text-[#9E6752] hover:bg-[#FED7A5]/25 rounded-xl transition-colors shrink-0"
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
