import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { setToken } from './api.js';
import logo from './assets/pet-logo.svg';

const linkClass = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition',
    isActive ? 'bg-ink text-white shadow-sm' : 'text-ink/70 hover:bg-surface hover:text-ink',
  ].join(' ');

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  { to: '/users', label: 'Users', icon: 'M16 19a4 4 0 0 0-8 0M12 11a4 4 0 1 0 0-8' },
  { to: '/orders', label: 'Orders', icon: 'M4 7h16M6 11h12M8 15h8M9 4h6v3H9z' },
  { to: '/categories', label: 'Categories', icon: 'M4 6h7v7H4zM13 6h7v7h-7zM4 15h7v5H4zM13 15h7v5h-7z' },
  { to: '/discounts', label: 'Discounts', icon: 'M7 7h.01M17 17h.01M5 19L19 5M4 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM14 14a3 3 0 1 0 6 0 3 3 0 0 0-6 0z' },
  { to: '/banners', label: 'Banners', icon: 'M4 5h16v10H4zM8 19h8M10 15v4M14 15v4' },
  { to: '/subscribers', label: 'Subscribers', icon: 'M4 6h16v12H4zM4 8l8 6 8-6' },
  { to: '/blogs', label: 'Blogs', icon: 'M6 4h12v16H6zM9 8h6M9 12h6M9 16h4' },
  { to: '/products', label: 'Products', icon: 'M5 7l7-4 7 4v10l-7 4-7-4zM5 7l7 4 7-4M12 11v10' },
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-line bg-white px-4 py-3 sm:px-6 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Pet Square" className="h-8 w-8 rounded-md" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Admin</p>
              <p className="text-[16px] font-semibold tracking-[0.06em] text-ink">PET SQUARE</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink hover:bg-surface"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </header>

      <div className="flex w-full gap-0">
        {open && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-black/25 md:hidden"
          />
        )}

        <aside
          className={[
            'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-white p-5 shadow-xl transition-all duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none',
            collapsed ? 'md:w-[96px]' : 'md:w-[270px]',
            open ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div
            className={[
              'rounded-xl bg-[linear-gradient(135deg,#1C1C1C_0%,#2a2a2a_100%)]',
              collapsed ? 'p-2.5' : 'p-4',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Pet Square Logo" className="h-9 w-9 rounded-lg bg-white/95 p-1" />
              {!collapsed ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Admin</p>
                  <p className="text-[20px] font-semibold tracking-[0.08em] text-white">PET SQUARE</p>
                </div>
              ) : null}
              </div>
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 md:inline-flex"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>
          </div>

          <nav className={['mt-5 space-y-1', collapsed ? 'flex-1' : ''].join(' ')}>
            {navItems.map((item) => (
              <NavLink key={item.to} onClick={() => setOpen(false)} to={item.to} className={linkClass}>
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {!collapsed ? <span>{item.label}</span> : null}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => {
              setToken('');
              navigate('/login', { replace: true });
            }}
            className={['w-full rounded-lg border border-line px-3 py-2.5 text-[13px] font-medium text-ink hover:bg-surface', collapsed ? 'mt-4' : 'mt-8'].join(' ')}
          >
            {!collapsed ? 'Log out' : '↩'}
          </button>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
