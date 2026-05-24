import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Target, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api, { formatNumber } from '../utils/api';
import { StatCard, LoadingSpinner } from '../components/common/index.jsx';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const FUNNEL_ORDER = ['new', 'contacted', 'qualified', 'proposal-sent', 'negotiation', 'won', 'lost'];
const FUNNEL_COLORS = {
  new: '#6366f1', contacted: '#f59e0b', qualified: '#8b5cf6',
  'proposal-sent': '#f97316', negotiation: '#ec4899', won: '#22c55e', lost: '#ef4444',
};
const FUNNEL_LABELS = {
  new: 'New', contacted: 'Contacted', qualified: 'Qualified',
  'proposal-sent': 'Proposal Sent', negotiation: 'Negotiation', won: 'Won', lost: 'Lost',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const { user, isManager } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-12 text-gray-400">Failed to load dashboard data.</div>;

  const { stats, revenueByMonth, leadFunnel, sourceBreakdown } = data;

  // Format revenue trend
  const revenueData = revenueByMonth.map((r) => ({
    month: MONTH_NAMES[r._id.month - 1],
    revenue: r.revenue,
    deals: r.count,
  }));

  // Format funnel
  const funnelData = FUNNEL_ORDER
    .map((s) => ({ status: s, label: FUNNEL_LABELS[s], ...leadFunnel.find((f) => f._id === s) }))
    .filter((f) => f.count > 0);

  const pieData = funnelData.map((f) => ({ name: f.label, value: f.count, color: FUNNEL_COLORS[f.status] }));

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-0.5">Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-indigo-200 text-sm">Here's what's happening with your sales pipeline today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          subtitle={`${stats.newThisMonth} new this month`}
          icon={TrendingUp}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatNumber(stats.monthlyRevenue)}
          subtitle="Won deals this month"
          icon={DollarSign}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          subtitle={`${stats.wonLeads} won / ${stats.lostLeads} lost`}
          icon={Target}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Pipeline Value"
          value={formatNumber(stats.pipelineValue)}
          subtitle={`${stats.pipelineCount} active leads`}
          icon={Activity}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Second row KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
            <p className="text-xs text-gray-500">Active Clients</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.wonLeads}</p>
            <p className="text-xs text-gray-500">Deals Won</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingActivities}</p>
            <p className="text-xs text-gray-500">Pending Activities</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Revenue Trend (Last 6 Months)</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => formatNumber(v)} labelStyle={{ fontWeight: 600 }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Lead status pie */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Pipeline Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name]} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Lead source bar chart */}
      {sourceBreakdown?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Lead Sources</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sourceBreakdown.map((s) => ({ source: s._id?.replace(/-/g, ' '), count: s.count }))} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="source" tick={{ fontSize: 11, textTransform: 'capitalize' }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
