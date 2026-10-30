import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { AlertTriangle, Atom, Building2, ClipboardCheck, FlaskConical, Flame, GraduationCap, Microscope, ShieldCheck, TrendingDown, TrendingUp, Zap } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* 3D-style floating laboratory tile with independent motion + parallax */
/* ------------------------------------------------------------------ */
function Tile({ Icon, from, to, glow, size = 72, depth = 20, dur = 7, delay = 0, amp = 14, pos, mx, my, className = '' }) {
  const x = useTransform(mx, [-1, 1], [-depth, depth]);
  const y = useTransform(my, [-1, 1], [-depth, depth]);
  return (
    <motion.div aria-hidden="true" className={`pointer-events-none absolute ${className}`} style={{ ...pos, x, y }}>
      <div className="scale-[.7] sm:scale-90 lg:scale-100">
        <motion.div
          animate={{ y: [0, -amp, 0], rotate: [-3, 4, -3] }}
          transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay }}
          className="relative grid place-items-center text-white"
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.3,
            background: `linear-gradient(145deg, ${from}, ${to})`,
            boxShadow: `inset 0 2px 3px rgba(255,255,255,.8), inset 0 -8px 14px rgba(0,0,0,.14), 0 26px 36px -12px ${glow}, 0 6px 10px rgba(15,23,42,.10)`,
          }}
        >
          <span className="absolute inset-x-2 top-1.5 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/55 to-transparent" />
          <Icon size={size * 0.48} strokeWidth={1.8} className="relative drop-shadow-[0_2px_3px_rgba(0,0,0,.28)]" />
        </motion.div>
      </div>
    </motion.div>
  );
}

const TILES = [
  { Icon: FlaskConical, from: '#60a5fa', to: '#2563eb', glow: 'rgba(37,99,235,.55)', pos: { top: '7%', left: '3.5%' }, depth: 22, dur: 7, size: 76 },
  { Icon: ShieldCheck, from: '#34d399', to: '#059669', glow: 'rgba(5,150,105,.5)', pos: { top: '9%', right: '5%' }, depth: 30, dur: 8.5, delay: 1, size: 70, className: 'hidden sm:block' },
  { Icon: Zap, from: '#fcd34d', to: '#f59e0b', glow: 'rgba(245,158,11,.5)', pos: { top: '46%', left: '51%' }, depth: 18, dur: 6.2, delay: 0.5, size: 60, className: 'hidden lg:block' },
  { Icon: Atom, from: '#a78bfa', to: '#6d28d9', glow: 'rgba(109,40,217,.5)', pos: { bottom: '8%', left: '45%' }, depth: 26, dur: 9, delay: 1.5, size: 64, className: 'hidden lg:block' },
  { Icon: Flame, from: '#fb923c', to: '#ea580c', glow: 'rgba(234,88,12,.5)', pos: { bottom: '7%', left: '3%' }, depth: 20, dur: 7.6, delay: 2, size: 62, className: 'hidden sm:block' },
  { Icon: Microscope, from: '#38bdf8', to: '#0284c7', glow: 'rgba(2,132,199,.5)', pos: { bottom: '10%', right: '4%' }, depth: 24, dur: 8, delay: 0.8, size: 66, className: 'hidden md:block' },
];

/* ------------------------------------------------------------------ */
/* Rotating headline                                                    */
/* ------------------------------------------------------------------ */
const MESSAGES = ['Inspect with confidence.', 'Spot hazards before they spread.', 'Keep every lab compliant.', 'Turn checklists into insight.'];

function RotatingText({ className = '' }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 3600);
    return () => clearInterval(t);
  }, []);
  return (
    <span aria-hidden="true" className={`relative block h-[1.25em] overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ y: '70%', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-70%', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute inset-0 whitespace-nowrap bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent"
        >
          {MESSAGES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Circular compliance indicator                                        */
/* ------------------------------------------------------------------ */
function ComplianceRing({ target = 96 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const controls = animate(0, target, { duration: 1.9, ease: 'easeOut', onUpdate: (v) => setVal(Math.round(v)) });
    return () => controls.stop();
  }, [target]);
  return (
    <div className="glass-mini relative grid h-40 w-40 shrink-0 place-items-center rounded-full" role="img" aria-label={`Sample compliance score ${target} percent`}>
      <motion.span
        className="absolute inset-2 rounded-full bg-emerald-300/30"
        animate={{ scale: [1, 1.07, 1], opacity: [0.5, 0.15, 0.5] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90 p-3">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: target / 100 }}
          transition={{ duration: 1.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="relative text-center">
        <div className="text-3xl font-extrabold leading-none text-slate-900">{val}%</div>
        <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Compliance</div>
      </div>
    </div>
  );
}

function StatCard({ Icon, label, value, delta, up, tone, delay = 0, dur = 6 }) {
  const TrendIcon = up ? TrendingUp : TrendingDown;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + delay * 0.2, duration: 0.6 }}
    >
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay }}
        className="glass-mini flex items-center gap-3 rounded-2xl px-4 py-3"
      >
        <span className={`grid h-10 w-10 place-items-center rounded-xl text-white ${tone}`}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-[8.5rem]">
          <div className="text-xs font-medium text-slate-500">{label}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900">{value}</span>
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendIcon size={12} aria-hidden="true" /> {delta}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                                */
/* ------------------------------------------------------------------ */
export default function AuthShell({ children }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 55, damping: 18 });
  const my = useSpring(rawY, { stiffness: 55, damping: 18 });

  useEffect(() => {
    const onMove = (e) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [rawX, rawY]);

  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 4 + Math.random() * 12,
        dur: 14 + Math.random() * 14,
        delay: -Math.random() * 25,
        color: i % 2 ? 'rgba(59,130,246,.30)' : 'rgba(16,185,129,.30)',
      })),
    []
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="auth-bg relative min-h-screen overflow-hidden">
        {/* moving gradient light */}
        <div className="aurora -left-20 -top-24 h-[26rem] w-[26rem] bg-blue-300/50" style={{ '--dur': '22s' }} />
        <div className="aurora -bottom-24 right-0 h-[30rem] w-[30rem] bg-emerald-300/50" style={{ '--dur': '26s' }} />
        <div className="aurora left-1/3 top-1/2 h-72 w-72 bg-indigo-200/50" style={{ '--dur': '30s' }} />

        {/* particles */}
        {particles.map((p) => (
          <span key={p.id} aria-hidden="true" className="particle" style={{ left: `${p.left}%`, width: p.size, height: p.size, background: p.color, '--dur': `${p.dur}s`, '--delay': `${p.delay}s` }} />
        ))}

        {/* floating 3D laboratory icons */}
        {TILES.map((t, i) => (
          <Tile key={i} mx={mx} my={my} {...t} />
        ))}

        <main className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          {/* hero (desktop) */}
          <section className="hidden lg:block">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="glass-mini inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-700">
                <GraduationCap size={15} className="text-blue-600" aria-hidden="true" />
                University of Ruhuna - Electrical and Information Engineering
              </span>
              <h1 className="mt-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 xl:text-6xl">
                Safer laboratories,
                <span className="sr-only"> smarter inspections.</span>
                <RotatingText className="mt-2 text-3xl font-bold xl:text-4xl" />
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
                Plan inspections, score compliance, track incidents and spot risk early, all in one secure platform built for university laboratories.
              </p>
            </motion.div>

            <div className="mt-10 flex items-center gap-6">
              <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
                <ComplianceRing />
              </motion.div>
              <div className="space-y-3">
                <StatCard Icon={ClipboardCheck} label="Inspections this month" value="128" delta="12%" up tone="bg-gradient-to-br from-blue-500 to-indigo-600" delay={0} dur={6} />
                <StatCard Icon={AlertTriangle} label="Open incidents" value="3" delta="2" tone="bg-gradient-to-br from-amber-400 to-orange-500" delay={0.7} dur={7} />
                <StatCard Icon={Building2} label="Labs on schedule" value="24/26" delta="8%" up tone="bg-gradient-to-br from-emerald-400 to-teal-600" delay={1.4} dur={6.6} />
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Preview figures shown for illustration. Live data appears after you sign in.</p>
          </section>

          {/* form column */}
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 text-center lg:hidden">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30">
                <ShieldCheck size={30} aria-hidden="true" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">Safer laboratories</p>
              <RotatingText className="mx-auto mt-1 text-lg font-bold" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="glass-card rounded-3xl p-7 sm:p-9"
            >
              {children}
            </motion.div>
            <p className="mt-5 text-center text-xs text-slate-500">EC4307 Web Application Development - University of Ruhuna</p>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
