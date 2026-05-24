import { useState, useEffect } from 'react';
import { Trophy, Target, TrendingUp, Activity, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api, { formatNumber } from '../../utils/api';
import { LoadingSpinner, Avatar } from '../../components/common/index.jsx';
import toast from 'react-hot-toast';

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#c2763b'];
const BAR_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'];

export default function TeamPerformance() {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    api.get('/team/performance', { params: { month, year } })
      .then(({ data }) => setPerformance(data.performance))
      .catch(() => toast.error('Failed to load team data'))
      .finally(() => setLoading(false));
  }, [month, year]);

  const totalRevenue = performance.reduce((s, p) => s + p.revenue, 0);
  const totalLeads = performance.reduce((s, p) => s + p.totalLeads, 0);
  const totalWon = performance.reduce((s, p) => s + p.wonLeads, 0);

  const chartData = performance.map((p) => ({
    name: p.name.split(' ')[0],
    revenue: p.revenue,
    target: p.target,
    achievement: p.achievement,
  }));

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team Performance</h2>
          <p className="text-sm text-gray-500">BDA leaderboard and target tracking</p>
        </div>
        <div className="flex gap-2">
          <select className="select w-auto" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select className="select w-auto" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2023, 2024, 2025].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{formatNumber(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Team Revenue</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalWon}</p>
          <p className="text-xs text-gray-500 mt-1">Deals Closed</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{totalLeads}</p>
          <p className="text-xs text-gray-500 mt-1">Total Leads</p>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : performance.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No performance data for this period.</div>
      ) : (
        <>
          {/* Revenue vs Target Chart */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Revenue vs Target — {months[month - 1]} {year}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={28} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v) => formatNumber(v)} />
                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
                <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Leaderboard */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Trophy size={16} className="text-yellow-500" /> Leaderboard
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {performance.map((bda, index) => (
                <div key={bda._id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50">
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    index < 3 ? 'text-white' : 'bg-gray-100 text-gray-500'
                  }`} style={index < 3 ? { backgroundColor: RANK_COLORS[index] } : {}}>
                    {index < 3 ? ['🥇','🥈','🥉'][index] : index + 1}
                  </div>

                  {/* Avatar & Name */}
                  <Avatar name={bda.name} avatar={bda.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{bda.name}</p>
                    <p className="text-xs text-gray-400">{bda.department}</p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 text-center flex-shrink-0">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{bda.wonLeads}</p>
                      <p className="text-[10px] text-gray-400">Won</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{bda.conversionRate}%</p>
                      <p className="text-[10px] text-gray-400">Conv.</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{bda.activitiesCount}</p>
                      <p className="text-[10px] text-gray-400">Activities</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-indigo-600">{formatNumber(bda.revenue)}</p>
                      <p className="text-[10px] text-gray-400">Revenue</p>
                    </div>
                  </div>

                  {/* Achievement bar */}
                  <div className="w-24 flex-shrink-0 hidden lg:block">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Target</span>
                      <span className={`font-bold ${bda.achievement >= 100 ? 'text-green-600' : bda.achievement >= 75 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {bda.achievement}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${bda.achievement >= 100 ? 'bg-green-500' : bda.achievement >= 75 ? 'bg-yellow-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(bda.achievement, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
