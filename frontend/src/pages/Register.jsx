import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Zap, TrendingUp, Users, BarChart3 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: TrendingUp, text: 'Track leads through a visual pipeline' },
  { icon: Users, text: 'Monitor team performance & targets' },
  { icon: BarChart3, text: 'Insights with real-time dashboards' },
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    phone: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields.');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        department: form.department,
      });

      localStorage.setItem('crm_token', data.token);
      localStorage.setItem('crm_user', JSON.stringify(data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      toast.success('Account created! Welcome to Isaii CRM!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
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
            Join your team.<br />
            <span className="text-indigo-400">Start closing.</span>
          </h2>
          <p className="text-slate-400 text-base mb-10 max-w-sm">
            Create your account and get access to the full BDA CRM platform for your manufacturing team.
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

          {/* Mobile logo - FIXED */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={18} className="text-white" />
            </div>
            <p className="font-bold text-xl" style={{ color: '#111827' }}>Isaii CRM</p>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>Create account</h1>
          <p className="text-sm mb-7" style={{ color: '#6b7280' }}>Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="input"
                placeholder="Arjun Sharma"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>

            <div>
              <label className="label">Email address <span className="text-red-500">*</span></label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Phone</label>
                <input
                  type="text"
                  className="input"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Department</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Sales"
                  value={form.department}
                  onChange={(e) => set('department', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
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

            <div>
              <label className="label">Confirm Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                className="input"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}