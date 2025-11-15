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

/**
 * List all projects for the authenticated user
 * @returns {Promise<Array>} Array of project objects
 */
export async function listProjects() {
  const response = await request('/api/projects', { method: 'GET' });
  // Handle nested response structure: {result: "success", data: [...]}
  const data = response?.data || response;
  const projects = Array.isArray(data) ? data : (data?.items || []);
  return projects;
}

/**
 * Get a single project by ID
 * @param {number|string} projectId - Project ID
 * @returns {Promise<Object>} Project object
 */
export async function getProject(projectId) {
  const response = await request(`/api/project/${encodeURIComponent(projectId)}`, { method: 'GET' });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

/**
 * Create a new project
 * @param {Object} project - Project data (name, description, etc.)
 * @returns {Promise<Object>} Created project object
 */
export async function createProject(project) {
  const response = await request('/api/projects', { 
    method: 'POST', 
    body: JSON.stringify(project) 
  });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

/**
 * Update an existing project (full update)
 * @param {number|string} projectId - Project ID
 * @param {Object} updates - Project data to update
 * @returns {Promise<Object>} Updated project object
 */
export async function updateProject(projectId, updates) {
  const response = await request(`/api/project/${encodeURIComponent(projectId)}`, { 
    method: 'PUT', 
    body: JSON.stringify(updates) 
  });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

/**
 * Partially update an existing project
 * @param {number|string} projectId - Project ID
 * @param {Object} updates - Partial project data to update
 * @returns {Promise<Object>} Updated project object
 */
export async function patchProject(projectId, updates) {
  const response = await request(`/api/project/${encodeURIComponent(projectId)}`, { 
    method: 'PATCH', 
    body: JSON.stringify(updates) 
  });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

/**
 * Delete a project
 * @param {number|string} projectId - Project ID
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteProject(projectId) {
  const response = await request(`/api/project/${encodeURIComponent(projectId)}`, { 
    method: 'DELETE' 
  });
  return response?.data || response;
}

/**
 * Get all tasks for a specific project
 * @param {number|string} projectId - Project ID
 * @param {Object} options - Query options (limit, offset)
 * @returns {Promise<Array>} Array of task objects
 */
export async function getProjectTasks(projectId, options = {}) {
  const { limit = 100, offset = 0 } = options;
  const queryParams = new URLSearchParams({ limit, offset });
  const response = await request(
    `/api/project/${encodeURIComponent(projectId)}/tasks?${queryParams}`, 
    { method: 'GET' }
  );
  // Handle nested response structure: {result: "success", data: [...]}
  const data = response?.data || response;
  const tasks = Array.isArray(data) ? data : (data?.items || []);
  return tasks;
}

