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
 * List all documents for the authenticated user
 * @param {Object} options - Query options (parentId)
 * @returns {Promise<Array>} Array of document objects
 */
export async function listDocuments(options = {}) {
  let path = '/api/documents';
  if (options.parentId) {
    path += `?parentId=${encodeURIComponent(options.parentId)}`;
  }
  const response = await request(path, { method: 'GET' });
  // Handle nested response structure: {result: "success", data: [...]}
  const data = response?.data || response;
  const documents = Array.isArray(data) ? data : (data?.items || []);
  return documents;
}

/**
 * Get a single document by ID
 * @param {number|string} documentId - Document ID
 * @returns {Promise<Object>} Document object
 */
export async function getDocument(documentId) {
  const response = await request(`/api/document/${encodeURIComponent(documentId)}`, { method: 'GET' });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

/**
 * Create a new document
 * @param {Object} document - Document data (title, content, parentId, order)
 * @returns {Promise<Object>} Created document object
 */
export async function createDocument(document) {
  const response = await request('/api/documents', { 
    method: 'POST', 
    body: JSON.stringify(document) 
  });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

/**
 * Partially update an existing document
 * @param {number|string} documentId - Document ID
 * @param {Object} updates - Partial document data to update
 * @returns {Promise<Object>} Updated document object
 */
export async function patchDocument(documentId, updates) {
  const response = await request(`/api/document/${encodeURIComponent(documentId)}`, { 
    method: 'PATCH', 
    body: JSON.stringify(updates) 
  });
  // Handle nested response structure: {result: "success", data: {...}}
  return response?.data || response;
}

/**
 * Delete a document
 * @param {number|string} documentId - Document ID
 * @returns {Promise<Object>} Deletion response
 */
export async function deleteDocument(documentId) {
  const response = await request(`/api/document/${encodeURIComponent(documentId)}`, { 
    method: 'DELETE' 
  });
  return response?.data || response;
}
