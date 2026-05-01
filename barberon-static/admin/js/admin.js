/**
 * Barberon Static Admin — Shared utilities
 * Requires: ../js/config.js, ../js/api.js, ../js/app.js
 */

// ── Admin navigation ──────────────────────────────────────────
const ADMIN_NAV = [
  { id:'dashboard',    icon:'📊', label:'Dashboard',       roles:['ADMIN','SUPERADMIN'] },
  { id:'services',     icon:'✂️',  label:'Serviços',        roles:['ADMIN','SUPERADMIN'] },
  { id:'bookings',     icon:'📅', label:'Agendamentos',     roles:['ADMIN','SUPERADMIN'] },
  { id:'hours',        icon:'🕐', label:'Horários',         roles:['ADMIN','SUPERADMIN'] },
  { id:'payment',      icon:'💳', label:'Pagamento',        roles:['ADMIN','SUPERADMIN'] },
  { id:'page-builder', icon:'🎨', label:'Page Builder',     roles:['ADMIN','SUPERADMIN'] },
  { id:'plans',        icon:'💎', label:'Meu Plano',        roles:['ADMIN','SUPERADMIN'] },
  { id:'barbershops',  icon:'🏪', label:'Barbearias',       roles:['SUPERADMIN'] },
  { id:'users',        icon:'👥', label:'Usuários',         roles:['SUPERADMIN'] },
  { id:'admins',       icon:'🔑', label:'Administradores',  roles:['SUPERADMIN'] },
  { id:'settings',     icon:'⚙️', label:'Configurações',    roles:['SUPERADMIN'] },
];

let _adminUser   = null;
let _activePage  = null;

// ── Bootstrap admin layout ────────────────────────────────────
async function initAdmin() {
  if (!Auth.isLoggedIn()) {
    window.location.href = ROOT + '/pages/login.html?cb=' + encodeURIComponent(window.location.href);
    return;
  }
  try {
    _adminUser = await apiMe();
  } catch(e) {
    Auth.clear();
    window.location.href = ROOT + '/pages/login.html';
    return;
  }
  if (!['ADMIN','SUPERADMIN'].includes(_adminUser.role)) {
    window.location.href = ROOT + '/index.html';
    return;
  }

  buildAdminLayout();

  // Route to page from URL hash or default
  const page = getParam('page') || 'dashboard';
  navigateTo(page);
}

function buildAdminLayout() {
  const user  = _adminUser;
  const role  = user.role;
  const links = ADMIN_NAV.filter(n => n.roles.includes(role));

  document.body.innerHTML = `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar" id="adminSidebar">
        <a href="${ROOT}/index.html" class="brand" style="padding:.75rem 1.25rem 1.25rem">
          <img src="${ROOT}/img/logo.svg" alt="Barberon" width="24" height="24">
          <span>Barberon</span>
        </a>
        <nav class="admin-nav" id="adminNav">
          ${links.map(n => `
            <a href="#" data-page="${n.id}" onclick="navigateTo('${n.id}');return false;">
              ${n.icon} ${n.label}
            </a>`).join('')}
          <a href="#" onclick="adminLogout();return false;" style="margin-top:auto;color:var(--danger)">
            🚪 Sair
          </a>
        </nav>
      </aside>

      <!-- Mobile nav -->
      <div class="admin-mobile-nav" id="adminMobileNav">
        ${links.map(n => `<a href="#" data-page="${n.id}" onclick="navigateTo('${n.id}');return false;">${n.icon} ${n.label}</a>`).join('')}
      </div>

      <!-- Main content -->
      <div style="flex:1;display:flex;flex-direction:column;min-width:0">
        <!-- Top bar -->
        <div style="background:var(--bg-card);border-bottom:1px solid var(--border);padding:.65rem 1.25rem;display:flex;align-items:center;gap:.75rem;position:sticky;top:0;z-index:50">
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('adminSidebar').style.display=document.getElementById('adminSidebar').style.display==='none'?'':'none'" style="display:none" id="menuToggle">☰</button>
          <span id="adminBreadcrumb" style="font-weight:600;font-size:.95rem;flex:1"></span>
          <span style="color:var(--text-muted);font-size:.8rem">${escHtml(user.name || user.email)}</span>
          <span class="badge badge-${role==='SUPERADMIN'?'primary':'warning'}" style="font-size:.65rem">${role}</span>
        </div>
        <div class="admin-main" id="adminContent">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
    <div id="toastContainer"></div>
    <style>
      @media(max-width:768px){
        .admin-sidebar{display:none!important}
        .admin-mobile-nav{display:flex!important}
      }
      .admin-layout{height:100vh;overflow:hidden}
      .admin-main{overflow-y:auto;height:100%}
    </style>
  `;
}

function navigateTo(page) {
  const user = _adminUser;
  const nav  = ADMIN_NAV.find(n => n.id === page);
  if (!nav || !nav.roles.includes(user.role)) page = 'dashboard';

  _activePage = page;

  // Update active link
  document.querySelectorAll('[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  // Update breadcrumb
  const n = ADMIN_NAV.find(x => x.id === page);
  const bc = document.getElementById('adminBreadcrumb');
  if (bc && n) bc.textContent = n.icon + ' ' + n.label;

  // Update URL without reload
  const url = new URL(window.location.href);
  url.searchParams.set('page', page);
  window.history.replaceState({}, '', url);

  // Load page content
  const content = document.getElementById('adminContent');
  content.innerHTML = '<div class="spinner"></div>';

  const loader = PAGE_LOADERS[page];
  if (loader) {
    Promise.resolve(loader(content, user)).catch(e => {
      content.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
    });
  } else {
    content.innerHTML = `<p class="text-muted">Página "${page}" não encontrada.</p>`;
  }
}

function adminLogout() {
  apiLogout();
}

// ── Dialog helpers ────────────────────────────────────────────
function openDialog(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeDialog(id) {
  document.getElementById(id)?.classList.remove('open');
}

// ── PAGE_LOADERS registry ─────────────────────────────────────
// Each page registers itself here:
const PAGE_LOADERS = {};
