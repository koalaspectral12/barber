<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/layout.php';

// Fetch settings
$appName = 'Barberon';
$banners = [];
try {
    $settings = DB::fetchOne('SELECT * FROM AppSettings WHERE id = ? LIMIT 1', ['singleton']);
    if ($settings) {
        $appName = $settings['appName'] ?? 'Barberon';
        $banners = json_decode($settings['banners'] ?? '[]', true) ?: [];
    }
} catch (\Throwable $e) {}

// Fetch barbershops
$barbershops        = [];
$popularBarbershops = [];
try {
    try {
        $barbershops        = DB::fetchAll('SELECT * FROM Barbershop WHERE active = 1 ORDER BY createdAt DESC LIMIT 10');
        $popularBarbershops = DB::fetchAll('SELECT * FROM Barbershop WHERE active = 1 ORDER BY name ASC LIMIT 10');
    } catch (\Throwable $e) {
        $barbershops        = DB::fetchAll('SELECT * FROM Barbershop ORDER BY createdAt DESC LIMIT 10');
        $popularBarbershops = DB::fetchAll('SELECT * FROM Barbershop ORDER BY name ASC LIMIT 10');
    }
    foreach ($barbershops as &$b)        $b['phones'] = json_decode($b['phones'] ?? '[]', true) ?: [];
    foreach ($popularBarbershops as &$b) $b['phones'] = json_decode($b['phones'] ?? '[]', true) ?: [];
} catch (\Throwable $e) {}

$quickSearch = [
  ['label' => 'Cabelo',      'emoji' => '✂️',  'search' => 'Cabelo'],
  ['label' => 'Barba',       'emoji' => '🧔',  'search' => 'Barba'],
  ['label' => 'Sobrancelha', 'emoji' => '🪮',  'search' => 'Sobrancelha'],
  ['label' => 'Massagem',    'emoji' => '💆',  'search' => 'Massagem'],
  ['label' => 'Hidratação',  'emoji' => '💧',  'search' => 'Hidratação'],
  ['label' => 'Acabamento',  'emoji' => '⚡',  'search' => 'Acabamento'],
];

$today = date_create('now', timezone_open('America/Sao_Paulo'));
$todayFmt = strftime_compat($today);

function strftime_compat(\DateTime $dt): string {
    $days = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
    $months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    $d = (int)$dt->format('w');
    $m = (int)$dt->format('n') - 1;
    return $days[$d] . ', ' . $dt->format('d') . ' de ' . $months[$m];
}

layout_start($appName);
?>

<div class="hero container">
  <h1>Olá! Bem-vindo ao <?= htmlspecialchars($appName) ?></h1>
  <p class="mt-1"><?= htmlspecialchars(ucfirst($todayFmt)) ?></p>

  <div class="search-bar mt-4">
    <span style="color:var(--text-muted);padding:0 4px">🔍</span>
    <input id="searchInput" type="text" placeholder="Buscar barbearia ou serviço…">
    <button onclick="doSearch()" class="btn btn-primary btn-sm">Buscar</button>
  </div>

  <div class="pills mt-4">
    <?php foreach ($quickSearch as $qs): ?>
      <a href="<?= $base ?>/pages/barbershops.php?search=<?= urlencode($qs['search']) ?>" class="pill">
        <span><?= $qs['emoji'] ?></span>
        <span><?= htmlspecialchars($qs['label']) ?></span>
      </a>
    <?php endforeach; ?>
  </div>
</div>

<?php if (!empty($banners)): ?>
<div class="container mt-4">
  <div class="carousel">
    <div class="carousel-track">
      <?php foreach ($banners as $url): ?>
        <div class="carousel-slide">
          <img src="<?= htmlspecialchars($url) ?>" alt="Banner" loading="lazy">
        </div>
      <?php endforeach; ?>
    </div>
    <?php if (count($banners) > 1): ?>
    <button class="carousel-btn prev">‹</button>
    <button class="carousel-btn next">›</button>
    <div class="carousel-dots"></div>
    <?php endif; ?>
  </div>
</div>
<?php endif; ?>

<!-- Upcoming bookings (loaded by JS) -->
<div class="container mt-6" id="upcomingSection" style="display:none">
  <p class="section-title">Agendamentos próximos</p>
  <div id="upcomingList"></div>
</div>

<?php if (!empty($barbershops)): ?>
<div class="container section">
  <p class="section-title">Recomendados</p>
  <div class="barbershop-grid">
    <?php foreach ($barbershops as $b): ?>
    <div class="card barbershop-card">
      <a href="<?= $base ?>/pages/barbershop.php?id=<?= urlencode($b['id']) ?>">
        <img src="<?= htmlspecialchars($b['imageUrl']) ?>" alt="<?= htmlspecialchars($b['name']) ?>" loading="lazy">
        <div class="card-body">
          <p class="card-title"><?= htmlspecialchars($b['name']) ?></p>
          <p class="card-sub mt-1"><?= htmlspecialchars($b['address']) ?></p>
          <span class="badge badge-primary mt-2">Destacado</span>
        </div>
      </a>
    </div>
    <?php endforeach; ?>
  </div>
</div>
<?php else: ?>
<div class="container section text-center text-muted">
  <p>Nenhuma barbearia disponível no momento.</p>
</div>
<?php endif; ?>

<?php if (!empty($popularBarbershops)): ?>
<div class="container section" style="padding-top:0">
  <p class="section-title">Populares</p>
  <div class="barbershop-grid">
    <?php foreach ($popularBarbershops as $b): ?>
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
</div>
<?php endif; ?>

<!-- Booking modal (shared) -->
<?php include __DIR__ . '/includes/booking-modal.php'; ?>

<script>
// Load upcoming bookings
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const bookings = await api('/api/bookings/index.php');
    const upcoming = bookings.filter(b => new Date(b.date) >= new Date()).slice(0, 3);
    if (!upcoming.length) return;
    const section = document.getElementById('upcomingSection');
    const list    = document.getElementById('upcomingList');
    section.style.display = '';
    list.innerHTML = upcoming.map(b => `
      <div class="booking-item">
        <img src="${b.service?.barbershop?.imageUrl || (_BASE + '/public/img/placeholder.png')}" alt="">
        <div class="info">
          <div class="shop-name">${b.service?.barbershop?.name || ''}</div>
          <div class="svc-name">${b.service?.name || ''}</div>
          <div class="date-time">${fmtDate(b.date)}</div>
        </div>
      </div>
    `).join('');
  } catch {}
});
</script>

<?php layout_end(); ?>
