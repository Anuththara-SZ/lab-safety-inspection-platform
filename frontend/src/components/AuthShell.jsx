import { useEffect, useMemo, useRef, useState } from 'react';

// Simple stroke icons (24x24) used as floating "lab objects"
const ICONS = {
  flask: (<><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3" /><path d="M7.5 15h9" /></>),
  shield: (<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5L16 9.5" /></>),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  flame: <path d="M12 22c4 0 7-2.8 7-7 0-3-2-5-3.5-7-.5 2-2 3-2.5 3 0-3-1-6-4-9 0 4-4 6-4 12 0 4.2 3 8 7 8z" />,
  atom: (<><circle cx="12" cy="12" r="1.5" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /></>),
  clipboard: (<><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4h6v3H9zM9 12l2 2 4-4" /></>),
};

const FLOATERS = [
  { icon: 'flask', top: '10%', left: '8%', size: 64, depth: 22, dur: 7, delay: 0 },
  { icon: 'shield', top: '22%', left: '72%', size: 76, depth: 30, dur: 8, delay: 1 },
  { icon: 'bolt', top: '62%', left: '12%', size: 56, depth: 18, dur: 6, delay: 0.5 },
  { icon: 'flame', top: '75%', left: '64%', size: 60, depth: 26, dur: 9, delay: 2 },
  { icon: 'atom', top: '45%', left: '42%', size: 70, depth: 14, dur: 10, delay: 1.5 },
  { icon: 'clipboard', top: '6%', left: '48%', size: 52, depth: 20, dur: 7.5, delay: 3 },
];

const TICKER = [
  { lab: 'HV-01', text: 'High Voltage Lab inspected', score: '92%', color: 'bg-green-400' },
  { lab: 'PE-03', text: 'Corrective action opened', score: '58%', color: 'bg-orange-400' },
  { lab: 'EL-02', text: 'Electronics Lab passed all checks', score: '100%', color: 'bg-green-400' },
  { lab: 'CH-05', text: 'Chemical storage review scheduled', score: 'New', color: 'bg-blue-400' },
];

function ScoreRing({ target = 96 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / 1800, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#4ade80" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - val / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-2xl font-bold">{val}%</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-300">Safety</span>
      </div>
    </div>
  );
}

function Ticker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % TICKER.length), 3000);
    return () => clearInterval(t);
  }, []);
  const item = TICKER[i];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
      <span className="relative flex h-3 w-3">
        <span className={`anim-ping absolute inline-flex h-full w-full rounded-full ${item.color}`} />
        <span className={`relative inline-flex h-3 w-3 rounded-full ${item.color}`} />
      </span>
      <div key={i} className="anim-tick flex-1">
        <b>{item.lab}</b> <span className="text-slate-200">{item.text}</span>
      </div>
      <span className="font-semibold">{item.score}</span>
    </div>
  );
}

export default function AuthShell({ children }) {
  const ref = useRef(null);

  // Mouse parallax: write normalised cursor position into CSS variables
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width - 0.5).toFixed(3));
    el.style.setProperty('--my', ((e.clientY - rect.top) / rect.height - 0.5).toFixed(3));
  };

  const bubbles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 22,
        dur: 10 + Math.random() * 12,
        delay: -Math.random() * 20,
      })),
    []
  );

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="auth-grid relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-brand-900 to-indigo-900"
    >
      {/* glowing blobs */}
      <div className="anim-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="anim-blob absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-3xl" style={{ '--dur': '22s' }} />
      <div className="anim-blob absolute left-1/2 top-1/3 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" style={{ '--dur': '26s' }} />

      {/* rising bubbles */}
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="anim-rise absolute bottom-0 rounded-full border border-white/30 bg-white/10"
          style={{ left: `${b.left}%`, width: b.size, height: b.size, '--dur': `${b.dur}s`, '--delay': `${b.delay}s` }}
        />
      ))}

      {/* floating lab objects with mouse parallax */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {FLOATERS.map((f) => (
          <div key={f.icon} className="parallax absolute" style={{ top: f.top, left: f.left, '--depth': f.depth }}>
            <div className="anim-floaty" style={{ '--dur': `${f.dur}s`, '--delay': `${f.delay}s` }}>
              <svg width={f.size} height={f.size} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 12px rgba(96,165,250,.6))' }}>
                {ICONS[f.icon]}
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-10 p-6 lg:grid-cols-2">
        {/* hero */}
        <div className="anim-fadeup hidden text-white lg:block">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-green-400" /> University of Ruhuna - EIE
          </div>
          <h1 className="text-5xl font-extrabold leading-tight">
            Safer labs,
            <br />
            <span className="bg-gradient-to-r from-sky-300 to-emerald-300 bg-clip-text text-transparent">smarter inspections.</span>
          </h1>
          <p className="mt-4 max-w-md text-slate-300">
            Plan inspections, score compliance, track incidents and spot risk early, all in one platform.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <ScoreRing />
            <div className="flex-1 space-y-3">
              <Ticker />
              <div className="flex gap-2 text-xs">
                {['Checklists', 'Risk scoring', 'Incident log'].map((t, i) => (
                  <span key={t} className="anim-fadeup rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-200" style={{ '--delay': `${0.4 + i * 0.15}s` }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* form card */}
        <div className="anim-fadeup flex justify-center" style={{ '--delay': '0.15s' }}>
          <div className="glass w-full max-w-md rounded-2xl p-8 shadow-2xl ring-1 ring-white/40">{children}</div>
        </div>
      </div>
    </div>
  );
}
