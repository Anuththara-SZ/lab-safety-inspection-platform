import { useEffect } from 'react';

const COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-slate-200 text-slate-700',
  closed: 'bg-red-100 text-red-800',
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  open: 'bg-red-100 text-red-800',
  investigating: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  admin: 'bg-purple-100 text-purple-800',
  inspector: 'bg-blue-100 text-blue-800',
  technician: 'bg-slate-200 text-slate-700',
  pass: 'bg-green-100 text-green-800',
  fail: 'bg-red-100 text-red-800',
  na: 'bg-slate-200 text-slate-700',
  pending: 'bg-slate-100 text-slate-500',
};

export const Badge = ({ value }) =>
  value ? (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${COLORS[value] || 'bg-slate-100'}`}>
      {value === 'na' ? 'N/A' : value.replace('_', ' ')}
    </span>
  ) : (
    <span className="text-slate-400">-</span>
  );

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex gap-2 no-print">{children}</div>
  </div>
);

export const StatCard = ({ label, value, accent = 'text-brand-600' }) => (
  <div className="card">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${accent}`}>{value}</p>
  </div>
);

export const Alert = ({ type = 'error', children }) =>
  children ? (
    <div className={`rounded-lg px-4 py-3 text-sm mb-4 ${type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
      {children}
    </div>
  ) : null;

export const Spinner = () => <div className="py-10 text-center text-slate-400">Loading...</div>;

export const Empty = ({ children }) => <div className="py-10 text-center text-slate-400">{children}</div>;

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div className={`mt-10 w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} rounded-xl bg-white p-6 shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');

export const scoreColor = (s) => (s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-600');
