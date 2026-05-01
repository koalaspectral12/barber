<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';

$base = BASE_URL;
$user = current_user();

// Fetch active plans
$plans = DB::fetchAll('SELECT * FROM Plan WHERE active = 1 ORDER BY price ASC');
foreach ($plans as &$p) {
    $p['features']    = json_decode($p['features'] ?? '[]', true);
    $p['price']       = (float)$p['price'];
    $p['customPage']  = (bool)$p['customPage'];
    $p['exclusiveApp']= (bool)$p['exclusiveApp'];
}
unset($p);

layout_start('Planos e Preços');
?>
<div class="container" style="padding-top:3rem;padding-bottom:4rem">

  <div style="text-align:center;margin-bottom:3rem">
    <h1 style="font-size:2.2rem;font-weight:800;margin-bottom:0.75rem">Planos para sua Barbearia</h1>
    <p style="color:var(--text-muted);max-width:520px;margin:0 auto;font-size:1.05rem">
      Escolha o plano ideal, faça o pagamento seguro via Mercado Pago e comece a receber agendamentos online agora mesmo.
    </p>
  </div>

  <!-- Billing toggle -->
  <div style="display:flex;align-items:center;justify-content:center;gap:1rem;margin-bottom:2.5rem">
    <span style="font-size:0.9rem;color:var(--text-muted)">Mensal</span>
    <label class="toggle-switch">
      <input type="checkbox" id="billingToggle" onchange="filterPeriod(this.checked)">
      <span class="toggle-slider"></span>
    </label>
    <span style="font-size:0.9rem;color:var(--text-muted)">Anual <span class="badge badge-primary" style="font-size:0.7rem">Economize 26%</span></span>
  </div>

  <div id="plansGrid" class="pricing-grid">
    <?php foreach ($plans as $i => $p):
      $highlight = $i === 1; // middle plan highlighted
      $periodLabel = ['monthly'=>'/ mês','quarterly'=>'/ trimestre','yearly'=>'/ ano'][$p['period']] ?? $p['period'];
      $periodClass = 'period-' . $p['period'];
    ?>
    <div class="pricing-card <?= $highlight ? 'pricing-highlight' : '' ?> <?= $periodClass ?>">
      <?php if ($highlight): ?><div class="pricing-badge">⭐ Mais popular</div><?php endif; ?>
      <div class="pricing-name"><?= htmlspecialchars($p['name']) ?></div>
      <div class="pricing-price">
        R$ <?= number_format($p['price'], 2, ',', '.') ?>
        <span class="pricing-period"><?= $periodLabel ?></span>
      </div>
      <?php if ($p['description']): ?>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.25rem"><?= htmlspecialchars($p['description']) ?></p>
      <?php endif; ?>
      <ul class="pricing-features">
        <?php foreach ($p['features'] as $f): ?>
          <li><?= htmlspecialchars($f) ?></li>
        <?php endforeach; ?>
        <?php if ($p['customPage']): ?>
          <li style="color:var(--primary);font-weight:600">🎨 Página personalizada</li>
        <?php endif; ?>
        <?php if ($p['exclusiveApp']): ?>
          <li style="color:var(--primary);font-weight:600">📱 App exclusivo (sem branding Barberon)</li>
        <?php endif; ?>
      </ul>
      <?php if ($user && in_array($user['role'], ['ADMIN','SUPERADMIN'])): ?>
        <button class="btn btn-primary btn-block" onclick="checkout('<?= $p['id'] ?>')">
          Assinar agora
        </button>
      <?php elseif ($user): ?>
        <a href="<?= $base ?>/pages/login.php" class="btn btn-outline btn-block">
          Entrar como admin para assinar
        </a>
      <?php else: ?>
        <a href="<?= $base ?>/pages/login.php" class="btn btn-primary btn-block">
          Começar agora
        </a>
      <?php endif; ?>
    </div>
    <?php endforeach; ?>
  </div>

  <!-- FAQ -->
  <div style="max-width:700px;margin:4rem auto 0">
    <h2 style="text-align:center;font-size:1.4rem;font-weight:700;margin-bottom:2rem">Perguntas frequentes</h2>
    <?php
    $faqs = [
      ['O que acontece se eu não renovar?','Se o plano vencer e não for renovado, sua barbearia ficará inativa na plataforma e os clientes não poderão mais agendar. Basta renovar para reativar imediatamente.'],
      ['Posso trocar de plano?','Sim. Para fazer upgrade basta assinar o plano desejado. O novo plano sobrepõe o anterior.'],
      ['O pagamento é seguro?','Sim. Todos os pagamentos são processados pelo Mercado Pago, com criptografia e proteção antifraude.'],
      ['O que é o App Exclusivo?','No plano Anual, você pode ativar o modo App Exclusivo, que transforma a página da sua barbearia em um app independente, sem o branding da Barberon. Seu logo, sua identidade visual.'],
      ['Posso cancelar a qualquer momento?','Sim. Entre em contato com nosso suporte para cancelar a renovação automática.'],
    ];
    foreach ($faqs as $faq): ?>
    <details class="faq-item">
      <summary><?= $faq[0] ?></summary>
      <p><?= $faq[1] ?></p>
    </details>
    <?php endforeach; ?>
  </div>

  <!-- Checkout modal -->
  <div class="modal-backdrop hidden" id="checkoutBackdrop">
    <div class="modal" style="max-width:460px">
      <div class="modal-header">
        <h2 class="modal-title">Confirmar assinatura</h2>
        <button class="modal-close" onclick="closeCheckout()">✕</button>
      </div>
      <div id="checkoutBody" style="padding:1.25rem">
        <p class="text-muted">Carregando...</p>
      </div>
    </div>
  </div>

</div>

<style>
.pricing-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.5rem; max-width:960px; margin:0 auto; }
.pricing-card { background:var(--bg-card); border:2px solid var(--border); border-radius:1rem; padding:2rem 1.75rem; position:relative; display:flex; flex-direction:column; transition:transform .2s,border-color .2s; }
.pricing-card:hover { transform:translateY(-4px); }
.pricing-highlight { border-color:var(--primary); box-shadow:0 0 0 4px #f59e0b18; }
.pricing-badge { position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--primary);color:#000;font-size:0.75rem;font-weight:700;padding:3px 14px;border-radius:999px; }
.pricing-name { font-size:1.1rem;font-weight:700;margin-bottom:0.35rem; }
.pricing-price { font-size:2.4rem;font-weight:800;color:var(--primary);line-height:1; }
.pricing-period { font-size:0.9rem;font-weight:400;color:var(--text-muted); }
.pricing-features { list-style:none;padding:0;margin:1.25rem 0 1.5rem;flex:1;display:flex;flex-direction:column;gap:0.45rem;font-size:0.88rem; }
.pricing-features li::before { content:'✓ ';color:var(--primary);font-weight:700; }
.faq-item { border-bottom:1px solid var(--border);padding:1rem 0; }
.faq-item summary { cursor:pointer;font-weight:600;list-style:none;display:flex;justify-content:space-between;align-items:center; }
.faq-item summary::after { content:'▸';transition:.2s; }
.faq-item[open] summary::after { content:'▾'; }
.faq-item p { margin-top:0.6rem;font-size:0.9rem;color:var(--text-muted); }
.toggle-switch { position:relative;display:inline-block;width:44px;height:24px; }
.toggle-switch input { opacity:0;width:0;height:0; }
.toggle-slider { position:absolute;inset:0;background:#333;border-radius:999px;transition:.3s;cursor:pointer; }
.toggle-slider::before { content:'';position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s; }
.toggle-switch input:checked + .toggle-slider { background:var(--primary); }
.toggle-switch input:checked + .toggle-slider::before { transform:translateX(20px); }
</style>

<script>
const _plansData = <?= json_encode($plans) ?>;
let _selectedPlanId = null;

function filterPeriod(showYearly) {
  document.querySelectorAll('.pricing-card').forEach(c => {
    const ym = showYearly ? 'period-yearly' : 'period-monthly';
    c.style.display = showYearly
      ? (c.classList.contains('period-yearly') ? '' : 'none')
      : (c.classList.contains('period-quarterly') || c.classList.contains('period-yearly') ? 'none' : '');
  });
  // Show all if no filter selected
  if (!showYearly) {
    document.querySelectorAll('.pricing-card').forEach(c=>c.style.display='');
  }
}

async function checkout(planId) {
  _selectedPlanId = planId;
  const plan = _plansData.find(p=>p.id===planId);
  if (!plan) return;

  // Need barbershopId — fetch from admin context
  let shopId = null;
  try {
    const me = await api('/api/admin/me.php');
    shopId = me.barbershopId || null;
  } catch(e) {}

  if (!shopId) {
    toast('Sua conta não está vinculada a uma barbearia. Contate o administrador.','error');
    return;
  }

  const periodLabel = {monthly:'Mensal',quarterly:'Trimestral',yearly:'Anual'};
  document.getElementById('checkoutBody').innerHTML = `
    <div style="text-align:center;margin-bottom:1.25rem">
      <div style="font-size:1.1rem;font-weight:700">${plan.name}</div>
      <div style="font-size:2rem;font-weight:800;color:var(--primary)">R$ ${Number(plan.price).toFixed(2).replace('.',',')}</div>
      <div style="font-size:0.85rem;color:var(--text-muted)">${periodLabel[plan.period]||plan.period}</div>
    </div>
    <ul style="list-style:none;padding:0;margin-bottom:1.5rem;font-size:0.875rem;display:flex;flex-direction:column;gap:0.4rem">
      ${(plan.features||[]).map(f=>`<li>✓ ${f}</li>`).join('')}
    </ul>
    <div id="checkoutError" class="alert alert-danger hidden mb-3"></div>
    <button class="btn btn-primary btn-block" onclick="confirmCheckout('${planId}','${shopId}')">
      💳 Pagar com Mercado Pago
    </button>
    <p style="text-align:center;font-size:0.78rem;color:var(--text-muted);margin-top:0.75rem">
      🔒 Pagamento seguro processado pelo Mercado Pago
    </p>`;

  document.getElementById('checkoutBackdrop').classList.remove('hidden');
}

function closeCheckout() {
  document.getElementById('checkoutBackdrop').classList.add('hidden');
}
document.getElementById('checkoutBackdrop').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeCheckout();
});

async function confirmCheckout(planId, barbershopId) {
  const btn = document.querySelector('#checkoutBody .btn-primary');
  const errEl = document.getElementById('checkoutError');
  btn.disabled = true; btn.textContent = 'Aguarde...';
  errEl.classList.add('hidden');
  try {
    const res = await api('/api/payments/plan-checkout.php', {
      method:'POST',
      body: JSON.stringify({ planId, barbershopId })
    });
    if (res.checkoutUrl) {
      btn.textContent = 'Redirecionando...';
      window.location.href = res.checkoutUrl;
    }
  } catch(e) {
    errEl.textContent = e.message || 'Erro ao iniciar pagamento';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = '💳 Pagar com Mercado Pago';
  }
}
</script>

<?php layout_end(); ?>
