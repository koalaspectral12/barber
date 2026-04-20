/**
 * Barberon — Main client-side JS
 * Works at root (/) and in any subfolder (/barberon/, etc.)
 * window.BASE_URL is injected by PHP layout.php — e.g. '' or '/barberon'
 */

// ── Base URL helper ───────────────────────────────────────────────────────────
// PHP injects window.BASE_URL before this file loads.
// Fallback to '' if somehow missing.
const _BASE = (typeof window !== 'undefined' && window.BASE_URL != null)
  ? window.BASE_URL
  : '';

// ── Utilities ──────────────────────────────────────────────────────────────

/** Show a toast notification */
function toast(msg, type = 'info') {
  const c = document.getElementById('toastContainer') || (() => {
    const d = document.createElement('div');
    d.id = 'toastContainer';
    document.body.appendChild(d);
    return d;
  })();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/**
 * Generic fetch wrapper.
 * Accepts absolute URLs (https://…) and relative paths (/api/…).
 * Relative paths are automatically prefixed with BASE_URL.
 */
async function api(url, opts = {}) {
  // Prefix relative paths with the app base URL
  const fullUrl = url.startsWith('http') ? url : _BASE + url;
  const res = await fetch(fullUrl, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    credentials: 'same-origin',
    ...opts,
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/** Format date to pt-BR */
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Format price (BRL) */
function fmtPrice(val) {
  return 'R$ ' + Number(val).toFixed(2).replace('.', ',');
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

async function authLogout() {
  try { await api('/api/auth/logout.php', { method: 'POST' }); } catch {}
  window.location.href = _BASE + '/';
}

// ── Mobile menu toggle ────────────────────────────────────────────────────────

function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  if (m) m.classList.toggle('open');
}

// ── Banner Carousel ───────────────────────────────────────────────────────────

function initCarousel(el) {
  const track  = el.querySelector('.carousel-track');
  const slides = el.querySelectorAll('.carousel-slide');
  const dotsEl = el.querySelector('.carousel-dots');
  if (!track || !slides.length) return;

  let current = 0;
  const total = slides.length;

  const dots = Array.from({ length: total }, (_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.onclick = () => goTo(i);
    if (dotsEl) dotsEl.appendChild(d);
    return d;
  });

  function goTo(n) {
    current = (n + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  el.querySelector('.carousel-btn.prev')?.addEventListener('click', () => goTo(current - 1));
  el.querySelector('.carousel-btn.next')?.addEventListener('click', () => goTo(current + 1));

  if (total > 1) setInterval(() => goTo(current + 1), 4000);
}

// ── Calendar ──────────────────────────────────────────────────────────────────

function buildCalendar(containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();
  let selected  = null;

  function render() {
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                        'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMo = new Date(viewYear, viewMonth + 1, 0).getDate();

    let html = `<div class="calendar">
      <div class="cal-header">
        <button class="btn btn-ghost btn-sm" id="calPrev">‹</button>
        <span class="font-semibold">${monthNames[viewMonth]} ${viewYear}</span>
        <button class="btn btn-ghost btn-sm" id="calNext">›</button>
      </div>
      <div class="cal-grid">`;
    ['D','S','T','Q','Q','S','S'].forEach(d => { html += `<div class="cal-day-name">${d}</div>`; });
    for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;
    for (let d = 1; d <= daysInMo; d++) {
      const dt  = new Date(viewYear, viewMonth, d);
      const iso = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      let cls   = 'cal-day';
      if (dt < today)                        cls += ' disabled';
      if (dt.getTime() === today.getTime())  cls += ' today';
      if (selected === iso)                  cls += ' selected';
      html += `<div class="${cls}" data-date="${iso}">${d}</div>`;
    }
    html += '</div></div>';
    container.innerHTML = html;
    container.querySelector('#calPrev').addEventListener('click', () => {
      viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } render();
    });
    container.querySelector('#calNext').addEventListener('click', () => {
      viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } render();
    });
    container.querySelectorAll('.cal-day:not(.disabled):not(.empty)').forEach(el => {
      el.addEventListener('click', () => { selected = el.dataset.date; render(); onSelect(selected); });
    });
  }

  render();
}

// ── Booking flow ──────────────────────────────────────────────────────────────

let _selectedServiceId   = null;
let _selectedServiceName = null;
let _selectedDate        = null;
let _selectedTime        = null;
let _barbershopId        = null;

function openBookingModal(serviceId, serviceName, barbershopId) {
  _selectedServiceId   = serviceId;
  _selectedServiceName = serviceName;
  _barbershopId        = barbershopId;
  _selectedDate        = null;
  _selectedTime        = null;

  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  document.getElementById('modalServiceName').textContent = serviceName;
  document.getElementById('bookingSlots').innerHTML = '<p class="text-muted text-sm">Selecione uma data</p>';
  document.getElementById('bookingConfirmBtn').disabled = true;
  modal.classList.add('open');

  buildCalendar('bookingCalendar', async (date) => {
    _selectedDate = date;
    _selectedTime = null;
    document.getElementById('bookingConfirmBtn').disabled = true;
    await loadSlots(date);
  });
}

function closeBookingModal() {
  document.getElementById('bookingModal')?.classList.remove('open');
}

async function loadSlots(date) {
  const slotEl = document.getElementById('bookingSlots');
  slotEl.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0.5rem auto"></div>';
  try {
    const data = await api(`/api/barbershops/hours.php?barbershopId=${_barbershopId}&date=${date}`);
    if (!data.slots || !data.slots.length) {
      slotEl.innerHTML = '<p class="text-muted text-sm">Nenhum horário disponível neste dia</p>';
      return;
    }
    slotEl.innerHTML = '<div class="slot-grid"></div>';
    const grid = slotEl.querySelector('.slot-grid');
    data.slots.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'slot-btn';
      btn.textContent = s.time;
      btn.disabled = !s.available;
      btn.addEventListener('click', () => {
        grid.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        _selectedTime = s.time;
        document.getElementById('bookingConfirmBtn').disabled = false;
      });
      grid.appendChild(btn);
    });
  } catch (e) {
    slotEl.innerHTML = `<p class="text-muted text-sm">${e.message}</p>`;
  }
}

async function confirmBooking() {
  if (!_selectedDate || !_selectedTime) return;
  const btn = document.getElementById('bookingConfirmBtn');
  btn.disabled = true;
  btn.textContent = 'Agendando...';
  try {
    await api('/api/bookings/index.php', {
      method: 'POST',
      body: JSON.stringify({
        serviceId: _selectedServiceId,
        date: `${_selectedDate} ${_selectedTime}:00`,
      }),
    });
    closeBookingModal();
    toast('Agendamento realizado com sucesso!', 'success');
  } catch (e) {
    toast(e.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Confirmar';
  }
}

// ── Quick search ──────────────────────────────────────────────────────────────

function doSearch() {
  const q = document.getElementById('searchInput')?.value.trim();
  if (q) window.location.href = `${_BASE}/pages/barbershops.php?search=${encodeURIComponent(q)}`;
}

document.getElementById('searchInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

// ── On page load ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.carousel').forEach(initCarousel);
});
