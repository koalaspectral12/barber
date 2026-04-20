<?php
/**
 * GET    /api/admin/services.php        — list
 * POST   /api/admin/services.php        — create
 * PUT    /api/admin/services.php?id=xxx — update
 * DELETE /api/admin/services.php?id=xxx — delete
 */
require_once __DIR__ . '/../../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();
$id     = $_GET['id'] ?? null;

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
    foreach ($rows as &$r) $r['price'] = (float) $r['price'];
    json_response($rows);
}

// ── POST ──────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $body   = request_body();
    $name   = $body['name']         ?? '';
    $desc   = $body['description']  ?? '';
    $price  = $body['price']        ?? null;
    $img    = $body['imageUrl']     ?? '';
    $shopId = $body['barbershopId'] ?? $ctx['barbershopId'];

    if (!$name || !$desc || $price === null || !$img || !$shopId) {
        json_error('Campos obrigatórios faltando', 400);
    }
    if ($ctx['role'] === 'ADMIN' && $shopId !== $ctx['barbershopId']) {
        json_error('Acesso negado', 403);
    }

    $newId = DB::uuid();
    DB::query(
        'INSERT INTO BarbershopService (id, name, description, imageUrl, price, barbershopId) VALUES (?, ?, ?, ?, ?, ?)',
        [$newId, $name, $desc, $img, (float)$price, $shopId]
    );
    $svc = DB::fetchOne('SELECT s.*, b.name AS barbershopName FROM BarbershopService s JOIN Barbershop b ON b.id = s.barbershopId WHERE s.id = ?', [$newId]);
    $svc['price'] = (float) $svc['price'];
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
    if (array_key_exists('price', $body)) { $fields[] = '`price` = ?'; $vals[] = (float)$body['price']; }
    if (!$fields) json_error('Nenhum campo para atualizar', 400);
    $vals[] = $id;
    DB::query('UPDATE BarbershopService SET ' . implode(', ', $fields) . ' WHERE id = ?', $vals);
    $updated = DB::fetchOne('SELECT s.*, b.name AS barbershopName FROM BarbershopService s JOIN Barbershop b ON b.id = s.barbershopId WHERE s.id = ?', [$id]);
    $updated['price'] = (float) $updated['price'];
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
