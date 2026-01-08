// API URL helper — uses environment variable for backend in production
// In development (Vite), relative paths route through the proxy (vite.config.js)
// In production, set VITE_API_BASE_URL to your backend domain

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function apiUrl(path) {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  if (API_BASE_URL) {
    return API_BASE_URL + path;
  }
  return path;
}
