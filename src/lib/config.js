// Centralized configuration with sensible defaults for local/prod
// Reads Vite env vars when available

/**
 * Get the current protocol (http or https) from the browser
 * @returns {string} The protocol ('http:' or 'https:')
 */
function getCurrentProtocol() {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.protocol;
  }
  return 'https:'; // Default to https if not in browser
}

/**
 * Get the API host with the same scheme as the current app
 * @returns {string} The API host URL
 */
function getApiHost() {
  // Check for environment variable override
  const envHost = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_AUTH_API_HOST);
  
  if (envHost) {
    // If env var is set, use it but update the protocol to match current page
    const protocol = getCurrentProtocol();
    // Replace the protocol in the env host URL
    return envHost.replace(/^https?:/, protocol);
  }
  
  // Auto-detect based on environment
  const isProduction = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD;
  const protocol = getCurrentProtocol();
  
  if (isProduction) {
    // In production, use groodo-api.greq.me with current protocol
    return `${protocol}//groodo-api.greq.me`;
  } else {
    // In development, use localhost
    return 'http://localhost:8000';
  }
}

export const AUTH_API_HOST = getApiHost();

export function getAuthApiUrl(path) {
  const base = getApiHost().replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}


