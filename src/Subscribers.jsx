import { useEffect, useState } from 'react';
import { fetchSubscribers } from './api.js';

export function Subscribers() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscribers()
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="admin-page">
      <h1 className="admin-title">Newsletter Subscribers</h1>
      <p className="admin-subtitle">
        Emails captured from the storefront modal (<code className="text-ink">POST /api/subscribe</code>
        ).
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="admin-chip">Read</span>
        <span className="admin-chip">List management</span>
      </div>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </p>
      ) : null}

      <div className="admin-table-wrap mt-8">
        <table className="w-full text-left text-[14px]">
          <thead >
            <tr>
              <th className="admin-th">ID</th>
              <th className="admin-th">Email</th>
              <th className="admin-th">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="admin-td text-muted" colSpan={3}>
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="border-t border-line">
                  <td className="admin-td text-ink/80">{r._id.slice(-6)}</td>
                  <td className="admin-td font-medium text-ink">{r.email}</td>
                  <td className="admin-td text-muted">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
