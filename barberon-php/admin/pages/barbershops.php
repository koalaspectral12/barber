<?php // admin/pages/barbershops.php ?>
<div class="flex items-center justify-between mb-4">
  <h1 class="admin-title" style="margin:0">Barbearias</h1>
  <button class="btn btn-primary btn-sm" onclick="openShopDialog()">+ Nova barbearia</button>
</div>

<div class="card">
  <div class="table-wrap">
    <table id="shopsTable">
      <thead><tr><th>Nome</th><th>Endereço</th><th>Serviços</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody><tr><td colspan="5" class="text-center text-muted">Carregando…</td></tr></tbody>
    </table>
  </div>
</div>

<!-- Dialog -->
<div class="dialog-backdrop" id="shopDialog">
  <div class="dialog">
    <h2 class="dialog-title" id="shopDialogTitle">Nova barbearia</h2>
    <input type="hidden" id="shopId">
    <div class="form-group"><label class="form-label">Nome *</label><input class="form-input" id="shopName"></div>
    <div class="form-group"><label class="form-label">Endereço *</label><input class="form-input" id="shopAddress"></div>
    <div class="form-group"><label class="form-label">Descrição *</label><textarea class="form-textarea" id="shopDesc"></textarea></div>
    <div class="form-group"><label class="form-label">URL da imagem *</label><input class="form-input" id="shopImg" placeholder="https://…"></div>
    <div class="form-group"><label class="form-label">Telefones (um por linha)</label><textarea class="form-textarea" id="shopPhones" rows="3" placeholder="+55 11 99999-0000"></textarea></div>
    <div id="shopError" class="alert alert-danger hidden"></div>
    <div class="dialog-footer">
      <button class="btn btn-ghost" onclick="closeDialog('shopDialog')">Cancelar</button>
      <button class="btn btn-primary" id="shopSaveBtn" onclick="saveShop()">Salvar</button>
    </div>
  </div>
</div>

<script>
let _shops = [];

async function loadShops() {
  try {
    _shops = await api('/api/admin/barbershops.php');
    renderShops();
  } catch (e) {
    document.querySelector('#shopsTable tbody').innerHTML = `<tr><td colspan="5">${e.message}</td></tr>`;
  }
}

function renderShops() {
  const tbody = document.querySelector('#shopsTable tbody');
  if (!_shops.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-muted text-center">Nenhuma barbearia</td></tr>'; return; }
  tbody.innerHTML = _shops.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td class="text-muted">${s.address}</td>
      <td>${s.servicesCount || 0}</td>
      <td><span class="badge ${s.active ? 'badge-primary' : ''}">${s.active ? 'Ativa' : 'Inativa'}</span></td>
      <td class="flex gap-2">
        <button class="btn btn-outline btn-sm" onclick="editShop('${s.id}')">Editar</button>
        <button class="btn btn-danger btn-sm"  onclick="deleteShop('${s.id}', '${s.name.replace(/'/g,"\\'")}')">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function openShopDialog(shop = null) {
  document.getElementById('shopId').value      = shop?.id || '';
  document.getElementById('shopName').value    = shop?.name || '';
  document.getElementById('shopAddress').value = shop?.address || '';
  document.getElementById('shopDesc').value    = shop?.description || '';
  document.getElementById('shopImg').value     = shop?.imageUrl || '';
  document.getElementById('shopPhones').value  = (shop?.phones || []).join('\n');
  document.getElementById('shopDialogTitle').textContent = shop ? 'Editar barbearia' : 'Nova barbearia';
  document.getElementById('shopError').classList.add('hidden');
  openDialog('shopDialog');
}

function editShop(id) {
  const shop = _shops.find(s => s.id === id);
  if (shop) openShopDialog(shop);
}

async function saveShop() {
  const errEl = document.getElementById('shopError');
  errEl.classList.add('hidden');
  const id     = document.getElementById('shopId').value;
  const phones = document.getElementById('shopPhones').value.split('\n').map(p => p.trim()).filter(Boolean);
  const data = {
    name: document.getElementById('shopName').value.trim(),
    address: document.getElementById('shopAddress').value.trim(),
    description: document.getElementById('shopDesc').value.trim(),
    imageUrl: document.getElementById('shopImg').value.trim(),
    phones,
  };
  const btn = document.getElementById('shopSaveBtn');
  btn.disabled = true;
  try {
    if (id) {
      await api('/api/admin/barbershops.php?id=' + id, { method: 'PUT', body: JSON.stringify(data) });
    } else {
      await api('/api/admin/barbershops.php', { method: 'POST', body: JSON.stringify(data) });
    }
    closeDialog('shopDialog');
    toast(id ? 'Barbearia atualizada' : 'Barbearia criada', 'success');
    loadShops();
  } catch (e) {
    errEl.textContent = e.message; errEl.classList.remove('hidden');
  }
  btn.disabled = false;
}

async function deleteShop(id, name) {
  if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return;
  try {
    await api('/api/admin/barbershops.php?id=' + id, { method: 'DELETE' });
    toast('Barbearia excluída', 'success');
    loadShops();
  } catch (e) { toast(e.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', loadShops);
</script>
