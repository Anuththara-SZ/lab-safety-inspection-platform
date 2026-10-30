import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import AuthShell from '../components/AuthShell';
import AuthField from '../components/AuthField';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// Simple strength estimate: length, digits, mixed case, symbols
function strength(pw) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/\d/.test(pw) && /[a-zA-Z]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw) || (/[a-z]/.test(pw) && /[A-Z]/.test(pw))) s++;
  return s;
}
const LEVELS = [
  { label: 'Too short', color: '#e2e8f0' },
  { label: 'Weak', color: '#f43f5e' },
  { label: 'Fair', color: '#f59e0b' },
  { label: 'Good', color: '#3b82f6' },
  { label: 'Strong', color: '#10b981' },
];

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const score = form.password ? strength(form.password) : 0;
  const level = LEVELS[score];

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
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="mb-6 flex items-center gap-3.5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/30">
            <UserPlus size={24} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Create account</h2>
            <p className="text-sm text-slate-600">New accounts start as Lab Technicians</p>
          </div>
        </motion.div>

        <div aria-live="assertive">
          <AnimatePresence initial={false}>
            {error && (
              <motion.div key={error} role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', x: [0, -8, 8, -5, 5, 0] }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }} className="mb-4 overflow-hidden">
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={submit} aria-busy={busy}>
          <fieldset disabled={busy} className="space-y-4 border-0 p-0">
            <motion.div variants={item}>
              <AuthField id="name" label="Full name" icon={User} required autoComplete="name" placeholder="Your full name" value={form.name} onChange={set('name')} />
            </motion.div>
            <motion.div variants={item}>
              <AuthField id="email" label="Email" icon={Mail} type="email" required autoComplete="email" placeholder="you@university.lk" value={form.email} onChange={set('email')} />
            </motion.div>
            <motion.div variants={item}>
              <AuthField
                id="password"
                label="Password (min 6 characters)"
                icon={Lock}
                type={show ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Create a password"
                value={form.password}
                onChange={set('password')}
                trailing={
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                hint={
                  form.password && (
                    <div className="mt-2" aria-live="polite">
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <motion.div className="h-full rounded-full" animate={{ width: `${(score / 4) * 100}%`, backgroundColor: level.color }} transition={{ duration: 0.3 }} />
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-600">Strength: {level.label}</p>
                    </div>
                  )
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
                      <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Creating account...
                    </>
                  ) : (
                    <>
                      Create account <ArrowRight size={18} aria-hidden="true" />
                    </>
                  )}
                </span>
                {busy && <span className="shimmer-bar" aria-hidden="true" />}
              </motion.button>
            </motion.div>
          </fieldset>
        </form>

        <motion.p variants={item} className="mt-5 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-700 hover:underline focus:outline-none focus-visible:underline">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </AuthShell>
  );
}
