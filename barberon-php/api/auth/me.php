<?php
/**
 * GET /api/auth/me — Returns current authenticated user or 401
 */
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
header('Content-Type: application/json; charset=utf-8');

$user = current_user();
if (!$user) json_error('Não autenticado', 401);

json_response([
    'id'    => $user['id'],
    'name'  => $user['name'],
    'email' => $user['email'],
    'image' => $user['image'] ?? null,
    'role'  => $user['role'],
]);
