<?php // admin/pages/settings.php ?>
<h1 class="admin-title">Configurações do App</h1>

<div class="card" style="max-width:600px">
  <div class="card-body">
    <div id="settingsError"   class="alert alert-danger  hidden"></div>
    <div id="settingsSuccess" class="alert alert-success hidden"></div>

    <div class="form-group">
      <label class="form-label">Nome do app</label>
      <input class="form-input" id="cfgAppName" placeholder="Barberon">
    </div>
    <div class="form-group">
      <label class="form-label">URL do logo (opcional)</label>
      <input class="form-input" id="cfgLogoUrl" placeholder="https://…">
    </div>
    <div class="form-group">
      <label class="form-label">Banners (um URL por linha)</label>
      <textarea class="form-textarea" id="cfgBanners" rows="5" placeholder="https://…/banner1.jpg&#10;https://…/banner2.jpg"></textarea>
      <p class="text-muted text-xs mt-1">Imagens exibidas no carrossel da página inicial</p>
    </div>

    <button class="btn btn-primary" onclick="saveSettings()">Salvar configurações</button>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const s = await api('/api/admin/settings.php');
    document.getElementById('cfgAppName').value  = s.appName  || '';
    document.getElementById('cfgLogoUrl').value  = s.logoUrl  || '';
    document.getElementById('cfgBanners').value  = (s.banners || []).join('\n');
  } catch (e) {
    document.getElementById('settingsError').textContent = e.message;
    document.getElementById('settingsError').classList.remove('hidden');
  }
});

async function saveSettings() {
  const errEl = document.getElementById('settingsError');
  const sucEl = document.getElementById('settingsSuccess');
  errEl.classList.add('hidden'); sucEl.classList.add('hidden');

  const banners = document.getElementById('cfgBanners').value
    .split('\n').map(l => l.trim()).filter(Boolean);

  try {
    await api('/api/admin/settings.php', {
      method: 'PUT',
      body: JSON.stringify({
        appName: document.getElementById('cfgAppName').value.trim(),
        logoUrl: document.getElementById('cfgLogoUrl').value.trim() || null,
        banners,
      }),
    });
    sucEl.textContent = 'Configurações salvas!';
    sucEl.classList.remove('hidden');
    setTimeout(() => sucEl.classList.add('hidden'), 3000);
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
  }
}
</script>
