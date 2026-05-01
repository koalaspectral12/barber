<?php // admin/pages/page-builder.php — Barbershop page customization ?>
<div class="flex items-center justify-between mb-2" style="flex-wrap:wrap;gap:0.75rem">
  <h1 class="admin-title" style="margin:0">🎨 Construtor de Página</h1>
  <div class="flex gap-2">
    <button class="btn btn-outline btn-sm" onclick="previewPage()">👁 Pré-visualizar</button>
    <button class="btn btn-primary btn-sm" onclick="savePage()">💾 Salvar</button>
  </div>
</div>
<p class="text-muted text-sm mb-4">Personalize a página pública da sua barbearia. As alterações ficam visíveis em <strong id="previewLink">—</strong></p>

<div id="planWarning" class="alert alert-danger hidden mb-4">
  ⚠️ Seu plano não inclui personalização de página.
  <a href="<?= $base ?>/admin/?page=plans" class="btn btn-sm btn-primary ml-2">Fazer upgrade</a>
</div>

<?php if ($isSuperAdmin): ?>
<div class="form-group" style="max-width:320px;margin-bottom:1.5rem">
  <label class="form-label">Barbearia</label>
  <select class="form-select" id="pbShopSelect" onchange="loadPageConfig()">
    <option value="">— selecione —</option>
  </select>
</div>
<?php else: ?>
<input type="hidden" id="pbShopSelect" value="<?= htmlspecialchars($ctx['barbershopId'] ?? '') ?>">
<?php endif; ?>

<div id="builderBody" class="hidden">

<!-- ── Tabs ─────────────────────────────────────────────────── -->
<div class="pill-nav mb-4" id="pbTabs">
  <button class="pill active" onclick="showTab('identity')">🏷 Identidade</button>
  <button class="pill" onclick="showTab('hero')">🖼 Hero</button>
  <button class="pill" onclick="showTab('carousel')">🎠 Carrossel</button>
  <button class="pill" onclick="showTab('modules')">🧩 Módulos</button>
  <button class="pill" onclick="showTab('style')">🎨 Estilo</button>
  <button class="pill" onclick="showTab('app')">📱 App</button>
</div>

<!-- ── Identity ─────────────────────────────────────────────── -->
<div id="tab-identity" class="pb-tab">
  <div class="card"><div class="card-body">
    <div class="form-group">
      <label class="form-label">WhatsApp (com DDD, somente números)</label>
      <input class="form-input" id="pb-whatsapp" placeholder="11999999999" type="tel">
    </div>
    <div class="form-group">
      <label class="form-label">Instagram (URL completa)</label>
      <input class="form-input" id="pb-instagram" placeholder="https://instagram.com/suabarbearia">
    </div>
    <div class="form-group">
      <label class="form-label">CSS personalizado</label>
      <textarea class="form-textarea" id="pb-css" rows="6" placeholder="/* seu CSS extra */
.hero-title { font-size: 3rem; }"></textarea>
    </div>
  </div></div>
</div>

<!-- ── Hero ─────────────────────────────────────────────────── -->
<div id="tab-hero" class="pb-tab hidden">
  <div class="card"><div class="card-body">
    <div class="form-group">
      <label class="form-label">Título do hero</label>
      <input class="form-input" id="pb-heroTitle" placeholder="Bem-vindo à Barbearia X">
    </div>
    <div class="form-group">
      <label class="form-label">Subtítulo</label>
      <input class="form-input" id="pb-heroSubtitle" placeholder="O melhor corte da cidade">
    </div>
    <div class="form-group">
      <label class="form-label">Imagem de fundo do hero (URL)</label>
      <input class="form-input" id="pb-heroImage" placeholder="https://..." oninput="previewHeroImg()">
      <div id="heroImgPreview" style="margin-top:0.75rem;border-radius:8px;overflow:hidden;max-height:180px;display:none">
        <img id="heroImgEl" src="" style="width:100%;height:180px;object-fit:cover">
      </div>
    </div>
  </div></div>
</div>

<!-- ── Carousel ──────────────────────────────────────────────── -->
<div id="tab-carousel" class="pb-tab hidden">
  <div class="card"><div class="card-body">
    <p class="text-muted text-sm mb-3">Adicione URLs de imagens para o carrossel da página (uma por linha ou adicione individualmente).</p>
    <div id="carouselList" style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:0.75rem"></div>
    <div class="flex gap-2">
      <input class="form-input" id="newCarouselUrl" placeholder="https://... (URL da imagem)" style="flex:1">
      <button class="btn btn-outline btn-sm" onclick="addCarouselImg()">+ Adicionar</button>
    </div>
    <div id="carouselPreview" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin-top:1rem"></div>
  </div></div>
</div>

<!-- ── Modules ───────────────────────────────────────────────── -->
<div id="tab-modules" class="pb-tab hidden">
  <div class="card"><div class="card-body">
    <p class="text-muted text-sm mb-3">Ative ou desative seções da página pública da barbearia. Arraste para reordenar (ordem salva).</p>
    <div id="modulesList" style="display:flex;flex-direction:column;gap:0.5rem"></div>
  </div></div>
</div>

<!-- ── Style ─────────────────────────────────────────────────── -->
<div id="tab-style" class="pb-tab hidden">
  <div class="card"><div class="card-body">
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1.25rem">
      <div class="form-group">
        <label class="form-label">Cor primária</label>
        <div class="flex gap-2 items-center">
          <input type="color" id="pb-primaryColor" value="#f59e0b" style="width:44px;height:36px;padding:2px;border:1px solid var(--border);border-radius:6px;background:none;cursor:pointer">
          <input class="form-input" id="pb-primaryColorHex" value="#f59e0b" style="flex:1" oninput="syncColor('primaryColor')">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Cor de destaque</label>
        <div class="flex gap-2 items-center">
          <input type="color" id="pb-accentColor" value="#1a1a1a" style="width:44px;height:36px;padding:2px;border:1px solid var(--border);border-radius:6px;background:none;cursor:pointer">
          <input class="form-input" id="pb-accentColorHex" value="#1a1a1a" style="flex:1" oninput="syncColor('accentColor')">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Cor de fundo</label>
        <div class="flex gap-2 items-center">
          <input type="color" id="pb-bgColor" value="#0f0f0f" style="width:44px;height:36px;padding:2px;border:1px solid var(--border);border-radius:6px;background:none;cursor:pointer">
          <input class="form-input" id="pb-bgColorHex" value="#0f0f0f" style="flex:1" oninput="syncColor('bgColor')">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Fonte</label>
        <select class="form-select" id="pb-fontFamily">
          <option value="Inter">Inter (padrão)</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Poppins">Poppins</option>
          <option value="Roboto">Roboto</option>
          <option value="Playfair Display">Playfair Display</option>
          <option value="Oswald">Oswald</option>
          <option value="Raleway">Raleway</option>
        </select>
      </div>
    </div>
    <div class="mt-3 p-3" id="stylePreviewBox" style="border-radius:8px;text-align:center;transition:.3s">
      <p style="font-weight:700;font-size:1.1rem" id="spTitle">Pré-visualização do estilo</p>
      <p style="font-size:0.85rem;opacity:.7">Cor primária aplicada nos botões e destaques</p>
      <button class="btn btn-sm mt-2" id="spBtn" style="background:var(--pb-primary,#f59e0b);color:#000;border:none;padding:.5rem 1.2rem;border-radius:6px">Reservar</button>
    </div>
    <!-- sync color picker ↔ hex -->
    <script>
    ['primaryColor','accentColor','bgColor'].forEach(k=>{
      const picker=document.getElementById('pb-'+k), hex=document.getElementById('pb-'+k+'Hex');
      if(!picker||!hex) return;
      picker.addEventListener('input',()=>{ hex.value=picker.value; updateStylePreview(); });
    });
    function syncColor(k){ const h=document.getElementById('pb-'+k+'Hex').value; if(/^#[0-9a-f]{6}$/i.test(h)) document.getElementById('pb-'+k).value=h; updateStylePreview(); }
    function updateStylePreview(){
      const primary=document.getElementById('pb-primaryColor').value;
      const bg=document.getElementById('pb-bgColor').value;
      const box=document.getElementById('stylePreviewBox');
      if(box){ box.style.background=bg; box.style.color='#fff'; }
      const spBtn=document.getElementById('spBtn');
      if(spBtn) spBtn.style.background=primary;
      document.documentElement.style.setProperty('--pb-primary',primary);
    }
    </script>
  </div></div>
</div>

<!-- ── App mode ───────────────────────────────────────────────── -->
<div id="tab-app" class="pb-tab hidden">
  <div id="appModeLockedMsg" class="alert alert-warning mb-3 hidden">
    📱 O modo App Exclusivo requer o <strong>Plano Anual</strong>. 
    <a href="<?= $base ?>/admin/?page=plans" class="btn btn-sm btn-primary ml-2">Fazer upgrade</a>
  </div>
  <div class="card"><div class="card-body">
    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;margin-bottom:1rem">
      <input type="checkbox" id="pb-appMode" onchange="toggleAppMode(this.checked)" style="width:18px;height:18px">
      <span><strong>Modo App Exclusivo</strong> — remove o branding Barberon da página pública, transformando-a em um app independente da sua barbearia</span>
    </label>
    <div id="appModeFields" class="hidden" style="display:flex;flex-direction:column;gap:1rem">
      <div class="form-group">
        <label class="form-label">Nome do App</label>
        <input class="form-input" id="pb-appName" placeholder="ex: Barbearia Estilo Noir">
      </div>
      <div class="form-group">
        <label class="form-label">Logo do App (URL — recomendado 200×200 px, PNG/SVG)</label>
        <input class="form-input" id="pb-appLogo" placeholder="https://..." oninput="previewAppLogo()">
        <div id="appLogoPreview" style="margin-top:0.5rem;display:none">
          <img id="appLogoImg" src="" style="width:64px;height:64px;object-fit:contain;border-radius:12px;border:1px solid var(--border)">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Ícone do App (URL — 512×512 px para PWA)</label>
        <input class="form-input" id="pb-appIcon" placeholder="https://...">
      </div>
    </div>
  </div></div>
  <div class="card mt-3"><div class="card-body">
    <h3 style="font-size:0.95rem;font-weight:600;margin-bottom:0.5rem">📲 Pré-visualização antes de publicar</h3>
    <p class="text-muted text-sm">Veja como ficará a página personalizada da sua barbearia antes de compartilhar com os clientes.</p>
    <button class="btn btn-outline mt-2" onclick="previewPage()">👁 Abrir pré-visualização</button>
  </div></div>
</div>

</div><!-- /builderBody -->

<style>
.pb-tab { animation: fadeIn .2s ease; }
.pill-nav { display:flex;gap:0.5rem;flex-wrap:wrap; }
.pill-nav .pill { background:var(--bg-card);border:1px solid var(--border);border-radius:999px;padding:0.35rem 1rem;font-size:0.82rem;cursor:pointer;transition:.15s; }
.pill-nav .pill.active { background:var(--primary);color:#000;border-color:var(--primary);font-weight:600; }
.module-row { display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.9rem;border:1px solid var(--border);border-radius:8px;background:var(--bg-card);cursor:grab; }
.module-row input[type=checkbox] { width:16px;height:16px; }
</style>

<script>
let _pbCfg = null;
const _allModules = [
  { id:'hero',     label:'🖼 Hero / Banner principal' },
  { id:'services', label:'💈 Serviços' },
  { id:'carousel', label:'🎠 Carrossel de fotos' },
  { id:'hours',    label:'🕐 Horários de funcionamento' },
  { id:'location', label:'📍 Endereço / Localização' },
  { id:'whatsapp', label:'💬 Botão WhatsApp' },
  { id:'instagram',label:'📸 Link Instagram' },
  { id:'reviews',  label:'⭐ Avaliações (em breve)' },
];
let _carouselImgs = [];

document.addEventListener('DOMContentLoaded', async () => {
  <?php if ($isSuperAdmin): ?>
  const shops = await api('/api/admin/barbershops.php').catch(()=>[]);
  const sel   = document.getElementById('pbShopSelect');
  shops.forEach(s => { const o=document.createElement('option'); o.value=s.id; o.textContent=s.name; sel.appendChild(o); });
  <?php else: ?>
  loadPageConfig();
  <?php endif; ?>
});

// ── Tab switching ────────────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.pb-tab').forEach(t=>t.classList.add('hidden'));
  document.querySelectorAll('.pill-nav .pill').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name).classList.remove('hidden');
  event.currentTarget.classList.add('active');
}

// ── Load config ──────────────────────────────────────────────
async function loadPageConfig() {
  const shopId = document.getElementById('pbShopSelect').value;
  if (!shopId) return;

  // Update preview link
  const base = window.BASE_URL||'';
  document.getElementById('previewLink').innerHTML =
    `<a href="${base}/pages/barbershop-app.php?id=${shopId}" target="_blank">/pages/barbershop-app.php?id=${shopId}</a>`;

  try {
    _pbCfg = await api('/api/admin/page-builder.php?barbershopId=' + shopId);

    if (!_pbCfg._planAllowsCustomPage) {
      document.getElementById('planWarning').classList.remove('hidden');
      document.getElementById('builderBody').classList.add('hidden');
      return;
    }
    document.getElementById('planWarning').classList.add('hidden');
    document.getElementById('builderBody').classList.remove('hidden');

    if (!_pbCfg._planAllowsExclusiveApp) {
      document.getElementById('appModeLockedMsg').classList.remove('hidden');
      document.getElementById('pb-appMode').disabled = true;
    }

    // Fill fields
    document.getElementById('pb-whatsapp').value     = _pbCfg.whatsappNumber || '';
    document.getElementById('pb-instagram').value    = _pbCfg.instagramUrl   || '';
    document.getElementById('pb-css').value          = _pbCfg.customCss      || '';
    document.getElementById('pb-heroTitle').value    = _pbCfg.heroTitle       || '';
    document.getElementById('pb-heroSubtitle').value = _pbCfg.heroSubtitle    || '';
    document.getElementById('pb-heroImage').value    = _pbCfg.heroImageUrl    || '';
    document.getElementById('pb-primaryColor').value = _pbCfg.primaryColor   || '#f59e0b';
    document.getElementById('pb-primaryColorHex').value = _pbCfg.primaryColor|| '#f59e0b';
    document.getElementById('pb-accentColor').value  = _pbCfg.accentColor    || '#1a1a1a';
    document.getElementById('pb-accentColorHex').value  = _pbCfg.accentColor || '#1a1a1a';
    document.getElementById('pb-bgColor').value      = _pbCfg.bgColor        || '#0f0f0f';
    document.getElementById('pb-bgColorHex').value   = _pbCfg.bgColor        || '#0f0f0f';
    document.getElementById('pb-fontFamily').value   = _pbCfg.fontFamily      || 'Inter';
    document.getElementById('pb-appMode').checked    = !!_pbCfg.appMode;
    document.getElementById('pb-appName').value      = _pbCfg.appName        || '';
    document.getElementById('pb-appLogo').value      = _pbCfg.appLogoUrl     || '';
    document.getElementById('pb-appIcon').value      = _pbCfg.appIconUrl     || '';

    _carouselImgs = _pbCfg.carouselImages || [];
    renderCarousel();
    renderModules(_pbCfg.modules || []);
    previewHeroImg();
    previewAppLogo();
    if (_pbCfg.appMode) toggleAppMode(true);

    if(typeof updateStylePreview==='function') updateStylePreview();
  } catch(e) { toast('Erro ao carregar configuração: '+e.message,'error'); }
}

// ── Hero image preview ────────────────────────────────────────
function previewHeroImg() {
  const url = document.getElementById('pb-heroImage').value;
  const box = document.getElementById('heroImgPreview');
  const img = document.getElementById('heroImgEl');
  if (url) { box.style.display='block'; img.src=url; } else { box.style.display='none'; }
}

// ── App logo preview ─────────────────────────────────────────
function previewAppLogo() {
  const url = document.getElementById('pb-appLogo').value;
  const box = document.getElementById('appLogoPreview');
  const img = document.getElementById('appLogoImg');
  if (url) { box.style.display='block'; img.src=url; } else { box.style.display='none'; }
}

function toggleAppMode(on) {
  const fields = document.getElementById('appModeFields');
  if(on) fields.classList.remove('hidden'); else fields.classList.add('hidden');
}

// ── Carousel ─────────────────────────────────────────────────
function addCarouselImg() {
  const inp = document.getElementById('newCarouselUrl');
  const url = inp.value.trim();
  if (!url) return;
  _carouselImgs.push(url);
  inp.value = '';
  renderCarousel();
}

function removeCarouselImg(i) {
  _carouselImgs.splice(i,1);
  renderCarousel();
}

function renderCarousel() {
  const list    = document.getElementById('carouselList');
  const preview = document.getElementById('carouselPreview');
  list.innerHTML = _carouselImgs.map((u,i)=>`
    <div class="flex gap-2 items-center">
      <input class="form-input" value="${u.replace(/"/g,'&quot;')}" style="flex:1" oninput="_carouselImgs[${i}]=this.value;renderCarousel()">
      <button class="btn btn-sm btn-ghost btn-danger" onclick="removeCarouselImg(${i})">✕</button>
    </div>`).join('');
  preview.innerHTML = _carouselImgs.map(u=>
    `<img src="${u}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" onerror="this.style.display='none'">`
  ).join('');
}

// ── Modules ──────────────────────────────────────────────────
function renderModules(activeModules) {
  const list = document.getElementById('modulesList');
  // Sort: active modules first in their saved order, then inactive ones
  const ordered = [
    ..._allModules.filter(m => activeModules.includes(m.id)).sort((a,b)=>activeModules.indexOf(a.id)-activeModules.indexOf(b.id)),
    ..._allModules.filter(m => !activeModules.includes(m.id)),
  ];
  list.innerHTML = ordered.map(m=>`
    <div class="module-row" draggable="true" data-mod="${m.id}">
      <span style="color:var(--text-muted);cursor:grab">⠿</span>
      <input type="checkbox" ${activeModules.includes(m.id)?'checked':''} id="mod-${m.id}" onchange="reorderModules()">
      <label for="mod-${m.id}" style="flex:1;cursor:pointer">${m.label}</label>
    </div>`).join('');
  initDragSort(list);
}

function reorderModules() {} // Called on checkbox — order is determined by DOM

function getActiveModules() {
  return [...document.querySelectorAll('#modulesList .module-row')]
    .filter(r=>r.querySelector('input[type=checkbox]').checked)
    .map(r=>r.dataset.mod);
}

function initDragSort(list) {
  let dragging=null;
  list.querySelectorAll('.module-row').forEach(row=>{
    row.addEventListener('dragstart',()=>{ dragging=row; row.style.opacity='0.5'; });
    row.addEventListener('dragend',  ()=>{ dragging=null; row.style.opacity='1'; });
    row.addEventListener('dragover', e=>{ e.preventDefault(); const after=getDragAfter(list,e.clientY); if(!after) list.appendChild(dragging); else list.insertBefore(dragging,after); });
  });
}
function getDragAfter(list,y) {
  const els=[...list.querySelectorAll('.module-row:not([style*="opacity: 0.5"])')];
  return els.reduce((closest,el)=>{
    const box=el.getBoundingClientRect();
    const offset=y-box.top-box.height/2;
    if(offset<0&&offset>closest.offset) return{offset,el}; else return closest;
  },{offset:-Infinity}).el;
}

// ── Save ─────────────────────────────────────────────────────
async function savePage() {
  const shopId = document.getElementById('pbShopSelect').value;
  if (!shopId) { toast('Selecione uma barbearia','error'); return; }
  const body = {
    barbershopId:   shopId,
    primaryColor:   document.getElementById('pb-primaryColor').value,
    accentColor:    document.getElementById('pb-accentColor').value,
    bgColor:        document.getElementById('pb-bgColor').value,
    fontFamily:     document.getElementById('pb-fontFamily').value,
    heroTitle:      document.getElementById('pb-heroTitle').value.trim()||null,
    heroSubtitle:   document.getElementById('pb-heroSubtitle').value.trim()||null,
    heroImageUrl:   document.getElementById('pb-heroImage').value.trim()||null,
    carouselImages: _carouselImgs.filter(Boolean),
    modules:        getActiveModules(),
    customCss:      document.getElementById('pb-css').value||null,
    whatsappNumber: document.getElementById('pb-whatsapp').value.replace(/\D/g,'')||null,
    instagramUrl:   document.getElementById('pb-instagram').value.trim()||null,
    appMode:        document.getElementById('pb-appMode').checked,
    appName:        document.getElementById('pb-appName').value.trim()||null,
    appLogoUrl:     document.getElementById('pb-appLogo').value.trim()||null,
    appIconUrl:     document.getElementById('pb-appIcon').value.trim()||null,
  };
  try {
    await api('/api/admin/page-builder.php', { method:'PUT', body:JSON.stringify(body) });
    toast('Página salva com sucesso!','success');
  } catch(e) { toast(e.message,'error'); }
}

// ── Preview ──────────────────────────────────────────────────
function previewPage() {
  const shopId = document.getElementById('pbShopSelect').value;
  if (!shopId) { toast('Selecione uma barbearia','error'); return; }
  const base = window.BASE_URL||'';
  window.open(base + '/pages/barbershop-app.php?id=' + shopId + '&preview=1', '_blank');
}
</script>
