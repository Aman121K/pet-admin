import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Editor } from 'primereact/editor';
import {
  createProduct,
  fetchCategories,
  deleteProduct,
  fetchAdminProducts,
  uploadProductImages,
  updateProduct,
} from './api.js';

function formatPrice(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const emptyForm = {
  name: '',
  slug: '',
  price: '',
  imageUrl: '',
  gallery: [],
  imageAltText: '',
  description: '',
  sku: '',
  compareAtPrice: '',
  stock: '',
  category: '',
  isActive: true,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  seoCanonicalUrl: '',
  seoOgTitle: '',
  seoOgDescription: '',
  seoOgImageUrl: '',
  seoRobots: 'index,follow',
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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState([]);

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
        slug: editingItem.slug || '',
        price: String(editingItem.price ?? ''),
        imageUrl: editingItem.imageUrl || '',
        gallery: Array.isArray(editingItem.gallery) ? editingItem.gallery : [],
        imageAltText: editingItem.imageAltText || '',
        description: editingItem.description || '',
        sku: editingItem.sku || '',
        compareAtPrice: String(editingItem.compareAtPrice || ''),
        stock: String(editingItem.stock ?? ''),
        category: editingItem.category?._id || editingItem.category || '',
        isActive: editingItem.isActive !== false,
        seoTitle: editingItem.seoTitle || '',
        seoDescription: editingItem.seoDescription || '',
        seoKeywords: editingItem.seoKeywords || '',
        seoCanonicalUrl: editingItem.seoCanonicalUrl || '',
        seoOgTitle: editingItem.seoOgTitle || '',
        seoOgDescription: editingItem.seoOgDescription || '',
        seoOgImageUrl: editingItem.seoOgImageUrl || '',
        seoRobots: editingItem.seoRobots || 'index,follow',
      });
    }
  }, [mode, editingItem, categories]);

  useEffect(() => {
    if (mode !== 'new') return;
    if (!form.slug || form.slug === toSlug(form.name)) {
      setForm((f) => ({ ...f, slug: toSlug(f.name) }));
    }
  }, [form.name, form.slug, mode]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const body = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      price: Number(form.price),
      imageUrl: form.imageUrl.trim(),
      gallery: (form.gallery || []).map((x) => String(x || '').trim()).filter(Boolean),
      imageAltText: form.imageAltText.trim(),
      description: form.description.trim(),
      sku: form.sku.trim(),
      compareAtPrice: Number(form.compareAtPrice || 0),
      stock: Number(form.stock || 0),
      category: form.category,
      isActive: form.isActive,
      seoTitle: form.seoTitle.trim(),
      seoDescription: form.seoDescription.trim(),
      seoKeywords: form.seoKeywords.trim(),
      seoCanonicalUrl: form.seoCanonicalUrl.trim(),
      seoOgTitle: form.seoOgTitle.trim(),
      seoOgDescription: form.seoOgDescription.trim(),
      seoOgImageUrl: form.seoOgImageUrl.trim(),
      seoRobots: form.seoRobots.trim() || 'index,follow',
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

  async function onChooseImages(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const localPreviews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setSelectedImagePreviews(localPreviews);
    setError('');
    setUploadingImages(true);
    try {
      const res = await uploadProductImages(files);
      const urls = (res?.files || []).map((f) => f.url).filter(Boolean);
      setForm((f) => {
        const gallery = [...(f.gallery || []), ...urls];
        return {
          ...f,
          gallery,
          imageUrl: f.imageUrl || gallery[0] || '',
          seoOgImageUrl: f.seoOgImageUrl || gallery[0] || '',
        };
      });
      e.target.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImages(false);
      localPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    }
  }

  function onRemoveGalleryImage(url) {
    setForm((f) => {
      const gallery = (f.gallery || []).filter((img) => img !== url);
      const nextMain = f.imageUrl === url ? (gallery[0] || '') : f.imageUrl;
      return {
        ...f,
        gallery,
        imageUrl: nextMain,
      };
    });
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
                    <div className="mt-1 text-[12px] text-muted">Slug: /products/{p.slug}</div>
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

      <form onSubmit={onSubmit} className="admin-form-card mt-7 grid gap-5 bg-surface sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-[13px] font-semibold text-ink">Content</p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Name</label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Slug (URL)</label>
          <input required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: toSlug(e.target.value) }))} className="admin-input mt-1 h-11" />
          <p className="mt-1 text-[12px] text-muted">Final URL: /products/{form.slug || 'your-product-slug'}</p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Description</label>
          <div className="mt-1 rounded-xl border border-line bg-white p-2">
            <Editor
              value={form.description}
              onTextChange={(e) => setForm((f) => ({ ...f, description: e.htmlValue || '' }))}
              style={{ height: '240px' }}
            />
          </div>
        </div>

        <div className="sm:col-span-2 mt-1">
          <p className="text-[13px] font-semibold text-ink">Pricing & Inventory</p>
        </div>
        <div>
          <label className="admin-label">Price (USD)</label>
          <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div>
          <label className="admin-label">Compare at price</label>
          <input type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div>
          <label className="admin-label">SKU</label>
          <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="admin-input mt-1 h-11" />
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

        <div className="sm:col-span-2 mt-1">
          <p className="text-[13px] font-semibold text-ink">Media</p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Image URL</label>
          <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Upload Product Images</label>
          <input type="file" accept="image/*" multiple onChange={onChooseImages} className="admin-input mt-1 h-auto py-2" />
          <p className="mt-1 text-[12px] text-muted">{uploadingImages ? 'Uploading images to Cloudflare R2...' : 'You can select multiple images. Uploaded image URLs are saved in gallery.'}</p>
        </div>
        {(selectedImagePreviews || []).length ? (
          <div className="sm:col-span-2">
            <label className="admin-label">Selected Images Preview</label>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {selectedImagePreviews.map((item) => (
                <div key={item.url} className="rounded-xl border border-line bg-white p-2">
                  <img src={item.url} alt={item.name} className="h-28 w-full rounded-lg object-cover" />
                  <p className="mt-1 truncate text-[11px] text-muted">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <label className="admin-label">Gallery</label>
          {(form.gallery || []).length ? (
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {form.gallery.map((url) => (
                <div key={url} className="rounded-xl border border-line bg-white p-2">
                  <img src={url} alt="" className="h-28 w-full rounded-lg object-cover" />
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: url }))} className="rounded-md border border-line px-2 py-1 text-[12px]">Set Main</button>
                    <button type="button" onClick={() => onRemoveGalleryImage(url)} className="rounded-md border border-red-200 px-2 py-1 text-[12px] text-red-600">Remove</button>
                  </div>
                  <p className="mt-1 break-all text-[11px] text-muted">{url}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-[12px] text-muted">No uploaded images yet.</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Image ALT text (SEO)</label>
          <input value={form.imageAltText} onChange={(e) => setForm((f) => ({ ...f, imageAltText: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>

        <div className="sm:col-span-2 mt-1">
          <p className="text-[13px] font-semibold text-ink">SEO Settings</p>
          <p className="text-[12px] text-muted">All fields are editable by admin like WordPress SEO plugins.</p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Meta Title</label>
          <input value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} className="admin-input mt-1 h-11" />
          <p className="mt-1 text-[12px] text-muted">{form.seoTitle.length}/60 recommended</p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Meta Description</label>
          <textarea rows={3} value={form.seoDescription} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} className="admin-textarea mt-1" />
          <p className="mt-1 text-[12px] text-muted">{form.seoDescription.length}/160 recommended</p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Keywords (comma separated)</label>
          <input value={form.seoKeywords} onChange={(e) => setForm((f) => ({ ...f, seoKeywords: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Canonical URL (optional override)</label>
          <input value={form.seoCanonicalUrl} onChange={(e) => setForm((f) => ({ ...f, seoCanonicalUrl: e.target.value }))} className="admin-input mt-1 h-11" placeholder="https://example.com/products/your-product-slug" />
        </div>
        <div>
          <label className="admin-label">Open Graph Title</label>
          <input value={form.seoOgTitle} onChange={(e) => setForm((f) => ({ ...f, seoOgTitle: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div>
          <label className="admin-label">Open Graph Image URL</label>
          <input value={form.seoOgImageUrl} onChange={(e) => setForm((f) => ({ ...f, seoOgImageUrl: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Open Graph Description</label>
          <textarea rows={2} value={form.seoOgDescription} onChange={(e) => setForm((f) => ({ ...f, seoOgDescription: e.target.value }))} className="admin-textarea mt-1" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Meta Robots</label>
          <select value={form.seoRobots} onChange={(e) => setForm((f) => ({ ...f, seoRobots: e.target.value }))} className="admin-select mt-1 h-11">
            <option value="index,follow">index,follow</option>
            <option value="noindex,follow">noindex,follow</option>
            <option value="index,nofollow">index,nofollow</option>
            <option value="noindex,nofollow">noindex,nofollow</option>
          </select>
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
