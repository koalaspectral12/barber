<?php
/**
 * pages/barbershop-app.php
 * Custom-branded barbershop page.
 * Works as a standalone "app" when appMode=1 (no Barberon branding).
 * Also works as a standard preview/page for any barbershop.
 */
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';

$base      = BASE_URL;
$id        = $_GET['id']      ?? null;
$isPreview = !empty($_GET['preview']);

if (!$id) { header('Location: ' . $base . '/'); exit; }

// Fetch barbershop
$shop = DB::fetchOne('SELECT * FROM Barbershop WHERE id = ?', [$id]);
if (!$shop) { header('Location: ' . $base . '/'); exit; }

$shop['phones'] = json_decode($shop['phones'] ?? '[]', true);

// Fetch services
$services = DB::fetchAll(
    'SELECT * FROM BarbershopService WHERE barbershopId = ? ORDER BY price ASC', [$id]
);
foreach ($services as &$s) { $s['price'] = (float)$s['price']; }
unset($s);

// Fetch hours
$hours = DB::fetchAll(
    'SELECT * FROM BarbershopHours WHERE barbershopId = ? ORDER BY dayOfWeek ASC', [$id]
);

// Fetch custom page config
$cfg = DB::fetchOne('SELECT * FROM BarberPageConfig WHERE barbershopId = ?', [$id]);
$hasCfg = !empty($cfg);
if ($hasCfg) {
    $cfg['carouselImages'] = json_decode($cfg['carouselImages'] ?? '[]', true);
    $cfg['modules']        = json_decode($cfg['modules']        ?? '[]', true);
    $cfg['appMode']        = (bool)($cfg['appMode'] ?? false);
} else {
    $cfg = [
        'primaryColor'  => '#f59e0b',
        'accentColor'   => '#1a1a1a',
        'bgColor'       => '#0f0f0f',
        'fontFamily'    => 'Inter',
        'heroTitle'     => $shop['name'],
        'heroSubtitle'  => $shop['description'] ?? '',
        'heroImageUrl'  => $shop['imageUrl']     ?? '',
        'carouselImages'=> [],
        'modules'       => ['hero','services','carousel','hours','location','whatsapp'],
        'customCss'     => null,
        'whatsappNumber'=> null,
        'instagramUrl'  => null,
        'appMode'       => false,
        'appName'       => null,
        'appLogoUrl'    => null,
        'appIconUrl'    => null,
    ];
}

$appMode     = $cfg['appMode'];
$appName     = $cfg['appName']    ?: $shop['name'];
$appLogo     = $cfg['appLogoUrl'] ?: ($base . '/public/img/logo.svg');
$primaryColor = $cfg['primaryColor'] ?: '#f59e0b';
$bgColor      = $cfg['bgColor']      ?: '#0f0f0f';
$fontFamily   = $cfg['fontFamily']   ?: 'Inter';
$modules      = $cfg['modules']      ?: ['hero','services','hours','location'];

$user    = current_user();
$isLoggedIn = !!$user;

$dayNames = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

// Build hours map
$hoursMap = [];
foreach ($hours as $h) { $hoursMap[$h['dayOfWeek']] = $h; }

// Font URL
$googleFontMap = [
    'Montserrat' => 'Montserrat:wght@400;600;700;800',
    'Poppins'    => 'Poppins:wght@400;500;600;700',
    'Roboto'     => 'Roboto:wght@400;500;700',
    'Playfair Display' => 'Playfair+Display:wght@400;700',
    'Oswald'     => 'Oswald:wght@400;500;600',
    'Raleway'    => 'Raleway:wght@400;600;700',
    'Inter'      => 'Inter:wght@400;500;600;700',
];
$fontParam = $googleFontMap[$fontFamily] ?? 'Inter:wght@400;500;600;700';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title><?= htmlspecialchars($appName) ?></title>
  <?php if ($cfg['appIconUrl']): ?>
  <link rel="icon" href="<?= htmlspecialchars($cfg['appIconUrl']) ?>" type="image/png">
  <link rel="apple-touch-icon" href="<?= htmlspecialchars($cfg['appIconUrl']) ?>">
  <?php else: ?>
  <link rel="icon" href="<?= $base ?>/public/img/logo.svg" type="image/svg+xml">
  <?php endif; ?>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=<?= urlencode($fontParam) ?>&display=swap" rel="stylesheet">
  <!-- Inject BASE_URL for JS -->
  <script>window.BASE_URL = <?= json_encode($base) ?>;</script>
  <style>
    :root {
      --primary: <?= htmlspecialchars($primaryColor) ?>;
      --accent:  <?= htmlspecialchars($cfg['accentColor'] ?? '#1a1a1a') ?>;
      --bg:      <?= htmlspecialchars($bgColor) ?>;
      --bg-card: color-mix(in srgb, var(--bg) 60%, #fff 8%);
      --text:    #f1f1f1;
      --text-muted: #9ca3af;
      --border:  rgba(255,255,255,0.1);
      --radius:  0.65rem;
      --shadow:  0 4px 24px rgba(0,0,0,.35);
      --font:    '<?= $fontFamily ?>', system-ui, sans-serif;
    }
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html, body { background:var(--bg); color:var(--text); font-family:var(--font); min-height:100vh; }
    a { color:inherit; text-decoration:none; }
    img { max-width:100%; display:block; }
    button { font-family:var(--font); cursor:pointer; border:none; }

    /* ── App header ─────────────────────────────── */
    .app-header {
      position:sticky; top:0; z-index:100;
      background:rgba(0,0,0,.75); backdrop-filter:blur(12px);
      border-bottom:1px solid var(--border);
      padding:.75rem 1.25rem;
      display:flex; align-items:center; gap:.75rem;
    }
    .app-header .app-logo { width:32px;height:32px;border-radius:8px;object-fit:contain; }
    .app-header .app-title { font-size:1rem;font-weight:700; }
    .app-header .app-login { margin-left:auto; background:var(--primary);color:#000;border-radius:6px;padding:.4rem .9rem;font-size:.8rem;font-weight:700; }
    <?php if (!$appMode): ?>
    .app-header .barberon-link { margin-left:auto;font-size:.72rem;color:var(--text-muted);white-space:nowrap; }
    .app-header .barberon-link a { color:var(--primary); }
    <?php endif; ?>

    /* ── Hero ───────────────────────────────────── */
    .hero {
      position:relative; min-height:70vmin; display:flex; align-items:flex-end;
      background:var(--bg-card) center/cover;
      overflow:hidden;
    }
    .hero-overlay { position:absolute;inset:0;background:linear-gradient(to bottom, rgba(0,0,0,.1) 0%, rgba(0,0,0,.75) 100%); }
    .hero-content { position:relative;padding:2rem 1.5rem 2.5rem; }
    .hero-title { font-size:clamp(1.8rem,5vw,3rem);font-weight:800;line-height:1.1;margin-bottom:.5rem; }
    .hero-subtitle { font-size:1rem;color:rgba(255,255,255,.75);max-width:480px;margin-bottom:1.25rem; }
    .hero-cta { background:var(--primary);color:#000;font-weight:700;padding:.75rem 1.75rem;border-radius:8px;font-size:.95rem;display:inline-flex;align-items:center;gap:.4rem;transition:.15s; }
    .hero-cta:hover { filter:brightness(1.1); }
    .hero-phones { display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.75rem; }
    .phone-badge { background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:.3rem .85rem;font-size:.8rem; }

    /* ── Section ────────────────────────────────── */
    .section { padding:2.5rem 1.25rem; max-width:960px; margin:0 auto; }
    .section-title { font-size:1.35rem;font-weight:700;margin-bottom:1.25rem;display:flex;align-items:center;gap:.5rem; }
    .section-title::after { content:'';flex:1;height:1px;background:var(--border);margin-left:.75rem; }

    /* ── Services grid ──────────────────────────── */
    .services-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem; }
    .service-card { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:transform .2s,border-color .2s; }
    .service-card:hover { transform:translateY(-3px);border-color:var(--primary); }
    .service-card img { width:100%;height:130px;object-fit:cover; }
    .service-card .svc-body { padding:.9rem; }
    .service-card .svc-name { font-weight:600;font-size:.95rem;margin-bottom:.2rem; }
    .service-card .svc-desc { font-size:.8rem;color:var(--text-muted);margin-bottom:.6rem;line-height:1.4; }
    .service-card .svc-meta { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem; }
    .service-card .svc-price { font-size:1.15rem;font-weight:800;color:var(--primary); }
    .service-card .svc-dur { font-size:.75rem;background:rgba(255,255,255,.08);border-radius:999px;padding:2px 8px;color:var(--text-muted); }
    .book-btn { background:var(--primary);color:#000;font-weight:700;padding:.45rem 1.1rem;border-radius:6px;font-size:.82rem;transition:.15s; }
    .book-btn:hover { filter:brightness(1.1); }

    /* ── Carousel ───────────────────────────────── */
    .carousel-wrap { position:relative;overflow:hidden;border-radius:var(--radius); }
    .carousel-track { display:flex;transition:transform .45s cubic-bezier(.4,0,.2,1); }
    .carousel-track img { flex:0 0 100%;height:280px;object-fit:cover; }
    .carousel-btn { position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.5);color:#fff;border:none;padding:.5rem .9rem;border-radius:6px;cursor:pointer;font-size:1.1rem;z-index:2; }
    .carousel-btn.prev { left:.75rem; }
    .carousel-btn.next { right:.75rem; }
    .carousel-dots { display:flex;justify-content:center;gap:.4rem;margin-top:.6rem; }
    .carousel-dot { width:8px;height:8px;border-radius:50%;background:var(--border);cursor:pointer;transition:.2s; }
    .carousel-dot.active { background:var(--primary);width:20px;border-radius:4px; }

    /* ── Hours ──────────────────────────────────── */
    .hours-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.65rem; }
    .hours-day { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:.75rem 1rem;display:flex;justify-content:space-between;align-items:center; }
    .hours-day.today { border-color:var(--primary);background:color-mix(in srgb,var(--primary) 10%,var(--bg-card)); }
    .hours-day .day-name { font-size:.85rem;font-weight:600; }
    .hours-day .day-time { font-size:.82rem;color:var(--text-muted); }
    .hours-day .day-closed { font-size:.8rem;color:#ef4444; }

    /* ── Location ───────────────────────────────── */
    .location-card { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem;display:flex;flex-direction:column;gap:.5rem; }
    .location-card .addr { font-size:.95rem; }
    .location-card .map-link { background:var(--primary);color:#000;font-weight:700;border-radius:6px;padding:.55rem 1.2rem;font-size:.85rem;align-self:flex-start;display:inline-flex;align-items:center;gap:.4rem;margin-top:.25rem; }

    /* ── Social CTA ─────────────────────────────── */
    .social-bar { display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center;padding:1.5rem 1.25rem;border-top:1px solid var(--border); }
    .social-btn { display:inline-flex;align-items:center;gap:.5rem;padding:.6rem 1.3rem;border-radius:8px;font-weight:600;font-size:.875rem;transition:.15s; }
    .social-btn:hover { filter:brightness(1.1); }
    .social-btn.wa  { background:#25d366;color:#fff; }
    .social-btn.ig  { background:linear-gradient(135deg,#f58529,#dd2a7b,#8134af);color:#fff; }

    /* ── Booking modal ──────────────────────────── */
    .modal-backdrop { position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s; }
    .modal-backdrop.hidden { display:none; }
    .modal { background:var(--bg-card);border-radius:1rem 1rem 0 0;padding:1.5rem 1.25rem 2rem;width:100%;max-width:540px;max-height:90vh;overflow-y:auto;animation:slideUp .3s; }
    @media(min-width:600px){ .modal { border-radius:1rem;margin:auto; } }
    .modal-title { font-size:1.15rem;font-weight:700;margin-bottom:.25rem; }
    .modal-svc   { font-size:.85rem;color:var(--text-muted);margin-bottom:1rem; }
    .modal-close { float:right;background:none;color:var(--text-muted);font-size:1.3rem;line-height:1;padding:.1rem .4rem; }
    @keyframes slideUp { from{transform:translateY(60px);opacity:0} to{transform:none;opacity:1} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }

    /* ── Slot grid ──────────────────────────────── */
    .slot-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem;margin-bottom:1rem; }
    .slot-btn { padding:.5rem;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:.78rem;text-align:center;cursor:pointer;transition:.15s; }
    .slot-btn:hover:not(:disabled) { border-color:var(--primary); }
    .slot-btn.selected { background:var(--primary);color:#000;border-color:var(--primary);font-weight:700; }
    .slot-btn:disabled, .slot-btn.booked { opacity:.4;cursor:not-allowed; }
    .empty-slots { text-align:center;padding:1.5rem;color:var(--text-muted);font-size:.875rem; }

    /* ── Calendar ───────────────────────────────── */
    .cal-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem; }
    .cal-title  { font-weight:600;font-size:.9rem; }
    .cal-nav    { background:none;color:var(--text);font-size:1.1rem;padding:.2rem .5rem;border-radius:4px;border:1px solid var(--border);cursor:pointer; }
    .cal-grid   { display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;font-size:.78rem; }
    .cal-day    { padding:.45rem .2rem;border-radius:6px;cursor:pointer;transition:.15s; }
    .cal-day.header { font-weight:700;color:var(--text-muted);cursor:default; }
    .cal-day.empty  { cursor:default; }
    .cal-day.past   { opacity:.35;cursor:not-allowed; }
    .cal-day.today  { border:1px solid var(--primary);font-weight:700; }
    .cal-day.selected { background:var(--primary);color:#000;font-weight:700; }
    .cal-day:not(.empty):not(.past):not(.header):hover { background:rgba(255,255,255,.08); }

    /* ── Confirm summary ────────────────────────── */
    .confirm-summary { background:rgba(255,255,255,.05);border-radius:8px;padding:1rem;margin-bottom:1rem;font-size:.875rem; }
    .confirm-summary .row { display:flex;justify-content:space-between;padding:.25rem 0;border-bottom:1px solid var(--border); }
    .confirm-summary .row:last-child { border:none;font-weight:700;color:var(--primary); }
    .confirm-btn { width:100%;background:var(--primary);color:#000;font-weight:700;padding:.8rem;border-radius:8px;font-size:1rem;margin-top:.5rem;transition:.15s; }
    .confirm-btn:hover { filter:brightness(1.1); }
    .confirm-btn:disabled { opacity:.5;cursor:not-allowed; }

    /* ── Footer ─────────────────────────────────── */
    .app-footer { text-align:center;padding:1.5rem;border-top:1px solid var(--border);font-size:.78rem;color:var(--text-muted); }
    .app-footer a { color:var(--primary); }

    /* ── Preview banner ─────────────────────────── */
    .preview-banner { background:var(--primary);color:#000;text-align:center;padding:.5rem 1rem;font-size:.82rem;font-weight:700;position:sticky;top:0;z-index:200; }

    /* ── Toast ──────────────────────────────────── */
    #toastContainer { position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:.5rem;align-items:center; }
    .toast { background:var(--bg-card);border:1px solid var(--border);color:var(--text);padding:.65rem 1.25rem;border-radius:8px;font-size:.875rem;box-shadow:var(--shadow);animation:fadeIn .2s; }
    .toast.success { border-color:#10b981;color:#10b981; }
    .toast.error   { border-color:#ef4444;color:#ef4444; }
    .toast.info    { border-color:var(--primary);color:var(--primary); }

    /* ── Spinner ────────────────────────────────── */
    .spinner { width:28px;height:28px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite;margin:1rem auto; }
    @keyframes spin { to{transform:rotate(360deg)} }

    <?= $cfg['customCss'] ?? '' ?>
  </style>
</head>
<body>

<?php if ($isPreview): ?>
<div class="preview-banner">
  👁 MODO PRÉ-VISUALIZAÇÃO — Esta é a aparência da sua página pública.
  <a href="<?= $base ?>/admin/?page=page-builder" style="margin-left:.75rem;text-decoration:underline">← Voltar ao editor</a>
</div>
<?php endif; ?>

<!-- ── App Header ─────────────────────────────────────────── -->
<header class="app-header">
  <img class="app-logo" src="<?= htmlspecialchars($appLogo) ?>" alt="<?= htmlspecialchars($appName) ?>" onerror="this.style.display='none'">
  <span class="app-title"><?= htmlspecialchars($appName) ?></span>
  <?php if ($isLoggedIn): ?>
    <span style="margin-left:auto;font-size:.8rem;color:var(--text-muted)"><?= htmlspecialchars($user['name'] ?? $user['email']) ?></span>
  <?php else: ?>
    <a href="<?= $base ?>/pages/login.php?callbackUrl=<?= urlencode($_SERVER['REQUEST_URI']) ?>" class="app-login">Entrar</a>
  <?php endif; ?>
  <?php if (!$appMode): ?>
    <span class="barberon-link" style="<?= $isLoggedIn ? '' : 'display:none' ?>">via <a href="<?= $base ?>/">Barberon</a></span>
  <?php endif; ?>
</header>

<!-- ═══════════════════════════════════════════════════════════
     MODULE: HERO
     ═══════════════════════════════════════════════════════════ -->
<?php if (in_array('hero', $modules)): ?>
<section class="hero" style="background-image:url('<?= htmlspecialchars($cfg['heroImageUrl'] ?: ($shop['imageUrl'] ?? '')) ?>')">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1 class="hero-title"><?= htmlspecialchars($cfg['heroTitle'] ?: $shop['name']) ?></h1>
    <?php if (!empty($cfg['heroSubtitle']) || !empty($shop['description'])): ?>
      <p class="hero-subtitle"><?= htmlspecialchars($cfg['heroSubtitle'] ?: $shop['description']) ?></p>
    <?php endif; ?>
    <?php if ($services): ?>
      <a href="#services" class="hero-cta">✂️ Ver serviços</a>
    <?php endif; ?>
    <?php if ($shop['phones']): ?>
    <div class="hero-phones">
      <?php foreach ($shop['phones'] as $phone): ?>
        <a href="tel:<?= preg_replace('/\D/','',$phone) ?>" class="phone-badge">📞 <?= htmlspecialchars($phone) ?></a>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
  </div>
</section>
<?php endif; ?>

<!-- ═══════════════════════════════════════════════════════════
     MODULE: CAROUSEL
     ═══════════════════════════════════════════════════════════ -->
<?php if (in_array('carousel', $modules) && !empty($cfg['carouselImages'])): ?>
<div class="section" style="padding-top:2rem;padding-bottom:0">
  <div class="carousel-wrap" id="appCarousel">
    <div class="carousel-track" id="carTrack">
      <?php foreach ($cfg['carouselImages'] as $img): ?>
        <img src="<?= htmlspecialchars($img) ?>" alt="Foto da barbearia" loading="lazy">
      <?php endforeach; ?>
    </div>
    <?php if (count($cfg['carouselImages']) > 1): ?>
    <button class="carousel-btn prev" onclick="carMove(-1)">‹</button>
    <button class="carousel-btn next" onclick="carMove(1)">›</button>
    <div class="carousel-dots" id="carDots">
      <?php foreach ($cfg['carouselImages'] as $i => $img): ?>
        <div class="carousel-dot <?= $i===0?'active':'' ?>" onclick="carGoTo(<?= $i ?>)"></div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
  </div>
</div>
<?php endif; ?>

<!-- ═══════════════════════════════════════════════════════════
     MODULE: SERVICES
     ═══════════════════════════════════════════════════════════ -->
<?php if (in_array('services', $modules) && $services): ?>
<section class="section" id="services">
  <h2 class="section-title">💈 Nossos Serviços</h2>
  <div class="services-grid">
    <?php foreach ($services as $svc): ?>
    <div class="service-card">
      <?php if ($svc['imageUrl']): ?>
        <img src="<?= htmlspecialchars($svc['imageUrl']) ?>" alt="<?= htmlspecialchars($svc['name']) ?>" loading="lazy" onerror="this.style.display='none'">
      <?php endif; ?>
      <div class="svc-body">
        <div class="svc-name"><?= htmlspecialchars($svc['name']) ?></div>
        <?php if ($svc['description']): ?>
          <div class="svc-desc"><?= htmlspecialchars($svc['description']) ?></div>
        <?php endif; ?>
        <div class="svc-meta">
          <div>
            <div class="svc-price">R$ <?= number_format($svc['price'], 2, ',', '.') ?></div>
            <?php if (!empty($svc['duration']) && $svc['duration'] !== '00:00'): ?>
              <div class="svc-dur">⏱ <?= htmlspecialchars($svc['duration']) ?></div>
            <?php endif; ?>
          </div>
          <button class="book-btn" onclick="openBooking(<?= json_encode(['id'=>$svc['id'],'name'=>$svc['name'],'price'=>$svc['price'],'duration'=>$svc['duration']??'','barbershopId'=>$id]) ?>)">
            Reservar
          </button>
        </div>
      </div>
    </div>
    <?php endforeach; ?>
  </div>
</section>
<?php endif; ?>

<!-- ═══════════════════════════════════════════════════════════
     MODULE: HOURS
     ═══════════════════════════════════════════════════════════ -->
<?php if (in_array('hours', $modules) && $hours): ?>
<section class="section" id="hours">
  <h2 class="section-title">🕐 Horários de Funcionamento</h2>
  <div class="hours-grid">
    <?php
    $todayDow = (int)date('w');
    for ($d = 0; $d <= 6; $d++):
      $h = $hoursMap[$d] ?? null;
      $isToday = $d === $todayDow;
    ?>
    <div class="hours-day <?= $isToday ? 'today' : '' ?>">
      <span class="day-name"><?= $dayNames[$d] ?><?= $isToday ? ' <small style="color:var(--primary)">(hoje)</small>' : '' ?></span>
      <?php if ($h): ?>
        <span class="day-time"><?= $h['openTime'] ?> – <?= $h['closeTime'] ?></span>
      <?php else: ?>
        <span class="day-closed">Fechado</span>
      <?php endif; ?>
    </div>
    <?php endfor; ?>
  </div>
</section>
<?php endif; ?>

<!-- ═══════════════════════════════════════════════════════════
     MODULE: LOCATION
     ═══════════════════════════════════════════════════════════ -->
<?php if (in_array('location', $modules)): ?>
<section class="section" id="location">
  <h2 class="section-title">📍 Localização</h2>
  <div class="location-card">
    <span class="addr">📍 <?= htmlspecialchars($shop['address']) ?></span>
    <?php if ($shop['phones']): ?>
      <?php foreach ($shop['phones'] as $phone): ?>
        <a href="tel:<?= preg_replace('/\D/','',$phone) ?>" style="font-size:.88rem;color:var(--primary)">📞 <?= htmlspecialchars($phone) ?></a>
      <?php endforeach; ?>
    <?php endif; ?>
    <a class="map-link" href="https://www.google.com/maps/search/<?= urlencode($shop['address']) ?>" target="_blank" rel="noopener">
      🗺 Ver no Google Maps
    </a>
  </div>
</section>
<?php endif; ?>

<!-- ═══════════════════════════════════════════════════════════
     SOCIAL BAR (WhatsApp + Instagram)
     ═══════════════════════════════════════════════════════════ -->
<?php if ((in_array('whatsapp',$modules) && !empty($cfg['whatsappNumber'])) || (in_array('instagram',$modules) && !empty($cfg['instagramUrl']))): ?>
<div class="social-bar">
  <?php if (in_array('whatsapp',$modules) && !empty($cfg['whatsappNumber'])): ?>
    <a class="social-btn wa" href="https://wa.me/55<?= preg_replace('/\D/','',$cfg['whatsappNumber']) ?>" target="_blank" rel="noopener">
      💬 WhatsApp
    </a>
  <?php endif; ?>
  <?php if (in_array('instagram',$modules) && !empty($cfg['instagramUrl'])): ?>
    <a class="social-btn ig" href="<?= htmlspecialchars($cfg['instagramUrl']) ?>" target="_blank" rel="noopener">
      📸 Instagram
    </a>
  <?php endif; ?>
</div>
<?php endif; ?>

<!-- ── Footer ───────────────────────────────────────────────── -->
<footer class="app-footer">
  <?php if (!$appMode): ?>
    <p>Agendamentos via <a href="<?= $base ?>/">Barberon</a> · <?= date('Y') ?></p>
  <?php else: ?>
    <p><?= htmlspecialchars($appName) ?> · <?= date('Y') ?></p>
  <?php endif; ?>
</footer>

<!-- ── Booking Modal ─────────────────────────────────────────── -->
<div class="modal-backdrop hidden" id="bookingBackdrop">
  <div class="modal" id="bookingModal">
    <button class="modal-close" onclick="closeBooking()">✕</button>
    <div class="modal-title" id="bookingTitle">Reservar</div>
    <div class="modal-svc"  id="bookingSvc"></div>
    <div id="bookingContent">
      <!-- Step 1: calendar -->
      <div id="step-calendar">
        <div id="bookingCalendar"></div>
      </div>
      <!-- Step 2: slots -->
      <div id="step-slots" class="hidden">
        <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:.5rem">Horários disponíveis:</div>
        <div id="bookingSlots"><div class="spinner"></div></div>
        <button class="btn" style="background:none;color:var(--text-muted);font-size:.82rem;margin-top:.5rem" onclick="showStep('calendar')">← Trocar data</button>
      </div>
      <!-- Step 3: confirm -->
      <div id="step-confirm" class="hidden">
        <div class="confirm-summary" id="confirmSummary"></div>
        <button class="confirm-btn" id="confirmBtn" onclick="submitBooking()">✓ Confirmar agendamento</button>
        <button class="btn" style="background:none;color:var(--text-muted);font-size:.82rem;margin-top:.5rem;width:100%;text-align:center" onclick="showStep('slots')">← Trocar horário</button>
      </div>
    </div>
  </div>
</div>

<div id="toastContainer"></div>

<script>
// ── Booking state ─────────────────────────────────────────────
let _bSvc = null, _bDate = null, _bSlot = null;
let _calYear = null, _calMonth = null;
const _shopId = <?= json_encode($id) ?>;
const _isLoggedIn = <?= $isLoggedIn ? 'true' : 'false' ?>;
const _loginUrl   = <?= json_encode($base . '/pages/login.php?callbackUrl=' . urlencode($_SERVER['REQUEST_URI'])) ?>;

function toast(msg, type='info') {
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function openBooking(svc) {
  if (!_isLoggedIn) { window.location.href = _loginUrl; return; }
  _bSvc  = svc;
  _bDate = null;
  _bSlot = null;
  document.getElementById('bookingTitle').textContent = 'Reservar serviço';
  document.getElementById('bookingSvc').textContent   = svc.name + ' — R$ ' + Number(svc.price).toFixed(2).replace('.',',');
  document.getElementById('bookingBackdrop').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  showStep('calendar');
  buildCalendar();
}

function closeBooking() {
  document.getElementById('bookingBackdrop').classList.add('hidden');
  document.body.style.overflow = '';
}
document.getElementById('bookingBackdrop').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeBooking();
});

// ── Step navigation ───────────────────────────────────────────
function showStep(step) {
  ['calendar','slots','confirm'].forEach(s => {
    document.getElementById('step-'+s).classList.toggle('hidden', s !== step);
  });
}

// ── Calendar ──────────────────────────────────────────────────
function buildCalendar(year, month) {
  const now = new Date();
  if (!year)  year  = _calYear  || now.getFullYear();
  if (!month) month = _calMonth || now.getMonth();
  _calYear  = year;
  _calMonth = month;

  const ptMonths = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const ptDays   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  let html = `<div class="cal-header">
    <button class="cal-nav" onclick="buildCalendar(${month===0?year-1:year},${month===0?11:month-1})">‹</button>
    <span class="cal-title">${ptMonths[month]} ${year}</span>
    <button class="cal-nav" onclick="buildCalendar(${month===11?year+1:year},${month===11?0:month+1})">›</button>
  </div>
  <div class="cal-grid">`;
  ptDays.forEach(d => html += `<div class="cal-day header">${d}</div>`);
  for (let i=0;i<firstDay;i++) html += '<div class="cal-day empty"></div>';
  for (let d=1;d<=daysInMonth;d++) {
    const date = new Date(year, month, d);
    date.setHours(0,0,0,0);
    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isSel = _bDate === dateStr;
    html += `<div class="cal-day${isPast?' past':''}${isToday?' today':''}${isSel?' selected':''}"
      ${!isPast?`onclick="selectDate('${dateStr}')"`:''}>${d}</div>`;
  }
  html += '</div>';
  document.getElementById('bookingCalendar').innerHTML = html;
}

async function selectDate(dateStr) {
  _bDate = dateStr;
  _bSlot = null;
  buildCalendar(_calYear, _calMonth); // re-render to show selection
  showStep('slots');
  await loadSlots(dateStr);
}

// ── Slots ─────────────────────────────────────────────────────
async function loadSlots(date) {
  const slotsEl = document.getElementById('bookingSlots');
  slotsEl.innerHTML = '<div class="spinner"></div>';
  try {
    const url = `/api/barbershops/hours.php?barbershopId=${_shopId}&date=${date}&serviceId=${_bSvc.id}`;
    const data = await fetch(window.BASE_URL + url).then(r=>r.json());
    const slots = data.slots || [];
    if (!slots.length) { slotsEl.innerHTML = '<div class="empty-slots">Nenhum horário disponível nesta data.</div>'; return; }
    slotsEl.innerHTML = '<div class="slot-grid">' +
      slots.map(s => `<button class="slot-btn${!s.available?' booked':''}" ${!s.available?'disabled':''} onclick="selectSlot('${s.time}',this)">${s.time}</button>`).join('') +
      '</div>';
  } catch(e) { slotsEl.innerHTML = '<div class="empty-slots">Erro ao carregar horários.</div>'; }
}

function selectSlot(time, btn) {
  _bSlot = time;
  document.querySelectorAll('.slot-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  // Show confirm step
  const dur = _bSvc.duration || '';
  document.getElementById('confirmSummary').innerHTML = `
    <div class="row"><span>Serviço</span><span>${_bSvc.name}</span></div>
    <div class="row"><span>Data</span><span>${formatDatePt(_bDate)}</span></div>
    <div class="row"><span>Horário</span><span>${_bSlot}</span></div>
    ${dur?`<div class="row"><span>Duração</span><span>⏱ ${dur}</span></div>`:''}
    <div class="row"><span>Total</span><span>R$ ${Number(_bSvc.price).toFixed(2).replace('.',',')}</span></div>`;
  setTimeout(()=>showStep('confirm'), 350);
}

function formatDatePt(dateStr) {
  const [y,m,d] = dateStr.split('-');
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${d} de ${months[parseInt(m)-1]} de ${y}`;
}

async function submitBooking() {
  if (!_bDate || !_bSlot) { toast('Selecione data e horário','error'); return; }
  const btn = document.getElementById('confirmBtn');
  btn.disabled = true; btn.textContent = 'Confirmando...';
  try {
    const dateTime = _bDate + 'T' + _bSlot + ':00';
    await fetch(window.BASE_URL + '/api/bookings/index.php', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ serviceId: _bSvc.id, date: dateTime }),
    }).then(async r => { if(!r.ok) { const e=await r.json(); throw new Error(e.error||'Erro'); } return r.json(); });
    toast('Agendamento confirmado! ✓', 'success');
    closeBooking();
  } catch(e) { toast(e.message||'Erro ao confirmar','error'); btn.disabled=false; btn.textContent='✓ Confirmar agendamento'; }
}

// ── Carousel ──────────────────────────────────────────────────
let _carIdx = 0;
const _carImgs = <?= json_encode($cfg['carouselImages'] ?? []) ?>;

function carMove(dir) {
  _carIdx = (_carIdx + dir + _carImgs.length) % _carImgs.length;
  carUpdate();
}
function carGoTo(i) { _carIdx = i; carUpdate(); }
function carUpdate() {
  const track = document.getElementById('carTrack');
  if (!track) return;
  track.style.transform = `translateX(-${_carIdx * 100}%)`;
  document.querySelectorAll('.carousel-dot').forEach((d,i)=>d.classList.toggle('active',i===_carIdx));
}

// Auto-advance carousel
if (_carImgs.length > 1) setInterval(()=>carMove(1), 4500);

// Close modal on backdrop
document.getElementById('bookingBackdrop').addEventListener('click', e=>{
  if(e.target===e.currentTarget) closeBooking();
});
</script>
</body>
</html>
