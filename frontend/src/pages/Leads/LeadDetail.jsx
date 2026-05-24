import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Phone, Mail, Calendar, Tag, User, Building2, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import api, { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, formatNumber, ACTIVITY_ICONS } from '../../utils/api';
import { LoadingSpinner, Avatar, Badge } from '../../components/common/index.jsx';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_STEPS = ['new', 'contacted', 'qualified', 'proposal-sent', 'negotiation', 'won'];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/leads/${id}`),
      api.get('/activities', { params: { lead: id, limit: 10 } }),
    ])
      .then(([leadRes, actRes]) => {
        setLead(leadRes.data.lead);
        setActivities(actRes.data.activities);
      })
      .catch(() => toast.error('Failed to load lead'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!lead) return (
    <div className="text-center py-20">
      <p className="text-gray-400 text-lg">Lead not found.</p>
      <Link to="/leads" className="btn-primary mt-4 inline-flex">Back to Leads</Link>
    </div>
  );

  const currentStepIndex = STATUS_STEPS.indexOf(lead.status);
  const isLost = lead.status === 'lost';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 mt-0.5">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{lead.title}</h2>
            <p className="text-sm text-gray-400">{lead.company} · {lead.industry}</p>
          </div>
        </div>
        <Link to={`/leads/${id}/edit`} className="btn-primary flex-shrink-0">
          <Edit2 size={14} /> Edit Lead
        </Link>
      </div>

      {/* Pipeline Progress Bar */}
      {!isLost && (
        <div className="card p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Pipeline Progress</p>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isLast = index === STATUS_STEPS.length - 1;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' :
                      isCurrent ? 'bg-white border-indigo-600 text-indigo-600' :
                      'bg-white border-gray-200 text-gray-300'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <p className={`text-[10px] mt-1.5 font-medium text-center leading-tight ${
                      isCurrent ? 'text-indigo-600' : isCompleted ? 'text-gray-600' : 'text-gray-300'
                    }`}>
                      {STATUS_LABELS[step]}
                    </p>
                  </div>
                  {!isLast && (
                    <div className={`h-0.5 flex-1 mb-4 ${index < currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lost banner */}
      {isLost && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <XCircle size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">Lead Lost</p>
            {lead.lostReason && <p className="text-xs text-red-500">Reason: {lead.lostReason}</p>}
          </div>
        </div>
      )}

      {/* Won banner */}
      {lead.status === 'won' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-700">Deal Won! 🎉</p>
            {lead.actualCloseDate && <p className="text-xs text-green-500">Closed on {format(new Date(lead.actualCloseDate), 'dd MMM yyyy')}</p>}
          </div>
        </div>
      )}

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Contact Info */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User size={15} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Contact Person</p>
                  <p className="text-sm font-semibold text-gray-800">{lead.contactPerson}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 size={15} className="text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Company</p>
                  <p className="text-sm font-semibold text-gray-800">{lead.company}</p>
                </div>
              </div>
              {lead.email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={15} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-indigo-600 hover:underline">{lead.email}</a>
                  </div>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={15} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-indigo-600 hover:underline">{lead.phone}</a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Notes</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{lead.notes}</p>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
              Activity Timeline ({activities.length})
            </h3>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No activities logged yet</p>
            ) : (
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act._id} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 text-sm">
                      {ACTIVITY_ICONS[act.type] || '📌'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{act.title}</p>
                      {act.outcome && <p className="text-xs text-green-600">→ {act.outcome}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {act.performedBy?.name} · {format(new Date(act.createdAt), 'dd MMM, h:mm a')}
                      </p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                      act.status === 'completed' ? 'bg-green-100 text-green-600' :
                      act.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Summary */}
        <div className="space-y-4">

          {/* Deal Value */}
          <div className="card p-5 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            <p className="text-xs font-medium text-indigo-200 mb-1">Deal Value</p>
            <p className="text-3xl font-bold">{formatNumber(lead.value)}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className={`badge ${lead.status === 'won' ? 'bg-green-400/30 text-green-100' : lead.status === 'lost' ? 'bg-red-400/30 text-red-100' : 'bg-white/20 text-white'}`}>
                {STATUS_LABELS[lead.status]}
              </span>
              <span className={`badge bg-white/20 text-white capitalize`}>{lead.priority}</span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="card p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Deal Info</h3>
            {[
              { label: 'Source', value: lead.source?.replace(/-/g, ' '), icon: TrendingUp },
              { label: 'Product', value: lead.product, icon: Tag },
              { label: 'Industry', value: lead.industry, icon: Building2 },
              { label: 'Expected Close', value: lead.expectedCloseDate ? format(new Date(lead.expectedCloseDate), 'dd MMM yyyy') : null, icon: Calendar },
              { label: 'Created', value: format(new Date(lead.createdAt), 'dd MMM yyyy'), icon: Clock },
            ].filter((item) => item.value).map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Icon size={11} />{label}
                </span>
                <span className="text-xs font-medium text-gray-700 capitalize text-right">{value}</span>
              </div>
            ))}
          </div>

          {/* Assigned To */}
          {lead.assignedTo && (
            <div className="card p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Assigned To</h3>
              <div className="flex items-center gap-3">
                <Avatar name={lead.assignedTo.name} avatar={lead.assignedTo.avatar} size="md" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{lead.assignedTo.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{lead.assignedTo.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {lead.tags?.length > 0 && (
            <div className="card p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map((tag) => (
                  <span key={tag} className="badge bg-gray-100 text-gray-600 capitalize">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}