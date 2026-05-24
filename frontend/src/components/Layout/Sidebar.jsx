import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, Activity, BarChart3,
  Building2, TrendingUp, ChevronRight, X, Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'bda'] },
  { label: 'Lead Pipeline', to: '/leads', icon: TrendingUp, roles: ['admin', 'manager', 'bda'] },
  { label: 'Kanban Board', to: '/leads/kanban', icon: BarChart3, roles: ['admin', 'manager', 'bda'] },
  { label: 'Clients', to: '/clients', icon: Building2, roles: ['admin', 'manager', 'bda'] },
  { label: 'Activities', to: '/activities', icon: Activity, roles: ['admin', 'manager', 'bda'] },
  { label: 'Team Performance', to: '/team', icon: Users, roles: ['admin', 'manager'] },
  { label: 'Reports', to: '/reports', icon: Briefcase, roles: ['admin', 'manager'] },
];

const ROLE_BADGE = {
  admin: { label: 'Admin', className: 'bg-red-500/20 text-red-300' },
  manager: { label: 'Manager', className: 'bg-teal-500/20 text-teal-300' },
  bda: { label: 'BDA', className: 'bg-blue-500/20 text-blue-300' },
};

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  const filtered = navItems.filter((item) => item.roles.includes(user?.role));
  const roleBadge = ROLE_BADGE[user?.role] || {};
  const avatarUrl = user?.avatar;
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 flex flex-col z-30 transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'linear-gradient(180deg, #0f2027 0%, #0d3d38 50%, #0f2027 100%)' }}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          onClick={onClose}
          className="flex items-center justify-between px-5 h-16 border-b border-teal-900/50 hover:bg-teal-900/20 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-white">Isaii CRM</p>
              <p className="text-[10px] text-teal-400">Manufacturing BDA</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onClose(); }}
            className="lg:hidden p-1 rounded hover:bg-teal-900/30 text-teal-400"
          >
            <X size={18} />
          </button>
        </Link>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-widest px-3 mb-2">Menu</p>
          <ul className="space-y-0.5">
            {filtered.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/leads' || item.to === '/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                        : 'text-slate-300 hover:bg-teal-900/30 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={17} className="flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User card */}
        <Link
          to="/profile"
          onClick={onClose}
          className="p-3 border-t border-teal-900/50 hover:bg-teal-900/20 transition-colors"
        >
          <div className="flex items-center gap-3 px-2 py-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-teal-500/30" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold flex-shrink-0 text-white">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleBadge.className}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </Link>
      </aside>
    </>
  );
}