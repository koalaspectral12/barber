<?php // admin/pages/services.php ?>
<div class="flex items-center justify-between mb-4">
  <h1 class="admin-title" style="margin:0">Serviços</h1>
  <button class="btn btn-primary btn-sm" onclick="openSvcDialog()">+ Novo serviço</button>
</div>

<div class="card">
  <div class="table-wrap">
    <table id="svcsTable">
      <thead><tr><th>Nome</th><th>Barbearia</th><th>Preço</th><th>Ações</th></tr></thead>
      <tbody><tr><td colspan="4" class="text-center text-muted">Carregando…</td></tr></tbody>
    </table>
  </div>
</div>

<!-- Dialog -->
<div class="dialog-backdrop" id="svcDialog">
  <div class="dialog">
    <h2 class="dialog-title" id="svcDialogTitle">Novo serviço</h2>
    <input type="hidden" id="svcId">
    <div class="form-group"><label class="form-label">Nome *</label><input class="form-input" id="svcName"></div>
    <div class="form-group"><label class="form-label">Descrição *</label><textarea class="form-textarea" id="svcDesc"></textarea></div>
    <div class="form-group"><label class="form-label">Preço (R$) *</label><input class="form-input" type="number" step="0.01" id="svcPrice"></div>
    <div class="form-group"><label class="form-label">URL da imagem *</label><input class="form-input" id="svcImg" placeholder="https://…"></div>
    <div class="form-group" id="svcShopGroup">
      <label class="form-label">Barbearia *</label>
      <select class="form-select" id="svcShop"></select>
    </div>
    <div id="svcError" class="alert alert-danger hidden"></div>
    <div class="dialog-footer">
      <button class="btn btn-ghost" onclick="closeDialog('svcDialog')">Cancelar</button>
      <button class="btn btn-primary" id="svcSaveBtn" onclick="saveSvc()">Salvar</button>
    </div>
  </div>
</div>

<script>
let _svcs  = [];
let _shops = [];

async function loadSvcs() {
  try {
    [_svcs, _shops] = await Promise.all([
      api('/api/admin/services.php'),
      api('/api/admin/barbershops.php').catch(() => []),
    ]);
    renderSvcs();
    // Populate shop select
    const sel = document.getElementById('svcShop');
    sel.innerHTML = _shops.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    if (_shops.length <= 1) document.getElementById('svcShopGroup').style.display = 'none';
  } catch (e) {
    document.querySelector('#svcsTable tbody').innerHTML = `<tr><td colspan="4">${e.message}</td></tr>`;
  }
}

function renderSvcs() {
  const tbody = document.querySelector('#svcsTable tbody');
  if (!_svcs.length) { tbody.innerHTML = '<tr><td colspan="4" class="text-muted text-center">Nenhum serviço</td></tr>'; return; }
  tbody.innerHTML = _svcs.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td class="text-muted">${s.barbershopName || '—'}</td>
      <td>${fmtPrice(s.price)}</td>
      <td class="flex gap-2">
        <button class="btn btn-outline btn-sm" onclick="editSvc('${s.id}')">Editar</button>
        <button class="btn btn-danger btn-sm"  onclick="deleteSvc('${s.id}', '${s.name.replace(/'/g,"\\'")}')">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function openSvcDialog(svc = null) {
  document.getElementById('svcId').value    = svc?.id || '';
  document.getElementById('svcName').value  = svc?.name || '';
  document.getElementById('svcDesc').value  = svc?.description || '';
  document.getElementById('svcPrice').value = svc?.price || '';
  document.getElementById('svcImg').value   = svc?.imageUrl || '';
  if (svc?.barbershopId) document.getElementById('svcShop').value = svc.barbershopId;
  document.getElementById('svcDialogTitle').textContent = svc ? 'Editar serviço' : 'Novo serviço';
  document.getElementById('svcError').classList.add('hidden');
  openDialog('svcDialog');
}

function editSvc(id) {
  const svc = _svcs.find(s => s.id === id);
  if (svc) openSvcDialog(svc);
}

async function saveSvc() {
  const errEl = document.getElementById('svcError');
  errEl.classList.add('hidden');
  const id  = document.getElementById('svcId').value;
  const data = {
    name:         document.getElementById('svcName').value.trim(),
    description:  document.getElementById('svcDesc').value.trim(),
    price:        parseFloat(document.getElementById('svcPrice').value),
    imageUrl:     document.getElementById('svcImg').value.trim(),
    barbershopId: document.getElementById('svcShop').value,
  };
  const btn = document.getElementById('svcSaveBtn');
  btn.disabled = true;
  try {
    if (id) {
      await api('/api/admin/services.php?id=' + id, { method: 'PUT', body: JSON.stringify(data) });
    } else {
      await api('/api/admin/services.php', { method: 'POST', body: JSON.stringify(data) });
    }
    closeDialog('svcDialog');
    toast(id ? 'Serviço atualizado' : 'Serviço criado', 'success');
    loadSvcs();
  } catch (e) {
    errEl.textContent = e.message; errEl.classList.remove('hidden');
  }
  btn.disabled = false;
}

async function deleteSvc(id, name) {
  if (!confirm(`Excluir "${name}"?`)) return;
  try {
    await api('/api/admin/services.php?id=' + id, { method: 'DELETE' });
    toast('Serviço excluído', 'success');
    loadSvcs();
  } catch (e) { toast(e.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', loadSvcs);
</script>
