// StatCard.jsx
export function StatCard({ title, value, subtitle, icon: Icon, iconBg = 'bg-indigo-100', iconColor = 'text-indigo-600', trend, trendLabel }) {
  const isPositive = trend > 0;
  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs font-medium mt-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel || 'vs last month'}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className={iconColor} />
          </div>
        )}
      </div>
    </div>
  );
}

// Badge.jsx
const VARIANTS = {
  default: 'bg-gray-100 text-gray-600',
  indigo: 'bg-indigo-100 text-indigo-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  pink: 'bg-pink-100 text-pink-700',
  blue: 'bg-blue-100 text-blue-700',
};

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`badge ${VARIANTS[variant] || VARIANTS.default} ${className}`}>
      {children}
    </span>
  );
}

// Modal.jsx
import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

// LoadingSpinner.jsx
export function LoadingSpinner({ size = 'md', center = true }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const spinner = (
    <div className={`${sizes[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`} />
  );
  if (center) return <div className="flex items-center justify-center py-12">{spinner}</div>;
  return spinner;
}

// Avatar.jsx
export function Avatar({ name, avatar, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (avatar) return <img src={avatar} alt={name} className={`${sizes[size]} rounded-full object-cover`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// EmptyState.jsx
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Confirm dialog
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger">
          {loading ? 'Deleting...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
