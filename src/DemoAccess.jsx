import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, setToken, token as getToken } from './api.js';

const DEMO_ADMIN = {
  username: 'admin@petsquare.local',
  password: 'admin123',
};

export function DemoAccess() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function autoSignIn() {
      if (getToken()) {
        navigate('/dashboard', { replace: true });
        return;
      }
      try {
        const data = await login(DEMO_ADMIN.username, DEMO_ADMIN.password);
        if (!active) return;
        setToken(data.token);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Demo access failed');
      }
    }

    autoSignIn();
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="admin-card w-full max-w-[480px] p-8 text-center">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">Opening Admin Dashboard</h1>
        <p className="mt-2 text-[14px] text-muted">
          Please wait while we create demo access.
        </p>
        {error ? <p className="mt-4 text-[13px] text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
