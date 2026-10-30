import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import AuthShell from '../components/AuthShell';
import AuthField from '../components/AuthField';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const DEMO = [
  ['Admin', 'admin@lab.com', 'Admin@123'],
  ['Inspector', 'inspector@lab.com', 'Inspector@123'],
  ['Technician', 'tech@lab.com', 'Tech@123'],
];

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
      await login(form.email, form.password); // real API call; App redirects once the user is set
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="mb-7 flex items-center gap-3.5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck size={26} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-600">Sign in to Lab Safety Platform</p>
          </div>
        </motion.div>

        <div aria-live="assertive">
          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                key={error}
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto', x: [0, -8, 8, -5, 5, 0] }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={submit} noValidate={false} aria-busy={busy}>
          <fieldset disabled={busy} className="space-y-4 border-0 p-0">
            <motion.div variants={item}>
              <AuthField id="email" label="Email" icon={Mail} type="email" required autoComplete="email" placeholder="you@university.lk" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </motion.div>
            <motion.div variants={item}>
              <AuthField
                id="password"
                label="Password"
                icon={Lock}
                type={show ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                trailing={
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </motion.div>

            <motion.div variants={item}>
              <motion.button
                type="submit"
                whileHover={busy ? undefined : { y: -2 }}
                whileTap={busy ? undefined : { scale: 0.98 }}
                className="relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 disabled:cursor-wait"
                style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5 60%,#0ea5e9)' }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {busy ? (
                    <>
                      <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Signing you in...
                    </>
                  ) : (
                    <>
                      Sign in <ArrowRight size={18} aria-hidden="true" />
                    </>
                  )}
                </span>
                {busy && <span className="shimmer-bar" aria-hidden="true" />}
              </motion.button>
            </motion.div>
          </fieldset>
        </form>

        <motion.p variants={item} className="mt-5 text-center text-sm text-slate-600">
          No account?{' '}
          <Link to="/register" className="font-semibold text-blue-700 hover:underline focus:outline-none focus-visible:underline">
            Create one
          </Link>
        </motion.p>

        <motion.div variants={item} className="mt-6 border-t border-slate-200 pt-4">
          <p className="mb-2.5 text-xs font-semibold text-slate-600">Quick demo login (fills the form)</p>
          <div className="flex flex-wrap gap-2">
            {DEMO.map(([label, email, password]) => (
              <motion.button
                key={label}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                disabled={busy}
                onClick={() => setForm({ email, password })}
                className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              >
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AuthShell>
  );
}
