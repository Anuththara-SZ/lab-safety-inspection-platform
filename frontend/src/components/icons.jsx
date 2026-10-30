// Shared stroke icons (24x24). Usage: <Icon name="flask" size={32} />
const PATHS = {
  flask: (<><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3" /><path d="M7.5 15h9" /></>),
  shield: (<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5L16 9.5" /></>),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  flame: <path d="M12 22c4 0 7-2.8 7-7 0-3-2-5-3.5-7-.5 2-2 3-2.5 3 0-3-1-6-4-9 0 4-4 6-4 12 0 4.2 3 8 7 8z" />,
  atom: (<><circle cx="12" cy="12" r="1.5" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /></>),
  clipboard: (<><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4h6v3H9zM9 12l2 2 4-4" /></>),
  building: (<><rect x="4" y="3" width="10" height="18" rx="1" /><path d="M14 9h6v12h-6M8 7h2M8 11h2M8 15h2M17 13h0M17 17h0" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" /><circle cx="17" cy="9" r="2.5" /><path d="M17.5 14c2.5.3 4 2.3 4 5" /></>),
  alert: (<><path d="M12 3L2 20h20z" /><path d="M12 10v4M12 17.5v.01" /></>),
  chart: (<><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></>),
  list: (<><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h4" /></>),
};

export default function Icon({ name = 'shield', size = 24, className = '', stroke = 1.8, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
      {PATHS[name] || PATHS.shield}
    </svg>
  );
}
