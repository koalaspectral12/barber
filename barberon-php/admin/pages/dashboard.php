<?php // admin/pages/dashboard.php ?>
<h1 class="admin-title">Dashboard</h1>

<div id="statsGrid" class="stats-grid">
  <div class="stat-card"><div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto"></div></div>
</div>

<div class="card mt-4">
  <div class="card-body">
    <p class="section-title">Agendamentos recentes</p>
    <div class="table-wrap">
      <table id="recentTable">
        <thead><tr><th>Cliente</th><th>Serviço</th><th>Barbearia</th><th>Data</th><th>Status</th></tr></thead>
        <tbody><tr><td colspan="5" class="text-center text-muted">Carregando…</td></tr></tbody>
      </table>
    </div>
  </div>
</div>

<script>
(async () => {
  try {
    const s = await api('/api/admin/stats.php');
    const grid = document.getElementById('statsGrid');
    const cards = [
      ['Barbearias',    s.totalBarbershops, '🏪'],
      ['Serviços',      s.totalServices,    '💈'],
      ['Agendamentos',  s.totalBookings,    '📅'],
      ['Clientes',      s.totalUsers,       '👤'],
      ['Barbeiros',     s.totalBarbers,     '✂️'],
      ['Próximos',      s.upcomingBookings, '⏰'],
    ];
    if (s.isSuperAdmin) cards.push(['Admins', s.totalAdmins, '👥']);
    grid.innerHTML = cards.map(([l,v,i]) => `
      <div class="stat-card">
        <div class="stat-value">${i} ${v}</div>
        <div class="stat-label">${l}</div>
      </div>
    `).join('');

    const tbody = document.querySelector('#recentTable tbody');
    if (!s.recentBookings?.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted text-center">Nenhum agendamento</td></tr>';
      return;
    }
    tbody.innerHTML = s.recentBookings.map(b => `
      <tr>
        <td>${b.userName || b.userEmail || '—'}</td>
        <td>${b.serviceName || '—'}</td>
        <td>${b.barbershopName || '—'}</td>
        <td>${fmtDate(b.date)}</td>
        <td><span class="badge">${b.paymentStatus || 'pending'}</span></td>
      </tr>
    `).join('');
  } catch (e) {
    document.getElementById('statsGrid').innerHTML = `<p class="text-muted">${e.message}</p>`;
  }
})();
</script>
