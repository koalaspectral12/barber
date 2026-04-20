<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';

$user = current_user();
if (!$user) {
    header('Location: /pages/login.php?callbackUrl=' . urlencode('/admin/'));
    exit;
}
if (!in_array($user['role'], ['ADMIN', 'SUPERADMIN'])) {
    header('Location: /?error=unauthorized');
    exit;
}

require_once __DIR__ . '/../includes/db.php';

// Get admin context
$ctx = get_admin_context();
$isSuperAdmin = $user['role'] === 'SUPERADMIN';

function admin_nav_item(string $href, string $icon, string $label, string $page): string {
    $current = $_GET['page'] ?? 'dashboard';
    $active  = $current === $page ? ' active' : '';
    return "<a href=\"/admin/?page={$page}\" class=\"{$active}\">{$icon} {$label}</a>";
}
?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin — Barberon</title>
  <link rel="icon" href="/public/img/logo.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/public/css/style.css">
</head>
<body>
<div class="admin-layout">

  <!-- Sidebar (desktop) -->
  <aside class="admin-sidebar">
    <a href="/admin/" class="brand flex items-center gap-2">
      <img src="/public/img/logo.png" alt="" width="22" height="22">
      <span>Barberon</span>
    </a>
    <nav class="admin-nav">
      <?= admin_nav_item('/admin/', '📊', 'Dashboard',    'dashboard') ?>
      <?php if ($isSuperAdmin): ?>
        <?= admin_nav_item('/admin/', '🏪', 'Barbearias',  'barbershops') ?>
      <?php endif; ?>
      <?= admin_nav_item('/admin/', '💈', 'Serviços',     'services') ?>
      <?= admin_nav_item('/admin/', '📅', 'Agendamentos', 'bookings') ?>
      <?= admin_nav_item('/admin/', '🕐', 'Horários',     'hours') ?>
      <?= admin_nav_item('/admin/', '💳', 'Pagamento',    'payment') ?>
      <?php if ($isSuperAdmin): ?>
        <?= admin_nav_item('/admin/', '👥', 'Admins',      'admins') ?>
        <?= admin_nav_item('/admin/', '👤', 'Clientes',    'users') ?>
        <?= admin_nav_item('/admin/', '⚙️', 'Configurações','settings') ?>
      <?php endif; ?>
    </nav>
    <div style="margin-top:auto;padding:1.25rem;border-top:1px solid var(--border);font-size:0.8rem;color:var(--text-muted)">
      <p class="truncate font-semibold" style="color:var(--text)"><?= htmlspecialchars($user['name'] ?? '') ?></p>
      <p class="truncate"><?= htmlspecialchars($user['email']) ?></p>
      <p class="mt-1"><span class="badge badge-primary"><?= $user['role'] ?></span></p>
      <div class="mt-2 flex gap-2">
        <a href="/" class="btn btn-ghost btn-sm">← Site</a>
        <button class="btn btn-ghost btn-sm" onclick="authLogout()">Sair</button>
      </div>
    </div>
  </aside>

  <!-- Mobile nav tabs -->
  <div class="admin-mobile-nav">
    <a href="/admin/?page=dashboard" class="<?= (($_GET['page'] ?? 'dashboard') === 'dashboard') ? 'active' : '' ?>">📊 Dashboard</a>
    <?php if ($isSuperAdmin): ?>
    <a href="/admin/?page=barbershops" class="<?= (($_GET['page'] ?? '') === 'barbershops') ? 'active' : '' ?>">🏪 Barbearias</a>
    <?php endif; ?>
    <a href="/admin/?page=services"  class="<?= (($_GET['page'] ?? '') === 'services')  ? 'active' : '' ?>">💈 Serviços</a>
    <a href="/admin/?page=bookings"  class="<?= (($_GET['page'] ?? '') === 'bookings')  ? 'active' : '' ?>">📅 Agenda</a>
    <a href="/admin/?page=hours"     class="<?= (($_GET['page'] ?? '') === 'hours')     ? 'active' : '' ?>">🕐 Horários</a>
    <?php if ($isSuperAdmin): ?>
    <a href="/admin/?page=admins"    class="<?= (($_GET['page'] ?? '') === 'admins')    ? 'active' : '' ?>">👥 Admins</a>
    <a href="/admin/?page=users"     class="<?= (($_GET['page'] ?? '') === 'users')     ? 'active' : '' ?>">👤 Clientes</a>
    <a href="/admin/?page=settings"  class="<?= (($_GET['page'] ?? '') === 'settings')  ? 'active' : '' ?>">⚙️ Config</a>
    <?php endif; ?>
  </div>

  <!-- Main content -->
  <main class="admin-main">
    <?php
    $page = $_GET['page'] ?? 'dashboard';
    $allowed = ['dashboard','barbershops','services','bookings','hours','payment','admins','users','settings'];
    if (!in_array($page, $allowed)) $page = 'dashboard';
    // Restrict non-superadmin pages
    $superAdminOnly = ['barbershops','admins','users','settings'];
    if (in_array($page, $superAdminOnly) && !$isSuperAdmin) $page = 'dashboard';

    include __DIR__ . "/pages/{$page}.php";
    ?>
  </main>

</div>
<div id="toastContainer"></div>
<script src="/public/js/app.js"></script>
<script src="/public/js/admin.js"></script>
</body>
</html>
