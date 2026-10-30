import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { Alert } from '../components/ui';
import AuthShell from '../components/AuthShell';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  const demo = [
    ['Admin', 'admin@lab.com', 'Admin@123'],
    ['Inspector', 'inspector@lab.com', 'Inspector@123'],
    ['Technician', 'tech@lab.com', 'Tech@123'],
  ];

  return (
    <AuthShell>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 text-white shadow-lg">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
            <path d="M8.5 12l2.5 2.5L16 9.5" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-500">Sign in to Lab Safety Platform</p>
        </div>
      </div>

      <Alert>{error}</Alert>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required autoComplete="email" placeholder="you@university.lk" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input className="input pr-16" type={show ? 'text' : 'password'} required autoComplete="current-password" placeholder="Your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-brand-600 hover:underline">
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <button className="btn-primary w-full bg-gradient-to-r from-brand-500 to-indigo-600 py-2.5 shadow-lg shadow-blue-500/30 hover:scale-[1.01]" disabled={busy}>
          {busy ? (
            <>
              <span className="anim-spin inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white" /> Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        No account?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">
          Register
        </Link>
      </p>

      <div className="mt-6 border-t pt-4">
        <p className="mb-2 text-xs font-medium text-slate-500">Quick demo login (fills the form)</p>
        <div className="flex flex-wrap gap-2">
          {demo.map(([label, email, password]) => (
            <button key={label} type="button" className="btn-secondary btn-sm hover:-translate-y-0.5" onClick={() => setForm({ email, password })}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}
