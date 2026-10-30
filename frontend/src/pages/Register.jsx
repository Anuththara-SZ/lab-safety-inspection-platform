import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { Alert } from '../components/ui';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
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
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-brand-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
