import { getAuthApiUrl } from './config.js';
import { getToken } from './authClient.js';

async function request(path, options = {}) {
  const url = getAuthApiUrl(path);
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) {
    const message = (body && (body.error || body.message)) || `HTTP ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return body;
}

export async function listTasks() {
  const data = await request('/tasks', { method: 'GET' });
  return Array.isArray(data) ? data : (data?.items || []);
}

export async function createTask(task) {
  const data = await request('/tasks', { method: 'POST', body: JSON.stringify(task) });
  return data;
}

export async function updateTask(taskId, updates) {
  const data = await request(`/tasks/${encodeURIComponent(taskId)}`, { method: 'PATCH', body: JSON.stringify(updates) });
  return data;
}

export async function deleteTask(taskId) {
  await request(`/tasks/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
}


