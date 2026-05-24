import { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import api, { STATUS_COLORS, STATUS_LABELS, formatNumber } from '../../utils/api';
import { LoadingSpinner, Avatar } from '../../components/common/index.jsx';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Reports() {
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '', assignedTo: '' });

  useEffect(() => {
    api.get('/team').then(({ data }) => setUsers(data.users)).catch(() => {});
    fetchReport();
  }, []);

  const fetchReport = async (f = filters) => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
      const { data } = await api.get('/reports/leads', { params });
      setLeads(data.leads);
      setSummary(data.summary);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  const set = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  const exportCSV = () => {
    const headers = ['Title', 'Company', 'Contact', 'Status', 'Value', 'Assigned To', 'Source', 'Created'];
    const rows = leads.map((l) => [
      l.title, l.company, l.contactPerson, l.status,
      l.value, l.assignedTo?.name || '', l.source,
      format(new Date(l.createdAt), 'dd/MM/yyyy'),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'leads-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-500">Analyze lead performance across the team</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Filter size={14} /> Filters
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="label">From Date</label>
            <input type="date" className="input" value={filters.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </div>
          <div>
            <label className="label">To Date</label>
            <input type="date" className="input" value={filters.endDate} onChange={(e) => set('endDate', e.target.value)} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="select" value={filters.status} onChange={(e) => set('status', e.target.value)}>
              <option value="">All Statuses</option>
              {['new','contacted','qualified','proposal-sent','negotiation','won','lost'].map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">BDA</label>
            <select className="select" value={filters.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}>
              <option value="">All BDAs</option>
              {users.filter((u) => u.role === 'bda').map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <button onClick={() => fetchReport(filters)} className="btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Leads</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{formatNumber(summary.totalValue)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Value</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{summary.byStatus?.won || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Won</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{summary.byStatus?.lost || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Lost</p>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? <LoadingSpinner /> : leads.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No data for selected filters.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Lead</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Value</th>
                  <th className="table-header hidden md:table-cell">Assigned To</th>
                  <th className="table-header hidden lg:table-cell">Source</th>
                  <th className="table-header hidden lg:table-cell">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <p className="font-medium text-gray-900 text-sm">{lead.title}</p>
                      <p className="text-xs text-gray-400">{lead.company}</p>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${STATUS_COLORS[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
                    </td>
                    <td className="table-cell font-semibold text-gray-800">{formatNumber(lead.value)}</td>
                    <td className="table-cell hidden md:table-cell">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={lead.assignedTo.name} size="sm" />
                          <span className="text-xs text-gray-600">{lead.assignedTo.name}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="table-cell hidden lg:table-cell text-xs text-gray-500 capitalize">{lead.source?.replace(/-/g, ' ')}</td>
                    <td className="table-cell hidden lg:table-cell text-xs text-gray-400">{format(new Date(lead.createdAt), 'dd MMM yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
