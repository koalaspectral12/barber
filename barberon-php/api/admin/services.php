<?php
/**
 * GET    /api/admin/services.php        — list
 * POST   /api/admin/services.php        — create
 * PUT    /api/admin/services.php?id=xxx — update
 * DELETE /api/admin/services.php?id=xxx — delete
 */
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();
$id     = $_GET['id'] ?? null;

// Helper: validate HH:MM duration string
function valid_duration(string $d): bool {
    return (bool) preg_match('/^\d{2}:\d{2}$/', $d);
}

// ── GET ───────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    if ($ctx['role'] === 'ADMIN' && $ctx['barbershopId']) {
        $rows = DB::fetchAll(
            'SELECT s.*, b.name AS barbershopName FROM BarbershopService s
             JOIN Barbershop b ON b.id = s.barbershopId
             WHERE s.barbershopId = ? ORDER BY s.name',
            [$ctx['barbershopId']]
        );
    } else {
        $rows = DB::fetchAll(
            'SELECT s.*, b.name AS barbershopName FROM BarbershopService s
             JOIN Barbershop b ON b.id = s.barbershopId ORDER BY s.name'
        );
    }
    foreach ($rows as &$r) {
        $r['price']    = (float) $r['price'];
        $r['duration'] = $r['duration'] ?? '00:30';
    }
    json_response($rows);
}

// ── POST ──────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $body     = request_body();
    $name     = $body['name']         ?? '';
    $desc     = $body['description']  ?? '';
    $price    = $body['price']        ?? null;
    $img      = $body['imageUrl']     ?? '';
    $duration = trim($body['duration'] ?? '00:30');
    $shopId   = $body['barbershopId'] ?? $ctx['barbershopId'];

    if (!$name || !$desc || $price === null || !$img || !$shopId) {
        json_error('Campos obrigatórios faltando', 400);
    }
    if (!valid_duration($duration)) {
        json_error('Duração inválida. Use o formato HH:MM (ex: 00:30, 01:00)', 400);
    }
    if ($ctx['role'] === 'ADMIN' && $shopId !== $ctx['barbershopId']) {
        json_error('Acesso negado', 403);
    }

    $newId = DB::uuid();
    try {
        DB::query(
            'INSERT INTO BarbershopService (id, name, description, imageUrl, price, duration, barbershopId) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [$newId, $name, $desc, $img, (float)$price, $duration, $shopId]
        );
    } catch (\Throwable $e) {
        // Fallback without duration column (migration not yet run)
        DB::query(
            'INSERT INTO BarbershopService (id, name, description, imageUrl, price, barbershopId) VALUES (?, ?, ?, ?, ?, ?)',
            [$newId, $name, $desc, $img, (float)$price, $shopId]
        );
    }
    $svc = DB::fetchOne(
        'SELECT s.*, b.name AS barbershopName FROM BarbershopService s JOIN Barbershop b ON b.id = s.barbershopId WHERE s.id = ?',
        [$newId]
    );
    $svc['price']    = (float) $svc['price'];
    $svc['duration'] = $svc['duration'] ?? '00:30';
    json_response($svc, 201);
}

// ── PUT ───────────────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    if (!$id) json_error('id é obrigatório', 400);
    $svc = DB::fetchOne('SELECT * FROM BarbershopService WHERE id = ? LIMIT 1', [$id]);
    if (!$svc) json_error('Serviço não encontrado', 404);
    if ($ctx['role'] === 'ADMIN' && $svc['barbershopId'] !== $ctx['barbershopId']) json_error('Acesso negado', 403);

    $body   = request_body();
    $fields = [];
    $vals   = [];
    foreach (['name','description','imageUrl'] as $f) {
        if (array_key_exists($f, $body)) { $fields[] = "`$f` = ?"; $vals[] = $body[$f]; }
    }
    if (array_key_exists('price', $body)) {
        $fields[] = '`price` = ?'; $vals[] = (float)$body['price'];
    }
    if (array_key_exists('duration', $body)) {
        $dur = trim($body['duration']);
        if (!valid_duration($dur)) json_error('Duração inválida. Use o formato HH:MM (ex: 00:30, 01:00)', 400);
        $fields[] = '`duration` = ?'; $vals[] = $dur;
    }
    if (!$fields) json_error('Nenhum campo para atualizar', 400);
    $vals[] = $id;
    try {
        DB::query('UPDATE BarbershopService SET ' . implode(', ', $fields) . ' WHERE id = ?', $vals);
    } catch (\Throwable $e) {
        // If duration column doesn't exist yet, remove it and retry
        $fields2 = array_filter($fields, fn($f) => strpos($f,'duration') === false);
        $vals2   = [];
        foreach ($fields as $i => $f) {
            if (strpos($f,'duration') === false) $vals2[] = $vals[$i];
        }
        $vals2[] = $id;
        if ($fields2) DB::query('UPDATE BarbershopService SET ' . implode(', ', $fields2) . ' WHERE id = ?', array_values($vals2));
    }
    $updated = DB::fetchOne(
        'SELECT s.*, b.name AS barbershopName FROM BarbershopService s JOIN Barbershop b ON b.id = s.barbershopId WHERE s.id = ?',
        [$id]
    );
    $updated['price']    = (float) $updated['price'];
    $updated['duration'] = $updated['duration'] ?? '00:30';
    json_response($updated);
}

// ── DELETE ────────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    if (!$id) json_error('id é obrigatório', 400);
    $svc = DB::fetchOne('SELECT * FROM BarbershopService WHERE id = ? LIMIT 1', [$id]);
    if (!$svc) json_error('Serviço não encontrado', 404);
    if ($ctx['role'] === 'ADMIN' && $svc['barbershopId'] !== $ctx['barbershopId']) json_error('Acesso negado', 403);
    DB::delete('BarbershopService', ['id' => $id]);
    json_response(['ok' => true]);
}

json_error('Method not allowed', 405);
