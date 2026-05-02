<?php
/**
 * GET  /api/barbershops/list.php        — list active barbershops
 * GET  /api/barbershops/list.php?id=xxx — single barbershop detail (services + hours)
 * GET  /api/barbershops/list.php?slug=xxx — lookup by slug
 * GET  /api/barbershops/list.php?search=xxx — search by name/service
 */
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();

header('Content-Type: application/json; charset=utf-8');

$id     = $_GET['id']     ?? null;
$slug   = $_GET['slug']   ?? null;
$search = $_GET['search'] ?? null;

// ── Helper: build full shop detail (with services + hours) ────
function buildShopDetail(array $shop): array {
    $id = $shop['id'];

    // Normalise phones
    $shop['phones'] = is_array($shop['phones'] ?? null)
        ? $shop['phones']
        : (json_decode($shop['phones'] ?? '[]', true) ?: []);

    // Services
    $services = DB::fetchAll(
        'SELECT id, name, description, imageUrl, price, IFNULL(duration,"00:30") AS duration
         FROM BarbershopService WHERE barbershopId = ? ORDER BY name',
        [$id]
    );
    foreach ($services as &$s) {
        $s['price']    = (float) $s['price'];
        $s['duration'] = $s['duration'] ?? '00:30';
    }
    $shop['services'] = $services;

    // Hours (only open days — deleted rows mean closed)
    $hours = DB::fetchAll(
        'SELECT dayOfWeek, openTime, closeTime, slotMinutes FROM BarbershopHours
         WHERE barbershopId = ? ORDER BY dayOfWeek',
        [$id]
    );
    foreach ($hours as &$h) {
        $h['dayOfWeek']   = (int)$h['dayOfWeek'];
        $h['slotMinutes'] = (int)$h['slotMinutes'];
        $h['closed']      = false;
    }
    $shop['hours'] = $hours;

    // Payment config (public key only)
    $pc = DB::fetchOne(
        'SELECT active, mpPublicKey FROM PaymentConfig WHERE barbershopId = ? LIMIT 1',
        [$id]
    );
    $shop['paymentConfig'] = $pc ?: null;

    return $shop;
}

// ── Single shop by ID ─────────────────────────────────────────
if ($id) {
    $shop = DB::fetchOne('SELECT * FROM Barbershop WHERE id = ? LIMIT 1', [$id]);
    if (!$shop) json_error('Barbearia não encontrada', 404);
    json_response(buildShopDetail($shop));
}

// ── Lookup by slug ────────────────────────────────────────────
if ($slug) {
    $slug = strtolower(trim($slug));
    $shop = null;
    try {
        $shop = DB::fetchOne('SELECT * FROM Barbershop WHERE slug = ? LIMIT 1', [$slug]);
    } catch (\Throwable $e) {
        // slug column might not exist yet — safe fallback
    }
    if (!$shop) json_error('Barbearia não encontrada', 404);
    json_response(buildShopDetail($shop));
}

// ── List / search ─────────────────────────────────────────────
try {
    if ($search) {
        $like = '%' . $search . '%';
        $rows = DB::fetchAll(
            'SELECT DISTINCT b.* FROM Barbershop b
             LEFT JOIN BarbershopService s ON s.barbershopId = b.id
             WHERE b.active = 1 AND (b.name LIKE ? OR s.name LIKE ?)
             ORDER BY b.name LIMIT 50',
            [$like, $like]
        );
    } else {
        $rows = DB::fetchAll(
            'SELECT * FROM Barbershop WHERE active = 1 ORDER BY name LIMIT 50'
        );
    }
} catch (\Throwable $e) {
    // Fallback: active column may not exist
    if ($search) {
        $like = '%' . $search . '%';
        $rows = DB::fetchAll(
            'SELECT DISTINCT b.* FROM Barbershop b
             LEFT JOIN BarbershopService s ON s.barbershopId = b.id
             WHERE b.name LIKE ? OR s.name LIKE ?
             ORDER BY b.name LIMIT 50',
            [$like, $like]
        );
    } else {
        $rows = DB::fetchAll('SELECT * FROM Barbershop ORDER BY name LIMIT 50');
    }
}

foreach ($rows as &$r) {
    $r['phones'] = is_array($r['phones'] ?? null)
        ? $r['phones']
        : (json_decode($r['phones'] ?? '[]', true) ?: []);
    // Expose slug in listing (null if column missing)
    if (!array_key_exists('slug', $r)) $r['slug'] = null;
}

json_response($rows);
