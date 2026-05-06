import { useEffect, useState } from 'react';
import {
  createProduct,
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
  image_url: '',
  description: '',
};

export function Products() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setError('');
    try {
      const data = await fetchAdminProducts();
      setItems(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      image_url: p.image_url || '',
      description: p.description || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const body = {
      name: form.name.trim(),
      price: Number(form.price),
      image_url: form.image_url.trim(),
      description: form.description.trim(),
    };
    try {
      if (editingId) {
        await updateProduct(editingId, body);
      } else {
        await createProduct(body);
      }
      cancelEdit();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    setError('');
    try {
      await deleteProduct(id);
      if (editingId === id) cancelEdit();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-[26px] font-semibold tracking-tight text-ink">Products</h1>
      <p className="mt-2 text-[14px] text-muted">
        Changes sync to the public shop immediately via the API.
      </p>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="mt-8 grid gap-4 rounded-lg border border-line bg-surface p-6 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <h2 className="text-[16px] font-semibold text-ink">
            {editingId ? `Edit product #${editingId}` : 'Add product'}
          </h2>
        </div>
        <div className="sm:col-span-2">
          <label className="text-[13px] font-medium text-ink">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-[14px] outline-none focus:ring-2 focus:ring-ink/15"
          />
        </div>
        <div>
          <label className="text-[13px] font-medium text-ink">Price (USD)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-[14px] outline-none focus:ring-2 focus:ring-ink/15"
          />
        </div>
        <div>
          <label className="text-[13px] font-medium text-ink">Image URL</label>
          <input
            value={form.image_url}
            onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
            className="mt-1 h-11 w-full rounded-lg border border-line bg-white px-3 text-[14px] outline-none focus:ring-2 focus:ring-ink/15"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[13px] font-medium text-ink">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-ink/15"
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button
            type="submit"
            className="h-10 rounded-lg bg-ink px-5 text-[14px] font-semibold text-white"
          >
            {editingId ? 'Save changes' : 'Create product'}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="h-10 rounded-lg border border-line bg-white px-5 text-[14px] font-medium text-ink"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-10 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-surface text-[12px] font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-3 text-ink/70">{p.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{p.name}</div>
                  <div className="mt-1 line-clamp-2 text-[13px] text-muted">{p.description}</div>
                </td>
                <td className="px-4 py-3 font-medium text-ink">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
                    className="mr-2 rounded-md px-2 py-1 text-[13px] font-medium text-ink hover:bg-surface"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(p.id)}
                    className="rounded-md px-2 py-1 text-[13px] font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
