export async function fetchProfile() {
  const res = await fetch('/api/profile');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function adminRequest(path, options = {}) {
  const token = localStorage.getItem('portfolio-admin-token');
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) localStorage.removeItem('portfolio-admin-token');
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return body;
}
