/**
 * Barberon Static — Shared utilities
 * Requires: config.js, api.js loaded first
 */

// ── Formatters ────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function fmtDateShort(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}
function fmtPrice(val) {
  return 'R$ ' + Number(val || 0).toFixed(2).replace('.', ',');
}
function fmtDuration(hhmm) {
  if (!hhmm || hhmm === '00:00') return '';
  const [h, m] = hhmm.split(':').map(Number);
  if (h === 0) return m + ' min';
  if (m === 0) return h + 'h';
  return h + 'h ' + m + 'min';
}
function datePtBr(dateStr) {
  if (!dateStr) return '';
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const [y, m, d] = dateStr.split('-');
  return `${d} de ${months[parseInt(m)-1]} de ${y}`;
}

// ── Toast ─────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  let c = document.getElementById('toastContainer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toastContainer';
    document.body.appendChild(c);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Mobile menu ───────────────────────────────────────────────
function toggleMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

// ── Render header nav (dynamic, auth-aware) ───────────────────
function renderNav() {
  const user       = Auth.getUser();
  const isAdmin    = user && ['ADMIN','SUPERADMIN'].includes(user.role);
  const navEl      = document.getElementById('headerNav');
  const mobileEl   = document.getElementById('mobileMenu');
  const base       = ROOT;

  if (!navEl) return;

  if (user) {
    navEl.innerHTML = `
      <a href="${base}/pages/pricing.html" class="btn btn-sm btn-ghost">Planos</a>
      <span class="header-user">${escHtml(user.name || user.email)}</span>
      ${isAdmin ? `<a href="${base}/admin/" class="btn btn-sm btn-outline">Admin</a>` : ''}
      <a href="${base}/pages/bookings.html" class="btn btn-sm btn-ghost">Agendamentos</a>
      <button class="btn btn-sm btn-ghost" onclick="apiLogout()">Sair</button>`;
    if (mobileEl) mobileEl.innerHTML = `
      <span class="mobile-user">${escHtml(user.name || user.email)}</span>
      ${isAdmin ? `<a href="${base}/admin/">Admin</a>` : ''}
      <a href="${base}/pages/bookings.html">Agendamentos</a>
      <a href="${base}/pages/pricing.html">Planos</a>
      <button onclick="apiLogout()">Sair</button>`;
  } else {
    navEl.innerHTML = `
      <a href="${base}/pages/pricing.html" class="btn btn-sm btn-ghost">Planos</a>
      <a href="${base}/pages/login.html" class="btn btn-sm btn-primary">Entrar</a>`;
    if (mobileEl) mobileEl.innerHTML = `
      <a href="${base}/pages/login.html">Entrar</a>
      <a href="${base}/pages/pricing.html">Planos</a>`;
  }
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Carousel ──────────────────────────────────────────────────
function initCarousel(el) {
  const track  = el.querySelector('.carousel-track');
  const slides = el.querySelectorAll('.carousel-slide');
  const dotsEl = el.querySelector('.carousel-dots');
  if (!track || slides.length < 2) return;
  let current = 0;
  const total = slides.length;
  const dots = [];
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.onclick = () => goTo(i);
    dotsEl?.appendChild(d);
    dots.push(d);
  });
  function goTo(n) {
    current = (n + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }
  el.querySelector('.carousel-btn.prev')?.addEventListener('click', () => goTo(current - 1));
  el.querySelector('.carousel-btn.next')?.addEventListener('click', () => goTo(current + 1));
  setInterval(() => goTo(current + 1), 4500);
}

// ── Calendar ──────────────────────────────────────────────────
function buildCalendar(containerId, onSelect, selectedDate = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const today = new Date(); today.setHours(0,0,0,0);
  let viewYear = today.getFullYear(), viewMonth = today.getMonth(), selected = selectedDate;
  const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  function render() {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMo = new Date(viewYear, viewMonth + 1, 0).getDate();
    let html = `<div class="calendar">
      <div class="cal-header">
        <button class="btn btn-ghost btn-sm" id="calPrev">‹</button>
        <span class="font-semibold">${MONTHS[viewMonth]} ${viewYear}</span>
        <button class="btn btn-ghost btn-sm" id="calNext">›</button>
      </div>
      <div class="cal-grid">`;
    ['D','S','T','Q','Q','S','S'].forEach(d => { html += `<div class="cal-day-name">${d}</div>`; });
    for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;
    for (let d = 1; d <= daysInMo; d++) {
      const dt  = new Date(viewYear, viewMonth, d);
      const iso = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      let cls = 'cal-day';
      if (dt < today)                       cls += ' disabled';
      if (dt.getTime() === today.getTime()) cls += ' today';
      if (selected === iso)                 cls += ' selected';
      html += `<div class="${cls}" data-date="${iso}">${d}</div>`;
    }
    html += '</div></div>';
    container.innerHTML = html;
    container.querySelector('#calPrev')?.addEventListener('click', () => { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } render(); });
    container.querySelector('#calNext')?.addEventListener('click', () => { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } render(); });
    container.querySelectorAll('.cal-day:not(.disabled):not(.empty)').forEach(el => {
      el.addEventListener('click', () => { selected = el.dataset.date; render(); onSelect(selected); });
    });
  }
  render();
}

// ══════════════════════════════════════════════════════════════
// BOOKING FLOW
// ══════════════════════════════════════════════════════════════
let _bk = { serviceId:null, serviceName:null, duration:'00:30', price:0, barbershopId:null, date:null, time:null };

function openBookingModal(serviceId, serviceName, barbershopId, duration, price) {
  if (!Auth.isLoggedIn()) {
    goTo(`/pages/login.html?cb=${encodeURIComponent(window.location.href)}`);
    return;
  }
  Object.assign(_bk, { serviceId, serviceName, barbershopId, duration: duration||'00:30', price: price||0, date: null, time: null });
  document.getElementById('modalServiceName').textContent = serviceName;
  document.getElementById('modalServiceMeta').textContent = [fmtDuration(duration), fmtPrice(price)].filter(Boolean).join(' · ');
  _bkShowStep(1);
  buildCalendar('bookingCalendar', async (date) => {
    _bk.date = date; _bk.time = null;
    _bkShowStep(2);
    const el = document.getElementById('bkSelectedDate');
    if (el) el.textContent = fmtDateShort(date + 'T12:00:00');
    await _bkLoadSlots(date);
  });
  document.getElementById('bookingModal').classList.add('open');
}

function closeBookingModal() { document.getElementById('bookingModal')?.classList.remove('open'); }

function _bkShowStep(n) {
  [1,2,3].forEach(i => document.getElementById('bkStep'+i)?.classList.toggle('hidden', i !== n));
}
function bkBackToDate()  { _bk.time = null; _bkShowStep(1); }
function bkBackToSlots() { _bkShowStep(2); }

async function _bkLoadSlots(date) {
  const slotEl = document.getElementById('bookingSlots');
  slotEl.innerHTML = '<div class="spinner spinner-sm" style="margin:1rem auto"></div>';
  try {
    const data = await api(`/api/barbershops/hours.php?barbershopId=${_bk.barbershopId}&date=${date}&serviceId=${_bk.serviceId}`);
    if (!data.slots?.length || !data.slots.some(s => s.available)) {
      slotEl.innerHTML = '<div class="empty-slots">Nenhum horário disponível. Escolha outra data.</div>';
      return;
    }
    slotEl.innerHTML = '<div class="slot-grid"></div>';
    const grid = slotEl.querySelector('.slot-grid');
    data.slots.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'slot-btn' + (s.available ? '' : ' booked');
      btn.textContent = s.time;
      btn.disabled = !s.available;
      btn.addEventListener('click', () => {
        grid.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        _bk.time = s.time;
        _bkFillSummary();
        _bkShowStep(3);
      });
      grid.appendChild(btn);
    });
  } catch (e) {
    slotEl.innerHTML = `<div class="empty-slots text-danger">${e.message}</div>`;
  }
}

function _bkFillSummary() {
  document.getElementById('bkSumService').textContent  = _bk.serviceName;
  document.getElementById('bkSumDate').textContent     = datePtBr(_bk.date);
  document.getElementById('bkSumTime').textContent     = _bk.time;
  document.getElementById('bkSumDuration').textContent = fmtDuration(_bk.duration);
  document.getElementById('bkSumPrice').textContent    = fmtPrice(_bk.price);
  document.getElementById('bkConfirmError')?.classList.add('hidden');
  const btn = document.getElementById('bookingConfirmBtn');
  if (btn) { btn.disabled = false; btn.textContent = 'Confirmar agendamento'; }
}

async function confirmBooking() {
  if (!_bk.date || !_bk.time) return;
  const btn   = document.getElementById('bookingConfirmBtn');
  const errEl = document.getElementById('bkConfirmError');
  btn.disabled = true; btn.textContent = 'Agendando…';
  errEl?.classList.add('hidden');
  try {
    await api('/api/bookings/index.php', {
      method: 'POST',
      body: JSON.stringify({ serviceId: _bk.serviceId, date: `${_bk.date} ${_bk.time}:00` }),
    });
    closeBookingModal();
    toast('✅ Agendamento realizado!', 'success');
  } catch (e) {
    if (errEl) { errEl.textContent = e.message; errEl.classList.remove('hidden'); }
    else toast(e.message, 'error');
    btn.disabled = false; btn.textContent = 'Confirmar agendamento';
  }
}

// ── Quick search ──────────────────────────────────────────────
function doSearch(inputId) {
  const q = document.getElementById(inputId || 'searchInput')?.value.trim();
  if (q) goTo(`/pages/barbershops.html?search=${encodeURIComponent(q)}`);
}

// ── DOMContentLoaded init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  document.getElementById('searchInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  document.querySelectorAll('.carousel').forEach(initCarousel);
});
