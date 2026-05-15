import { useEffect, useState } from 'react';
import { fetchPageByName, fetchPages, updatePageByName } from './api.js';

export function Pages() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadPages() {
    try {
      const data = await fetchPages();
      setRows(data);
      setError('');
      if (data.length && !selected) {
        setSelected(data[0].name);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadPage(name) {
    if (!name) return;
    setLoading(true);
    try {
      const data = await fetchPageByName(name);
      setContent(data.content || '');
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    loadPage(selected);
  }, [selected]);

  async function onSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await updatePageByName(selected, { content });
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <h1 className="admin-title">Pages</h1>
      <p className="admin-subtitle">Access and edit all frontend page files from the admin panel.</p>
      {error ? <p className="mt-3 text-[13px] text-red-600">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[300px,1fr]">
        <div className="admin-card p-4">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">Frontend Pages</p>
          <div className="mt-3 space-y-2">
            {rows.map((row) => (
              <button
                key={row.name}
                type="button"
                onClick={() => setSelected(row.name)}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-left transition',
                  selected === row.name ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:bg-surface',
                ].join(' ')}
              >
                <p className="text-[13px] font-medium">{row.name}</p>
                <p className={selected === row.name ? 'text-[11px] text-white/70' : 'text-[11px] text-muted'}>{row.route}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-form-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">Editor</p>
              <p className="text-[14px] text-ink">{selected || 'Select a page'}</p>
            </div>
            <button type="button" onClick={onSave} disabled={!selected || saving} className="admin-btn-primary">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="admin-textarea mt-4 min-h-[560px] font-mono text-[12px]"
            placeholder={loading ? 'Loading...' : 'Select a page to edit its source'}
            disabled={!selected || loading}
          />
        </div>
      </div>
    </div>
  );
}
