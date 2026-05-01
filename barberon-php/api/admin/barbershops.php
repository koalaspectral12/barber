<?php
/**
 * GET    /api/admin/barbershops.php          — list
 * POST   /api/admin/barbershops.php          — create (SUPERADMIN)
 * PUT    /api/admin/barbershops.php?id=xxx   — update
 * DELETE /api/admin/barbershops.php?id=xxx   — delete (SUPERADMIN)
 */
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();
$id     = $_GET['id'] ?? null;

// ── GET ───────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    if ($ctx['role'] === 'ADMIN' && $ctx['barbershopId']) {
        $where  = 'WHERE b.id = ?';
        $params = [$ctx['barbershopId']];
    } else {
        $where  = '';
        $params = [];
    }

    $rows = DB::fetchAll(
        "SELECT b.*,
                (SELECT COUNT(*) FROM BarbershopService WHERE barbershopId = b.id) AS servicesCount
         FROM Barbershop b $where ORDER BY b.createdAt DESC",
        $params
    );
    foreach ($rows as &$r) {
        $r['phones'] = json_decode($r['phones'] ?? '[]', true) ?: [];
        $r['active'] = (bool) $r['active'];
    }
    json_response($rows);
}

// ── POST (create) ─────────────────────────────────────────────────────────────
if ($method === 'POST') {
    if ($ctx['role'] !== 'SUPERADMIN') json_error('Apenas Superadmin pode criar barbearias', 403);
    $body = request_body();
    ['name' => $name, 'address' => $address, 'description' => $desc, 'imageUrl' => $img] = $body + ['name'=>'','address'=>'','description'=>'','imageUrl'=>''];
    $phones = $body['phones'] ?? [];

    if (!$name || !$address || !$desc || !$img) json_error('Campos obrigatórios faltando', 400);

    $newId = DB::uuid();
    $now   = date('Y-m-d H:i:s');
    DB::query(
        'INSERT INTO Barbershop (id, name, address, phones, description, imageUrl, active, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)',
        [$newId, $name, $address, json_encode(is_array($phones) ? $phones : []), $desc, $img, $now, $now]
    );
    $shop = DB::fetchOne('SELECT * FROM Barbershop WHERE id = ?', [$newId]);
    $shop['phones'] = json_decode($shop['phones'], true) ?: [];
    json_response($shop, 201);
}

// ── PUT (update) ──────────────────────────────────────────────────────────────
if ($method === 'PUT') {
    if (!$id) json_error('id é obrigatório', 400);
    if ($ctx['role'] === 'ADMIN' && $ctx['barbershopId'] !== $id) json_error('Acesso negado', 403);

    $body   = request_body();
    $fields = [];
    $vals   = [];
    foreach (['name','address','description','imageUrl','active'] as $f) {
        if (array_key_exists($f, $body)) {
            $fields[] = "`$f` = ?";
            $vals[]   = $f === 'active' ? (int)(bool)$body[$f] : $body[$f];
        }
    }
    if (array_key_exists('phones', $body)) {
        $fields[] = '`phones` = ?';
        $vals[]   = json_encode(is_array($body['phones']) ? $body['phones'] : []);
    }
    if (!$fields) json_error('Nenhum campo para atualizar', 400);
    $vals[] = $id;
    $vals[] = date('Y-m-d H:i:s');

    DB::query('UPDATE Barbershop SET ' . implode(', ', $fields) . ', updatedAt = ? WHERE id = ?',
        [...$vals]);

    $shop = DB::fetchOne('SELECT * FROM Barbershop WHERE id = ?', [$id]);
    $shop['phones'] = json_decode($shop['phones'], true) ?: [];
    json_response($shop);
}

// ── DELETE ────────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    if ($ctx['role'] !== 'SUPERADMIN') json_error('Apenas Superadmin pode excluir barbearias', 403);
    if (!$id) json_error('id é obrigatório', 400);
    DB::delete('Barbershop', ['id' => $id]);
    json_response(['ok' => true]);
}

json_error('Method not allowed', 405);
