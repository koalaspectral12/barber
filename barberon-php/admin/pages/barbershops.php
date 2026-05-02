<?php // admin/pages/barbershops.php ?>
<div class="flex items-center justify-between mb-4">
  <h1 class="admin-title" style="margin:0">Barbearias</h1>
  <button class="btn btn-primary btn-sm" onclick="openShopDialog()">+ Nova barbearia</button>
</div>

<div class="card">
  <div class="table-wrap">
    <table id="shopsTable">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Slug / Link amigável</th>
          <th>Serviços</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody><tr><td colspan="5" class="text-center text-muted">Carregando…</td></tr></tbody>
    </table>
  </div>
</div>

<!-- Dialog -->
<div class="dialog-backdrop" id="shopDialog">
  <div class="dialog" style="max-width:580px">
    <h2 class="dialog-title" id="shopDialogTitle">Nova barbearia</h2>
    <input type="hidden" id="shopId">
    <div class="form-group">
      <label class="form-label">Nome *</label>
      <input class="form-input" id="shopName" placeholder="Barbearia do João">
    </div>
    <div class="form-group">
      <label class="form-label">Endereço</label>
      <input class="form-input" id="shopAddress" placeholder="Rua, número, bairro, cidade">
    </div>
    <div class="form-group">
      <label class="form-label">Descrição</label>
      <textarea class="form-textarea" id="shopDesc"></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">URL da imagem</label>
      <input class="form-input" id="shopImg" placeholder="https://…">
    </div>
    <div class="form-group">
      <label class="form-label">Telefones (separados por vírgula)</label>
      <input class="form-input" id="shopPhones" placeholder="(11) 99999-9999, (11) 3333-4444">
    </div>
    <div class="form-group">
      <label class="form-label">🔗 Slug (link amigável)</label>
      <input class="form-input" id="shopSlug" placeholder="nome-da-barbearia" pattern="[a-z0-9\-]+"
             title="Apenas letras minúsculas, números e hífens" oninput="updateSlugPreview()">
      <p class="text-muted" style="font-size:.75rem;margin-top:.25rem" id="shopSlugPreview">Link: —</p>
    </div>
    <div class="form-group">
      <label class="form-label">🌐 Domínio/Subdomínio customizado (opcional)</label>
      <input class="form-input" id="shopDomain" placeholder="luiz.barberon.shop">
      <p class="text-muted" style="font-size:.75rem;margin-top:.25rem">Configure o DNS apontando para o servidor antes de ativar.</p>
    </div>
    <div class="form-group">
      <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
        <input type="checkbox" id="shopActive" checked style="accent-color:var(--primary)">
        Ativo
      </label>
    </div>
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
    document.querySelector('#shopsTable tbody').innerHTML =
      `<tr><td colspan="5" class="text-danger text-center">${e.message}</td></tr>`;
  }
}

function renderShops() {
  const tbody = document.querySelector('#shopsTable tbody');
  if (!_shops.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted text-center">Nenhuma barbearia</td></tr>';
    return;
  }
  tbody.innerHTML = _shops.map(s => {
    const slugLink = s.slug
      ? `<a href="${escHtml(BASE_URL)}/b/${escHtml(s.slug)}.html" target="_blank"
            class="badge badge-primary" title="Abrir link amigável">/${escHtml(s.slug)}</a>`
      : `<span class="text-muted" style="font-size:.75rem">Não definido</span>`;
    return `<tr>
      <td>
        <strong>${escHtml(s.name)}</strong>
        ${s.customDomain ? `<br><span style="font-size:.75rem;color:var(--text-muted)">🌐 ${escHtml(s.customDomain)}</span>` : ''}
      </td>
      <td>${slugLink}</td>
      <td>${s.servicesCount || 0}</td>
      <td><span class="badge ${s.active ? 'badge-primary' : ''}">${s.active ? 'Ativa' : 'Inativa'}</span></td>
      <td class="flex gap-2">
        <button class="btn btn-outline btn-sm" onclick="editShop('${s.id}')">Editar</button>
        <button class="btn ${s.active ? 'btn-danger' : 'btn-outline'} btn-sm"
                onclick="toggleShop('${s.id}', ${!s.active})">${s.active ? 'Desativar' : 'Ativar'}</button>
      </td>
    </tr>`;
  }).join('');
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function updateSlugPreview() {
  const v = document.getElementById('shopSlug').value.trim();
  const base = (typeof BASE_URL !== 'undefined' ? BASE_URL : '').replace(/\/$/, '');
  document.getElementById('shopSlugPreview').textContent = v ? `Link: ${base}/b/${v}.html` : 'Link: —';
}

function openShopDialog(shop = null) {
  const errEl = document.getElementById('shopError');
  errEl.classList.add('hidden');

  document.getElementById('shopId').value      = shop?.id || '';
  document.getElementById('shopName').value    = shop?.name || '';
  document.getElementById('shopAddress').value = shop?.address || '';
  document.getElementById('shopDesc').value    = shop?.description || '';
  document.getElementById('shopImg').value     = shop?.imageUrl || '';
  document.getElementById('shopSlug').value    = shop?.slug || '';
  document.getElementById('shopDomain').value  = shop?.customDomain || '';
  document.getElementById('shopActive').checked = shop ? !!shop.active : true;

  // Phones — stored as array or JSON string
  let phones = shop?.phones || [];
  if (!Array.isArray(phones)) { try { phones = JSON.parse(phones); } catch { phones = []; } }
  document.getElementById('shopPhones').value = phones.join(', ');

  document.getElementById('shopDialogTitle').textContent = shop ? 'Editar barbearia' : 'Nova barbearia';

  // Update slug preview
  updateSlugPreview();

  openDialog('shopDialog');
}

function editShop(id) {
  const shop = _shops.find(s => s.id === id);
  if (shop) openShopDialog(shop);
}

async function saveShop() {
  const errEl = document.getElementById('shopError');
  errEl.classList.add('hidden');

  const id   = document.getElementById('shopId').value;
  const name = document.getElementById('shopName').value.trim();
  if (!name) {
    errEl.textContent = 'Nome é obrigatório.';
    errEl.classList.remove('hidden');
    return;
  }

  const rawSlug = document.getElementById('shopSlug').value.trim().toLowerCase()
    .replace(/[^a-z0-9\-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const phones = document.getElementById('shopPhones').value
    .split(',').map(p => p.trim()).filter(Boolean);

  const data = {
    name,
    address:      document.getElementById('shopAddress').value.trim(),
    description:  document.getElementById('shopDesc').value.trim(),
    imageUrl:     document.getElementById('shopImg').value.trim(),
    phones,
    active:       document.getElementById('shopActive').checked,
    slug:         rawSlug || null,
    customDomain: document.getElementById('shopDomain').value.trim() || null,
  };

  const btn = document.getElementById('shopSaveBtn');
  btn.disabled = true;
  btn.textContent = 'Salvando…';

  try {
    if (id) {
      data.id = id;
      await api('/api/admin/barbershops.php', { method: 'PUT', body: JSON.stringify(data) });
    } else {
      await api('/api/admin/barbershops.php', { method: 'POST', body: JSON.stringify(data) });
    }
    closeDialog('shopDialog');
    toast(id ? 'Barbearia atualizada!' : 'Barbearia criada!', 'success');
    loadShops();
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
  }
  btn.disabled = false;
  btn.textContent = 'Salvar';
}

async function toggleShop(id, active) {
  try {
    await api('/api/admin/barbershops.php', {
      method: 'PUT',
      body: JSON.stringify({ id, active }),
    });
    toast(active ? 'Barbearia ativada.' : 'Barbearia desativada.', 'info');
    loadShops();
  } catch (e) { toast(e.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', loadShops);
</script>
