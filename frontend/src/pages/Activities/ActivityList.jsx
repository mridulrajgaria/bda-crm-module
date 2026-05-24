import { useState, useEffect, useCallback } from 'react';
import { Plus, Phone, Mail, Users, Monitor, Bell, FileText, CheckSquare, CheckCircle, Clock, XCircle } from 'lucide-react';
import api, { ACTIVITY_ICONS } from '../../utils/api';
import { LoadingSpinner, EmptyState, Modal, Avatar } from '../../components/common/index.jsx';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = { call: Phone, email: Mail, meeting: Users, demo: Monitor, 'follow-up': Bell, note: FileText, task: CheckSquare };
const TYPE_COLORS = {
  call: 'bg-blue-100 text-blue-600', email: 'bg-purple-100 text-purple-600',
  meeting: 'bg-green-100 text-green-600', demo: 'bg-orange-100 text-orange-600',
  'follow-up': 'bg-yellow-100 text-yellow-600', note: 'bg-gray-100 text-gray-600', task: 'bg-teal-100 text-teal-600',
};
const STATUS_ICONS = { completed: CheckCircle, pending: Clock, cancelled: XCircle };
const STATUS_COLORS = { completed: 'text-green-500', pending: 'text-yellow-500', cancelled: 'text-red-400' };

const INITIAL = { type: 'call', title: '', description: '', lead: '', status: 'pending', outcome: '', duration: '', scheduledAt: '', nextAction: '' };

export default function ActivityList() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/activities', { params });
      setActivities(data.activities);
    } catch { toast.error('Failed to load activities'); }
    finally { setLoading(false); }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchActivities();
    api.get('/leads', { params: { limit: 100 } }).then(({ data }) => setLeads(data.leads)).catch(() => {});
  }, [fetchActivities]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title) return toast.error('Title is required');
    setSaving(true);
    try {
      const payload = { ...form, duration: Number(form.duration) || undefined };
      const { data } = await api.post('/activities', payload);
      setActivities((p) => [data.activity, ...p]);
      toast.success('Activity logged!');
      setModalOpen(false);
      setForm(INITIAL);
    } catch { toast.error('Failed to log activity'); }
    finally { setSaving(false); }
  };

  const markComplete = async (id) => {
    try {
      const { data } = await api.put(`/activities/${id}`, { status: 'completed', completedAt: new Date() });
      setActivities((p) => p.map((a) => a._id === id ? data.activity : a));
      toast.success('Marked as complete');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
          <p className="text-sm text-gray-500">Track all calls, meetings, emails, and follow-ups</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={15} /> Log Activity
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <select className="select w-auto" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {['call','email','meeting','demo','follow-up','note','task'].map((t) => (
              <option key={t} value={t} className="capitalize">{t.replace(/-/g, ' ')}</option>
            ))}
          </select>
          <select className="select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : activities.length === 0 ? (
        <EmptyState icon={FileText} title="No activities yet" description="Log a call, meeting, or email to get started" action={<button onClick={() => setModalOpen(true)} className="btn-primary">Log Activity</button>} />
      ) : (
        <div className="card divide-y divide-gray-100">
          {activities.map((act) => {
            const TypeIcon = TYPE_ICONS[act.type] || FileText;
            const StatusIcon = STATUS_ICONS[act.status] || Clock;
            return (
              <div key={act._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[act.type]}`}>
                    <TypeIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{act.title}</p>
                        {act.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{act.description}</p>}
                        {act.lead && <p className="text-xs text-indigo-500 mt-1">📋 {act.lead.title}</p>}
                        {act.outcome && <p className="text-xs text-green-600 mt-1 font-medium">→ {act.outcome}</p>}
                        {act.duration && <p className="text-xs text-gray-400 mt-1">⏱ {act.duration} min</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`flex items-center gap-1 text-xs font-medium ${STATUS_COLORS[act.status]}`}>
                          <StatusIcon size={13} />
                          <span className="capitalize hidden sm:inline">{act.status}</span>
                        </div>
                        {act.status === 'pending' && (
                          <button onClick={() => markComplete(act._id)} className="text-[11px] px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 font-medium">
                            Done
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {act.performedBy && (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={act.performedBy.name} size="sm" />
                          <span className="text-xs text-gray-400">{act.performedBy.name?.split(' ')[0]}</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-400">
                        {act.scheduledAt ? format(new Date(act.scheduledAt), 'dd MMM, h:mm a') : formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Activity Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Activity" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="select" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {['call','email','meeting','demo','follow-up','note','task'].map((t) => (
                  <option key={t} value={t} className="capitalize">{ACTIVITY_ICONS[t]} {t.replace(/-/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Call with procurement manager" />
          </div>
          <div>
            <label className="label">Related Lead</label>
            <select className="select" value={form.lead} onChange={(e) => set('lead', e.target.value)}>
              <option value="">Select lead (optional)</option>
              {leads.map((l) => <option key={l._id} value={l._id}>{l.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What happened?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Scheduled At</label>
              <input type="datetime-local" className="input" value={form.scheduledAt} onChange={(e) => set('scheduledAt', e.target.value)} />
            </div>
            <div>
              <label className="label">Duration (min)</label>
              <input type="number" className="input" value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="30" min="0" />
            </div>
          </div>
          <div>
            <label className="label">Outcome</label>
            <input className="input" value={form.outcome} onChange={(e) => set('outcome', e.target.value)} placeholder="e.g. Client agreed to review proposal" />
          </div>
          <div>
            <label className="label">Next Action</label>
            <input className="input" value={form.nextAction} onChange={(e) => set('nextAction', e.target.value)} placeholder="e.g. Send quote by Friday" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Log Activity'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
