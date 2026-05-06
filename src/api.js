const API = import.meta.env.VITE_API_URL || '';

export function token() {
  return localStorage.getItem('pet-admin-token') || '';
}

export function setToken(t) {
  if (t) localStorage.setItem('pet-admin-token', t);
  else localStorage.removeItem('pet-admin-token');
}

export async function login(username, password) {
  const res = await fetch(`${API}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

async function authFetch(path, options = {}) {
  const headers = { ...(options.headers || {}), Authorization: `Bearer ${token()}` };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    setToken('');
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function fetchSubscribers() {
  return authFetch('/api/admin/subscribers');
}

export function fetchAdminProducts() {
  return authFetch('/api/admin/products');
}

export function createProduct(body) {
  return authFetch('/api/admin/products', { method: 'POST', body: JSON.stringify(body) });
}

export function updateProduct(id, body) {
  return authFetch(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteProduct(id) {
  return authFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
}
