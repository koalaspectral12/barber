<?php // admin/pages/users.php — Clientes (SUPERADMIN only) ?>
<div class="flex items-center justify-between mb-4">
  <h1 class="admin-title" style="margin:0">Clientes</h1>
</div>

<div class="card">
  <div class="table-wrap">
    <table id="usersTable">
      <thead><tr><th>Nome</th><th>Email</th><th>Role</th><th>Agendamentos</th><th>Barbearia</th><th>Ações</th></tr></thead>
      <tbody><tr><td colspan="6" class="text-center text-muted">Carregando…</td></tr></tbody>
    </table>
  </div>
</div>

<!-- Promote Dialog -->
<div class="dialog-backdrop" id="promoteDialog">
  <div class="dialog">
    <h2 class="dialog-title">Promover a Administrador</h2>
    <input type="hidden" id="promoteUserId">
    <p class="text-muted text-sm mb-4" id="promoteUserName"></p>
    <div class="form-group">
      <label class="form-label">Barbearia *</label>
      <select class="form-select" id="promoteShop"></select>
    </div>
    <div class="form-group">
      <label class="form-label">Expira em (opcional)</label>
      <input class="form-input" type="date" id="promoteExpiry">
    </div>
    <div id="promoteError" class="alert alert-danger hidden"></div>
    <div class="dialog-footer">
      <button class="btn btn-ghost" onclick="closeDialog('promoteDialog')">Cancelar</button>
      <button class="btn btn-primary" id="promoteSaveBtn" onclick="doPromote()">Promover</button>
    </div>
  </div>
</div>

<script>
let _users = [];
let _shops = [];

async function loadUsers() {
  try {
    [_users, _shops] = await Promise.all([
      api('/api/admin/users.php'),
      api('/api/admin/barbershops.php').catch(() => []),
    ]);
    const sel = document.getElementById('promoteShop');
    sel.innerHTML = _shops.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    renderUsers();
  } catch (e) {
    document.querySelector('#usersTable tbody').innerHTML = `<tr><td colspan="6">${e.message}</td></tr>`;
  }
}

function renderUsers() {
  const tbody = document.querySelector('#usersTable tbody');
  if (!_users.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center">Nenhum usuário</td></tr>'; return; }
  tbody.innerHTML = _users.map(u => {
    const isAdmin = u.role === 'ADMIN';
    const adminInfo = isAdmin ? (u.barbershopName ? u.barbershopName : '—') + (u.adminExpired ? ' <span class="badge" style="color:red">Expirado</span>' : '') : '—';
    return `<tr>
      <td>${u.name || '—'}</td>
      <td class="text-muted">${u.email}</td>
      <td><span class="badge ${u.role==='SUPERADMIN'?'badge-primary':''}">${u.role}</span></td>
      <td>${u.bookingsCount || 0}</td>
      <td>${adminInfo}</td>
      <td class="flex gap-2">
        ${u.role === 'CUSTOMER' ? `<button class="btn btn-outline btn-sm" onclick="openPromote('${u.id}','${u.name?.replace(/'/g,"\\'")||u.email}')">Promover</button>` : ''}
        ${isAdmin ? `<button class="btn btn-danger btn-sm" onclick="demoteUser('${u.id}')">Remover admin</button>` : ''}
      </td>
    </tr>`;
  }).join('');
}

function openPromote(userId, name) {
  document.getElementById('promoteUserId').value   = userId;
  document.getElementById('promoteUserName').textContent = 'Usuário: ' + name;
  document.getElementById('promoteError').classList.add('hidden');
  document.getElementById('promoteExpiry').value = '';
  openDialog('promoteDialog');
}

async function doPromote() {
  const errEl = document.getElementById('promoteError');
  errEl.classList.add('hidden');
  const userId       = document.getElementById('promoteUserId').value;
  const barbershopId = document.getElementById('promoteShop').value;
  const expiryVal    = document.getElementById('promoteExpiry').value;
  const expiresAt    = expiryVal ? new Date(expiryVal).toISOString() : null;
  const btn = document.getElementById('promoteSaveBtn');
  btn.disabled = true;
  try {
    await api('/api/admin/users.php?action=promote', {
      method: 'POST',
      body: JSON.stringify({ userId, barbershopId, expiresAt }),
    });
    closeDialog('promoteDialog');
    toast('Usuário promovido!', 'success');
    loadUsers();
  } catch (e) {
    errEl.textContent = e.message; errEl.classList.remove('hidden');
  }
  btn.disabled = false;
}

async function demoteUser(userId) {
  if (!confirm('Remover privilégios de admin deste usuário?')) return;
  try {
    await api('/api/admin/users.php?action=demote', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    toast('Admin removido', 'success');
    loadUsers();
  } catch (e) { toast(e.message, 'error'); }
}

loadUsers();
</script>
