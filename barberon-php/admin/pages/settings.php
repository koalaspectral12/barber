<?php // admin/pages/settings.php — Superadmin only ?>
<h1 class="admin-title">Configurações do App</h1>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;max-width:900px" class="settings-grid">

<!-- ── App Settings ──────────────────────────────────────────── -->
<div class="card">
  <div class="card-body">
    <h2 style="font-size:1rem;font-weight:700;margin-bottom:1rem">🌐 Configurações Gerais</h2>
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
      <label class="form-label">E-mail de contato</label>
      <input class="form-input" id="cfgContactEmail" type="email" placeholder="contato@seusite.com.br">
      <p class="text-muted text-xs mt-1">Usado para notificações administrativas</p>
    </div>
    <div class="form-group">
      <label class="form-label">Banners (um URL por linha)</label>
      <textarea class="form-textarea" id="cfgBanners" rows="4" placeholder="https://…/banner1.jpg&#10;https://…/banner2.jpg"></textarea>
      <p class="text-muted text-xs mt-1">Imagens exibidas no carrossel da página inicial</p>
    </div>
    <button class="btn btn-primary" onclick="saveSettings()">Salvar configurações</button>
  </div>
</div>

<!-- ── Platform MP Credentials ──────────────────────────────── -->
<div class="card">
  <div class="card-body">
    <h2 style="font-size:1rem;font-weight:700;margin-bottom:0.35rem">💳 Mercado Pago — Plataforma</h2>
    <p class="text-muted text-sm mb-3">
      Credenciais usadas para cobrar os <strong>planos de assinatura</strong> das barbearias.
      Configure sua conta Mercado Pago de plataforma (não a das barbearias individuais).
    </p>
    <div id="mpError"   class="alert alert-danger  hidden"></div>
    <div id="mpSuccess" class="alert alert-success hidden"></div>
    <div class="form-group">
      <label class="form-label">Access Token da plataforma</label>
      <input class="form-input" type="password" id="cfgMpAccessToken" placeholder="APP_USR-…">
      <p class="text-muted text-xs mt-1">Encontrado em <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" style="color:var(--primary)">MP Developers → Credenciais</a></p>
    </div>
    <div class="form-group">
      <label class="form-label">Public Key da plataforma</label>
      <input class="form-input" id="cfgMpPublicKey" placeholder="APP_USR-…">
    </div>
    <div class="flex gap-2 items-center mb-1">
      <div class="form-group" style="flex:1;margin:0">
        <label class="form-label" style="font-size:0.8rem;margin-bottom:0.2rem">Status</label>
        <div id="mpStatus" style="font-size:0.85rem;color:var(--text-muted)">—</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="testMpCredentials()">Testar conexão</button>
    </div>
    <button class="btn btn-primary mt-3" onclick="saveMpCredentials()">Salvar credenciais MP</button>

    <div class="mt-4 p-3" style="background:rgba(255,255,255,.04);border-radius:8px;border:1px solid var(--border)">
      <h3 style="font-size:0.85rem;font-weight:600;margin-bottom:0.5rem">🔗 URL do Webhook MP</h3>
      <p class="text-muted text-xs mb-2">Configure esta URL no painel de webhooks do Mercado Pago:</p>
      <code id="webhookUrl" style="font-size:0.78rem;word-break:break-all;background:rgba(0,0,0,.3);padding:6px 10px;border-radius:4px;display:block"></code>
      <button class="btn btn-ghost btn-sm mt-2" onclick="copyWebhookUrl()">📋 Copiar</button>
    </div>
  </div>
</div>

<!-- ── Cron Job Info ─────────────────────────────────────────── -->
<div class="card" style="grid-column:1/-1">
  <div class="card-body">
    <h2 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem">⏰ Cron Job — Verificação de Planos</h2>
    <p class="text-muted text-sm mb-3">
      Configure um cron job no cPanel para verificar diariamente se há planos vencidos e desativar as barbearias automaticamente.
    </p>
    <div style="background:rgba(0,0,0,.3);border-radius:8px;padding:1rem;font-family:monospace;font-size:0.82rem">
      <div style="color:var(--text-muted);margin-bottom:0.5rem"># No cPanel → Cron Jobs → adicionar:</div>
      <div style="color:var(--primary)">0 3 * * *</div>
      <div id="cronCmd" style="word-break:break-all;margin-top:0.25rem"></div>
    </div>
    <div class="flex gap-2 mt-3 flex-wrap">
      <button class="btn btn-outline btn-sm" onclick="copyCron()">📋 Copiar comando</button>
      <a href="<?= $base ?>/cron/check-plans.php" target="_blank" class="btn btn-ghost btn-sm">▶ Executar agora (teste)</a>
    </div>
    <p class="text-muted text-xs mt-2">⚠️ O arquivo cron/check-plans.php só pode ser executado via CLI ou localhost por segurança.</p>
  </div>
</div>

</div><!-- /settings-grid -->

<style>
@media(max-width:700px){
  .settings-grid { grid-template-columns:1fr !important; }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', async () => {
  // Set webhook URL
  const base = window.location.origin + (window.BASE_URL||'');
  document.getElementById('webhookUrl').textContent = base + '/api/payments/plan-webhook.php';
  document.getElementById('cronCmd').textContent = 'php ' + (window.BASE_URL||'/barberon') + '/cron/check-plans.php >> ' + (window.BASE_URL||'/barberon') + '/cron/check-plans.log 2>&1';

  try {
    const s = await api('/api/admin/settings.php');
    document.getElementById('cfgAppName').value      = s.appName       || '';
    document.getElementById('cfgLogoUrl').value      = s.logoUrl       || '';
    document.getElementById('cfgContactEmail').value = s.contactEmail  || '';
    document.getElementById('cfgBanners').value      = (s.banners || []).join('\n');
    if (s.mpAccessToken) {
      document.getElementById('cfgMpAccessToken').value = s.mpAccessToken;
      document.getElementById('mpStatus').innerHTML = '<span style="color:#10b981">✓ Credenciais configuradas</span>';
    }
    if (s.mpPublicKey) {
      document.getElementById('cfgMpPublicKey').value = s.mpPublicKey;
    }
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
        appName:      document.getElementById('cfgAppName').value.trim(),
        logoUrl:      document.getElementById('cfgLogoUrl').value.trim() || null,
        contactEmail: document.getElementById('cfgContactEmail').value.trim() || null,
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

async function saveMpCredentials() {
  const errEl = document.getElementById('mpError');
  const sucEl = document.getElementById('mpSuccess');
  errEl.classList.add('hidden'); sucEl.classList.add('hidden');
  const token = document.getElementById('cfgMpAccessToken').value.trim();
  const key   = document.getElementById('cfgMpPublicKey').value.trim();
  if (!token) { errEl.textContent='Access Token obrigatório'; errEl.classList.remove('hidden'); return; }
  try {
    await api('/api/admin/settings.php', {
      method: 'PUT',
      body: JSON.stringify({ mpAccessToken: token, mpPublicKey: key || null }),
    });
    sucEl.textContent = 'Credenciais do Mercado Pago salvas!';
    sucEl.classList.remove('hidden');
    document.getElementById('mpStatus').innerHTML = '<span style="color:#10b981">✓ Credenciais configuradas</span>';
    setTimeout(() => sucEl.classList.add('hidden'), 3000);
  } catch(e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
  }
}

async function testMpCredentials() {
  const token = document.getElementById('cfgMpAccessToken').value.trim();
  if (!token) { toast('Insira o Access Token primeiro','error'); return; }
  const statusEl = document.getElementById('mpStatus');
  statusEl.innerHTML = 'Testando...';
  try {
    const res = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      statusEl.innerHTML = '<span style="color:#10b981">✓ Credenciais válidas!</span>';
      toast('Conexão com Mercado Pago OK ✓', 'success');
    } else {
      statusEl.innerHTML = '<span style="color:#ef4444">✗ Token inválido</span>';
      toast('Token inválido ou sem permissão', 'error');
    }
  } catch(e) {
    statusEl.innerHTML = '<span style="color:#ef4444">✗ Erro de conexão</span>';
    toast('Não foi possível conectar ao MP', 'error');
  }
}

function copyWebhookUrl() {
  const url = document.getElementById('webhookUrl').textContent;
  navigator.clipboard.writeText(url).then(()=>toast('URL copiada!','success')).catch(()=>toast('Copie manualmente','error'));
}

function copyCron() {
  const cmd = document.getElementById('cronCmd').textContent;
  navigator.clipboard.writeText(cmd).then(()=>toast('Comando copiado!','success')).catch(()=>toast('Copie manualmente','error'));
}
</script>
