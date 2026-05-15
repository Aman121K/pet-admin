import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Editor } from 'primereact/editor';
import { createBlog, deleteBlog, fetchBlogs, updateBlog } from './api.js';

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImageUrl: '',
  featuredImageAlt: '',
  authorName: 'Pet Square Team',
  category: 'General',
  tags: '',
  status: 'draft',
  publishedAt: '',
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

export function Blogs() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const mode = id ? 'edit' : location.pathname.endsWith('/new') ? 'new' : 'list';

  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  const editingItem = useMemo(() => items.find((row) => row._id === id), [items, id]);

  useEffect(() => {
    let active = true;
    (async () => {
      setError('');
      try {
        const rows = await fetchBlogs();
        if (!active) return;
        setItems(rows);
      } catch (e) {
        if (!active) return;
        setError(e.message);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (mode === 'new') {
      queueMicrotask(() => setForm(emptyForm));
      return;
    }
    if (mode === 'edit' && editingItem) {
      queueMicrotask(() => {
        setForm({
          title: editingItem.title || '',
          slug: editingItem.slug || '',
          excerpt: editingItem.excerpt || '',
          content: editingItem.content || '',
          featuredImageUrl: editingItem.featuredImageUrl || '',
          featuredImageAlt: editingItem.featuredImageAlt || '',
          authorName: editingItem.authorName || 'Pet Square Team',
          category: editingItem.category || 'General',
          tags: Array.isArray(editingItem.tags) ? editingItem.tags.join(', ') : '',
          status: editingItem.status || 'draft',
          publishedAt: editingItem.publishedAt ? new Date(editingItem.publishedAt).toISOString().slice(0, 16) : '',
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
      });
    }
  }, [mode, editingItem]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const body = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      featuredImageUrl: form.featuredImageUrl.trim(),
      featuredImageAlt: form.featuredImageAlt.trim(),
      authorName: form.authorName.trim(),
      category: form.category.trim(),
      tags: form.tags,
      status: form.status,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
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
      if (mode === 'edit') await updateBlog(id, body);
      else await createBlog(body);
      navigate('/blogs');
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(blogId, title) {
    if (!window.confirm(`Delete blog "${title}"? This action cannot be undone.`)) return;
    setError('');
    try {
      await deleteBlog(blogId);
      const rows = await fetchBlogs();
      setItems(rows);
    } catch (err) {
      setError(err.message);
    }
  }

  if (mode === 'list') {
    return (
      <div className="admin-page">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="admin-title">Blogs</h1>
            <p className="admin-subtitle">WordPress-style blog listing and SEO-friendly publishing flow.</p>
          </div>
          <Link to="/blogs/new" className="admin-btn-accent">Add Blog</Link>
        </div>

        {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

        <div className="admin-table-wrap mt-8">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr>
                <th className="admin-th">Title</th>
                <th className="admin-th">Category</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Published</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id} className="border-t border-line">
                  <td className="admin-td">
                    <div className="font-medium text-ink">{row.title}</div>
                    <div className="mt-1 text-[12px] text-muted">Slug: /blog/{row.slug}</div>
                  </td>
                  <td className="admin-td text-muted">{row.category || 'General'}</td>
                  <td className="admin-td text-muted">{row.status === 'published' ? 'Published' : 'Draft'}</td>
                  <td className="admin-td text-muted">{row.publishedAt ? new Date(row.publishedAt).toLocaleString() : '—'}</td>
                  <td className="admin-td text-right">
                    <Link to={`/blogs/${row._id}/edit`} className="mr-2 rounded-md px-2 py-1 text-[13px] font-medium text-ink hover:bg-surface">Edit</Link>
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
        <h1 className="admin-title">{mode === 'edit' ? 'Edit Blog' : 'Add Blog'}</h1>
        <Link to="/blogs" className="admin-btn-secondary">Back to Listing</Link>
      </div>
      {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

      <form onSubmit={onSubmit} className="admin-form-card mt-7 grid gap-5 bg-surface sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-[13px] font-semibold text-ink">Content</p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Blog Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => {
                const next = { ...f, title };
                if (mode === 'new' && (!f.slug || f.slug === toSlug(f.title))) {
                  next.slug = toSlug(title);
                }
                return next;
              });
            }}
            className="admin-input mt-1 h-11"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Slug (URL)</label>
          <input required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: toSlug(e.target.value) }))} className="admin-input mt-1 h-11" />
          <p className="mt-1 text-[12px] text-muted">Final URL: /blog/{form.slug || 'your-blog-slug'}</p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Excerpt</label>
          <textarea rows={3} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} className="admin-textarea mt-1" />
          <p className="mt-1 text-[12px] text-muted">{form.excerpt.length}/160 recommended</p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Blog Description</label>
          <div className="mt-1 rounded-xl border border-line bg-white p-2">
            <Editor
              value={form.content}
              onTextChange={(e) => setForm((f) => ({ ...f, content: e.htmlValue || '' }))}
              style={{ height: '240px' }}
            />
          </div>
        </div>

        <div className="sm:col-span-2 mt-1">
          <p className="text-[13px] font-semibold text-ink">Media & Publishing</p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Featured Image URL</label>
          <input value={form.featuredImageUrl} onChange={(e) => setForm((f) => ({ ...f, featuredImageUrl: e.target.value }))} className="admin-input mt-1 h-11" placeholder="https://example.com/blog-image.jpg" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Featured Image Alt Text</label>
          <input value={form.featuredImageAlt} onChange={(e) => setForm((f) => ({ ...f, featuredImageAlt: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div>
          <label className="admin-label">Author</label>
          <input value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div>
          <label className="admin-label">Category</label>
          <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Tags (comma separated)</label>
          <input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="admin-input mt-1 h-11" placeholder="pet care, training, nutrition" />
        </div>
        <div>
          <label className="admin-label">Status</label>
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="admin-select mt-1 h-11">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Publish Date</label>
          <input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))} className="admin-input mt-1 h-11" />
        </div>

        <div className="sm:col-span-2 mt-1">
          <p className="text-[13px] font-semibold text-ink">SEO</p>
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
          <input value={form.seoCanonicalUrl} onChange={(e) => setForm((f) => ({ ...f, seoCanonicalUrl: e.target.value }))} className="admin-input mt-1 h-11" placeholder="https://example.com/blog/your-blog-slug" />
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
          <textarea rows={3} value={form.seoOgDescription} onChange={(e) => setForm((f) => ({ ...f, seoOgDescription: e.target.value }))} className="admin-textarea mt-1" />
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

        <div className="sm:col-span-2 flex items-center gap-2">
          <input id="active" type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
          <label htmlFor="active" className="text-[14px] text-ink">Blog is active</label>
        </div>

        <div className="sm:col-span-2">
          <button type="submit" className="admin-btn-primary h-11 px-6">
            {mode === 'edit' ? 'Save Blog' : 'Create Blog'}
          </button>
        </div>
      </form>
    </div>
  );
}
