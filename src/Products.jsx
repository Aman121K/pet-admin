import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  createProduct,
  fetchCategories,
  deleteProduct,
  fetchAdminProducts,
  updateProduct,
} from './api.js';

function formatPrice(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const emptyForm = {
  name: '',
  price: '',
  imageUrl: '',
  description: '',
  sku: '',
  compareAtPrice: '',
  stock: '',
  category: '',
  isActive: true,
};

export function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const mode = id ? 'edit' : location.pathname.endsWith('/new') ? 'new' : 'list';

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const editingItem = useMemo(() => items.find((p) => p._id === id), [items, id]);

  async function load() {
    setError('');
    try {
      const [products, categoryRows] = await Promise.all([fetchAdminProducts(), fetchCategories()]);
      setItems(products);
      setCategories(categoryRows);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!categories.length) return;
    if (mode === 'new') {
      setForm({ ...emptyForm, category: categories[0]?._id || '' });
      return;
    }
    if (mode === 'edit' && editingItem) {
      setForm({
        name: editingItem.name || '',
        price: String(editingItem.price ?? ''),
        imageUrl: editingItem.imageUrl || '',
        description: editingItem.description || '',
        sku: editingItem.sku || '',
        compareAtPrice: String(editingItem.compareAtPrice || ''),
        stock: String(editingItem.stock ?? ''),
        category: editingItem.category?._id || editingItem.category || '',
        isActive: editingItem.isActive !== false,
      });
    }
  }, [mode, editingItem, categories]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const body = {
      name: form.name.trim(),
      price: Number(form.price),
      imageUrl: form.imageUrl.trim(),
      description: form.description.trim(),
      sku: form.sku.trim(),
      compareAtPrice: Number(form.compareAtPrice || 0),
      stock: Number(form.stock || 0),
      category: form.category,
      isActive: form.isActive,
    };

    try {
      if (mode === 'edit') {
        await updateProduct(id, body);
      } else {
        await createProduct(body);
      }
      navigate('/products');
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(pid, name) {
    if (!window.confirm(`Delete product "${name}"? This action cannot be undone.`)) return;
    setError('');
    try {
      await deleteProduct(pid);
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
            <h1 className="admin-title">Products</h1>
            <p className="admin-subtitle">Product listing and management.</p>
          </div>
          <Link to="/products/new" className="admin-btn-accent">Add Product</Link>
        </div>

        {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

        <div className="admin-table-wrap mt-8">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr>
                <th className="admin-th">ID</th>
                <th className="admin-th">Product</th>
                <th className="admin-th">Price</th>
                <th className="admin-th">Status</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id} className="border-t border-line">
                  <td className="admin-td text-ink/70">{p._id.slice(-6)}</td>
                  <td className="admin-td">
                    <div className="font-medium text-ink">{p.name}</div>
                    <div className="mt-1 text-[12px] text-muted">Category: {p.category?.name || 'Unassigned'} • Stock: {p.stock ?? 0}</div>
                  </td>
                  <td className="admin-td font-medium text-ink">{formatPrice(p.price)}</td>
                  <td className="admin-td text-muted">{p.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="admin-td text-right">
                    <Link to={`/products/${p._id}/edit`} className="mr-2 rounded-md px-2 py-1 text-[13px] font-medium text-ink hover:bg-surface">Edit</Link>
                    <button type="button" onClick={() => onDelete(p._id, p.name)} className="rounded-md px-2 py-1 text-[13px] font-medium text-red-600 hover:bg-red-50">Delete</button>
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
        <h1 className="admin-title">{mode === 'edit' ? 'Edit Product' : 'Add Product'}</h1>
        <Link to="/products" className="admin-btn-secondary">Back to Listing</Link>
      </div>
      {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

      <form onSubmit={onSubmit} className="admin-form-card mt-7 grid gap-4 bg-surface sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="admin-label">Name</label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div>
          <label className="admin-label">Price (USD)</label>
          <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div>
          <label className="admin-label">Image URL</label>
          <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div>
          <label className="admin-label">SKU</label>
          <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div>
          <label className="admin-label">Compare at price</label>
          <input type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div>
          <label className="admin-label">Stock</label>
          <input type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Category</label>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="admin-select mt-1 h-11">
            <option value="" disabled>Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="admin-textarea mt-1" />
        </div>
        <label className="sm:col-span-2 inline-flex items-center gap-2 text-[13px] text-ink">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
          Product is active
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="admin-btn-primary">{mode === 'edit' ? 'Save Changes' : 'Create Product'}</button>
        </div>
      </form>
    </div>
  );
}
