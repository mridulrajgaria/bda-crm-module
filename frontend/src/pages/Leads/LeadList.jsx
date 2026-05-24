import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit2, Trash2, Eye, Layout, List, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, formatNumber } from '../../utils/api';
import { LoadingSpinner, EmptyState, ConfirmDialog, Avatar, Badge } from '../../components/common/index.jsx';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUSES = ['', 'new', 'contacted', 'qualified', 'proposal-sent', 'negotiation', 'won', 'lost'];
const PRIORITIES = ['', 'high', 'medium', 'low'];
const SOURCES = ['', 'cold-call', 'email', 'referral', 'social-media', 'website', 'trade-show', 'exhibition'];

export default function LeadList() {
  const { isManager } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', source: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const { data } = await api.get('/leads', { params });
      setLeads(data.leads);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleFilterChange = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/leads/${deleteTarget._id}`);
      toast.success('Lead deleted');
      setDeleteTarget(null);
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Lead Pipeline</h2>
          <p className="text-sm text-gray-500">{total} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/leads/kanban" className="btn-secondary">
            <Layout size={15} /> Kanban View
          </Link>
          <Link to="/leads/new" className="btn-primary">
            <Plus size={15} /> Add Lead
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <select className="select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select className="select" value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.filter(Boolean).map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
          <select className="select" value={filters.source} onChange={(e) => handleFilterChange('source', e.target.value)}>
            <option value="">All Sources</option>
            {SOURCES.filter(Boolean).map((s) => <option key={s} value={s} className="capitalize">{s.replace(/-/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={List}
            title="No leads found"
            description="Try adjusting your filters or add a new lead."
            action={<Link to="/leads/new" className="btn-primary">Add Lead</Link>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="table-header">Lead</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Value</th>
                    <th className="table-header hidden md:table-cell">Priority</th>
                    <th className="table-header hidden lg:table-cell">Assigned To</th>
                    <th className="table-header hidden lg:table-cell">Expected Close</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-tight">{lead.title}</p>
                          <p className="text-xs text-gray-400">{lead.company} · {lead.contactPerson}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${STATUS_COLORS[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
                      </td>
                      <td className="table-cell font-semibold text-gray-800">{formatNumber(lead.value)}</td>
                      <td className="table-cell hidden md:table-cell">
                        <span className={`badge ${PRIORITY_COLORS[lead.priority]} capitalize`}>{lead.priority}</span>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        {lead.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={lead.assignedTo.name} avatar={lead.assignedTo.avatar} size="sm" />
                            <span className="text-sm text-gray-600">{lead.assignedTo.name?.split(' ')[0]}</span>
                          </div>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="table-cell hidden lg:table-cell text-gray-500 text-xs">
                        {lead.expectedCloseDate ? format(new Date(lead.expectedCloseDate), 'dd MMM yyyy') : '—'}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/leads/${lead._id}`)}
                            className="p-1.5 rounded hover:bg-gray-50 text-gray-500 transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => navigate(`/leads/${lead._id}/edit`)}
                            className="p-1.5 rounded hover:bg-indigo-50 text-indigo-600 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          {isManager && (
                            <button
                              onClick={() => setDeleteTarget(lead)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded text-xs font-medium ${page === p ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}