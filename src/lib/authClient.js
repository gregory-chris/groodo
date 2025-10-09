import { getAuthApiUrl } from './config.js';
import { getCookie, setCookie, deleteCookie, touchCookie } from './cookies.js';

const TOKEN_COOKIE_NAME = 'groodo_token';
const SLIDING_SECONDS = 24 * 60 * 60; // 24h

async function request(path, options = {}) {
  const url = getAuthApiUrl(path);
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getCookie(TOKEN_COOKIE_NAME);
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

export async function signIn({ email, password }) {
  const data = await request('/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data?.token) {
    setCookie(TOKEN_COOKIE_NAME, data.token, SLIDING_SECONDS);
  }
  return data;
}

export async function signUp({ email, password, username }) {
  const data = await request('/auth/sign-up', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });
  // Do not set token on sign-up; wait for email confirmation and sign-in
  return data;
}

export async function signOut() {
  try {
    await request('/auth/sign-out', { method: 'POST' });
  } catch {
    // Ignore network errors for sign out
  }
  deleteCookie(TOKEN_COOKIE_NAME);
}

export async function getMe() {
  const data = await request('/auth/me', { method: 'GET' });
  // Sliding expiration on activity
  touchCookie(TOKEN_COOKIE_NAME, SLIDING_SECONDS);
  return data;
}

export function getToken() {
  return getCookie(TOKEN_COOKIE_NAME);
}


