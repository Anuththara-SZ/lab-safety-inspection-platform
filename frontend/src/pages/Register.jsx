import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { Alert } from '../components/ui';
import AuthShell from '../components/AuthShell';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
      <p className="mb-6 text-sm text-slate-500">New accounts start as Lab Technicians. An admin can promote roles.</p>
      <Alert>{error}</Alert>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" required value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label">Password (min 6 characters)</label>
          <input className="input" type="password" minLength={6} required value={form.password} onChange={set('password')} />
        </div>
        <button className="btn-primary w-full bg-gradient-to-r from-brand-500 to-indigo-600 py-2.5 shadow-lg shadow-blue-500/30" disabled={busy}>
          {busy ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
