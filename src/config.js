// Centralized configuration

export const API_BASE_URL = 'https://polybitesbackend-production.up.railway.app';
//export const API_BASE_URL = 'http://localhost:5000';

// Frontend URL (for password reset redirects, etc.)
export const FRONTEND_URL = 'https://www.polybites.org/';
//export const FRONTEND_URL = 'http://localhost:3000';

// Helper to build API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

