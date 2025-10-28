// Minimal cookie utilities with sliding expiration for auth tokens

const DEFAULT_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function setCookie(name, value, maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS) {
  if (typeof document === 'undefined') return;
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(value);
  const maxAge = Number.isFinite(maxAgeSeconds) ? Math.max(0, Math.floor(maxAgeSeconds)) : DEFAULT_MAX_AGE_SECONDS;
  document.cookie = `${encodedName}=${encodedValue}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const encodedName = encodeURIComponent(name) + '=';
  const parts = document.cookie.split(';');
  for (let part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(encodedName)) {
      return decodeURIComponent(trimmed.substring(encodedName.length));
    }
  }
  return null;
}

export function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function touchCookie(name, maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS) {
  const current = getCookie(name);
  if (current != null) {
    setCookie(name, current, maxAgeSeconds);
  }
}


