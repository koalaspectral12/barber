<?php
/**
 * HTML layout helper — renders the outer HTML shell.
 * Usage: layout_start('Page Title'); ... layout_end();
 */
function layout_start(string $title = 'Barberon', string $extraCss = ''): void {
    require_once __DIR__ . '/config.php';
    require_once __DIR__ . '/auth.php';
    $user = current_user();
    $isAdmin = $user && in_array($user['role'], ['ADMIN','SUPERADMIN']);
    ?>
<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title) ?> — Barberon</title>
    <link rel="icon" href="<?= BASE_URL ?>/public/img/logo.png" type="image/png">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Main CSS -->
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/css/style.css">
    <?= $extraCss ?>
</head>
<body>
<header class="site-header">
  <div class="header-inner">
    <a href="<?= BASE_URL ?>/" class="brand">
      <img src="<?= BASE_URL ?>/public/img/logo.png" alt="Barberon" width="28" height="28">
      <span>Barberon</span>
    </a>
    <nav class="header-nav">
      <?php if ($user): ?>
        <span class="header-user"><?= htmlspecialchars($user['name'] ?? $user['email']) ?></span>
        <?php if ($isAdmin): ?>
          <a href="<?= BASE_URL ?>/admin/" class="btn btn-sm btn-outline">Administrador</a>
        <?php endif; ?>
        <a href="<?= BASE_URL ?>/pages/bookings.php" class="btn btn-sm btn-ghost">Agendamentos</a>
        <button class="btn btn-sm btn-ghost" onclick="authLogout()">Sair</button>
      <?php else: ?>
        <a href="<?= BASE_URL ?>/pages/login.php" class="btn btn-sm btn-primary">Entrar</a>
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
        <a href="<?= BASE_URL ?>/admin/">Administrador</a>
      <?php endif; ?>
      <a href="<?= BASE_URL ?>/pages/bookings.php">Agendamentos</a>
      <a href="#" onclick="authLogout(); return false;">Sair</a>
    <?php else: ?>
      <a href="<?= BASE_URL ?>/pages/login.php">Entrar</a>
      <a href="<?= BASE_URL ?>/pages/register.php">Criar conta</a>
    <?php endif; ?>
  </div>
</header>
<main class="main-content">
<?php
}

function layout_end(): void { ?>
</main>
<footer class="site-footer">
  <p>© <?= date('Y') ?> Barberon · Todos os direitos reservados.</p>
  <p><a href="<?= BASE_URL ?>/pages/about.php">Sobre nós</a></p>
</footer>
<script src="<?= BASE_URL ?>/public/js/app.js"></script>
</body>
</html>
<?php
}
