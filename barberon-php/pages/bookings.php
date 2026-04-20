<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';

$base = BASE_URL;
$user = current_user();
if (!$user) {
    header('Location: ' . $base . '/pages/login.php?callbackUrl=' . urlencode($base . '/pages/bookings.php'));
    exit;
}
layout_start('Meus Agendamentos');
?>
<div class="container section">
  <div class="flex items-center justify-between mb-4">
    <h1 style="font-size:1.3rem;font-weight:700">Meus Agendamentos</h1>
    <a href="<?= $base ?>/" class="btn btn-ghost btn-sm">← Início</a>
  </div>

  <div id="tabs" class="flex gap-2 mb-4">
    <button class="btn btn-primary btn-sm" id="tabUpcoming" onclick="showTab('upcoming')">Próximos</button>
    <button class="btn btn-outline btn-sm" id="tabPast"     onclick="showTab('past')">Anteriores</button>
  </div>

  <div id="bookingsLoading" class="spinner"></div>
  <div id="upcomingBookings" class="hidden"></div>
  <div id="pastBookings"     class="hidden"></div>
</div>

<script>
let _allBookings = [];
let _activeTab = 'upcoming';

async function loadBookings() {
  try {
    _allBookings = await api('/api/bookings/index.php');
    renderTab();
  } catch (e) {
    document.getElementById('bookingsLoading').innerHTML =
      `<p class="text-muted text-center">${e.message}</p>`;
  }
}

function showTab(tab) {
  _activeTab = tab;
  document.getElementById('tabUpcoming').className = 'btn btn-sm ' + (tab === 'upcoming' ? 'btn-primary' : 'btn-outline');
  document.getElementById('tabPast').className     = 'btn btn-sm ' + (tab === 'past'     ? 'btn-primary' : 'btn-outline');
  renderTab();
}

function renderTab() {
  document.getElementById('bookingsLoading').classList.add('hidden');
  const now = new Date();
  const upcoming = _allBookings.filter(b => new Date(b.date) >= now);
  const past     = _allBookings.filter(b => new Date(b.date) <  now);

  document.getElementById('upcomingBookings').classList.toggle('hidden', _activeTab !== 'upcoming');
  document.getElementById('pastBookings').classList.toggle('hidden',     _activeTab !== 'past');

  document.getElementById('upcomingBookings').innerHTML = renderList(upcoming, true);
  document.getElementById('pastBookings').innerHTML     = renderList(past, false);
}

function renderList(bookings, showCancel) {
  if (!bookings.length) return '<p class="text-muted text-center">Nenhum agendamento.</p>';
  return bookings.map(b => `
    <div class="booking-item" id="bk-${b.id}">
      <img src="${b.service?.barbershop?.imageUrl || b.barbershopImage || (_BASE + '/public/img/placeholder.png')}" alt="">
      <div class="info">
        <div class="shop-name">${b.service?.barbershop?.name || b.barbershopName || ''}</div>
        <div class="svc-name">${b.service?.name || b.serviceName || ''}</div>
        <div class="date-time">${fmtDate(b.date)}</div>
        ${b.paymentStatus ? `<span class="badge">${b.paymentStatus}</span>` : ''}
      </div>
      ${showCancel ? `<button class="btn btn-danger btn-sm cancel-btn" onclick="cancelBooking('${b.id}')">Cancelar</button>` : ''}
    </div>
  `).join('');
}

async function cancelBooking(id) {
  if (!confirm('Cancelar este agendamento?')) return;
  try {
    await api('/api/bookings/index.php?id=' + id, { method: 'DELETE' });
    _allBookings = _allBookings.filter(b => b.id !== id);
    renderTab();
    toast('Agendamento cancelado', 'success');
  } catch (e) {
    toast(e.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadBookings);
</script>
<?php layout_end(); ?>
