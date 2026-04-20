<?php
/**
 * GET /api/admin/payment.php?barbershopId=xxx — get payment config
 * PUT /api/admin/payment.php                  — save payment config
 */
require_once __DIR__ . '/../../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();

if ($method === 'GET') {
    $barbershopId = $_GET['barbershopId'] ?? $ctx['barbershopId'];
    if (!$barbershopId) json_error('barbershopId obrigatório', 400);
    if ($ctx['role'] !== 'SUPERADMIN' && $barbershopId !== $ctx['barbershopId']) json_error('Acesso negado', 403);

    $row = DB::fetchOne('SELECT * FROM PaymentConfig WHERE barbershopId = ? LIMIT 1', [$barbershopId]);
    json_response($row ?: ['barbershopId' => $barbershopId, 'active' => false]);
}

if ($method === 'PUT') {
    $body         = request_body();
    $barbershopId = $body['barbershopId'] ?? $ctx['barbershopId'];
    if (!$barbershopId) json_error('barbershopId obrigatório', 400);
    if ($ctx['role'] !== 'SUPERADMIN' && $barbershopId !== $ctx['barbershopId']) json_error('Acesso negado', 403);

    $now      = date('Y-m-d H:i:s');
    $existing = DB::fetchOne('SELECT id FROM PaymentConfig WHERE barbershopId = ? LIMIT 1', [$barbershopId]);

    if ($existing) {
        DB::query(
            'UPDATE PaymentConfig SET mpAccessToken = ?, mpPublicKey = ?, active = ?, updatedAt = ? WHERE barbershopId = ?',
            [$body['mpAccessToken'] ?? null, $body['mpPublicKey'] ?? null,
             (int)(bool)($body['active'] ?? false), $now, $barbershopId]
        );
    } else {
        DB::query(
            'INSERT INTO PaymentConfig (id, barbershopId, mpAccessToken, mpPublicKey, active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [DB::cuid(), $barbershopId,
             $body['mpAccessToken'] ?? null, $body['mpPublicKey'] ?? null,
             (int)(bool)($body['active'] ?? false), $now, $now]
        );
    }

    $row = DB::fetchOne('SELECT * FROM PaymentConfig WHERE barbershopId = ?', [$barbershopId]);
    json_response($row);
}

json_error('Method not allowed', 405);
