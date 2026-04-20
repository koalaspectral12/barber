<?php
// ─── Barberon — Configuration ────────────────────────────────────────────────
define('APP_NAME', 'Barberon');
define('APP_VERSION', '1.0.0');
define('BASE_URL', '');   // e.g. '' for root, or '/barberon' for subfolder

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
define('UPLOAD_DIR', __DIR__ . '/../public/uploads/');
define('UPLOAD_URL', BASE_URL . '/public/uploads/');

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Error reporting (disable on production)
if (getenv('APP_ENV') === 'production') {
    error_reporting(0);
    ini_set('display_errors', '0');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}
