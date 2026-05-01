<?php
/**
 * POST /api/auth/register
 * Body: { "name": "...", "email": "...", "password": "..." }
 */
require_once __DIR__ . '/../../includes/auth.php';

cors_headers();
header('Content-Type: application/json; charset=utf-8');

if (request_method() !== 'POST') json_error('Method not allowed', 405);

$body     = request_body();
$name     = trim($body['name']     ?? '');
$email    = trim($body['email']    ?? '');
$password = trim($body['password'] ?? '');

if (!$name || !$email || !$password) json_error('Nome, email e senha são obrigatórios', 400);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Email inválido', 400);
if (strlen($password) < 6) json_error('Senha deve ter pelo menos 6 caracteres', 400);

$existing = DB::fetchOne('SELECT id FROM User WHERE email = ? LIMIT 1', [$email]);
if ($existing) json_error('Email já cadastrado', 409);

$id   = DB::cuid();
$hash = hash_password($password);
$now  = date('Y-m-d H:i:s');

DB::query(
    'INSERT INTO User (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [$id, $name, $email, $hash, 'CUSTOMER', $now, $now]
);

$user  = DB::fetchOne('SELECT id, name, email, role FROM User WHERE id = ?', [$id]);
$token = sign_in($user);

json_response([
    'token' => $token,
    'user'  => $user,
], 201);
