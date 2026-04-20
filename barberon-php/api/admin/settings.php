<?php
/**
 * GET  /api/admin/settings.php — get app settings
 * PUT  /api/admin/settings.php — update app settings (SUPERADMIN)
 */
require_once __DIR__ . '/../../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();

function get_or_create_settings(): array {
    $s = DB::fetchOne('SELECT * FROM AppSettings WHERE id = ? LIMIT 1', ['singleton']);
    if (!$s) {
        $now = date('Y-m-d H:i:s');
        DB::query(
            'INSERT INTO AppSettings (id, appName, banners, updatedAt) VALUES (?, ?, ?, ?)',
            ['singleton', 'Barberon', '[]', $now]
        );
        $s = DB::fetchOne('SELECT * FROM AppSettings WHERE id = ?', ['singleton']);
    }
    $s['banners'] = json_decode($s['banners'] ?? '[]', true) ?: [];
    return $s;
}

if ($method === 'GET') {
    json_response(get_or_create_settings());
}

if ($method === 'PUT') {
    if ($ctx['role'] !== 'SUPERADMIN') json_error('Acesso restrito ao Superadmin', 403);

    $body    = request_body();
    $fields  = [];
    $vals    = [];

    if (array_key_exists('appName', $body)) {
        $fields[] = 'appName = ?'; $vals[] = $body['appName'];
    }
    if (array_key_exists('logoUrl', $body)) {
        $fields[] = 'logoUrl = ?'; $vals[] = $body['logoUrl'];
    }
    if (array_key_exists('banners', $body)) {
        $fields[] = 'banners = ?';
        $vals[] = json_encode(is_array($body['banners']) ? $body['banners'] : []);
    }

    $fields[] = 'updatedAt = ?';
    $vals[]   = date('Y-m-d H:i:s');

    // Ensure singleton exists
    get_or_create_settings();

    if (count($fields) > 1) {
        DB::query(
            'UPDATE AppSettings SET ' . implode(', ', $fields) . ' WHERE id = ?',
            [...$vals, 'singleton']
        );
    }

    json_response(get_or_create_settings());
}

json_error('Method not allowed', 405);
