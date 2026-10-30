import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from './ui';

const NAV = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'inspector', 'technician'], end: true },
  { to: '/labs', label: 'Laboratories', roles: ['admin', 'inspector', 'technician'] },
  { to: '/inspections', label: 'Inspections', roles: ['admin', 'inspector', 'technician'] },
  { to: '/incidents', label: 'Incidents', roles: ['admin', 'inspector', 'technician'] },
  { to: '/templates', label: 'Checklists', roles: ['admin', 'inspector'] },
  { to: '/users', label: 'Users', roles: ['admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer after navigating
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile top bar */}
      <header className="no-print flex items-center justify-between bg-brand-900 px-4 py-3 text-white md:hidden">
        <span className="font-bold">Lab Safety</span>
        <button onClick={() => setOpen(!open)} aria-label="Toggle menu" className="rounded bg-white/10 px-3 py-1 text-sm">
          {open ? 'Close' : 'Menu'}
        </button>
      </header>

      <aside
        className={`${open ? 'flex' : 'hidden'} md:flex w-full md:w-60 shrink-0 flex-col bg-brand-900 text-slate-200 md:sticky md:top-0 md:h-screen`}
      >
        <div className="hidden border-b border-white/10 px-5 py-5 md:block">
          <div className="text-lg font-bold leading-tight text-white">Lab Safety</div>
          <div className="text-xs text-slate-400">Smart Inspection Platform</div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.filter((n) => n.roles.includes(user.role)).map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-500 text-white' : 'hover:bg-white/10'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-sm">
          <div className="truncate font-medium text-white">{user.name}</div>
          <div className="mb-3 mt-1">
            <Badge value={user.role} />
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
