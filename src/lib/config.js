// Centralized configuration with sensible defaults for local/prod
// Reads Vite env vars when available

export const AUTH_API_HOST =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AUTH_API_HOST) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD
    ? 'https://groodo-api.greq.me'
    : 'http://localhost:8000');

export function getAuthApiUrl(path) {
  const base = AUTH_API_HOST?.replace(/\/$/, '') || '';
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}


