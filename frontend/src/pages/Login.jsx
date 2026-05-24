import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Zap, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: TrendingUp, text: 'Track leads through a visual pipeline' },
  { icon: Users, text: 'Monitor team performance & targets' },
  { icon: BarChart3, text: 'Insights with real-time dashboards' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields.');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex !bg-white" style={{ colorScheme: 'light' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-teal-950 to-gray-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Isaii CRM</p>
            <p className="text-indigo-300 text-xs">Manufacturing BDA Platform</p>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Close more deals.<br />
            <span className="text-indigo-400">Faster.</span>
          </h2>
          <p className="text-slate-400 text-base mb-10 max-w-sm">
            A complete CRM for Business Development teams in manufacturing — track leads, clients, and performance in one place.
          </p>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-indigo-400" />
                </div>
                <p className="text-slate-300 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Isaii AI. All rights reserved.</p>
      </div>

      {/* Right panel - forced light mode */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ backgroundColor: '#f9fafb' }}>
        <div className="w-full max-w-sm">

          {/* Mobile logo - only on small screens */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={18} className="text-white" />
            </div>
            <p className="font-bold text-xl" style={{ color: '#111827' }}>Isaii CRM</p>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>Welcome back</h1>
          <p className="text-sm mb-7" style={{ color: '#6b7280' }}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 font-medium hover:underline">
                Create account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}