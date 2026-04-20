<?php
// ─── Barberon — Configuration ────────────────────────────────────────────────
define('APP_NAME', 'Barberon');
define('APP_VERSION', '1.0.0');

// ── Auto-detect BASE_URL ─────────────────────────────────────────────────────
// Works whether the app is at the domain root (/), a subfolder (/barberon/),
// or any other path.  You can also override manually, e.g.:
//   define('BASE_URL', '/barberon');
if (!defined('BASE_URL')) {
    // __DIR__ = absolute filesystem path to the "includes" directory
    // DOCUMENT_ROOT = filesystem path of the web server document root
    $docRoot  = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/');
    // APP_ROOT = filesystem path one level above "includes"
    $appRoot  = dirname(__DIR__);
    // Subtract docRoot from appRoot to get the URL base path
    $basePath = str_replace($docRoot, '', $appRoot);
    // Normalise: remove trailing slash, ensure leading slash (or empty for root)
    $basePath = '/' . ltrim(str_replace('\\', '/', $basePath), '/');
    $basePath = rtrim($basePath, '/');
    // If the app IS at the document root, basePath is empty string — that's correct
    define('BASE_URL', $basePath === '/' ? '' : $basePath);
}

// ── APP_ROOT constant (filesystem absolute path to project root) ──────────────
define('APP_ROOT', dirname(__DIR__));

// Database credentials — set these in your hosting environment
// You can override with environment variables or a .env file
define('DB_HOST', getenv('DB_HOST')     ?: 'localhost');
define('DB_PORT', getenv('DB_PORT')     ?: '3306');
define('DB_NAME', getenv('DB_NAME')     ?: 'barberon');
define('DB_USER', getenv('DB_USER')     ?: 'root');
define('DB_PASS', getenv('DB_PASS')     ?: '');
define('DB_CHARSET', 'utf8mb4');

// Session secret (change on production!)
define('SESSION_SECRET', getenv('SESSION_SECRET') ?: 'CHANGE_ME_TO_A_RANDOM_SECRET_KEY');

// JWT-like session lifetime (seconds)
define('SESSION_LIFETIME', 60 * 60 * 24 * 7); // 7 days

// Upload directory (must be writable)
define('UPLOAD_DIR', APP_ROOT . '/public/uploads/');
define('UPLOAD_URL', BASE_URL . '/public/uploads/');

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Error reporting — disable display_errors in production for security
if (getenv('APP_ENV') === 'production') {
    error_reporting(0);
    ini_set('display_errors', '0');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}
