import { useEffect, useState } from 'react';
import { fetchUserDetails, fetchUsers, updateUserStatus } from './api.js';

export function Users() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setRows(await fetchUsers());
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function showDetails(id) {
    try {
      const details = await fetchUserDetails(id);
      setSelected(details);
    } catch (e) {
      setError(e.message);
    }
  }

  async function onStatus(id, status) {
    try {
      await updateUserStatus(id, status);
      await load();
      if (selected?.user?._id === id) setSelected(await fetchUserDetails(id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="admin-page">
      <h1 className="admin-title">Users</h1>
      <p className="admin-subtitle">Customer records, account status and order history.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="admin-chip">Read</span>
        <span className="admin-chip">Update</span>
        <span className="admin-chip">Status control</span>
      </div>
      {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr,1fr]">
        <div className="admin-table-wrap">
          <table className="w-full text-left text-[14px]">
            <thead >
              <tr>
                <th className="admin-th">Name</th>
                <th className="admin-th">Email</th>
                <th className="admin-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row._id}
                  className="cursor-pointer border-t border-line hover:bg-surface/50"
                  onClick={() => showDetails(row._id)}
                >
                  <td className="admin-td font-medium text-ink">{row.name}</td>
                  <td className="admin-td text-muted">{row.email}</td>
                  <td className="admin-td text-muted">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-card p-5">
          {!selected ? (
            <p className="text-[14px] text-muted">Select a user to inspect details.</p>
          ) : (
            <>
              <h2 className="text-[18px] font-semibold text-ink">{selected.user.name}</h2>
              <p className="mt-1 text-[13px] text-muted">{selected.user.email}</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => onStatus(selected.user._id, 'active')}
                  className="admin-btn-secondary h-9 px-3"
                >
                  Mark active
                </button>
                <button
                  type="button"
                  onClick={() => onStatus(selected.user._id, 'blocked')}
                  className="h-9 rounded-lg border border-red-300 bg-red-50 px-3 text-[13px] font-medium text-red-700 hover:bg-red-100"
                >
                  Block user
                </button>
              </div>
              <div className="mt-6 border-t border-line pt-4">
                <p className="text-[13px] font-semibold text-ink">Recent orders</p>
                <ul className="mt-2 space-y-2">
                  {selected.orders.length === 0 ? (
                    <li className="text-[13px] text-muted">No orders yet.</li>
                  ) : (
                    selected.orders.map((order) => (
                      <li key={order._id} className="text-[13px] text-muted">
                        {order.orderNo} — ${Number(order.total || 0).toFixed(2)} ({order.status})
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
