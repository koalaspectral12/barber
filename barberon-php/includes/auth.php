<?php
/**
 * Barberon — Session / Authentication helpers
 * Supports both PHP sessions (web) and JWT Bearer tokens (static/SPA frontend).
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// ─── CORS — allow static GitHub Pages frontend ────────────────────────────────
function cors_headers(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    // In production, restrict to your actual GitHub Pages URL, e.g.:
    //   $allowed = ['https://yourusername.github.io', 'https://yourdomain.com'];
    //   if (in_array($origin, $allowed)) { ... }
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// ─── Simple JWT (HS256) ───────────────────────────────────────────────────────
function jwt_encode(array $payload): string {
    $secret  = SESSION_SECRET;
    $header  = base64url_encode(json_encode(['alg'=>'HS256','typ'=>'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + SESSION_LIFETIME;
    $p   = base64url_encode(json_encode($payload));
    $sig = base64url_encode(hash_hmac('sha256', "$header.$p", $secret, true));
    return "$header.$p.$sig";
}

function jwt_decode(string $token): ?array {
    $secret = SESSION_SECRET;
    $parts  = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $payload, $sig] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    if (!hash_equals($expected, $sig)) return null;
    $data = json_decode(base64url_decode($payload), true);
    if (!$data || (isset($data['exp']) && $data['exp'] < time())) return null;
    return $data;
}

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

// ─── Token from Authorization header ─────────────────────────────────────────
function get_bearer_token(): ?string {
    $header = $_SERVER['HTTP_AUTHORIZATION']
           ?? apache_request_headers()['Authorization']
           ?? apache_request_headers()['authorization']
           ?? null;
    if ($header && preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
        return $m[1];
    }
    return null;
}

// ─── Session helpers ──────────────────────────────────────────────────────────
function session_start_secure(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path'     => '/',
            'secure'   => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'None',   // required for cross-origin cookie
        ]);
        session_start();
    }
}

// ─── current_user — session OR JWT Bearer ────────────────────────────────────
function current_user(): ?array {
    // 1. Try Bearer JWT first (static/SPA frontend)
    $token = get_bearer_token();
    if ($token) {
        $claims = jwt_decode($token);
        if ($claims && !empty($claims['uid'])) {
            $user = DB::fetchOne(
                'SELECT id, name, email, image, role FROM User WHERE id = ?',
                [$claims['uid']]
            );
            return $user ?: null;
        }
    }

    // 2. Fall back to PHP session (server-rendered pages)
    session_start_secure();
    if (empty($_SESSION['user_id'])) return null;
    return DB::fetchOne(
        'SELECT id, name, email, image, role FROM User WHERE id = ?',
        [$_SESSION['user_id']]
    );
}

/** Require authentication; send 401 JSON if missing */
function require_auth(): array {
    $user = current_user();
    if (!$user) json_error('Não autenticado', 401);
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
 * Get admin context: userId, role, barbershopId.
 */
function get_admin_context(): ?array {
    $user = current_user();
    if (!$user || !in_array($user['role'], ['ADMIN', 'SUPERADMIN'])) return null;
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

/** Sign a user in (set session + return JWT for API clients) */
function sign_in(array $user): string {
    session_start_secure();
    session_regenerate_id(true);
    $_SESSION['user_id']   = $user['id'];
    $_SESSION['user_role'] = $user['role'];
    return jwt_encode(['uid' => $user['id'], 'role' => $user['role']]);
}

/** Sign out */
function sign_out(): void {
    session_start_secure();
    $_SESSION = [];
    session_destroy();
}

// ─── JSON response helpers ────────────────────────────────────────────────────
function json_response(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status = 400): never {
    json_response(['error' => $message], $status);
}

function request_body(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function request_method(): string {
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}
