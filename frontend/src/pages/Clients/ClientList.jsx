import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Building2, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import api, { formatNumber } from '../../utils/api';
import { LoadingSpinner, EmptyState, Modal, ConfirmDialog, Avatar, Badge } from '../../components/common/index.jsx';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const INITIAL = {
  company: '', contactPerson: '', email: '', phone: '', industry: '',
  totalRevenue: '', status: 'active', notes: '', website: '',
  address: { city: '', state: '', country: 'India' },
};

export default function ClientList() {
  const { isManager } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(INITIAL);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const { data } = await api.get('/clients', { params });
      setClients(data.clients);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const openCreate = () => { setForm(INITIAL); setEditTarget(null); setModalOpen(true); };
  const openEdit = (c) => {
    setForm({ ...INITIAL, ...c, address: c.address || INITIAL.address, totalRevenue: c.totalRevenue?.toString() || '' });
    setEditTarget(c);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.company || !form.contactPerson) return toast.error('Company and contact are required');
    setSaving(true);
    try {
      if (editTarget) {
        const { data } = await api.put(`/clients/${editTarget._id}`, { ...form, totalRevenue: Number(form.totalRevenue) || 0 });
        setClients((p) => p.map((c) => c._id === editTarget._id ? data.client : c));
        toast.success('Client updated');
      } else {
        const { data } = await api.post('/clients', { ...form, totalRevenue: Number(form.totalRevenue) || 0 });
        setClients((p) => [data.client, ...p]);
        toast.success('Client added');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/clients/${deleteTarget._id}`);
      setClients((p) => p.filter((c) => c._id !== deleteTarget._id));
      toast.success('Client deleted');
      setDeleteTarget(null);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500">{clients.length} active client relationships</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Add Client
        </button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : clients.length === 0 ? (
        <EmptyState icon={Building2} title="No clients yet" description="Add your first client relationship" action={<button onClick={openCreate} className="btn-primary">Add Client</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div key={client._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{client.company}</p>
                    <p className="text-xs text-gray-400">{client.industry}</p>
                  </div>
                </div>
                <span className={`badge ${client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {client.status}
                </span>
              </div>

              <div className="space-y-1.5 mb-3">
                <p className="text-sm text-gray-700 font-medium">{client.contactPerson}</p>
                {client.email && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Mail size={11} />{client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Phone size={11} />{client.phone}
                  </div>
                )}
                {client.address?.city && (
                  <p className="text-xs text-gray-400">{client.address.city}, {client.address.state}</p>
                )}
              </div>

              {client.totalRevenue > 0 && (
                <div className="bg-green-50 rounded-lg px-3 py-2 mb-3">
                  <p className="text-xs text-green-600 font-medium">Total Revenue: {formatNumber(client.totalRevenue)}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                {client.assignedTo ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar name={client.assignedTo.name} size="sm" />
                    <span className="text-xs text-gray-400">{client.assignedTo.name?.split(' ')[0]}</span>
                  </div>
                ) : <span />}
                <div className="flex gap-1">
                  <button onClick={() => openEdit(client)} className="p-1.5 rounded hover:bg-indigo-50 text-indigo-500">
                    <Edit2 size={13} />
                  </button>
                  {isManager && (
                    <button onClick={() => setDeleteTarget(client)} className="p-1.5 rounded hover:bg-red-50 text-red-400">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Client Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Client' : 'Add Client'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Company *</label>
              <input className="input" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Company name" />
            </div>
            <div>
              <label className="label">Contact Person *</label>
              <input className="input" value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="label">Industry</label>
              <input className="input" value={form.industry} onChange={(e) => set('industry', e.target.value)} placeholder="e.g. Automotive" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">City</label>
              <input className="input" value={form.address?.city || ''} onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, city: e.target.value } }))} />
            </div>
            <div>
              <label className="label">State</label>
              <input className="input" value={form.address?.state || ''} onChange={(e) => setForm((p) => ({ ...p, address: { ...p.address, state: e.target.value } }))} />
            </div>
            <div>
              <label className="label">Total Revenue (₹)</label>
              <input type="number" className="input" value={form.totalRevenue} onChange={(e) => set('totalRevenue', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="input resize-none" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Relationship notes..." />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editTarget ? 'Update' : 'Add Client'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Client" message={`Delete "${deleteTarget?.company}"? This cannot be undone.`} />
    </div>
  );
}
