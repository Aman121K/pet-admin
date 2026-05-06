import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setToken } from './api.js';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(username, password);
      setToken(data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-[420px] rounded-[12px] border border-line bg-white p-8 shadow-[0_20px_60px_rgba(17,17,17,0.08)]">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">Admin sign in</h1>
        <p className="mt-2 text-[14px] text-muted">
          Default credentials: <span className="text-ink">admin</span> /{' '}
          <span className="text-ink">admin123</span> (change via server env).
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-[13px] font-medium text-ink" htmlFor="user">
              Username
            </label>
            <input
              id="user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-line px-3 text-[14px] outline-none focus:ring-2 focus:ring-ink/15"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-ink" htmlFor="pass">
              Password
            </label>
            <input
              id="pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-line px-3 text-[14px] outline-none focus:ring-2 focus:ring-ink/15"
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-ink text-[14px] font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
