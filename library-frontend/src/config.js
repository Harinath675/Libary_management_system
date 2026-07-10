const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const BASE_URL_NO_SLASH = BASE_URL.replace(/\/$/, '');

export const SERVER_URL = BASE_URL_NO_SLASH;
export const API = `${BASE_URL_NO_SLASH}/api`;
