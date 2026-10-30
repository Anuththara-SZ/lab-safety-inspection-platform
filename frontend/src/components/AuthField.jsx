import { useState } from 'react';
import { motion } from 'framer-motion';

// Labelled input with a leading icon, animated focus ring and an optional trailing control
export default function AuthField({ id, label, icon: Icon, trailing, hint, ...inputProps }) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <motion.div
        animate={{
          borderColor: focus ? '#2563eb' : '#cbd5e1',
          boxShadow: focus ? '0 0 0 4px rgba(37,99,235,0.16)' : '0 0 0 0px rgba(37,99,235,0)',
        }}
        transition={{ duration: 0.18 }}
        className="flex items-center gap-2.5 rounded-xl border bg-white/90 px-3.5"
      >
        <Icon size={18} aria-hidden="true" className={focus ? 'text-blue-600' : 'text-slate-400'} />
        <input
          id={id}
          {...inputProps}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        {trailing}
      </motion.div>
      {hint}
    </div>
  );
}
