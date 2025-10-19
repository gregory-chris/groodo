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
  const response = await request('/api/tasks', { method: 'GET' });
  console.log('🔍 Raw API response:', response);
  // Handle nested response structure: {result: "success", data: [...]}
  const data = response?.data || response;
  const tasks = Array.isArray(data) ? data : (data?.items || []);
  console.log('📋 Extracted tasks:', tasks);
  return tasks;
}

export async function createTask(task) {
  const response = await request('/api/tasks', { method: 'POST', body: JSON.stringify(task) });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

export async function updateTask(taskId, updates) {
  const response = await request(`/api/task/${encodeURIComponent(taskId)}`, { method: 'PATCH', body: JSON.stringify(updates) });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

export async function deleteTask(taskId) {
  await request(`/api/task/${encodeURIComponent(taskId)}`, { method: 'DELETE' });
}


