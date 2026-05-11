import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { createDiscount, deleteDiscount, fetchDiscounts, updateDiscount } from './api.js';

const emptyForm = {
  code: '',
  type: 'percent',
  value: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  isActive: true,
};

export function Discounts() {
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
      setRows(await fetchDiscounts());
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
        code: editingRow.code || '',
        type: editingRow.type || 'percent',
        value: String(editingRow.value || ''),
        minOrderAmount: String(editingRow.minOrderAmount || ''),
        maxDiscountAmount: String(editingRow.maxDiscountAmount || ''),
        usageLimit: String(editingRow.usageLimit || ''),
        isActive: editingRow.isActive !== false,
      });
    }
  }, [mode, editingRow]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      if (mode === 'edit') await updateDiscount(id, form);
      else await createDiscount(form);
      navigate('/discounts');
    } catch (err) {
      setError(err.message);
    }
  }

  async function onDelete(did, code) {
    if (!window.confirm(`Delete discount code "${code}"?`)) return;
    try {
      await deleteDiscount(did);
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
            <h1 className="admin-title">Discounts</h1>
            <p className="admin-subtitle">Discount code listing and management.</p>
          </div>
          <Link to="/discounts/new" className="admin-btn-accent">Add Discount</Link>
        </div>
        {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

        <div className="admin-table-wrap mt-8">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr>
                <th className="admin-th">Code</th>
                <th className="admin-th">Type</th>
                <th className="admin-th">Value</th>
                <th className="admin-th">Used</th>
                <th className="admin-th">Status</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t border-line">
                  <td className="admin-td font-semibold text-ink">{row.code}</td>
                  <td className="admin-td text-muted">{row.type}</td>
                  <td className="admin-td text-muted">{row.value}</td>
                  <td className="admin-td text-muted">{row.usedCount}/{row.usageLimit || '∞'}</td>
                  <td className="admin-td text-muted">{row.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="admin-td text-right">
                    <Link to={`/discounts/${row._id}/edit`} className="mr-2 rounded-md px-2 py-1 text-[13px] font-medium text-ink hover:bg-surface">Edit</Link>
                    <button type="button" onClick={() => onDelete(row._id, row.code)} className="rounded-md px-2 py-1 text-[13px] font-medium text-red-600 hover:bg-red-50">Delete</button>
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
        <h1 className="admin-title">{mode === 'edit' ? 'Edit Discount' : 'Add Discount'}</h1>
        <Link to="/discounts" className="admin-btn-secondary">Back to Listing</Link>
      </div>
      {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

      <form onSubmit={onSubmit} className="admin-form-card mt-7 grid gap-4 bg-surface sm:grid-cols-2">
        <input placeholder="Code" value={form.code} onChange={(e)=>setForm(f=>({...f,code:e.target.value}))} className="admin-input" />
        <select value={form.type} onChange={(e)=>setForm(f=>({...f,type:e.target.value}))} className="admin-input">
          <option value="percent">Percent</option>
          <option value="fixed">Fixed</option>
        </select>
        <input type="number" step="0.01" placeholder="Value" value={form.value} onChange={(e)=>setForm(f=>({...f,value:e.target.value}))} className="admin-input" />
        <input type="number" step="0.01" placeholder="Min order amount" value={form.minOrderAmount} onChange={(e)=>setForm(f=>({...f,minOrderAmount:e.target.value}))} className="admin-input" />
        <input type="number" step="0.01" placeholder="Max discount amount" value={form.maxDiscountAmount} onChange={(e)=>setForm(f=>({...f,maxDiscountAmount:e.target.value}))} className="admin-input" />
        <input type="number" placeholder="Usage limit" value={form.usageLimit} onChange={(e)=>setForm(f=>({...f,usageLimit:e.target.value}))} className="admin-input" />
        <label className="sm:col-span-2 inline-flex items-center gap-2 text-[13px] text-ink">
          <input type="checkbox" checked={form.isActive} onChange={(e)=>setForm(f=>({...f,isActive:e.target.checked}))} /> Active
        </label>
        <button type="submit" className="admin-btn-primary sm:col-span-2">{mode === 'edit' ? 'Save Discount' : 'Create Discount'}</button>
      </form>
    </div>
  );
}
