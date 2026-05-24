import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, User, Settings, Search, X, TrendingUp, Building2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/leads': 'Lead Pipeline',
  '/leads/kanban': 'Kanban Board',
  '/leads/new': 'New Lead',
  '/clients': 'Clients',
  '/activities': 'Activity Log',
  '/team': 'Team Performance',
  '/reports': 'Reports',
  '/profile': 'My Profile',
  '/settings': 'Settings',
};

const SAMPLE_NOTIFICATIONS = [
  { id: 1, message: 'New lead assigned to you', sub: 'CNC Parts — Tata Motors', time: '2 min ago', read: false, icon: TrendingUp, color: 'bg-teal-100 text-teal-600' },
  { id: 2, message: 'Client meeting scheduled', sub: 'ONGC Petro — Tomorrow 10am', time: '1 hr ago', read: false, icon: Building2, color: 'bg-green-100 text-green-600' },
  { id: 3, message: 'Lead status updated to Won', sub: 'Hydraulic Cylinders — JSW Steel', time: '3 hr ago', read: true, icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
  { id: 4, message: 'Follow-up reminder', sub: 'Gear Assemblies — Bajaj Auto', time: 'Yesterday', read: true, icon: Bell, color: 'bg-amber-100 text-amber-600' },
];

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] || 'BDA CRM';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const unreadCount = notifications.filter((n) => !n.read).length;
  const avatarUrl = user?.avatar;
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [leadsRes, clientsRes] = await Promise.all([
          api.get('/leads', { params: { search: searchQuery, limit: 4 } }),
          api.get('/clients', { params: { search: searchQuery, limit: 3 } }),
        ]);
        setSearchResults([
          ...leadsRes.data.leads.map((l) => ({ type: 'lead', _id: l._id, title: l.title, sub: l.company, url: `/leads/${l._id}` })),
          ...clientsRes.data.clients.map((c) => ({ type: 'client', _id: c._id, title: c.company, sub: c.contactPerson, url: `/clients` })),
        ]);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">{today}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-teal-400 transition-colors"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Global Search */}
        <div ref={searchRef} className="relative">
          <button
            onClick={() => { setSearchOpen((p) => !p); setNotifOpen(false); setDropOpen(false); }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400"
          >
            <Search size={18} />
          </button>
          {searchOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-30">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-slate-700">
                <Search size={15} className="text-gray-400 flex-shrink-0" />
                <input
                  autoFocus
                  className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent text-gray-900 dark:text-gray-100"
                  placeholder="Search leads, clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="py-1 max-h-64 overflow-y-auto">
                {searching && <p className="text-xs text-gray-400 text-center py-4">Searching...</p>}
                {!searching && searchQuery && searchResults.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No results found</p>
                )}
                {!searching && searchResults.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => { navigate(r.url); setSearchOpen(false); setSearchQuery(''); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 text-left"
                  >
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${r.type === 'lead' ? 'bg-teal-100 text-teal-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {r.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{r.title}</p>
                      <p className="text-xs text-gray-400 truncate">{r.sub}</p>
                    </div>
                  </button>
                ))}
                {!searchQuery && (
                  <p className="text-xs text-gray-400 text-center py-4">Type to search leads & clients</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((p) => !p); setDropOpen(false); setSearchOpen(false); }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-20">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Notifications</p>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-teal-600 hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="divide-y divide-gray-50 dark:divide-slate-800 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 ${!n.read ? 'bg-teal-50/40 dark:bg-teal-900/10' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.color}`}>
                        <n.icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{n.message}</p>
                        <p className="text-xs text-gray-400 truncate">{n.sub}</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">{n.time}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-700 text-center">
                  <p className="text-xs text-gray-400">Showing recent notifications</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setDropOpen((p) => !p); setNotifOpen(false); setSearchOpen(false); }}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name?.split(' ')[0]}</span>
          </button>

          {dropOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-1 z-20">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
                <Link to="/profile" onClick={() => setDropOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800">
                  <User size={15} /> Profile
                </Link>
                <Link to="/settings" onClick={() => setDropOpen(false)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800">
                  <Settings size={15} /> Settings
                </Link>
                <hr className="my-1 border-gray-100 dark:border-slate-700" />
                <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}