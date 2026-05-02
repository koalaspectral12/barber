<?php
/**
 * GET    /api/admin/barbershops.php          — list
 * POST   /api/admin/barbershops.php          — create (SUPERADMIN)
 * PUT    /api/admin/barbershops.php?id=xxx   — update (includes slug + customDomain)
 * DELETE /api/admin/barbershops.php?id=xxx   — delete (SUPERADMIN)
 */
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();
$id     = $_GET['id'] ?? null;

// Helper: sanitise a slug (lowercase letters, numbers, hyphens, max 80 chars)
function sanitise_slug(string $raw): string {
    $slug = mb_strtolower(trim($raw));
    // Replace accented chars
    $slug = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $slug) ?: $slug;
    // Keep only alphanumeric + hyphen
    $slug = preg_replace('/[^a-z0-9\-]+/', '-', $slug);
    $slug = trim($slug, '-');
    return mb_substr($slug, 0, 80);
}

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
                (SELECT COUNT(*) FROM BarbershopService WHERE barbershopId = b.id) AS servicesCount,
                pc.customDomain
         FROM Barbershop b
         LEFT JOIN BarberPageConfig pc ON pc.barbershopId = b.id
         $where ORDER BY b.createdAt DESC",
        $params
    );
    foreach ($rows as &$r) {
        $r['phones'] = json_decode($r['phones'] ?? '[]', true) ?: [];
        $r['active'] = (bool) $r['active'];
        if (!array_key_exists('slug', $r)) $r['slug'] = null;
    }
    json_response($rows);
}

// ── POST (create) ─────────────────────────────────────────────────────────────
if ($method === 'POST') {
    if ($ctx['role'] !== 'SUPERADMIN') json_error('Apenas Superadmin pode criar barbearias', 403);
    $body = request_body();
    $name    = $body['name']        ?? '';
    $address = $body['address']     ?? '';
    $desc    = $body['description'] ?? '';
    $img     = $body['imageUrl']    ?? '';
    $phones  = $body['phones']      ?? [];
    $rawSlug = $body['slug']        ?? '';

    if (!$name || !$address || !$desc || !$img) json_error('Campos obrigatórios faltando', 400);

    $slug  = $rawSlug ? sanitise_slug($rawSlug) : null;
    $newId = DB::uuid();
    $now   = date('Y-m-d H:i:s');

    // Try insert with slug column (graceful fallback if column missing)
    try {
        DB::query(
            'INSERT INTO Barbershop (id, name, address, phones, description, imageUrl, active, slug, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)',
            [$newId, $name, $address, json_encode(is_array($phones) ? $phones : []), $desc, $img, $slug, $now, $now]
        );
    } catch (\Throwable $e) {
        DB::query(
            'INSERT INTO Barbershop (id, name, address, phones, description, imageUrl, active, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)',
            [$newId, $name, $address, json_encode(is_array($phones) ? $phones : []), $desc, $img, $now, $now]
        );
    }
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

    foreach (['name','address','description','imageUrl'] as $f) {
        if (array_key_exists($f, $body)) {
            $fields[] = "`$f` = ?";
            $vals[]   = $body[$f];
        }
    }
    if (array_key_exists('active', $body)) {
        $fields[] = '`active` = ?';
        $vals[]   = (int)(bool)$body['active'];
    }
    if (array_key_exists('phones', $body)) {
        $fields[] = '`phones` = ?';
        $vals[]   = json_encode(is_array($body['phones']) ? $body['phones'] : []);
    }
    // slug: sanitise and check uniqueness
    if (array_key_exists('slug', $body)) {
        $newSlug = $body['slug'] !== '' && $body['slug'] !== null
            ? sanitise_slug((string)$body['slug'])
            : null;

        if ($newSlug) {
            // Check for duplicates (other shops)
            try {
                $existing = DB::fetchOne(
                    'SELECT id FROM Barbershop WHERE slug = ? AND id != ? LIMIT 1',
                    [$newSlug, $id]
                );
                if ($existing) json_error("O slug '$newSlug' já está em uso por outra barbearia.", 409);
            } catch (\Throwable $e) { /* slug column may not exist */ }
        }

        try {
            $fields[] = '`slug` = ?';
            $vals[]   = $newSlug;
        } catch (\Throwable $e) { /* ignore if column missing */ }
    }

    if (!$fields) json_error('Nenhum campo para atualizar', 400);

    // Handle customDomain via BarberPageConfig
    if (array_key_exists('customDomain', $body)) {
        $cd = $body['customDomain'] ? trim((string)$body['customDomain']) : null;
        try {
            $exists = DB::fetchOne('SELECT id FROM BarberPageConfig WHERE barbershopId = ? LIMIT 1', [$id]);
            if ($exists) {
                DB::query('UPDATE BarberPageConfig SET customDomain = ?, updatedAt = ? WHERE barbershopId = ?',
                    [$cd, date('Y-m-d H:i:s'), $id]);
            } else {
                DB::query(
                    'INSERT INTO BarberPageConfig (id, barbershopId, customDomain, createdAt, updatedAt) VALUES (?,?,?,?,?)',
                    [DB::uuid(), $id, $cd, date('Y-m-d H:i:s'), date('Y-m-d H:i:s')]
                );
            }
        } catch (\Throwable $e) { /* column may not exist */ }
    }

    $vals[] = date('Y-m-d H:i:s');
    $vals[] = $id;

    DB::query('UPDATE Barbershop SET ' . implode(', ', $fields) . ', updatedAt = ? WHERE id = ?', $vals);

    $shop = DB::fetchOne('SELECT * FROM Barbershop WHERE id = ?', [$id]);
    $shop['phones'] = json_decode($shop['phones'], true) ?: [];
    if (!array_key_exists('slug', $shop)) $shop['slug'] = null;
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
