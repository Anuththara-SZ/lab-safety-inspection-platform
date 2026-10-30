import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { Alert } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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

  const fill = (email, password) => setForm({ email, password });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Lab Safety Inspection</h1>
        <p className="mb-6 text-sm text-slate-500">Sign in to your account</p>
        <Alert>{error}</Alert>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{' '}
          <Link to="/register" className="text-brand-600 font-medium">
            Register
          </Link>
        </p>
        <div className="mt-6 border-t pt-4 text-xs text-slate-500">
          <p className="mb-2 font-medium">Demo accounts (after running the seed script):</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary btn-sm" onClick={() => fill('admin@lab.com', 'Admin@123')}>Admin</button>
            <button type="button" className="btn-secondary btn-sm" onClick={() => fill('inspector@lab.com', 'Inspector@123')}>Inspector</button>
            <button type="button" className="btn-secondary btn-sm" onClick={() => fill('tech@lab.com', 'Tech@123')}>Technician</button>
          </div>
        </div>
      </div>
    </div>
  );
}
