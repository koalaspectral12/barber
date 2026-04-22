<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';

$base = BASE_URL;

$id = $_GET['id'] ?? null;
if (!$id) { header('Location: ' . $base . '/'); exit; }

$shop = DB::fetchOne('SELECT * FROM Barbershop WHERE id = ? LIMIT 1', [$id]);
if (!$shop) {
    http_response_code(404);
    layout_start('Não encontrado');
    echo '<div class="container section text-center"><p>Barbearia não encontrada.</p>'
       . '<a href="' . $base . '/" class="btn btn-outline mt-4">Voltar</a></div>';
    layout_end();
    exit;
}

$shop['phones']   = json_decode($shop['phones'] ?? '[]', true) ?: [];
$shop['services'] = DB::fetchAll(
    'SELECT * FROM BarbershopService WHERE barbershopId = ? ORDER BY name', [$id]
);
foreach ($shop['services'] as &$s) {
    $s['price']    = (float) $s['price'];
    $s['duration'] = $s['duration'] ?? '00:30';
}
unset($s);

$shop['hours']   = DB::fetchAll(
    'SELECT * FROM BarbershopHours WHERE barbershopId = ? ORDER BY dayOfWeek', [$id]
);
$shop['payment'] = DB::fetchOne(
    'SELECT active, mpPublicKey FROM PaymentConfig WHERE barbershopId = ? LIMIT 1', [$id]
);

$days      = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
$daysLong  = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

// Helper: format duration "00:30" → "30 min", "01:00" → "1h", "01:30" → "1h 30min"
function formatDuration(string $dur): string {
    [$h, $m] = explode(':', $dur . ':00');
    $h = (int)$h; $m = (int)$m;
    if ($h === 0) return $m . ' min';
    if ($m === 0) return $h . 'h';
    return $h . 'h ' . $m . 'min';
}

$currentUser = current_user();
layout_start($shop['name']);
?>

<div class="shop-hero">
  <img src="<?= htmlspecialchars($shop['imageUrl']) ?>" alt="<?= htmlspecialchars($shop['name']) ?>">
  <a href="<?= $base ?>/pages/barbershops.php" class="shop-back btn btn-outline btn-sm">← Voltar</a>
</div>

<div class="shop-info container">
  <h1><?= htmlspecialchars($shop['name']) ?></h1>
  <p class="address">📍 <?= htmlspecialchars($shop['address']) ?></p>
  <?php if (!empty($shop['phones'])): ?>
    <div class="mt-2 flex gap-2" style="flex-wrap:wrap">
      <?php foreach ($shop['phones'] as $p): ?>
        <a href="tel:<?= htmlspecialchars($p) ?>" class="badge">📞 <?= htmlspecialchars($p) ?></a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
  <?php if (!empty($shop['description'])): ?>
    <p class="text-muted text-sm mt-2"><?= nl2br(htmlspecialchars($shop['description'])) ?></p>
  <?php endif; ?>
</div>

<?php if (!empty($shop['hours'])): ?>
<div class="container mb-4">
  <p class="section-title">Horários de funcionamento</p>
  <div class="hours-grid">
    <?php foreach ($shop['hours'] as $h): ?>
    <div class="hours-card">
      <p class="font-semibold text-sm"><?= $days[$h['dayOfWeek']] ?></p>
      <p class="text-muted text-xs"><?= $h['openTime'] ?> – <?= $h['closeTime'] ?></p>
    </div>
    <?php endforeach; ?>
  </div>
</div>
<?php endif; ?>

<div class="container">
  <p class="section-title">Serviços</p>
  <?php if (empty($shop['services'])): ?>
    <div class="empty-state">
      <p class="text-muted text-sm">Nenhum serviço cadastrado nesta barbearia.</p>
    </div>
  <?php else: ?>
  <div class="services-list">
    <?php foreach ($shop['services'] as $svc): ?>
    <div class="service-card">
      <img src="<?= htmlspecialchars($svc['imageUrl']) ?>"
           alt="<?= htmlspecialchars($svc['name']) ?>"
           loading="lazy"
           onerror="this.src='<?= $base ?>/public/img/placeholder.png'">
      <div class="info">
        <p class="name"><?= htmlspecialchars($svc['name']) ?></p>
        <p class="desc"><?= htmlspecialchars($svc['description']) ?></p>
        <div class="flex gap-2 mt-2" style="align-items:center">
          <p class="price">R$ <?= number_format($svc['price'], 2, ',', '.') ?></p>
          <span class="badge" title="Duração do serviço">
            🕐 <?= formatDuration($svc['duration']) ?>
          </span>
        </div>
      </div>
      <button class="btn btn-primary btn-sm book-btn"
        onclick="requireLogin(() => openBookingModal(
          '<?= htmlspecialchars($svc['id']) ?>',
          '<?= htmlspecialchars(addslashes($svc['name'])) ?>',
          '<?= htmlspecialchars($id) ?>',
          '<?= htmlspecialchars($svc['duration']) ?>',
          <?= $svc['price'] ?>
        ))">
        Reservar
      </button>
    </div>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</div>

<?php include __DIR__ . '/../includes/booking-modal.php'; ?>

<style>
.shop-info { padding: 1.25rem 1rem; }
.shop-info h1 { font-size: 1.3rem; font-weight: 700; }
.shop-info .address { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem; }

.hours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}
.hours-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 0.5rem 0.75rem;
}

.empty-state {
  text-align: center; padding: 3rem 1rem;
  border: 1px dashed var(--border); border-radius: var(--radius);
  margin-bottom: 2rem;
}

.services-list { display: flex; flex-direction: column; gap: 0.75rem; padding-bottom: 2rem; }
.service-card {
  display: flex; gap: 1rem; align-items: center;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden; padding: 0.75rem;
  transition: border-color .15s;
}
.service-card:hover { border-color: var(--primary); }
.service-card img { width: 80px; height: 80px; object-fit: cover; border-radius: calc(var(--radius) - 2px); flex-shrink: 0; }
.service-card .info { flex: 1; min-width: 0; }
.service-card .name { font-weight: 600; font-size: 0.95rem; }
.service-card .desc { color: var(--text-muted); font-size: 0.8rem; margin-top: 0.2rem;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.service-card .price { font-weight: 700; color: var(--primary); font-size: 0.9rem; }
.service-card .book-btn { margin-left: auto; flex-shrink: 0; }

/* Modal steps */
.modal-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; }
.modal-close { background: none; border: none; color: var(--text-muted); font-size: 1.2rem; cursor: pointer; padding: 0; margin-left: 0.5rem; }

/* Booking summary */
.bk-summary {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
}
.bk-summary-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.6rem 0.85rem; font-size: 0.875rem;
  border-bottom: 1px solid var(--border);
}
.bk-summary-row:last-child { border-bottom: none; }
.bk-summary-row span { color: var(--text-muted); }

@media (max-width: 480px) {
  .service-card { flex-wrap: wrap; }
  .service-card img { width: 60px; height: 60px; }
  .service-card .book-btn { width: 100%; margin-top: 0.5rem; margin-left: 0; }
}
</style>

<script>
// Current user injected server-side
const _currentUser = <?= json_encode($currentUser ? ['id' => $currentUser['id']] : null) ?>;

function requireLogin(fn) {
  if (!_currentUser) {
    window.location.href = _BASE + '/pages/login.php?callbackUrl=' + encodeURIComponent(window.location.href);
    return;
  }
  fn();
}
</script>
<?php layout_end(); ?>
