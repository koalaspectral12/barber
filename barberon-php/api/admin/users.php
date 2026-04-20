<?php
/**
 * GET  /api/admin/users.php                    — list users (SUPERADMIN)
 * POST /api/admin/users.php?action=promote     — promote user to ADMIN
 * POST /api/admin/users.php?action=demote      — demote admin back to CUSTOMER
 */
require_once __DIR__ . '/../../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();
$action = $_GET['action'] ?? null;

// ── GET: list users ───────────────────────────────────────────────────────────
if ($method === 'GET') {
    if ($ctx['role'] !== 'SUPERADMIN') json_error('Acesso restrito ao Superadmin', 403);

    $rows = DB::fetchAll(
        'SELECT u.id, u.name, u.email, u.role, u.image, u.createdAt,
                ba.barbershopId, ba.expiresAt, ba.active AS adminActive,
                b.name AS barbershopName
         FROM User u
         LEFT JOIN BarbershopAdmin ba ON ba.userId = u.id
         LEFT JOIN Barbershop b ON b.id = ba.barbershopId
         ORDER BY u.createdAt DESC'
    );

    $now = time();
    foreach ($rows as &$r) {
        $r['adminExpired'] = !empty($r['expiresAt']) && strtotime($r['expiresAt']) < $now;
        $r['bookingsCount'] = (int) DB::fetchOne(
            'SELECT COUNT(*) AS c FROM Booking WHERE userId = ?', [$r['id']])['c'];
    }

    json_response($rows);
}

// ── POST: promote / demote ────────────────────────────────────────────────────
if ($method === 'POST') {
    if ($ctx['role'] !== 'SUPERADMIN') json_error('Acesso restrito ao Superadmin', 403);

    $body         = request_body();
    $userId       = $body['userId']       ?? null;
    $barbershopId = $body['barbershopId'] ?? null;
    $expiresAt    = $body['expiresAt']    ?? null; // ISO string or null

    if (!$userId) json_error('userId é obrigatório', 400);

    if ($action === 'promote') {
        if (!$barbershopId) json_error('barbershopId é obrigatório', 400);

        // Check user exists
        $user = DB::fetchOne('SELECT id, role FROM User WHERE id = ? LIMIT 1', [$userId]);
        if (!$user) json_error('Usuário não encontrado', 404);

        $now = date('Y-m-d H:i:s');

        // Update role
        DB::query('UPDATE User SET role = ? WHERE id = ?', ['ADMIN', $userId]);

        // Upsert BarbershopAdmin
        $existing = DB::fetchOne('SELECT id FROM BarbershopAdmin WHERE userId = ? LIMIT 1', [$userId]);
        if ($existing) {
            DB::query(
                'UPDATE BarbershopAdmin SET barbershopId = ?, expiresAt = ?, active = 1 WHERE userId = ?',
                [$barbershopId, $expiresAt, $userId]
            );
        } else {
            DB::query(
                'INSERT INTO BarbershopAdmin (id, userId, barbershopId, expiresAt, active, assignedAt) VALUES (?, ?, ?, ?, 1, ?)',
                [DB::cuid(), $userId, $barbershopId, $expiresAt, $now]
            );
        }

        json_response(['ok' => true, 'role' => 'ADMIN']);
    }

    if ($action === 'demote') {
        DB::query('UPDATE User SET role = ? WHERE id = ?', ['CUSTOMER', $userId]);
        DB::query('UPDATE BarbershopAdmin SET active = 0 WHERE userId = ?', [$userId]);
        json_response(['ok' => true, 'role' => 'CUSTOMER']);
    }

    json_error('Ação inválida', 400);
}

json_error('Method not allowed', 405);
