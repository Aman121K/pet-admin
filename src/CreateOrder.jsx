import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder, fetchAdminProducts, fetchUsers } from './api.js';

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

export function CreateOrder() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const [createItems, setCreateItems] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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

    loadCreateData();
  }, []);

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
      await createOrder(payload);
      setError('');
      navigate('/orders');
    } catch (e2) {
      setError(e2.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="admin-title">Create Order</h1>
          <p className="admin-subtitle">Create a manual order for a customer.</p>
        </div>
        <Link to="/orders" className="admin-btn-secondary">Back to Orders</Link>
      </div>

      {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

      <form onSubmit={submitCreateOrder} className="admin-form-card mt-8 grid gap-4 sm:grid-cols-2">
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
