<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';

$search = trim($_GET['search'] ?? '');

$barbershops = [];
try {
    try {
        if ($search) {
            $like = '%' . $search . '%';
            $barbershops = DB::fetchAll(
                'SELECT DISTINCT b.* FROM Barbershop b
                 LEFT JOIN BarbershopService s ON s.barbershopId = b.id
                 WHERE b.active = 1 AND (b.name LIKE ? OR s.name LIKE ?)
                 ORDER BY b.name LIMIT 50',
                [$like, $like]
            );
        } else {
            $barbershops = DB::fetchAll('SELECT * FROM Barbershop WHERE active = 1 ORDER BY name LIMIT 50');
        }
    } catch (\Throwable $e) {
        if ($search) {
            $like = '%' . $search . '%';
            $barbershops = DB::fetchAll(
                'SELECT DISTINCT b.* FROM Barbershop b
                 LEFT JOIN BarbershopService s ON s.barbershopId = b.id
                 WHERE b.name LIKE ? OR s.name LIKE ?
                 ORDER BY b.name LIMIT 50',
                [$like, $like]
            );
        } else {
            $barbershops = DB::fetchAll('SELECT * FROM Barbershop ORDER BY name LIMIT 50');
        }
    }
    foreach ($barbershops as &$b) $b['phones'] = json_decode($b['phones'] ?? '[]', true) ?: [];
} catch (\Throwable $e) {}

$title = $search ? "Resultados para \"$search\"" : 'Barbearias';
$base = BASE_URL;
layout_start($title);
?>
<div class="container section">
  <div class="flex items-center gap-4 mb-4" style="flex-wrap:wrap">
    <h1 style="font-size:1.3rem;font-weight:700"><?= htmlspecialchars($title) ?></h1>
    <a href="<?= $base ?>/" class="btn btn-ghost btn-sm">← Início</a>
  </div>

  <div class="search-bar mb-4">
    <span style="color:var(--text-muted);padding:0 4px">🔍</span>
    <input id="searchInput" type="text" placeholder="Buscar barbearia ou serviço…" value="<?= htmlspecialchars($search) ?>">
    <button onclick="doSearch()" class="btn btn-primary btn-sm">Buscar</button>
  </div>

  <?php if (empty($barbershops)): ?>
    <p class="text-muted text-center" style="margin-top:2rem">
      Nenhuma barbearia encontrada<?= $search ? ' para "' . htmlspecialchars($search) . '"' : '' ?>.
    </p>
  <?php else: ?>
  <div class="barbershop-grid">
    <?php foreach ($barbershops as $b): ?>
    <div class="card barbershop-card">
      <a href="<?= $base ?>/pages/barbershop.php?id=<?= urlencode($b['id']) ?>">
        <img src="<?= htmlspecialchars($b['imageUrl']) ?>" alt="<?= htmlspecialchars($b['name']) ?>" loading="lazy">
        <div class="card-body">
          <p class="card-title"><?= htmlspecialchars($b['name']) ?></p>
          <p class="card-sub"><?= htmlspecialchars($b['address']) ?></p>
        </div>
      </a>
    </div>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</div>
<?php layout_end(); ?>
