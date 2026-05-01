<?php
/**
 * GET  /api/barbershops/list.php        — list active barbershops
 * GET  /api/barbershops/list.php?id=xxx — single barbershop detail
 * GET  /api/barbershops/list.php?search=xxx — search by name/service
 */
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();

header('Content-Type: application/json; charset=utf-8');

$id     = $_GET['id']     ?? null;
$search = $_GET['search'] ?? null;

// Single barbershop by ID
if ($id) {
    $shop = DB::fetchOne(
        'SELECT * FROM Barbershop WHERE id = ? LIMIT 1',
        [$id]
    );
    if (!$shop) json_error('Barbearia não encontrada', 404);

    $shop['phones']   = json_decode($shop['phones'] ?? '[]', true) ?: [];
    $shop['services'] = DB::fetchAll(
        'SELECT * FROM BarbershopService WHERE barbershopId = ? ORDER BY name',
        [$id]
    );
    foreach ($shop['services'] as &$s) {
        $s['price'] = (float) $s['price'];
    }
    $shop['hours'] = DB::fetchAll(
        'SELECT * FROM BarbershopHours WHERE barbershopId = ? ORDER BY dayOfWeek',
        [$id]
    );
    $shop['paymentConfig'] = DB::fetchOne(
        'SELECT active, mpPublicKey FROM PaymentConfig WHERE barbershopId = ? LIMIT 1',
        [$id]
    );
    json_response($shop);
}

// List / search
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
    $r['phones'] = json_decode($r['phones'] ?? '[]', true) ?: [];
}

json_response($rows);
