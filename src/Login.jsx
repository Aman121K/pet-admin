import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboard, login, setToken } from './api.js';

const DEMO_ADMIN = {
  username: 'admin@petsquare.local',
  password: 'admin123',
};

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(DEMO_ADMIN.username);
  const [password, setPassword] = useState(DEMO_ADMIN.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingApi, setCheckingApi] = useState(false);
  const [apiPreview, setApiPreview] = useState(null);

  async function fillDemoCredentials() {
    setUsername(DEMO_ADMIN.username);
    setPassword(DEMO_ADMIN.password);
    setError('');
    setApiPreview(null);
    setToken('demo-access');
    navigate('/', { replace: true });
  }

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

  async function onCheckApiDetails() {
    setCheckingApi(true);
    setError('');
    setApiPreview(null);
    try {
      const auth = await login(username, password);
      setToken(auth.token);
      const dashboard = await fetchDashboard();
      setApiPreview({
        admin: auth.admin,
        metrics: dashboard.metrics || {},
      });
    } catch (err) {
      setError(err.message || 'Unable to fetch admin details');
    } finally {
      setCheckingApi(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="admin-card w-full max-w-[440px] p-8">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">Admin sign in</h1>
        <p className="mt-2 text-[14px] text-muted">
          Dummy credentials: <span className="text-ink">{DEMO_ADMIN.username}</span> /{' '}
          <span className="text-ink">{DEMO_ADMIN.password}</span>
        </p>
        <button
          type="button"
          onClick={fillDemoCredentials}
          disabled={loading}
          className="admin-btn-secondary mt-3 h-10 w-full disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Use Dummy Credentials'}
        </button>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-[13px] font-medium text-ink" htmlFor="user">
              Username
            </label>
            <input
              id="user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="admin-input mt-1 h-11"
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
              className="admin-input mt-1 h-11"
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
          <button type="submit" disabled={loading} className="admin-btn-primary h-11 w-full disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            type="button"
            onClick={onCheckApiDetails}
            disabled={checkingApi}
            className="admin-btn-accent h-11 w-full disabled:opacity-60"
          >
            {checkingApi ? 'Checking API…' : 'Check Admin Details (API)'}
          </button>
        </form>

        {apiPreview ? (
          <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3 text-[13px] text-ink">
            <p className="font-medium">API response preview</p>
            <pre className="mt-2 overflow-x-auto text-[12px] text-muted">{JSON.stringify(apiPreview, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
