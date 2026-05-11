import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from './api.js';

const emptyForm = { name: '', slug: '', description: '', imageUrl: '', isActive: true };

export function Categories() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const mode = id ? 'edit' : location.pathname.endsWith('/new') ? 'new' : 'list';

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const editingRow = useMemo(() => rows.find((r) => r._id === id), [rows, id]);

  async function load() {
    setError('');
    try {
      setRows(await fetchCategories());
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
        name: editingRow.name || '',
        slug: editingRow.slug || '',
        description: editingRow.description || '',
        imageUrl: editingRow.imageUrl || '',
        isActive: editingRow.isActive !== false,
      });
    }
  }, [mode, editingRow]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'edit') await updateCategory(id, form);
      else await createCategory(form);
      navigate('/categories');
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(cid, name) {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    setError('');
    try {
      await deleteCategory(cid);
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
            <h1 className="admin-title">Categories</h1>
            <p className="admin-subtitle">Category listing and management.</p>
          </div>
          <Link to="/categories/new" className="admin-btn-accent">Add Category</Link>
        </div>
        {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

        <div className="admin-table-wrap mt-8">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr>
                <th className="admin-th">Name</th>
                <th className="admin-th">Slug</th>
                <th className="admin-th">Status</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t border-line">
                  <td className="admin-td font-medium text-ink">{row.name}</td>
                  <td className="admin-td text-muted">{row.slug}</td>
                  <td className="admin-td text-muted">{row.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="admin-td text-right">
                    <Link to={`/categories/${row._id}/edit`} className="mr-2 rounded-md px-2 py-1 text-[13px] font-medium text-ink hover:bg-surface">Edit</Link>
                    <button type="button" onClick={() => onDelete(row._id, row.name)} className="rounded-md px-2 py-1 text-[13px] font-medium text-red-600 hover:bg-red-50">Delete</button>
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
        <h1 className="admin-title">{mode === 'edit' ? 'Edit Category' : 'Add Category'}</h1>
        <Link to="/categories" className="admin-btn-secondary">Back to Listing</Link>
      </div>
      {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

      <form onSubmit={onSubmit} className="admin-form-card mt-7 grid gap-4 bg-surface p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label">Name</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="admin-input mt-1" />
          </div>
          <div>
            <label className="admin-label">Slug (optional)</label>
            <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="admin-input mt-1" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="admin-textarea mt-1" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label">Image URL</label>
            <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className="admin-input mt-1" />
          </div>
          <label className="inline-flex items-center gap-2 text-[13px] text-ink">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active category
          </label>
        </div>
        <div><button type="submit" className="admin-btn-primary">{mode === 'edit' ? 'Save Category' : 'Create Category'}</button></div>
      </form>
    </div>
  );
}
