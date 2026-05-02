/**
 * Barberon — Main client-side JS
 * Works at root (/) and in any subfolder (/barberon/, etc.)
 * window.BASE_URL is injected by PHP layout.php — e.g. '' or '/barberon'
 */

// ── Base URL ──────────────────────────────────────────────────────────────────
const _BASE = (typeof window !== 'undefined' && window.BASE_URL != null)
  ? window.BASE_URL : '';

// ── Fetch wrapper ─────────────────────────────────────────────────────────────
async function api(url, opts = {}) {
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

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function fmtDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}
function fmtPrice(val) {
  return 'R$ ' + Number(val).toFixed(2).replace('.', ',');
}
function fmtDuration(hhmm) {
  if (!hhmm) return '30 min';
  const [h, m] = hhmm.split(':').map(Number);
  if (h === 0) return m + ' min';
  if (m === 0) return h + 'h';
  return h + 'h ' + m + 'min';
}

// ── Toast ─────────────────────────────────────────────────────────────────────
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

// ── Auth helpers ──────────────────────────────────────────────────────────────
async function authLogout() {
  try { await api('/api/auth/logout.php', { method: 'POST' }); } catch {}
  window.location.href = _BASE + '/';
}

// ── Mobile menu ───────────────────────────────────────────────────────────────
function toggleMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
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
function buildCalendar(containerId, onSelect, selectedDate = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();
  let selected  = selectedDate;

  function render() {
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                        'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const firstDay  = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMo  = new Date(viewYear, viewMonth + 1, 0).getDate();

    let html = `<div class="calendar">
      <div class="cal-header">
        <button class="btn btn-ghost btn-sm" id="calPrev">‹</button>
        <span class="font-semibold">${monthNames[viewMonth]} ${viewYear}</span>
        <button class="btn btn-ghost btn-sm" id="calNext">›</button>
      </div>
      <div class="cal-grid">`;

    ['D','S','T','Q','Q','S','S'].forEach(d => {
      html += `<div class="cal-day-name">${d}</div>`;
    });
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

    container.querySelector('#calPrev').addEventListener('click', () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      render();
    });
    container.querySelector('#calNext').addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      render();
    });
    container.querySelectorAll('.cal-day:not(.disabled):not(.empty)').forEach(el => {
      el.addEventListener('click', () => {
        selected = el.dataset.date;
        render();
        onSelect(selected);
      });
    });
  }

  render();
}

// ══════════════════════════════════════════════════════════════════════════════
// BOOKING FLOW
// ══════════════════════════════════════════════════════════════════════════════

let _bk = {
  serviceId:   null,
  serviceName: null,
  duration:    '00:30',
  price:       0,
  barbershopId: null,
  date:        null,
  time:        null,
};

/** Open modal — called from barbershop page per service */
function openBookingModal(serviceId, serviceName, barbershopId, duration, price) {
  _bk.serviceId    = serviceId;
  _bk.serviceName  = serviceName;
  _bk.barbershopId = barbershopId;
  _bk.duration     = duration || '00:30';
  _bk.price        = price    || 0;
  _bk.date         = null;
  _bk.time         = null;

  // Header
  document.getElementById('modalServiceName').textContent = serviceName;
  document.getElementById('modalServiceMeta').textContent =
    fmtDuration(_bk.duration) + ' · ' + fmtPrice(_bk.price);

  // Show step 1
  _bkShowStep(1);

  // Build calendar (step 1)
  buildCalendar('bookingCalendar', async (date) => {
    _bk.date = date;
    _bk.time = null;
    _bkShowStep(2);
    document.getElementById('bkSelectedDate').textContent = fmtDateShort(date + 'T12:00:00');
    await _bkLoadSlots(date);
  });

  // Open modal
  document.getElementById('bookingModal').classList.add('open');
}

function closeBookingModal() {
  document.getElementById('bookingModal')?.classList.remove('open');
}

function handleModalBackdropClick(e) {
  if (e.target === document.getElementById('bookingModal')) closeBookingModal();
}

function _bkShowStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById('bkStep' + i)?.classList.toggle('hidden', i !== n);
  });
}

function bkBackToDate() {
  _bk.time = null;
  _bkShowStep(1);
}

function bkBackToSlots() {
  _bkShowStep(2);
}

async function _bkLoadSlots(date) {
  const slotEl = document.getElementById('bookingSlots');
  slotEl.innerHTML = '<div class="spinner" style="width:24px;height:24px;border-width:2px;margin:1rem auto"></div>';

  try {
    const data = await api(
      `/api/barbershops/hours.php?barbershopId=${_bk.barbershopId}&date=${date}&serviceId=${_bk.serviceId}`
    );

    if (!data.slots || data.slots.length === 0) {
      const msg = data.message || 'Nenhum horário disponível neste dia.';
      slotEl.innerHTML = `<div class="empty-slots" style="text-align:center;padding:1rem">
        <p class="text-muted" style="margin-bottom:.75rem">${msg}</p>
        <button class="btn btn-ghost btn-sm" onclick="bkBackToDate()">← Escolher outra data</button>
      </div>`;
      return;
    }

    const hasAvailable = data.slots.some(s => s.available);
    if (!hasAvailable) {
      slotEl.innerHTML = `<div class="empty-slots" style="text-align:center;padding:1rem">
        <p class="text-muted" style="margin-bottom:.75rem">Todos os horários deste dia estão ocupados.</p>
        <button class="btn btn-ghost btn-sm" onclick="bkBackToDate()">← Escolher outra data</button>
      </div>`;
      return;
    }

    slotEl.innerHTML = '<div class="slot-grid"></div>';
    const grid = slotEl.querySelector('.slot-grid');

    data.slots.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'slot-btn' + (s.available ? '' : ' booked');
      btn.textContent = s.time;
      btn.disabled = !s.available;
      if (!s.available) btn.title = 'Horário ocupado';

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
    slotEl.innerHTML = `<div class="empty-slots" style="text-align:center;padding:1rem">
      <p class="text-danger" style="margin-bottom:.75rem">${e.message}</p>
      <button class="btn btn-ghost btn-sm" onclick="bkBackToDate()">← Escolher outra data</button>
    </div>`;
  }
}

function _bkFillSummary() {
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const [y, m, d] = (_bk.date || '').split('-');
  const dateStr = d ? `${d} de ${months[parseInt(m)-1]} de ${y}` : _bk.date;

  document.getElementById('bkSumService').textContent  = _bk.serviceName;
  document.getElementById('bkSumDate').textContent     = dateStr;
  document.getElementById('bkSumTime').textContent     = _bk.time;
  document.getElementById('bkSumDuration').textContent = fmtDuration(_bk.duration);
  document.getElementById('bkSumPrice').textContent    = fmtPrice(_bk.price);

  const errEl = document.getElementById('bkConfirmError');
  if (errEl) errEl.classList.add('hidden');
  const btn = document.getElementById('bookingConfirmBtn');
  if (btn) { btn.disabled = false; btn.textContent = 'Confirmar agendamento'; }
}

async function confirmBooking() {
  if (!_bk.date || !_bk.time) return;

  const btn    = document.getElementById('bookingConfirmBtn');
  const errEl  = document.getElementById('bkConfirmError');
  btn.disabled = true;
  btn.textContent = 'Agendando…';
  if (errEl) errEl.classList.add('hidden');

  try {
    await api('/api/bookings/index.php', {
      method: 'POST',
      body: JSON.stringify({
        serviceId: _bk.serviceId,
        date: `${_bk.date} ${_bk.time}:00`,
      }),
    });
    closeBookingModal();
    toast('✅ Agendamento realizado com sucesso!', 'success');
  } catch (e) {
    if (errEl) {
      errEl.textContent = e.message;
      errEl.classList.remove('hidden');
    } else {
      toast(e.message, 'error');
    }
    btn.disabled = false;
    btn.textContent = 'Confirmar agendamento';
  }
}

// ── Quick search ──────────────────────────────────────────────────────────────
function doSearch() {
  const q = document.getElementById('searchInput')?.value.trim();
  if (q) window.location.href = `${_BASE}/pages/barbershops.php?search=${encodeURIComponent(q)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
  document.querySelectorAll('.carousel').forEach(initCarousel);
});
