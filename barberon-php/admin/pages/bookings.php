<?php // admin/pages/bookings.php ?>
<h1 class="admin-title">Agendamentos</h1>

<div class="flex gap-2 mb-4">
  <button class="btn btn-primary btn-sm" id="tabAllBtn"    onclick="filterBookings('all')">Todos</button>
  <button class="btn btn-outline btn-sm" id="tabTodayBtn"  onclick="filterBookings('today')">Hoje</button>
  <button class="btn btn-outline btn-sm" id="tabUpcomBtn"  onclick="filterBookings('upcoming')">Próximos</button>
</div>

<div class="card">
  <div class="table-wrap">
    <table id="bookingsTable">
      <thead><tr><th>Cliente</th><th>Serviço</th><th>Barbearia</th><th>Data</th><th>Pagamento</th><th>Ações</th></tr></thead>
      <tbody><tr><td colspan="6" class="text-center text-muted">Carregando…</td></tr></tbody>
    </table>
  </div>
</div>

<script>
let _bookings    = [];
let _activeFilter = 'all';

async function loadBookings() {
  try {
    _bookings = await api('/api/admin/bookings.php');
    renderBookings();
  } catch (e) {
    document.querySelector('#bookingsTable tbody').innerHTML = `<tr><td colspan="6">${e.message}</td></tr>`;
  }
}

function filterBookings(f) {
  _activeFilter = f;
  ['all','today','upcom'].forEach(k => {
    const btn = document.getElementById('tab' + k.charAt(0).toUpperCase() + k.slice(1) + 'Btn');
    if (btn) btn.className = 'btn btn-sm ' + (k === f ? 'btn-primary' : 'btn-outline');
  });
  renderBookings();
}

function renderBookings() {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomor = new Date(today); tomor.setDate(today.getDate() + 1);

  let filtered = _bookings;
  if (_activeFilter === 'today')    filtered = _bookings.filter(b => { const d = new Date(b.date); return d >= today && d < tomor; });
  if (_activeFilter === 'upcoming') filtered = _bookings.filter(b => new Date(b.date) >= now);

  const tbody = document.querySelector('#bookingsTable tbody');
  if (!filtered.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center">Nenhum agendamento</td></tr>'; return; }
  tbody.innerHTML = filtered.map(b => `
    <tr>
      <td>${b.userName || b.userEmail || '—'}</td>
      <td>${b.serviceName || '—'}</td>
      <td>${b.barbershopName || '—'}</td>
      <td>${fmtDate(b.date)}</td>
      <td><span class="badge">${b.paymentStatus || 'pending'}</span></td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="cancelBooking('${b.id}')">Cancelar</button>
      </td>
    </tr>
  `).join('');
}

async function cancelBooking(id) {
  if (!confirm('Cancelar este agendamento?')) return;
  try {
    await api('/api/admin/bookings.php?id=' + id, { method: 'DELETE' });
    _bookings = _bookings.filter(b => b.id !== id);
    renderBookings();
    toast('Agendamento cancelado', 'success');
  } catch (e) { toast(e.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', loadBookings);
</script>
