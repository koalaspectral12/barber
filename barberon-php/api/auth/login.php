<?php
/**
 * POST /api/auth/login
 * Body: { "email": "...", "password": "..." }
 * Returns: { token, user } — token is JWT for static/SPA frontend
 */
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
header('Content-Type: application/json; charset=utf-8');

if (request_method() !== 'POST') json_error('Method not allowed', 405);

$body     = request_body();
$email    = trim($body['email']    ?? '');
$password = trim($body['password'] ?? '');

if (!$email || !$password) json_error('Email e senha são obrigatórios', 400);

$user = DB::fetchOne('SELECT * FROM User WHERE email = ? LIMIT 1', [$email]);
if (!$user || !$user['password']) json_error('Credenciais inválidas', 401);
if (!verify_password($password, $user['password'])) json_error('Credenciais inválidas', 401);

// Check admin expiry
if ($user['role'] === 'ADMIN') {
    $adminRow = DB::fetchOne(
        'SELECT * FROM BarbershopAdmin WHERE userId = ? LIMIT 1',
        [$user['id']]
    );
    if ($adminRow) {
        if (!empty($adminRow['expiresAt']) && strtotime($adminRow['expiresAt']) < time()) {
            DB::update('BarbershopAdmin', ['active' => 0], ['userId' => $user['id']]);
            DB::update('Barbershop', ['active' => 0], ['id' => $adminRow['barbershopId']]);
            DB::update('User', ['role' => 'CUSTOMER'], ['id' => $user['id']]);
            $user['role'] = 'CUSTOMER';
        } elseif (!$adminRow['active']) {
            $user['role'] = 'CUSTOMER';
        }
    }
}

$token = sign_in($user);

json_response([
    'token' => $token,
    'user'  => [
        'id'    => $user['id'],
        'name'  => $user['name'],
        'email' => $user['email'],
        'image' => $user['image'] ?? null,
        'role'  => $user['role'],
    ],
]);
