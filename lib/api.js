export const API = process.env.NEXT_PUBLIC_API_URL || 'https://real-state-backend-two.vercel.app';
export const mediaUrl = (u) => (!u ? '' : u.startsWith('http') || u.startsWith('/') && !u.startsWith('/uploads') ? u : API + u);

export async function getContent() {
  const r = await fetch(API + '/api/public/content', { cache: 'no-store' });
  if (!r.ok) throw new Error('Could not load site content');
  return r.json();
}

export async function getPlots() {
  const r = await fetch(API + '/api/public/plots', { cache: 'no-store' });
  if (!r.ok) throw new Error('Could not load plots');
  return r.json();
}

export async function getConstruction() {
  const r = await fetch(API + '/api/public/construction', { cache: 'no-store' });
  if (!r.ok) throw new Error('Could not load construction progress');
  return r.json();
}

// Admin requests (browser only). Token lives in localStorage; 401 sends you back to login.
export async function adm(path, { method = 'GET', body, form } = {}) {
  const token = localStorage.getItem('vp_token');
  const res = await fetch(API + '/api/admin' + path, {
    method,
    headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  if (res.status === 401) {
    localStorage.removeItem('vp_token');
    window.location.href = '/admin/login';
    throw new Error('Signed out');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export async function uploadFile(file, replaceName) {
  const form = new FormData();
  form.append('file', file);
  return adm(replaceName ? `/media/${replaceName}` : '/media', { method: replaceName ? 'PUT' : 'POST', form });
}
