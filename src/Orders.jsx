import { useEffect, useMemo, useState } from 'react';
import {
  createOrder,
  deleteOrder,
  fetchAdminProducts,
  fetchOrderById,
  fetchOrders,
  fetchUsers,
  updateOrder,
} from './api.js';

const statusOptions = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentOptions = ['pending', 'paid', 'failed'];

const defaultCreateForm = {
  userId: '',
  status: 'pending',
  paymentStatus: 'pending',
  shippingFee: 0,
  tax: 0,
  discountAmount: 0,
  note: '',
  shippingAddress: {
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  },
};

export function Orders() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const [createItems, setCreateItems] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const data = await fetchOrders();
      setRows(data);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadCreateData() {
    try {
      const [userRows, productRows] = await Promise.all([fetchUsers(), fetchAdminProducts()]);
      setUsers(userRows);
      setProducts(productRows);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
    loadCreateData();
  }, []);

  async function openDetails(id) {
    try {
      setSelected(await fetchOrderById(id));
    } catch (e) {
      setError(e.message);
    }
  }

  async function patchOrder(id, patch) {
    try {
      await updateOrder(id, patch);
      if (selected?._id === id) setSelected(await fetchOrderById(id));
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const selectedProductsTotal = useMemo(() => {
    return createItems.reduce((sum, item) => {
      const product = products.find((p) => p._id === item.productId);
      if (!product) return sum;
      return sum + (Number(product.price || 0) * Number(item.qty || 0));
    }, 0);
  }, [createItems, products]);

  const createTotal = Math.max(
    0,
    selectedProductsTotal
      + Number(createForm.shippingFee || 0)
      + Number(createForm.tax || 0)
      - Number(createForm.discountAmount || 0)
  );

  async function submitCreateOrder(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...createForm,
        shippingFee: Number(createForm.shippingFee || 0),
        tax: Number(createForm.tax || 0),
        discountAmount: Number(createForm.discountAmount || 0),
        items: createItems.map((item) => ({ product: item.productId, qty: Number(item.qty || 0) })),
      };
      const created = await createOrder(payload);
      await load();
      setCreateForm(defaultCreateForm);
      setCreateItems([]);
      await openDetails(created._id);
      setError('');
    } catch (e2) {
      setError(e2.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="admin-page">
      <h1 className="admin-title">Orders</h1>
      <p className="admin-subtitle">Track order lifecycle, update status, and create manual orders.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="admin-chip">Create</span>
        <span className="admin-chip">Read</span>
        <span className="admin-chip">Update</span>
        <span className="admin-chip">Delete</span>
      </div>
      {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="admin-table-wrap">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr>
                <th className="admin-th">Order</th>
                <th className="admin-th">Customer</th>
                <th className="admin-th">Total</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Payment</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row._id}
                  className="cursor-pointer border-t border-line hover:bg-surface/50"
                  onClick={() => openDetails(row._id)}
                >
                  <td className="admin-td font-medium text-ink">{row.orderNo}</td>
                  <td className="admin-td text-muted">{row.user?.name || 'Unknown'}</td>
                  <td className="admin-td text-ink">${Number(row.total || 0).toFixed(2)}</td>
                  <td className="admin-td text-muted">
                    <select
                      value={row.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => patchOrder(row._id, { status: e.target.value })}
                      className="admin-select h-9 min-w-[130px]"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="admin-td text-muted">
                    <select
                      value={row.paymentStatus}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => patchOrder(row._id, { paymentStatus: e.target.value })}
                      className="admin-select h-9 min-w-[110px]"
                    >
                      {paymentOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="admin-td text-right">
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const ok = window.confirm(`Delete order ${row.orderNo}?`);
                        if (!ok) return;
                        try {
                          await deleteOrder(row._id);
                          if (selected?._id === row._id) setSelected(null);
                          await load();
                        } catch (err) {
                          setError(err.message);
                        }
                      }}
                      className="text-[12px] font-medium text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-card p-5">
          {!selected ? (
            <p className="text-[14px] text-muted">Select an order to view details.</p>
          ) : (
            <>
              <h2 className="text-[18px] font-semibold text-ink">{selected.orderNo}</h2>
              <p className="mt-1 text-[13px] text-muted">
                {selected.user?.name} • {selected.shippingAddress?.email}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[12px] font-semibold uppercase tracking-wide text-muted">Order status</label>
                  <select
                    value={selected.status}
                    onChange={(e) => patchOrder(selected._id, { status: e.target.value })}
                    className="admin-select mt-1 h-10"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-semibold uppercase tracking-wide text-muted">Payment status</label>
                  <select
                    value={selected.paymentStatus}
                    onChange={(e) => patchOrder(selected._id, { paymentStatus: e.target.value })}
                    className="admin-select mt-1 h-10"
                  >
                    {paymentOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-5 border-t border-line pt-4">
                <p className="text-[13px] font-semibold text-ink">Items</p>
                <ul className="mt-2 space-y-2">
                  {selected.items.map((item, i) => (
                    <li key={`${item.product}-${i}`} className="text-[13px] text-muted">
                      {item.name} × {item.qty} — ${Number(item.price).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 border-t border-line pt-4 text-[13px] text-muted">
                <p>Subtotal: ${Number(selected.subtotal || 0).toFixed(2)}</p>
                <p>Shipping: ${Number(selected.shippingFee || 0).toFixed(2)}</p>
                <p>Tax: ${Number(selected.tax || 0).toFixed(2)}</p>
                <p className="mt-1 font-semibold text-ink">Total: ${Number(selected.total || 0).toFixed(2)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="admin-section-head">
        <h2 className="text-[20px] font-semibold text-ink">Create Order</h2>
      </div>

      <form onSubmit={submitCreateOrder} className="admin-form-card grid gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">Customer</label>
          <select
            required
            value={createForm.userId}
            onChange={(e) => setCreateForm((f) => ({ ...f, userId: e.target.value }))}
            className="admin-select mt-1"
          >
            <option value="">Select customer</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label">Product</label>
          <div className="mt-1 flex gap-2">
            <select id="new-order-product" className="admin-select">
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.name} (${Number(p.price || 0).toFixed(2)})</option>
              ))}
            </select>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => {
                const select = document.getElementById('new-order-product');
                const productId = select?.value;
                if (!productId) return;
                setCreateItems((prev) => {
                  const existing = prev.find((x) => x.productId === productId);
                  if (existing) {
                    return prev.map((x) => (x.productId === productId ? { ...x, qty: x.qty + 1 } : x));
                  }
                  return [...prev, { productId, qty: 1 }];
                });
                select.value = '';
              }}
            >
              Add
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {createItems.map((item) => {
              const product = products.find((p) => p._id === item.productId);
              if (!product) return null;
              return (
                <div key={item.productId} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                  <p className="text-[13px] text-ink">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => {
                        const qty = Math.max(1, Number(e.target.value || 1));
                        setCreateItems((prev) => prev.map((x) => (x.productId === item.productId ? { ...x, qty } : x)));
                      }}
                      className="admin-input h-8 w-20"
                    />
                    <button
                      type="button"
                      onClick={() => setCreateItems((prev) => prev.filter((x) => x.productId !== item.productId))}
                      className="text-[12px] font-medium text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="admin-label">Order Status</label>
          <select className="admin-select mt-1" value={createForm.status} onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value }))}>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="admin-label">Payment Status</label>
          <select className="admin-select mt-1" value={createForm.paymentStatus} onChange={(e) => setCreateForm((f) => ({ ...f, paymentStatus: e.target.value }))}>
            {paymentOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="admin-label">Shipping Name</label>
          <input required className="admin-input mt-1" value={createForm.shippingAddress.name} onChange={(e) => setCreateForm((f) => ({ ...f, shippingAddress: { ...f.shippingAddress, name: e.target.value } }))} />
        </div>
        <div>
          <label className="admin-label">Shipping Email</label>
          <input required type="email" className="admin-input mt-1" value={createForm.shippingAddress.email} onChange={(e) => setCreateForm((f) => ({ ...f, shippingAddress: { ...f.shippingAddress, email: e.target.value } }))} />
        </div>
        <div>
          <label className="admin-label">Address Line 1</label>
          <input required className="admin-input mt-1" value={createForm.shippingAddress.line1} onChange={(e) => setCreateForm((f) => ({ ...f, shippingAddress: { ...f.shippingAddress, line1: e.target.value } }))} />
        </div>
        <div>
          <label className="admin-label">City</label>
          <input required className="admin-input mt-1" value={createForm.shippingAddress.city} onChange={(e) => setCreateForm((f) => ({ ...f, shippingAddress: { ...f.shippingAddress, city: e.target.value } }))} />
        </div>
        <div>
          <label className="admin-label">ZIP</label>
          <input required className="admin-input mt-1" value={createForm.shippingAddress.zip} onChange={(e) => setCreateForm((f) => ({ ...f, shippingAddress: { ...f.shippingAddress, zip: e.target.value } }))} />
        </div>
        <div>
          <label className="admin-label">Country</label>
          <input required className="admin-input mt-1" value={createForm.shippingAddress.country} onChange={(e) => setCreateForm((f) => ({ ...f, shippingAddress: { ...f.shippingAddress, country: e.target.value } }))} />
        </div>

        <div>
          <label className="admin-label">Shipping Fee</label>
          <input type="number" step="0.01" min="0" className="admin-input mt-1" value={createForm.shippingFee} onChange={(e) => setCreateForm((f) => ({ ...f, shippingFee: e.target.value }))} />
        </div>
        <div>
          <label className="admin-label">Tax</label>
          <input type="number" step="0.01" min="0" className="admin-input mt-1" value={createForm.tax} onChange={(e) => setCreateForm((f) => ({ ...f, tax: e.target.value }))} />
        </div>

        <div>
          <label className="admin-label">Discount Amount</label>
          <input type="number" step="0.01" min="0" className="admin-input mt-1" value={createForm.discountAmount} onChange={(e) => setCreateForm((f) => ({ ...f, discountAmount: e.target.value }))} />
        </div>
        <div>
          <label className="admin-label">Order Note</label>
          <input className="admin-input mt-1" value={createForm.note} onChange={(e) => setCreateForm((f) => ({ ...f, note: e.target.value }))} />
        </div>

        <div className="sm:col-span-2 flex items-center justify-between border-t border-line pt-4">
          <p className="text-[14px] font-semibold text-ink">Estimated total: ${createTotal.toFixed(2)}</p>
          <button type="submit" disabled={creating || !createItems.length} className="admin-btn-accent">
            {creating ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
