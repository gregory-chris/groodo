import { getAuthApiUrl } from './config.js';
import { getToken } from './authClient.js';
import { touchCookie } from './cookies.js';

const TOKEN_COOKIE_NAME = 'groodo_token';
const SLIDING_SECONDS = 7 * 24 * 60 * 60; // 7 days

async function request(path, options = {}) {
  const url = getAuthApiUrl(path);
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : await res.text();
  
  // Extend token expiration on successful API calls
  if (res.ok && token) {
    touchCookie(TOKEN_COOKIE_NAME, SLIDING_SECONDS);
  }
  
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

// Project CRUD operations
export async function listProjects() {
  const response = await request('/api/projects', { method: 'GET' });
  console.log('🔍 Raw projects API response:', response);
  // Handle nested response structure: {result: "success", data: [...]}
  const data = response?.data || response;
  const projects = Array.isArray(data) ? data : (data?.items || []);
  console.log('📋 Extracted projects:', projects);
  return projects;
}

export async function createProject(project) {
  const response = await request('/api/projects', { method: 'POST', body: JSON.stringify(project) });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

export async function getProject(projectId) {
  const response = await request(`/api/project/${encodeURIComponent(projectId)}`, { method: 'GET' });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

export async function updateProject(projectId, updates) {
  const response = await request(`/api/project/${encodeURIComponent(projectId)}`, { method: 'PUT', body: JSON.stringify(updates) });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

export async function deleteProject(projectId) {
  await request(`/api/project/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
}

// Project-specific task operations
export async function listProjectTasks(projectId) {
  const response = await request(`/api/project/${encodeURIComponent(projectId)}/tasks`, { method: 'GET' });
  console.log('🔍 Raw project tasks API response:', response);
  // Handle nested response structure: {result: "success", data: [...]}
  const data = response?.data || response;
  const tasks = Array.isArray(data) ? data : (data?.items || []);
  console.log('📋 Extracted project tasks:', tasks);
  return tasks;
}


