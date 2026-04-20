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
$shop['services'] = DB::fetchAll('SELECT * FROM BarbershopService WHERE barbershopId = ? ORDER BY name', [$id]);
foreach ($shop['services'] as &$s) $s['price'] = (float) $s['price'];
$shop['hours']    = DB::fetchAll('SELECT * FROM BarbershopHours WHERE barbershopId = ? ORDER BY dayOfWeek', [$id]);
$shop['payment']  = DB::fetchOne('SELECT active, mpPublicKey FROM PaymentConfig WHERE barbershopId = ? LIMIT 1', [$id]);

$days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

layout_start($shop['name']);
?>
<div class="shop-hero">
  <img src="<?= htmlspecialchars($shop['imageUrl']) ?>" alt="<?= htmlspecialchars($shop['name']) ?>">
  <a href="<?= $base ?>/pages/barbershops.php" class="shop-back btn btn-outline btn-sm">← Voltar</a>
</div>

<div class="shop-info">
  <h1><?= htmlspecialchars($shop['name']) ?></h1>
  <p class="address">📍 <?= htmlspecialchars($shop['address']) ?></p>
  <?php if (!empty($shop['phones'])): ?>
    <div class="mt-2 flex gap-2" style="flex-wrap:wrap">
      <?php foreach ($shop['phones'] as $p): ?>
        <a href="tel:<?= htmlspecialchars($p) ?>" class="badge">📞 <?= htmlspecialchars($p) ?></a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
  <p class="text-muted text-sm mt-2"><?= nl2br(htmlspecialchars($shop['description'])) ?></p>
</div>

<?php if (!empty($shop['hours'])): ?>
<div class="container mb-2">
  <p class="section-title">Horários de funcionamento</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem">
    <?php foreach ($shop['hours'] as $h): ?>
    <div class="card" style="padding:0.5rem">
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
    <p class="text-muted text-sm">Nenhum serviço cadastrado.</p>
  <?php else: ?>
  <div class="services-list" style="padding:0;margin-bottom:2rem">
    <?php foreach ($shop['services'] as $svc): ?>
    <div class="service-card">
      <img src="<?= htmlspecialchars($svc['imageUrl']) ?>" alt="<?= htmlspecialchars($svc['name']) ?>" loading="lazy">
      <div class="info">
        <p class="name"><?= htmlspecialchars($svc['name']) ?></p>
        <p class="desc"><?= htmlspecialchars($svc['description']) ?></p>
        <p class="price"><?= 'R$ ' . number_format($svc['price'], 2, ',', '.') ?></p>
      </div>
      <button class="btn btn-primary btn-sm book-btn"
        onclick="requireLogin(() => openBookingModal('<?= $svc['id'] ?>', '<?= addslashes($svc['name']) ?>', '<?= $id ?>'))">
        Reservar
      </button>
    </div>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</div>

<?php include __DIR__ . '/../includes/booking-modal.php'; ?>

<script>
function requireLogin(fn) {
  const user = <?= json_encode(current_user() ? ['id' => current_user()['id']] : null) ?>;
  if (!user) {
    window.location.href = _BASE + '/pages/login.php?callbackUrl=' + encodeURIComponent(window.location.href);
    return;
  }
  fn();
}
</script>
<?php layout_end(); ?>
