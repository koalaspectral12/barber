<?php // admin/pages/services.php ?>
<div class="flex items-center justify-between mb-4">
  <h1 class="admin-title" style="margin:0">Serviços</h1>
  <button class="btn btn-primary btn-sm" onclick="openSvcDialog()">+ Novo serviço</button>
</div>

<div class="card">
  <div class="table-wrap">
    <table id="svcsTable">
      <thead><tr><th>Nome</th><th>Barbearia</th><th>Duração</th><th>Preço</th><th>Ações</th></tr></thead>
      <tbody><tr><td colspan="5" class="text-center text-muted">Carregando…</td></tr></tbody>
    </table>
  </div>
</div>

<!-- Dialog -->
<div class="dialog-backdrop" id="svcDialog">
  <div class="dialog" style="max-width:520px">
    <h2 class="dialog-title" id="svcDialogTitle">Novo serviço</h2>
    <input type="hidden" id="svcId">
    <div class="form-group">
      <label class="form-label">Nome *</label>
      <input class="form-input" id="svcName" placeholder="Ex: Corte masculino">
    </div>
    <div class="form-group">
      <label class="form-label">Descrição *</label>
      <textarea class="form-textarea" id="svcDesc" placeholder="Descreva o serviço…"></textarea>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div class="form-group">
        <label class="form-label">Preço (R$) *</label>
        <input class="form-input" type="number" step="0.01" min="0" id="svcPrice" placeholder="25.00">
      </div>
      <div class="form-group">
        <label class="form-label">Duração * <span style="color:var(--text-muted);font-weight:400">(HH:MM)</span></label>
        <input class="form-input" id="svcDuration" placeholder="00:30" maxlength="5"
               pattern="\d{2}:\d{2}" title="Formato HH:MM (ex: 00:30, 01:00, 01:30)"
               oninput="formatDurationInput(this)">
        <div class="form-error hidden" id="svcDurationError">Use o formato HH:MM (ex: 00:30)</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
          <button type="button" class="duration-preset" onclick="setDuration('00:15')">15min</button>
          <button type="button" class="duration-preset" onclick="setDuration('00:30')">30min</button>
          <button type="button" class="duration-preset" onclick="setDuration('00:45')">45min</button>
          <button type="button" class="duration-preset" onclick="setDuration('01:00')">1h</button>
          <button type="button" class="duration-preset" onclick="setDuration('01:30')">1h30</button>
          <button type="button" class="duration-preset" onclick="setDuration('02:00')">2h</button>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">URL da imagem *</label>
      <input class="form-input" id="svcImg" placeholder="https://…">
    </div>
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

<style>
.duration-preset {
  padding: 2px 8px; font-size: 0.72rem; border-radius: 999px;
  border: 1px solid var(--border); background: var(--bg); color: var(--text-muted);
  cursor: pointer; transition: background .15s, color .15s;
}
.duration-preset:hover { background: var(--primary); color: #000; border-color: var(--primary); }
</style>

<script>
let _svcs  = [];
let _shops = [];

// ── Duration input helpers ────────────────────────────────────────────────────
function formatDurationInput(el) {
  let v = el.value.replace(/[^0-9:]/g, '');
  // Auto-insert colon after 2 digits
  if (v.length === 2 && !v.includes(':')) v = v + ':';
  if (v.length > 5) v = v.slice(0, 5);
  el.value = v;
  validateDuration();
}

function setDuration(val) {
  document.getElementById('svcDuration').value = val;
  validateDuration();
}

function validateDuration() {
  const v   = document.getElementById('svcDuration').value;
  const err = document.getElementById('svcDurationError');
  const ok  = /^\d{2}:\d{2}$/.test(v);
  err.classList.toggle('hidden', ok || !v);
  return ok || !v;
}

// ── Load services ─────────────────────────────────────────────────────────────
async function loadSvcs() {
  try {
    [_svcs, _shops] = await Promise.all([
      api('/api/admin/services.php'),
      api('/api/admin/barbershops.php').catch(() => []),
    ]);
    renderSvcs();
    const sel = document.getElementById('svcShop');
    sel.innerHTML = _shops.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    if (_shops.length <= 1) document.getElementById('svcShopGroup').style.display = 'none';
  } catch (e) {
    document.querySelector('#svcsTable tbody').innerHTML = `<tr><td colspan="5">${e.message}</td></tr>`;
  }
}

function renderSvcs() {
  const tbody = document.querySelector('#svcsTable tbody');
  if (!_svcs.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted text-center">Nenhum serviço</td></tr>';
    return;
  }
  tbody.innerHTML = _svcs.map(s => `
    <tr>
      <td><strong>${s.name}</strong><br><span class="text-xs text-muted">${s.description?.slice(0,50) || ''}</span></td>
      <td class="text-muted">${s.barbershopName || '—'}</td>
      <td><span class="badge">${s.duration || '00:30'}</span></td>
      <td>${fmtPrice(s.price)}</td>
      <td class="flex gap-2">
        <button class="btn btn-outline btn-sm" onclick="editSvc('${s.id}')">Editar</button>
        <button class="btn btn-danger btn-sm"  onclick="deleteSvc('${s.id}', '${s.name.replace(/'/g,"\\'")}')">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function openSvcDialog(svc = null) {
  document.getElementById('svcId').value       = svc?.id || '';
  document.getElementById('svcName').value     = svc?.name || '';
  document.getElementById('svcDesc').value     = svc?.description || '';
  document.getElementById('svcPrice').value    = svc?.price || '';
  document.getElementById('svcDuration').value = svc?.duration || '00:30';
  document.getElementById('svcImg').value      = svc?.imageUrl || '';
  if (svc?.barbershopId) document.getElementById('svcShop').value = svc.barbershopId;
  document.getElementById('svcDialogTitle').textContent = svc ? 'Editar serviço' : 'Novo serviço';
  document.getElementById('svcError').classList.add('hidden');
  document.getElementById('svcDurationError').classList.add('hidden');
  openDialog('svcDialog');
}

function editSvc(id) {
  const svc = _svcs.find(s => s.id === id);
  if (svc) openSvcDialog(svc);
}

async function saveSvc() {
  const errEl = document.getElementById('svcError');
  errEl.classList.add('hidden');

  const duration = document.getElementById('svcDuration').value.trim() || '00:30';
  if (!/^\d{2}:\d{2}$/.test(duration)) {
    errEl.textContent = 'Duração inválida. Use o formato HH:MM (ex: 00:30, 01:00)';
    errEl.classList.remove('hidden');
    return;
  }

  const id   = document.getElementById('svcId').value;
  const data = {
    name:         document.getElementById('svcName').value.trim(),
    description:  document.getElementById('svcDesc').value.trim(),
    price:        parseFloat(document.getElementById('svcPrice').value),
    imageUrl:     document.getElementById('svcImg').value.trim(),
    duration,
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
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
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
