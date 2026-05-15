import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchDashboard } from './api.js';

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="admin-kpi-card bg-[linear-gradient(180deg,#fff_0%,#fbfbfb_100%)]">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">{title}</p>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-ink/80">
          <Icon d={icon} />
        </span>
      </div>
      <p className="mt-3 text-[30px] font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}

const modules = [
  { name: 'Products', to: '/products', ops: ['Create', 'Read', 'Update', 'Delete'], icon: 'M5 7l7-4 7 4v10l-7 4-7-4zM5 7l7 4 7-4M12 11v10' },
  { name: 'Categories', to: '/categories', ops: ['Create', 'Read', 'Update', 'Delete'], icon: 'M4 6h7v7H4zM13 6h7v7h-7zM4 15h7v5H4zM13 15h7v5h-7z' },
  { name: 'Discounts', to: '/discounts', ops: ['Create', 'Read', 'Update', 'Delete'], icon: 'M7 7h.01M17 17h.01M5 19L19 5M4 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM14 14a3 3 0 1 0 6 0 3 3 0 0 0-6 0z' },
  { name: 'Banners', to: '/banners', ops: ['Create', 'Read', 'Update', 'Delete'], icon: 'M4 5h16v10H4zM8 19h8M10 15v4M14 15v4' },
  { name: 'Users', to: '/users', ops: ['Read', 'Update', 'Status control'], icon: 'M16 19a4 4 0 0 0-8 0M12 11a4 4 0 1 0 0-8' },
  { name: 'Orders', to: '/orders', ops: ['Read', 'Update', 'Lifecycle tracking'], icon: 'M4 7h16M6 11h12M8 15h8M9 4h6v3H9z' },
  { name: 'Subscribers', to: '/subscribers', ops: ['Read', 'Export-ready list'], icon: 'M4 6h16v12H4zM4 8l8 6 8-6' },
  { name: 'Blogs', to: '/blogs', ops: ['Create', 'Read', 'Update', 'Delete', 'SEO'], icon: 'M6 4h12v16H6zM9 8h6M9 12h6M9 16h4' },
];

export function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const m = data?.metrics || {};

  return (
    <div className="admin-page">
      <section className="admin-card overflow-hidden">
        <div className="bg-[linear-gradient(135deg,#1C1C1C_0%,#2b2b2b_100%)] px-6 py-6 text-white">
          <h1 className="text-[34px] font-semibold leading-tight tracking-tight">CRM Dashboard</h1>
          <p className="mt-2 text-[14px] text-white/75">
            Overview for products, customers, orders and revenue.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link className="rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-ink transition hover:bg-white/90" to="/products/new">Add Product</Link>
            <Link className="rounded-lg border border-white/35 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-white/10" to="/orders">View Orders</Link>
          </div>
        </div>
      </section>

      {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Revenue" value={`$${Number(m.revenue || 0).toFixed(2)}`} icon="M4 19h16M6 15l3-4 3 2 4-6 2 3" />
        <Card title="Orders" value={m.orders ?? 0} icon="M4 7h16M6 11h12M8 15h8M9 4h6v3H9z" />
        <Card title="Users" value={m.users ?? 0} icon="M16 19a4 4 0 0 0-8 0M12 11a4 4 0 1 0 0-8" />
        <Card title="Products" value={m.products ?? 0} icon="M5 7l7-4 7 4v10l-7 4-7-4zM5 7l7 4 7-4M12 11v10" />
        <Card title="Categories" value={m.categories ?? 0} icon="M4 6h7v7H4zM13 6h7v7h-7zM4 15h7v5H4zM13 15h7v5h-7z" />
        <Card title="Discount Codes" value={m.discounts ?? 0} icon="M7 7h.01M17 17h.01M5 19L19 5" />
        <Card title="Banners" value={m.banners ?? 0} icon="M4 5h16v10H4zM8 19h8" />
        <Card title="Subscribers" value={m.subscribers ?? 0} icon="M4 6h16v12H4zM4 8l8 6 8-6" />
        <Card title="Blogs" value={m.blogs ?? 0} icon="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" />
      </div>

      <div className="admin-section-head">
        <h2 className="text-[20px] font-semibold tracking-tight text-ink">Section Operations</h2>
        <span className="admin-chip">Professional CRUD Flow</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <div key={mod.name} className="admin-card p-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(17,17,17,0.08)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-surface text-ink/80">
                  <Icon d={mod.icon} />
                </span>
                <p className="text-[16px] font-semibold text-ink">{mod.name}</p>
              </div>
              <Link className="text-[12px] font-semibold text-brand hover:underline" to={mod.to}>
                Open
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {mod.ops.map((op) => (
                <span key={op} className="admin-chip">
                  {op}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
