<?php
/**
 * Barberon — Session / Authentication helpers
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// Start a secure PHP session
function session_start_secure(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path'     => '/',
            'secure'   => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

/** Return the currently authenticated user array or null */
function current_user(): ?array {
    session_start_secure();
    if (empty($_SESSION['user_id'])) return null;
    // Re-verify from DB on each request (cheap — uses PK)
    return DB::fetchOne(
        'SELECT id, name, email, image, role FROM User WHERE id = ?',
        [$_SESSION['user_id']]
    );
}

/** Require authentication; send 401 JSON if missing */
function require_auth(): array {
    $user = current_user();
    if (!$user) {
        json_error('Não autenticado', 401);
    }
    return $user;
}

/** Require ADMIN or SUPERADMIN; send 403 JSON if insufficient */
function require_admin(): array {
    $user = require_auth();
    if (!in_array($user['role'], ['ADMIN', 'SUPERADMIN'])) {
        json_error('Acesso restrito a administradores', 403);
    }
    return $user;
}

/** Require SUPERADMIN only */
function require_superadmin(): array {
    $user = require_auth();
    if ($user['role'] !== 'SUPERADMIN') {
        json_error('Acesso restrito ao Superadmin', 403);
    }
    return $user;
}

/**
 * Get admin context: userId, role, barbershopId (or null for SUPERADMIN).
 * Returns null if not admin.
 */
function get_admin_context(): ?array {
    $user = current_user();
    if (!$user || !in_array($user['role'], ['ADMIN', 'SUPERADMIN'])) {
        return null;
    }
    $barbershopId = null;
    if ($user['role'] === 'ADMIN') {
        $row = DB::fetchOne(
            'SELECT barbershopId FROM BarbershopAdmin WHERE userId = ? AND active = 1 LIMIT 1',
            [$user['id']]
        );
        $barbershopId = $row['barbershopId'] ?? null;
    }
    return [
        'userId'       => $user['id'],
        'role'         => $user['role'],
        'barbershopId' => $barbershopId,
        'user'         => $user,
    ];
}

/** Hash a password with bcrypt */
function hash_password(string $plain): string {
    return password_hash($plain, PASSWORD_BCRYPT, ['cost' => 12]);
}

/** Verify a plain password against a bcrypt hash */
function verify_password(string $plain, string $hash): bool {
    return password_verify($plain, $hash);
}

/** Sign a user in (set session) */
function sign_in(array $user): void {
    session_start_secure();
    session_regenerate_id(true);
    $_SESSION['user_id']   = $user['id'];
    $_SESSION['user_role'] = $user['role'];
}

/** Sign out */
function sign_out(): void {
    session_start_secure();
    $_SESSION = [];
    session_destroy();
}

// ─── JSON response helpers ────────────────────────────────────────────────────

/** Send JSON response and exit */
function json_response(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Send JSON error and exit */
function json_error(string $message, int $status = 400): never {
    json_response(['error' => $message], $status);
}

/** Parse JSON request body */
function request_body(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Get request method */
function request_method(): string {
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}
