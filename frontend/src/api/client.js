const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function headers(includeAuth = true) {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

export async function api(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...headers(options.auth !== false), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Request failed');
  return data;
}

export const auth = {
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/auth/me'),
  update: (body) => api('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),
};

export const workouts = {
  list: (params = {}) => api('/workouts?' + new URLSearchParams(params).toString()),
  get: (id) => api(`/workouts/${id}`),
  create: (body) => api('/workouts', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/workouts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => api(`/workouts/${id}`, { method: 'DELETE' }),
};

export const nutrition = {
  list: (params = {}) => api('/nutrition?' + new URLSearchParams(params).toString()),
  get: (id) => api(`/nutrition/${id}`),
  create: (body) => api('/nutrition', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/nutrition/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => api(`/nutrition/${id}`, { method: 'DELETE' }),
};

export const progress = {
  list: (params = {}) => api('/progress?' + new URLSearchParams(params).toString()),
  get: (id) => api(`/progress/${id}`),
  create: (body) => api('/progress', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/progress/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => api(`/progress/${id}`, { method: 'DELETE' }),
};

export const dashboard = {
  get: () => api('/dashboard'),
};

export const analytics = {
  workouts: (params = {}) => api('/analytics/workouts?' + new URLSearchParams(params).toString()),
  nutrition: (params = {}) => api('/analytics/nutrition?' + new URLSearchParams(params).toString()),
};

export const notifications = {
  list: () => api('/notifications'),
  markRead: (id) => api(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => api('/notifications/read-all', { method: 'PATCH' }),
  reminders: () => api('/notifications/reminders'),
  createReminder: (body) => api('/notifications/reminders', { method: 'POST', body: JSON.stringify(body) }),
};

export const settings = {
  get: () => api('/settings'),
  update: (body) => api('/settings', { method: 'PUT', body: JSON.stringify(body) }),
};

export function exportReport(params) {
  const q = new URLSearchParams(params).toString();
  return `${API_BASE}/export/report?${q}`;
}
