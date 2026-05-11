import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { createBanner, deleteBanner, fetchBanners, updateBanner } from './api.js';

const emptyForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  ctaText: '',
  ctaLink: '',
  position: 'home-hero',
  priority: '',
  isActive: true,
};

export function Banners() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const mode = id ? 'edit' : location.pathname.endsWith('/new') ? 'new' : 'list';

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const editingRow = useMemo(() => rows.find((r) => r._id === id), [rows, id]);

  async function load() {
    try {
      setRows(await fetchBanners());
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (mode === 'new') setForm(emptyForm);
    if (mode === 'edit' && editingRow) {
      setForm({
        title: editingRow.title || '',
        subtitle: editingRow.subtitle || '',
        imageUrl: editingRow.imageUrl || '',
        ctaText: editingRow.ctaText || '',
        ctaLink: editingRow.ctaLink || '',
        position: editingRow.position || 'home-hero',
        priority: String(editingRow.priority || 0),
        isActive: editingRow.isActive !== false,
      });
    }
  }, [mode, editingRow]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (mode === 'edit') await updateBanner(id, form);
      else await createBanner(form);
      navigate('/banners');
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(bid, title) {
    if (!window.confirm(`Delete banner "${title}"?`)) return;
    try {
      await deleteBanner(bid);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (mode === 'list') {
    return (
      <div className="admin-page">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="admin-title">Banners</h1>
            <p className="admin-subtitle">Banner listing and management.</p>
          </div>
          <Link to="/banners/new" className="admin-btn-accent">Add Banner</Link>
        </div>
        {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

        <div className="admin-table-wrap mt-8">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr>
                <th className="admin-th">Title</th>
                <th className="admin-th">Position</th>
                <th className="admin-th">Priority</th>
                <th className="admin-th">Status</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t border-line">
                  <td className="admin-td font-medium text-ink">{row.title}</td>
                  <td className="admin-td text-muted">{row.position}</td>
                  <td className="admin-td text-muted">{row.priority}</td>
                  <td className="admin-td text-muted">{row.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="admin-td text-right">
                    <Link to={`/banners/${row._id}/edit`} className="mr-2 rounded-md px-2 py-1 text-[13px] font-medium text-ink hover:bg-surface">Edit</Link>
                    <button type="button" onClick={() => onDelete(row._id, row.title)} className="rounded-md px-2 py-1 text-[13px] font-medium text-red-600 hover:bg-red-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="flex items-center justify-between">
        <h1 className="admin-title">{mode === 'edit' ? 'Edit Banner' : 'Add Banner'}</h1>
        <Link to="/banners" className="admin-btn-secondary">Back to Listing</Link>
      </div>
      {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

      <form onSubmit={onSubmit} className="admin-form-card mt-7 grid gap-4 bg-surface sm:grid-cols-2">
        <input placeholder="Title" value={form.title} onChange={(e)=>setForm(f=>({...f,title:e.target.value}))} className="admin-input" />
        <input placeholder="Subtitle" value={form.subtitle} onChange={(e)=>setForm(f=>({...f,subtitle:e.target.value}))} className="admin-input" />
        <input placeholder="Image URL" value={form.imageUrl} onChange={(e)=>setForm(f=>({...f,imageUrl:e.target.value}))} className="admin-input sm:col-span-2" />
        <input placeholder="CTA text" value={form.ctaText} onChange={(e)=>setForm(f=>({...f,ctaText:e.target.value}))} className="admin-input" />
        <input placeholder="CTA link" value={form.ctaLink} onChange={(e)=>setForm(f=>({...f,ctaLink:e.target.value}))} className="admin-input" />
        <select value={form.position} onChange={(e)=>setForm(f=>({...f,position:e.target.value}))} className="admin-input">
          <option value="home-hero">Home hero</option>
          <option value="home-mid">Home mid</option>
          <option value="shop-top">Shop top</option>
        </select>
        <input type="number" placeholder="Priority" value={form.priority} onChange={(e)=>setForm(f=>({...f,priority:e.target.value}))} className="admin-input" />
        <label className="sm:col-span-2 inline-flex items-center gap-2 text-[13px] text-ink">
          <input type="checkbox" checked={form.isActive} onChange={(e)=>setForm(f=>({...f,isActive:e.target.checked}))} /> Active
        </label>
        <button type="submit" className="admin-btn-primary sm:col-span-2">{mode === 'edit' ? 'Save Banner' : 'Create Banner'}</button>
      </form>
    </div>
  );
}
