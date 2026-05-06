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
    <div>
      <h1 className="text-[26px] font-semibold tracking-tight text-ink">Newsletter subscribers</h1>
      <p className="mt-2 text-[14px] text-muted">
        Emails captured from the storefront modal (<code className="text-ink">POST /api/subscribe</code>
        ).
      </p>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </p>
      ) : null}

      <div className="mt-8 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-surface text-[12px] font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={3}>
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-4 py-3 text-ink/80">{r.id}</td>
                  <td className="px-4 py-3 font-medium text-ink">{r.email}</td>
                  <td className="px-4 py-3 text-muted">{r.created_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
