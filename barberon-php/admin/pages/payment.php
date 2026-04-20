<?php // admin/pages/payment.php ?>
<h1 class="admin-title">Configuração de Pagamento</h1>

<?php if ($ctx['role'] === 'SUPERADMIN'): ?>
<div class="form-group" style="max-width:320px;margin-bottom:1.5rem">
  <label class="form-label">Barbearia</label>
  <select class="form-select" id="payShopSelect" onchange="loadPayment()">
    <option value="">— selecione —</option>
  </select>
</div>
<?php else: ?>
<input type="hidden" id="payShopSelect" value="<?= htmlspecialchars($ctx['barbershopId'] ?? '') ?>">
<?php endif; ?>

<div class="card" style="max-width:560px" id="paymentForm">
  <div class="card-body">
    <p class="text-muted text-sm mb-4">Configure as credenciais do Mercado Pago para aceitar pagamentos online.</p>
    <div class="form-group">
      <label class="form-label">Access Token</label>
      <input class="form-input" type="password" id="mpAccessToken" placeholder="APP_USR-…">
    </div>
    <div class="form-group">
      <label class="form-label">Public Key</label>
      <input class="form-input" id="mpPublicKey" placeholder="APP_USR-…">
    </div>
    <div class="form-group">
      <label class="form-label" style="display:flex;align-items:center;gap:8px">
        <input type="checkbox" id="paymentActive">
        Pagamento online ativo
      </label>
    </div>
    <div id="payError"   class="alert alert-danger  hidden"></div>
    <div id="paySuccess" class="alert alert-success hidden"></div>
    <button class="btn btn-primary" onclick="savePayment()">Salvar</button>
  </div>
</div>

<script>
<?php if ($ctx['role'] === 'SUPERADMIN'): ?>
document.addEventListener('DOMContentLoaded', async () => {
  const shops = await api('/api/admin/barbershops.php').catch(() => []);
  const sel = document.getElementById('payShopSelect');
  shops.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.textContent = s.name; sel.appendChild(o); });
});
<?php else: ?>
document.addEventListener('DOMContentLoaded', loadPayment);
<?php endif; ?>

async function loadPayment() {
  const shopId = document.getElementById('payShopSelect').value;
  if (!shopId) return;
  try {
    const row = await api('/api/admin/payment.php?barbershopId=' + shopId);
    document.getElementById('mpAccessToken').value = row.mpAccessToken || '';
    document.getElementById('mpPublicKey').value   = row.mpPublicKey   || '';
    document.getElementById('paymentActive').checked = !!row.active;
  } catch {}
}

async function savePayment() {
  const errEl = document.getElementById('payError');
  const sucEl = document.getElementById('paySuccess');
  errEl.classList.add('hidden'); sucEl.classList.add('hidden');
  const shopId = document.getElementById('payShopSelect').value || '<?= $ctx['barbershopId'] ?? '' ?>';
  if (!shopId) { errEl.textContent = 'Selecione uma barbearia'; errEl.classList.remove('hidden'); return; }
  try {
    await api('/api/admin/payment.php', {
      method: 'PUT',
      body: JSON.stringify({
        barbershopId: shopId,
        mpAccessToken: document.getElementById('mpAccessToken').value.trim(),
        mpPublicKey:   document.getElementById('mpPublicKey').value.trim(),
        active:        document.getElementById('paymentActive').checked,
      }),
    });
    sucEl.textContent = 'Configuração salva!'; sucEl.classList.remove('hidden');
    setTimeout(() => sucEl.classList.add('hidden'), 3000);
  } catch (e) {
    errEl.textContent = e.message; errEl.classList.remove('hidden');
  }
}
</script>
