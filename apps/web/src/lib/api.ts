const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('accessToken');
    if (stored) {
      headers['Authorization'] = `Bearer ${stored}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  signup: (data: { email: string; name: string; password: string }) =>
    apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () => apiFetch('/auth/me'),

  // Projects
  getProjects: () => apiFetch('/projects'),

  getProject: (id: string) => apiFetch(`/projects/${id}`),

  createProject: (data: { name: string; domain: string; sitemapUrl?: string }) =>
    apiFetch('/projects', { method: 'POST', body: JSON.stringify(data) }),

  updateProject: (id: string, data: any) =>
    apiFetch(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Scans
  freeScan: (url: string) =>
    apiFetch('/free-scan', { method: 'POST', body: JSON.stringify({ url }) }),

  createScan: (projectId: string, url: string, type?: string) =>
    apiFetch(`/projects/${projectId}/scans`, {
      method: 'POST',
      body: JSON.stringify({ url, type }),
    }),

  getScan: (scanId: string) => apiFetch(`/scans/${scanId}`),

  getScanIssues: (scanId: string) => apiFetch(`/scans/${scanId}/issues`),

  getIssueDetail: (issueGroupId: string) => apiFetch(`/issues/${issueGroupId}`),

  updateIssueStatus: (issueGroupId: string, status: string) =>
    apiFetch(`/issues/${issueGroupId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  wakeWorkers: () =>
    apiFetch('/wake-workers', { method: 'POST' }),
};
