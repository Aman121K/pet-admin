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
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (options.body && !isFormData && !headers['Content-Type']) {
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

export function uploadProductImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  return authFetch('/api/admin/uploads/products', {
    method: 'POST',
    body: formData,
  });
}

export function fetchSubscribers() {
  return authFetch('/api/admin/subscribers');
}

export function fetchDashboard() {
  return authFetch('/api/admin/dashboard');
}

export function fetchUsers() {
  return authFetch('/api/admin/users');
}

export function fetchUserDetails(id) {
  return authFetch(`/api/admin/users/${id}`);
}

export function updateUserStatus(id, status) {
  return authFetch(`/api/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function fetchAdminProducts() {
  return authFetch('/api/admin/products');
}

export function fetchCategories() {
  return authFetch('/api/admin/categories');
}

export function createCategory(body) {
  return authFetch('/api/admin/categories', { method: 'POST', body: JSON.stringify(body) });
}

export function updateCategory(id, body) {
  return authFetch(`/api/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteCategory(id) {
  return authFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
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

export function fetchOrders() {
  return authFetch('/api/admin/orders');
}

export function fetchOrderById(id) {
  return authFetch(`/api/admin/orders/${id}`);
}

export function updateOrder(id, body) {
  return authFetch(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function fetchDiscounts() {
  return authFetch('/api/admin/discounts');
}

export function createDiscount(body) {
  return authFetch('/api/admin/discounts', { method: 'POST', body: JSON.stringify(body) });
}

export function updateDiscount(id, body) {
  return authFetch(`/api/admin/discounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteDiscount(id) {
  return authFetch(`/api/admin/discounts/${id}`, { method: 'DELETE' });
}

export function fetchBanners() {
  return authFetch('/api/admin/banners');
}

export function createBanner(body) {
  return authFetch('/api/admin/banners', { method: 'POST', body: JSON.stringify(body) });
}

export function updateBanner(id, body) {
  return authFetch(`/api/admin/banners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteBanner(id) {
  return authFetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
}

export function fetchBlogs() {
  return authFetch('/api/admin/blogs');
}

export function createBlog(body) {
  return authFetch('/api/admin/blogs', { method: 'POST', body: JSON.stringify(body) });
}

export function updateBlog(id, body) {
  return authFetch(`/api/admin/blogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function deleteBlog(id) {
  return authFetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
}
