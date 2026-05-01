/**
 * Barberon Static — API Client
 * All calls go to the PHP backend (API_BASE from config.js).
 * Auth token stored in localStorage as 'bb_token' (set by backend via
 * JSON response on login; sent as Authorization: Bearer header on every request).
 */

const API_BASE = window.BARBERON_CONFIG?.API_BASE || '';

// ── Token storage ────────────────────────────────────────────
const Auth = {
  getToken:  ()    => localStorage.getItem('bb_token'),
  setToken:  (t)   => localStorage.setItem('bb_token', t),
  clearToken:()    => localStorage.removeItem('bb_token'),
  getUser:   ()    => { try { return JSON.parse(localStorage.getItem('bb_user') || 'null'); } catch { return null; } },
  setUser:   (u)   => localStorage.setItem('bb_user', JSON.stringify(u)),
  clearUser: ()    => localStorage.removeItem('bb_user'),
  isLoggedIn:()    => !!localStorage.getItem('bb_token'),
  clear:     ()    => { Auth.clearToken(); Auth.clearUser(); },
};

// ── Core fetch wrapper ────────────────────────────────────────
async function api(path, opts = {}) {
  const url = path.startsWith('http') ? path : API_BASE + path;
  const token = Auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(url, {
    ...opts,
    headers,
    credentials: 'include',          // send cookies too (session fallback)
  });

  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

// ── Auth helpers ──────────────────────────────────────────────
async function apiLogin(email, password) {
  const data = await api('/api/auth/login.php', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) Auth.setToken(data.token);
  if (data.user)  Auth.setUser(data.user);
  return data;
}

async function apiRegister(name, email, password) {
  const data = await api('/api/auth/register.php', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  if (data.token) Auth.setToken(data.token);
  if (data.user)  Auth.setUser(data.user);
  return data;
}

async function apiLogout() {
  try { await api('/api/auth/logout.php', { method: 'POST' }); } catch {}
  Auth.clear();
  window.location.href = ROOT + '/';
}

async function apiMe() {
  const data = await api('/api/auth/me.php');
  if (data) Auth.setUser(data);
  return data;
}

// ── Site root (for relative navigation) ──────────────────────
const ROOT = window.BARBERON_CONFIG?.SITE_BASE || '';

function goTo(path) {
  window.location.href = ROOT + path;
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
