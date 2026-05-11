import { useEffect, useState } from 'react';
import { fetchOrderById, fetchOrders, updateOrder } from './api.js';

const statusOptions = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentOptions = ['pending', 'paid', 'failed'];

export function Orders() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setRows(await fetchOrders());
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
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

  return (
    <div className="admin-page">
      <h1 className="admin-title">Orders</h1>
      <p className="admin-subtitle">
        Track order lifecycle, payment state and customer details.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="admin-chip">Read</span>
        <span className="admin-chip">Update</span>
        <span className="admin-chip">Lifecycle control</span>
      </div>
      {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr,1fr]">
        <div className="admin-table-wrap">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr>
                <th className="admin-th">Order</th>
                <th className="admin-th">Customer</th>
                <th className="admin-th">Total</th>
                <th className="admin-th">Status</th>
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
                  <td className="admin-td text-muted">{row.status}</td>
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
    </div>
  );
}
