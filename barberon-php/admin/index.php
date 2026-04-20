<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';

$base = BASE_URL; // '' or '/barberon' etc.

$user = current_user();
if (!$user) {
    header('Location: ' . $base . '/pages/login.php?callbackUrl=' . urlencode($base . '/admin/'));
    exit;
}
if (!in_array($user['role'], ['ADMIN', 'SUPERADMIN'])) {
    header('Location: ' . $base . '/?error=unauthorized');
    exit;
}

require_once __DIR__ . '/../includes/db.php';

// Get admin context
$ctx = get_admin_context();
$isSuperAdmin = $user['role'] === 'SUPERADMIN';

function admin_nav_item(string $icon, string $label, string $page): string {
    global $base;
    $current = $_GET['page'] ?? 'dashboard';
    $active  = $current === $page ? ' active' : '';
    return "<a href=\"{$base}/admin/?page={$page}\" class=\"{$active}\">{$icon} {$label}</a>";
}

$curPage = $_GET['page'] ?? 'dashboard';
function is_page(string $p): string {
    global $curPage;
    return $curPage === $p ? 'active' : '';
}
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin — Barberon</title>
  <link rel="icon" href="<?= $base ?>/public/img/logo.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= $base ?>/public/css/style.css">
  <!-- Inject BASE_URL FIRST so api() and _BASE work in inline scripts -->
  <script>window.BASE_URL = <?= json_encode($base) ?>;</script>
  <!-- Load app.js and admin.js in <head> so api() is defined before inline scripts run -->
  <script src="<?= $base ?>/public/js/app.js"></script>
  <script src="<?= $base ?>/public/js/admin.js"></script>
</head>
<body>
<div class="admin-layout">

  <!-- Sidebar (desktop) -->
  <aside class="admin-sidebar">
    <a href="<?= $base ?>/admin/" class="brand flex items-center gap-2">
      <img src="<?= $base ?>/public/img/logo.svg" alt="" width="22" height="22">
      <span>Barberon</span>
    </a>
    <nav class="admin-nav">
      <?= admin_nav_item('📊', 'Dashboard',    'dashboard') ?>
      <?php if ($isSuperAdmin): ?>
        <?= admin_nav_item('🏪', 'Barbearias',  'barbershops') ?>
      <?php endif; ?>
      <?= admin_nav_item('💈', 'Serviços',     'services') ?>
      <?= admin_nav_item('📅', 'Agendamentos', 'bookings') ?>
      <?= admin_nav_item('🕐', 'Horários',     'hours') ?>
      <?= admin_nav_item('💳', 'Pagamento',    'payment') ?>
      <?php if ($isSuperAdmin): ?>
        <?= admin_nav_item('👥', 'Admins',      'admins') ?>
        <?= admin_nav_item('👤', 'Clientes',    'users') ?>
        <?= admin_nav_item('⚙️', 'Configurações','settings') ?>
      <?php endif; ?>
    </nav>
    <div style="margin-top:auto;padding:1.25rem;border-top:1px solid var(--border);font-size:0.8rem;color:var(--text-muted)">
      <p class="truncate font-semibold" style="color:var(--text)"><?= htmlspecialchars($user['name'] ?? '') ?></p>
      <p class="truncate"><?= htmlspecialchars($user['email']) ?></p>
      <p class="mt-1"><span class="badge badge-primary"><?= $user['role'] ?></span></p>
      <div class="mt-2 flex gap-2">
        <a href="<?= $base ?>/" class="btn btn-ghost btn-sm">← Site</a>
        <button class="btn btn-ghost btn-sm" onclick="authLogout()">Sair</button>
      </div>
    </div>
  </aside>

  <!-- Mobile nav tabs -->
  <div class="admin-mobile-nav">
    <a href="<?= $base ?>/admin/?page=dashboard" class="<?= is_page('dashboard') ?>">📊 Dashboard</a>
    <?php if ($isSuperAdmin): ?>
    <a href="<?= $base ?>/admin/?page=barbershops" class="<?= is_page('barbershops') ?>">🏪 Barbearias</a>
    <?php endif; ?>
    <a href="<?= $base ?>/admin/?page=services"  class="<?= is_page('services')  ?>">💈 Serviços</a>
    <a href="<?= $base ?>/admin/?page=bookings"  class="<?= is_page('bookings')  ?>">📅 Agenda</a>
    <a href="<?= $base ?>/admin/?page=hours"     class="<?= is_page('hours')     ?>">🕐 Horários</a>
    <?php if ($isSuperAdmin): ?>
    <a href="<?= $base ?>/admin/?page=admins"    class="<?= is_page('admins')    ?>">👥 Admins</a>
    <a href="<?= $base ?>/admin/?page=users"     class="<?= is_page('users')     ?>">👤 Clientes</a>
    <a href="<?= $base ?>/admin/?page=settings"  class="<?= is_page('settings')  ?>">⚙️ Config</a>
    <?php endif; ?>
  </div>

  <!-- Main content -->
  <main class="admin-main">
    <?php
    $page = $_GET['page'] ?? 'dashboard';
    $allowed        = ['dashboard','barbershops','services','bookings','hours','payment','admins','users','settings'];
    $superAdminOnly = ['barbershops','admins','users','settings'];
    if (!in_array($page, $allowed)) $page = 'dashboard';
    if (in_array($page, $superAdminOnly) && !$isSuperAdmin) $page = 'dashboard';

    include __DIR__ . "/pages/{$page}.php";
    ?>
  </main>

</div>
<div id="toastContainer"></div>
</body>
</html>
