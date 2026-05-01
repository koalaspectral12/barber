<?php
/**
 * GET /api/admin/me.php — current admin info
 */
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$u = $ctx['user'];

// Get managed barbershop
$barbershop = null;
$barbershopId = $ctx['barbershopId'];
if ($barbershopId) {
    $barbershop = DB::fetchOne(
        'SELECT id, name, imageUrl FROM Barbershop WHERE id = ? LIMIT 1',
        [$barbershopId]
    );
}

json_response([
    'id'           => $u['id'],
    'name'         => $u['name'],
    'email'        => $u['email'],
    'role'         => $u['role'],
    'barbershopId' => $barbershopId,
    'barbershop'   => $barbershop,
]);
