<?php
/**
 * HTML layout helper — renders the outer HTML shell.
 * Usage: layout_start('Page Title'); ... layout_end();
 */
function layout_start(string $title = 'Barberon', string $extraCss = ''): void {
    require_once __DIR__ . '/config.php';
    require_once __DIR__ . '/auth.php';
    $user    = current_user();
    $isAdmin = $user && in_array($user['role'], ['ADMIN','SUPERADMIN']);
    $base    = BASE_URL; // e.g. '' or '/barberon'
    ?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title) ?> — Barberon</title>
    <link rel="icon" href="<?= $base ?>/public/img/logo.svg" type="image/svg+xml">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Main CSS -->
    <link rel="stylesheet" href="<?= $base ?>/public/css/style.css">
    <?= $extraCss ?>
    <!-- Inject PHP BASE_URL into JS so api() calls work in any subfolder -->
    <script>window.BASE_URL = <?= json_encode($base) ?>;</script>
</head>
<body>
<header class="site-header">
  <div class="header-inner">
    <a href="<?= $base ?>/" class="brand">
      <img src="<?= $base ?>/public/img/logo.svg" alt="Barberon" width="28" height="28">
      <span>Barberon</span>
    </a>
    <nav class="header-nav">
      <?php if ($user): ?>
        <span class="header-user"><?= htmlspecialchars($user['name'] ?? $user['email']) ?></span>
        <?php if ($isAdmin): ?>
          <a href="<?= $base ?>/admin/" class="btn btn-sm btn-outline">Administrador</a>
        <?php endif; ?>
        <a href="<?= $base ?>/pages/bookings.php" class="btn btn-sm btn-ghost">Agendamentos</a>
        <button class="btn btn-sm btn-ghost" onclick="authLogout()">Sair</button>
      <?php else: ?>
        <a href="<?= $base ?>/pages/login.php" class="btn btn-sm btn-primary">Entrar</a>
      <?php endif; ?>
    </nav>
    <!-- Mobile hamburger -->
    <button class="hamburger" onclick="toggleMenu()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
  <!-- Mobile dropdown -->
  <div class="mobile-menu" id="mobileMenu">
    <?php if ($user): ?>
      <span class="mobile-user"><?= htmlspecialchars($user['name'] ?? $user['email']) ?></span>
      <?php if ($isAdmin): ?>
        <a href="<?= $base ?>/admin/">Administrador</a>
      <?php endif; ?>
      <a href="<?= $base ?>/pages/bookings.php">Agendamentos</a>
      <a href="#" onclick="authLogout(); return false;">Sair</a>
    <?php else: ?>
      <a href="<?= $base ?>/pages/login.php">Entrar</a>
      <a href="<?= $base ?>/pages/register.php">Criar conta</a>
    <?php endif; ?>
  </div>
</header>
<main class="main-content">
<?php
}

function layout_end(): void {
    $base = BASE_URL;
    ?>
</main>
<footer class="site-footer">
  <p>© <?= date('Y') ?> Barberon · Todos os direitos reservados.</p>
  <p><a href="<?= $base ?>/pages/about.php">Sobre nós</a></p>
</footer>
<script src="<?= $base ?>/public/js/app.js"></script>
</body>
</html>
<?php
}
