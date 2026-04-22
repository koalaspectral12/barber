<?php // admin/pages/bookings.php ?>
<div class="flex items-center justify-between mb-4">
  <h1 class="admin-title" style="margin:0">Agendamentos</h1>
  <button class="btn btn-outline btn-sm" onclick="loadBookings()">↺ Atualizar</button>
</div>

<div class="flex gap-2 mb-4" style="flex-wrap:wrap">
  <button class="btn btn-primary btn-sm"  id="tabAllBtn"    onclick="filterBookings('all')">Todos</button>
  <button class="btn btn-outline btn-sm" id="tabTodayBtn"  onclick="filterBookings('today')">Hoje</button>
  <button class="btn btn-outline btn-sm" id="tabUpcomBtn"  onclick="filterBookings('upcoming')">Próximos</button>
  <button class="btn btn-outline btn-sm" id="tabPastBtn"   onclick="filterBookings('past')">Anteriores</button>
</div>

<div class="card">
  <div class="table-wrap">
    <table id="bookingsTable">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Serviço</th>
          <th>Barbearia</th>
          <th>Data / Hora</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody><tr><td colspan="6" class="text-center text-muted">Carregando…</td></tr></tbody>
    </table>
  </div>
</div>

<!-- ── Notify Dialog ─────────────────────────────────────────────── -->
<div class="dialog-backdrop" id="notifyDialog">
  <div class="dialog" style="max-width:480px">
    <h2 class="dialog-title">🔔 Avisar clientes — horário vago</h2>
    <input type="hidden" id="notifyBookingId">
    <input type="hidden" id="notifyServiceId">
    <input type="hidden" id="notifyBarbershopId">
    <input type="hidden" id="notifyDate">

    <div class="alert alert-info" style="margin-bottom:1rem;font-size:0.85rem">
      Ao confirmar, o sistema marca este horário como disponível e avisa todos os
      clientes com agendamentos futuros nesta barbearia.
    </div>

    <div id="notifySlotInfo" class="bk-summary" style="margin-bottom:1rem">
      <div class="bk-summary-row"><span class="text-muted">Serviço</span><strong id="nSvcName"></strong></div>
      <div class="bk-summary-row"><span class="text-muted">Data/Hora</span><strong id="nDateTime"></strong></div>
      <div class="bk-summary-row"><span class="text-muted">Cliente</span><strong id="nClientName"></strong></div>
    </div>

    <div class="form-group">
      <label class="form-label">Mensagem personalizada (opcional)</label>
      <textarea class="form-textarea" id="notifyMessage" rows="3"
        placeholder="Ex: Horário das 14h de amanhã ficou disponível! Entre em contato para agendar."></textarea>
    </div>

    <div id="notifyResult" class="alert hidden" style="margin-top:0.5rem"></div>

    <div class="dialog-footer">
      <button class="btn btn-ghost" onclick="closeDialog('notifyDialog')">Fechar</button>
      <button class="btn btn-primary" id="notifySendBtn" onclick="sendNotify()">🔔 Enviar aviso</button>
    </div>
  </div>
</div>

<style>
.bk-summary { background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden; }
.bk-summary-row { display:flex;justify-content:space-between;align-items:center;padding:.55rem .85rem;font-size:.85rem;border-bottom:1px solid var(--border); }
.bk-summary-row:last-child { border-bottom:none; }
.bk-summary-row span { color:var(--text-muted); }
.btn-notify { background:rgba(245,158,11,.15);color:var(--primary);border-color:rgba(245,158,11,.4); }
.btn-notify:hover { background:rgba(245,158,11,.25); }
</style>

<script>
let _bookings     = [];
let _activeFilter = 'all';

// ── Load ──────────────────────────────────────────────────────────────────────
async function loadBookings() {
  document.querySelector('#bookingsTable tbody').innerHTML =
    '<tr><td colspan="6" class="text-center text-muted">Carregando…</td></tr>';
  try {
    _bookings = await api('/api/admin/bookings.php');
    renderBookings();
  } catch (e) {
    document.querySelector('#bookingsTable tbody').innerHTML =
      `<tr><td colspan="6" class="text-center" style="color:var(--danger)">${e.message}</td></tr>`;
  }
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
function filterBookings(f) {
  _activeFilter = f;
  document.querySelectorAll('[id^="tab"][id$="Btn"]').forEach(btn => {
    btn.className = 'btn btn-sm btn-outline';
  });
  const active = document.getElementById('tab' + f.charAt(0).toUpperCase() + f.slice(1) + 'Btn');
  if (active) active.className = 'btn btn-sm btn-primary';
  renderBookings();
}

// ── Render table ──────────────────────────────────────────────────────────────
function renderBookings() {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomor = new Date(today); tomor.setDate(today.getDate() + 1);

  let list = _bookings;
  if (_activeFilter === 'today')    list = _bookings.filter(b => { const d = new Date(b.date); return d >= today && d < tomor; });
  if (_activeFilter === 'upcoming') list = _bookings.filter(b => new Date(b.date) >= now);
  if (_activeFilter === 'past')     list = _bookings.filter(b => new Date(b.date) < now);

  const tbody = document.querySelector('#bookingsTable tbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center" style="padding:2rem">Nenhum agendamento</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(b => {
    const isFuture  = new Date(b.date) >= now;
    const statusCls = b.paymentStatus === 'paid' ? 'badge-primary' : '';
    return `
    <tr>
      <td>
        <strong>${b.userName || '—'}</strong>
        <div class="text-xs text-muted">${b.userEmail || ''}</div>
      </td>
      <td>
        ${b.serviceName || '—'}
        ${b.duration ? `<div class="text-xs text-muted">🕐 ${fmtDuration(b.duration)}</div>` : ''}
      </td>
      <td class="text-muted">${b.barbershopName || '—'}</td>
      <td>
        <strong>${fmtTimeOnly(b.date)}</strong>
        <div class="text-xs text-muted">${fmtDateOnly(b.date)}</div>
      </td>
      <td>
        <span class="badge ${statusCls}">${translateStatus(b.paymentStatus)}</span>
      </td>
      <td>
        <div class="flex gap-2" style="flex-wrap:wrap">
          ${isFuture ? `
            <button class="btn btn-notify btn-sm"
              onclick="openNotifyDialog('${b.id}','${b.serviceId}','${b.barbershopId}',
                '${b.date}','${(b.serviceName||'').replace(/'/g,"\\'")}',
                '${(b.userName||b.userEmail||'').replace(/'/g,"\\'")}')">
              🔔 Avisar
            </button>
            <button class="btn btn-danger btn-sm" onclick="cancelBooking('${b.id}')">Cancelar</button>
          ` : `
            <span class="text-muted text-xs">Concluído</span>
          `}
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTimeOnly(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function fmtDateOnly(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDuration(hhmm) {
  if (!hhmm) return '30min';
  const [h,m] = hhmm.split(':').map(Number);
  if (h === 0) return m + 'min';
  if (m === 0) return h + 'h';
  return h + 'h ' + m + 'min';
}
function translateStatus(s) {
  return { pending:'Pendente', paid:'Pago', cancelled:'Cancelado', local:'Presencial' }[s] || s || 'Pendente';
}

// ── Cancel booking ────────────────────────────────────────────────────────────
async function cancelBooking(id) {
  if (!confirm('Cancelar este agendamento?\n\nO horário ficará disponível novamente.')) return;
  try {
    await api('/api/admin/bookings.php?id=' + id, { method: 'DELETE' });
    _bookings = _bookings.filter(b => b.id !== id);
    renderBookings();
    toast('Agendamento cancelado', 'success');
  } catch (e) { toast(e.message, 'error'); }
}

// ── Notify flow ───────────────────────────────────────────────────────────────
function openNotifyDialog(bookingId, serviceId, barbershopId, date, serviceName, clientName) {
  document.getElementById('notifyBookingId').value    = bookingId;
  document.getElementById('notifyServiceId').value    = serviceId;
  document.getElementById('notifyBarbershopId').value = barbershopId;
  document.getElementById('notifyDate').value         = date;
  document.getElementById('nSvcName').textContent     = serviceName;
  document.getElementById('nDateTime').textContent    = fmtDateOnly(date) + ' às ' + fmtTimeOnly(date);
  document.getElementById('nClientName').textContent  = clientName;
  document.getElementById('notifyMessage').value      = '';
  document.getElementById('notifyResult').className   = 'alert hidden';
  document.getElementById('notifySendBtn').disabled   = false;
  document.getElementById('notifySendBtn').textContent = '🔔 Enviar aviso';
  openDialog('notifyDialog');
}

async function sendNotify() {
  const btn     = document.getElementById('notifySendBtn');
  const resultEl = document.getElementById('notifyResult');
  btn.disabled  = true;
  btn.textContent = 'Enviando…';
  resultEl.className = 'alert hidden';

  try {
    const res = await api('/api/admin/notify.php', {
      method: 'POST',
      body: JSON.stringify({
        barbershopId: document.getElementById('notifyBarbershopId').value,
        serviceId:    document.getElementById('notifyServiceId').value,
        date:         document.getElementById('notifyDate').value,
        message:      document.getElementById('notifyMessage').value.trim() || null,
      }),
    });

    resultEl.className   = 'alert alert-success';
    resultEl.textContent = res.message || 'Aviso enviado!';
    btn.textContent      = '✅ Enviado';

    // Ask if admin also wants to cancel the booking now
    setTimeout(() => {
      const bookingId = document.getElementById('notifyBookingId').value;
      if (bookingId && confirm('Deseja também cancelar o agendamento atual para liberar o horário?')) {
        cancelBooking(bookingId);
        closeDialog('notifyDialog');
      }
    }, 800);
  } catch (e) {
    resultEl.className   = 'alert alert-danger';
    resultEl.textContent = e.message;
    btn.disabled         = false;
    btn.textContent      = '🔔 Enviar aviso';
  }
}

document.addEventListener('DOMContentLoaded', loadBookings);
</script>
