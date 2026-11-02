const BASE_URL = import.meta.env.API_URL ?? '';
const TOKEN_KEY = 'vi_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, public: isPublic = false } = {}) {
  const headers = {};
  const token = isPublic ? null : tokenStore.get();

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    const detail = data?.details?.[0]?.message;
    throw new ApiError(detail || data?.message || 'Something went wrong.', response.status, data?.details);
  }

  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body, public: true }),
  login: (body) => request('/auth/login', { method: 'POST', body, public: true }),
  me: () => request('/auth/me'),
  options: () => request('/interviews/options'),
  createInterview: (body) => request('/interviews', { method: 'POST', body }),
  listInterviews: () => request('/interviews'),
  getInterview: (id) => request(`/interviews/${id}`),
  submitAnswer: (id, answer) => request(`/interviews/${id}/answer`, { method: 'POST', body: { answer } }),
};
