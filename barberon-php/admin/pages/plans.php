<?php // admin/pages/plans.php — Plan management (SUPERADMIN) + Subscription view (ADMIN) ?>

<?php if ($isSuperAdmin): ?>
<!-- ══════════════════════════════════════════════════════════
     SUPERADMIN: Manage platform plans
     ══════════════════════════════════════════════════════════ -->
<div class="flex items-center justify-between mb-4">
  <h1 class="admin-title" style="margin:0">Planos da Plataforma</h1>
  <button class="btn btn-primary" onclick="openPlanDialog()">+ Novo plano</button>
</div>

<div class="stats-grid mb-4" id="planStats" style="grid-template-columns:repeat(4,1fr)">
  <div class="stat-card"><div class="stat-label">Total Planos</div><div class="stat-value" id="sTotalPlans">—</div></div>
  <div class="stat-card"><div class="stat-label">Assinaturas Ativas</div><div class="stat-value" id="sActiveSubs">—</div></div>
  <div class="stat-card"><div class="stat-label">Expiram em 7 dias</div><div class="stat-value" id="sExpiringSoon">—</div></div>
  <div class="stat-card"><div class="stat-label">Receita Estimada/mês</div><div class="stat-value" id="sRevenue">—</div></div>
</div>

<h2 style="font-size:1rem;font-weight:600;margin-bottom:0.75rem;color:var(--text-muted)">Planos Disponíveis</h2>
<div id="plansGrid" class="plans-grid mb-4">
  <div class="text-muted text-sm">Carregando...</div>
</div>

<h2 style="font-size:1rem;font-weight:600;margin:1.5rem 0 0.75rem;color:var(--text-muted)">Assinaturas das Barbearias</h2>
<div class="admin-table-wrap">
  <table class="admin-table" id="subsTable">
    <thead><tr><th>Barbearia</th><th>Plano</th><th>Status</th><th>Início</th><th>Vencimento</th><th>Ações</th></tr></thead>
    <tbody id="subsBody"><tr><td colspan="6" class="text-muted">Carregando...</td></tr></tbody>
  </table>
</div>

<?php else: ?>
<!-- ══════════════════════════════════════════════════════════
     ADMIN: View own subscription + upgrade
     ══════════════════════════════════════════════════════════ -->
<h1 class="admin-title">Meu Plano</h1>

<div id="currentPlanBox" class="card mb-4" style="max-width:600px">
  <div class="card-body">
    <p class="text-muted">Carregando...</p>
  </div>
</div>

<h2 style="font-size:1.1rem;font-weight:600;margin-bottom:1rem">Planos disponíveis</h2>
<div id="plansGrid" class="plans-grid"></div>
<div id="checkoutMsg" class="alert alert-info hidden" style="max-width:600px;margin-top:1rem"></div>
<?php endif; ?>

<!-- Plan dialog (superadmin) -->
<?php if ($isSuperAdmin): ?>
<div class="dialog-backdrop hidden" id="planDialog">
  <div class="dialog" style="max-width:520px;width:100%">
    <h2 class="dialog-title" id="planDialogTitle">Novo Plano</h2>
    <input type="hidden" id="planId">

    <div class="form-group">
      <label class="form-label">Nome</label>
      <input class="form-input" id="planName" placeholder="ex: Mensal">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div class="form-group">
        <label class="form-label">Período</label>
        <select class="form-select" id="planPeriod">
          <option value="monthly">Mensal</option>
          <option value="quarterly">Trimestral</option>
          <option value="yearly">Anual</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Preço (R$)</label>
        <input class="form-input" id="planPrice" type="number" step="0.01" min="0" placeholder="89.90">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Descrição</label>
      <input class="form-input" id="planDesc" placeholder="ex: Plano básico com renovação mensal">
    </div>
    <div class="form-group">
      <label class="form-label">Funcionalidades (uma por linha)</label>
      <textarea class="form-textarea" id="planFeatures" rows="5" placeholder="Agendamentos ilimitados&#10;Painel admin completo&#10;Suporte por e-mail"></textarea>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">
      <div class="form-group">
        <label class="form-label">Máx. serviços</label>
        <input class="form-input" id="planMaxSvcs" type="number" min="1" value="20">
      </div>
      <div class="form-group" style="display:flex;align-items:flex-end;padding-bottom:0.25rem">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.9rem">
          <input type="checkbox" id="planCustomPage"> Página personalizada
        </label>
      </div>
      <div class="form-group" style="display:flex;align-items:flex-end;padding-bottom:0.25rem">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.9rem">
          <input type="checkbox" id="planExclusiveApp"> App exclusivo
        </label>
      </div>
    </div>
    <div class="flex gap-2 mt-2">
      <button class="btn btn-primary" onclick="savePlan()">Salvar</button>
      <button class="btn btn-ghost" onclick="closeDialog('planDialog')">Cancelar</button>
    </div>
  </div>
</div>
<?php endif; ?>

<style>
.plans-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1.25rem; }
.plan-card  { background:var(--bg-card); border:2px solid var(--border); border-radius:var(--radius); padding:1.5rem; position:relative; transition:border-color .2s; }
.plan-card.highlight { border-color:var(--primary); }
.plan-card .plan-badge { position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--primary);color:#000;font-size:0.72rem;font-weight:700;padding:2px 12px;border-radius:999px;white-space:nowrap; }
.plan-card .plan-name  { font-size:1.1rem;font-weight:700;margin-bottom:0.25rem; }
.plan-card .plan-price { font-size:2rem;font-weight:800;color:var(--primary);line-height:1.1; }
.plan-card .plan-period{ font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem; }
.plan-card ul          { list-style:none;padding:0;margin:0 0 1.25rem;font-size:0.875rem;display:flex;flex-direction:column;gap:0.4rem; }
.plan-card ul li::before{ content:'✓ ';color:var(--primary);font-weight:700; }
.plan-card .plan-actions{ display:flex;gap:0.5rem;flex-wrap:wrap; }
.sub-badge-active   { background:#10b98122;color:#10b981;border:1px solid #10b981;border-radius:4px;padding:2px 8px;font-size:0.75rem;font-weight:600; }
.sub-badge-expired  { background:#ef444422;color:#ef4444;border:1px solid #ef4444;border-radius:4px;padding:2px 8px;font-size:0.75rem;font-weight:600; }
.sub-badge-pending  { background:#f59e0b22;color:#f59e0b;border:1px solid #f59e0b;border-radius:4px;padding:2px 8px;font-size:0.75rem;font-weight:600; }
.sub-badge-cancelled{ background:#6b728022;color:#6b7280;border:1px solid #6b7280;border-radius:4px;padding:2px 8px;font-size:0.75rem;font-weight:600; }
</style>

<script>
const _isSuperAdmin = <?= $isSuperAdmin ? 'true' : 'false' ?>;
const _adminShopId  = <?= json_encode($ctx['barbershopId'] ?? null) ?>;
let _plans = [], _subs = [];

document.addEventListener('DOMContentLoaded', () => {
  loadPlans();
  if (_isSuperAdmin) loadSubs();
  else loadMyPlan();
});

// ── Load plans ──────────────────────────────────────────────
async function loadPlans() {
  try {
    _plans = await api('/api/admin/plans.php');
    renderPlansGrid();
    if (_isSuperAdmin) {
      document.getElementById('sTotalPlans').textContent = _plans.length;
    }
  } catch(e) { toast('Erro ao carregar planos: ' + e.message, 'error'); }
}

function renderPlansGrid() {
  const grid = document.getElementById('plansGrid');
  if (!_plans.length) { grid.innerHTML = '<p class="text-muted text-sm">Nenhum plano cadastrado.</p>'; return; }
  const periodLabel = {monthly:'/ mês', quarterly:'/ trimestre', yearly:'/ ano'};
  grid.innerHTML = _plans.map((p,i) => `
    <div class="plan-card ${i===1?'highlight':''}">
      ${i===1 ? '<div class="plan-badge">⭐ Mais popular</div>' : ''}
      <div class="plan-name">${p.name}</div>
      <div class="plan-price">R$ ${Number(p.price).toFixed(2).replace('.',',')}</div>
      <div class="plan-period">${periodLabel[p.period]||p.period}</div>
      <ul>${(p.features||[]).map(f=>`<li>${f}</li>`).join('')}</ul>
      ${p.customPage  ? '<div style="font-size:0.8rem;color:var(--primary);margin-bottom:0.3rem">🎨 Página personalizada</div>':''}
      ${p.exclusiveApp? '<div style="font-size:0.8rem;color:var(--primary);margin-bottom:0.75rem">📱 App exclusivo</div>':''}
      <div class="plan-actions">
        ${_isSuperAdmin
          ? `<button class="btn btn-sm btn-outline" onclick="openPlanDialog(${JSON.stringify(p)})">Editar</button>
             <button class="btn btn-sm btn-ghost btn-danger" onclick="deletePlan('${p.id}')">Excluir</button>`
          : `<button class="btn btn-sm btn-primary" onclick="startCheckout('${p.id}')">Assinar</button>`
        }
      </div>
    </div>`).join('');
}

// ── SUPERADMIN: subscriptions table ─────────────────────────
async function loadSubs() {
  try {
    _subs = await api('/api/admin/plans.php?barbershop_plans=1');
    // Stats
    const active = _subs.filter(s=>s.status==='active').length;
    const soon   = _subs.filter(s=>s.status==='active'&&(new Date(s.endDate)-Date.now())<7*86400*1000).length;
    const rev    = _subs.filter(s=>s.status==='active').reduce((acc,s)=>{
      let m = parseFloat(s.price||0);
      if(s.period==='quarterly') m=m/3; if(s.period==='yearly') m=m/12; return acc+m;
    },0);
    document.getElementById('sActiveSubs').textContent  = active;
    document.getElementById('sExpiringSoon').textContent = soon;
    document.getElementById('sRevenue').textContent      = 'R$ ' + rev.toFixed(2).replace('.',',');
    renderSubsTable();
  } catch(e) { toast('Erro ao carregar assinaturas: ' + e.message, 'error'); }
}

function renderSubsTable() {
  const tbody = document.getElementById('subsBody');
  if (!_subs.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-muted">Nenhuma assinatura.</td></tr>'; return; }
  tbody.innerHTML = _subs.map(s=>`
    <tr>
      <td>${s.shopName}</td>
      <td>${s.planName} <small style="color:var(--text-muted)">(${periodLabel(s.period)})</small></td>
      <td><span class="sub-badge-${s.status}">${statusLabel(s.status)}</span></td>
      <td>${fmtDate(s.startDate)}</td>
      <td>${fmtDate(s.endDate)}</td>
      <td>
        ${s.status!=='active'?`<button class="btn btn-sm btn-outline" onclick="activateSub('${s.barbershopId}','${s.planId}')">Ativar</button>`:''}
        ${s.status==='active'?`<button class="btn btn-sm btn-ghost btn-danger" onclick="cancelSub('${s.id}','${s.barbershopId}')">Cancelar</button>`:''}
      </td>
    </tr>`).join('');
}
function periodLabel(p){return{monthly:'Mensal',quarterly:'Trimestral',yearly:'Anual'}[p]||p;}
function statusLabel(s){return{active:'Ativo',expired:'Expirado',cancelled:'Cancelado',pending:'Pendente'}[s]||s;}

// ── ADMIN: view own subscription ─────────────────────────────
async function loadMyPlan() {
  try {
    const sub = await api('/api/admin/plans.php?subscription=1&barbershopId=' + (_adminShopId||''));
    const box  = document.getElementById('currentPlanBox');
    if (sub && sub.status === 'active') {
      const daysLeft = Math.max(0, Math.ceil((new Date(sub.endDate)-Date.now())/86400000));
      box.innerHTML = `<div class="card-body">
        <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
          <div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.2rem">Plano atual</div>
            <div style="font-size:1.4rem;font-weight:800;color:var(--primary)">${sub.planName}</div>
            <div style="font-size:0.85rem;color:var(--text-muted)">${periodLabel(sub.period)} · R$ ${Number(sub.price).toFixed(2).replace('.',',')}</div>
          </div>
          <div style="margin-left:auto;text-align:right">
            <span class="sub-badge-${sub.status}">${statusLabel(sub.status)}</span>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.4rem">Vence em <strong>${daysLeft} dia(s)</strong></div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${fmtDate(sub.endDate)}</div>
          </div>
        </div>
        ${daysLeft<=7?'<div class="alert alert-danger mt-3">⚠️ Seu plano vence em breve. Renove para manter sua barbearia ativa!</div>':''}
        <button class="btn btn-outline btn-sm mt-3" onclick="startCheckout('${sub.planId}')">🔄 Renovar plano</button>
      </div>`;
    } else {
      box.innerHTML = `<div class="card-body">
        <div class="alert alert-danger">⚠️ Sua barbearia não possui plano ativo. Selecione um plano abaixo para ativar.</div>
      </div>`;
    }
  } catch(e) {
    document.getElementById('currentPlanBox').innerHTML = '<div class="card-body"><p class="text-muted">Não foi possível carregar o plano.</p></div>';
  }
}

// ── Checkout ─────────────────────────────────────────────────
async function startCheckout(planId) {
  if(!_adminShopId){toast('Barbearia não identificada','error');return;}
  const btn = event.target;
  btn.disabled=true; btn.textContent='Aguarde...';
  try {
    const res = await api('/api/payments/plan-checkout.php', {
      method:'POST',
      body: JSON.stringify({ planId, barbershopId: _adminShopId })
    });
    if (res.checkoutUrl) {
      const msg = document.getElementById('checkoutMsg');
      if(msg){ msg.innerHTML=`<strong>Redirecionando para o Mercado Pago…</strong> <a href="${res.checkoutUrl}" target="_blank" class="btn btn-sm btn-primary ml-2">Pagar agora</a>`; msg.classList.remove('hidden'); }
      setTimeout(()=>window.open(res.checkoutUrl,'_blank'),1000);
    }
  } catch(e) { toast(e.message||'Erro ao iniciar pagamento','error'); }
  finally { btn.disabled=false; btn.textContent='Assinar'; }
}

// ── Superadmin: manual activate ──────────────────────────────
async function activateSub(barbershopId, planId) {
  if(!confirm('Ativar este plano manualmente?')) return;
  try {
    await api('/api/admin/plans.php?action=manual_activate', {
      method:'POST',
      body: JSON.stringify({ barbershopId, planId })
    });
    toast('Plano ativado!','success');
    loadSubs();
  } catch(e) { toast(e.message,'error'); }
}

async function cancelSub(subId, barbershopId) {
  if(!confirm('Cancelar esta assinatura? A barbearia será desativada.')) return;
  try {
    await api('/api/admin/plans.php?action=cancel&id=' + subId, { method:'DELETE' });
    toast('Assinatura cancelada','success');
    loadSubs();
  } catch(e) { toast(e.message,'error'); }
}

// ── Plan dialog (superadmin) ─────────────────────────────────
function openPlanDialog(plan) {
  document.getElementById('planDialogTitle').textContent = plan ? 'Editar Plano' : 'Novo Plano';
  document.getElementById('planId').value       = plan?.id        || '';
  document.getElementById('planName').value     = plan?.name      || '';
  document.getElementById('planPeriod').value   = plan?.period    || 'monthly';
  document.getElementById('planPrice').value    = plan?.price     || '';
  document.getElementById('planDesc').value     = plan?.description || '';
  document.getElementById('planFeatures').value = (plan?.features||[]).join('\n');
  document.getElementById('planMaxSvcs').value  = plan?.maxServices || 20;
  document.getElementById('planCustomPage').checked   = !!plan?.customPage;
  document.getElementById('planExclusiveApp').checked = !!plan?.exclusiveApp;
  openDialog('planDialog');
}

async function savePlan() {
  const id       = document.getElementById('planId').value;
  const features = document.getElementById('planFeatures').value.split('\n').map(l=>l.trim()).filter(Boolean);
  const body = {
    name:        document.getElementById('planName').value.trim(),
    period:      document.getElementById('planPeriod').value,
    price:       parseFloat(document.getElementById('planPrice').value),
    description: document.getElementById('planDesc').value.trim(),
    features,
    maxServices: parseInt(document.getElementById('planMaxSvcs').value)||20,
    customPage:  document.getElementById('planCustomPage').checked,
    exclusiveApp:document.getElementById('planExclusiveApp').checked,
  };
  if(!body.name) { toast('Nome obrigatório','error'); return; }
  try {
    if (id) await api('/api/admin/plans.php?id='+id, {method:'PUT', body:JSON.stringify(body)});
    else    await api('/api/admin/plans.php',         {method:'POST',body:JSON.stringify(body)});
    toast('Plano salvo!','success');
    closeDialog('planDialog');
    loadPlans();
    loadSubs();
  } catch(e) { toast(e.message,'error'); }
}

async function deletePlan(id) {
  if(!confirm('Desativar este plano?')) return;
  try {
    await api('/api/admin/plans.php?id='+id, {method:'DELETE'});
    toast('Plano desativado','success');
    loadPlans();
  } catch(e) { toast(e.message,'error'); }
}
</script>
