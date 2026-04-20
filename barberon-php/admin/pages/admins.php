<?php // admin/pages/admins.php — list and manage admins (SUPERADMIN) ?>
<div class="flex items-center justify-between mb-4">
  <h1 class="admin-title" style="margin:0">Administradores</h1>
</div>

<div class="card">
  <div class="table-wrap">
    <table id="adminsTable">
      <thead><tr><th>Nome</th><th>Email</th><th>Barbearia</th><th>Expira em</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody><tr><td colspan="6" class="text-center text-muted">Carregando…</td></tr></tbody>
    </table>
  </div>
</div>

<script>
async function loadAdmins() {
  try {
    const users = await api('/api/admin/users.php');
    const admins = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN');
    const tbody = document.querySelector('#adminsTable tbody');
    if (!admins.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center">Nenhum administrador</td></tr>';
      return;
    }
    tbody.innerHTML = admins.map(u => `
      <tr>
        <td>${u.name || '—'}</td>
        <td class="text-muted">${u.email}</td>
        <td>${u.barbershopName || '—'}</td>
        <td class="text-muted">${u.expiresAt ? new Date(u.expiresAt).toLocaleDateString('pt-BR') : 'Sem expiração'}</td>
        <td>
          <span class="badge ${u.adminExpired ? '' : 'badge-primary'}">
            ${u.role === 'SUPERADMIN' ? 'Superadmin' : (u.adminExpired ? 'Expirado' : (u.adminActive ? 'Ativo' : 'Inativo'))}
          </span>
        </td>
        <td>
          ${u.role === 'ADMIN' ? `<button class="btn btn-danger btn-sm" onclick="demoteAdmin('${u.id}')">Remover</button>` : ''}
        </td>
      </tr>
    `).join('');
  } catch (e) {
    document.querySelector('#adminsTable tbody').innerHTML = `<tr><td colspan="6">${e.message}</td></tr>`;
  }
}

async function demoteAdmin(userId) {
  if (!confirm('Remover privilégios deste admin?')) return;
  try {
    await api('/api/admin/users.php?action=demote', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    toast('Admin removido', 'success');
    loadAdmins();
  } catch (e) { toast(e.message, 'error'); }
}

loadAdmins();
</script>
