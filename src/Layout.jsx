import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { setToken } from './api.js';

const linkClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-[14px] font-medium transition',
    isActive ? 'bg-ink text-white' : 'text-ink/70 hover:bg-surface hover:text-ink',
  ].join(' ');

export function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
              Admin
            </p>
            <p className="text-[18px] font-semibold tracking-[0.12em] text-ink">PET SQUARE</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/subscribers" className={linkClass}>
              Subscribers
            </NavLink>
            <NavLink to="/products" className={linkClass}>
              Products
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setToken('');
                navigate('/login', { replace: true });
              }}
              className="ml-2 rounded-lg border border-line px-3 py-2 text-[14px] font-medium text-ink hover:bg-surface"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6">
        <Outlet />
      </div>
    </div>
  );
}
