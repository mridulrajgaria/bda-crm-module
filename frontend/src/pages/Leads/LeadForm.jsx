import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common/index.jsx';
import toast from 'react-hot-toast';

const INITIAL = {
  title: '', company: '', contactPerson: '', email: '', phone: '',
  source: 'other', status: 'new', value: '', priority: 'medium',
  product: '', industry: '', assignedTo: '', expectedCloseDate: '',
  notes: '', tags: '', lostReason: '',
};

export default function LeadForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user, isManager } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (isManager) {
      api.get('/team').then(({ data }) => setUsers(data.users)).catch(() => {});
    }
    if (isEdit) {
      api.get(`/leads/${id}`)
        .then(({ data }) => {
          const l = data.lead;
          setForm({
            ...INITIAL, ...l,
            assignedTo: l.assignedTo?._id || '',
            expectedCloseDate: l.expectedCloseDate ? l.expectedCloseDate.slice(0, 10) : '',
            tags: (l.tags || []).join(', '),
            value: l.value?.toString() || '',
          });
        })
        .catch(() => toast.error('Failed to load lead'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, isManager]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.contactPerson) {
      return toast.error('Please fill required fields (title, company, contact person)');
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value) || 0,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        expectedCloseDate: form.expectedCloseDate || undefined,
        assignedTo: form.assignedTo || undefined,
        lostReason: form.status === 'lost' ? form.lostReason : undefined,
      };

      if (isEdit) {
        await api.put(`/leads/${id}`, payload);
        toast.success('Lead updated!');
      } else {
        await api.post('/leads', payload);
        toast.success('Lead created!');
      }
      navigate('/leads');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
          <p className="text-sm text-gray-500">{isEdit ? 'Update lead information' : 'Fill in lead details to add to pipeline'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lead Info */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Lead Information</h3>
          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input className="input" placeholder="e.g. CNC Machined Parts — Tata Motors" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Company <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Company name" value={form.company} onChange={(e) => set('company', e.target.value)} required />
            </div>
            <div>
              <label className="label">Contact Person <span className="text-red-500">*</span></label>
              <input className="input" placeholder="Contact name" value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="contact@company.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="9876543210" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Deal Details */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Deal Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Deal Value (₹)</label>
              <input type="number" className="input" placeholder="500000" value={form.value} onChange={(e) => set('value', e.target.value)} min="0" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {['new','contacted','qualified','proposal-sent','negotiation','won','lost'].map((s) => (
                  <option key={s} value={s} className="capitalize">{s.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="label">Source</label>
              <select className="select" value={form.source} onChange={(e) => set('source', e.target.value)}>
                {['cold-call','email','referral','social-media','website','trade-show','exhibition','other'].map((s) => (
                  <option key={s} value={s}>{s.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Product</label>
              <input className="input" placeholder="CNC Machined Parts" value={form.product} onChange={(e) => set('product', e.target.value)} />
            </div>
            <div>
              <label className="label">Industry</label>
              <input className="input" placeholder="Automotive" value={form.industry} onChange={(e) => set('industry', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Expected Close Date</label>
              <input type="date" className="input" value={form.expectedCloseDate} onChange={(e) => set('expectedCloseDate', e.target.value)} />
            </div>
            {isManager && users.length > 0 && (
              <div>
                <label className="label">Assign To</label>
                <select className="select" value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}>
                  <option value="">Select BDA</option>
                  {users.filter((u) => u.role !== 'admin' || isManager).map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {form.status === 'lost' && (
            <div>
              <label className="label">Lost Reason</label>
              <input className="input" placeholder="e.g. Budget constraints" value={form.lostReason} onChange={(e) => set('lostReason', e.target.value)} />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Notes & Tags</h3>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={4} placeholder="Any additional information..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <div>
            <label className="label">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input className="input" placeholder="automotive, cnc, q1-target" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Save size={15} /> {isEdit ? 'Update Lead' : 'Create Lead'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
