<?php
/**
 * Barberon — Create Superadmin seed
 * Run ONCE: php seed-superadmin.php
 *
 * Usage:
 *   php seed-superadmin.php [email] [password] [name]
 *
 * Defaults:
 *   email:    admin@barberon.com
 *   password: admin123
 *   name:     Super Admin
 */

require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/auth.php';

$email    = $argv[1] ?? 'admin@barberon.com';
$password = $argv[2] ?? 'admin123';
$name     = $argv[3] ?? 'Super Admin';

$existing = DB::fetchOne('SELECT id, role FROM User WHERE email = ? LIMIT 1', [$email]);

if ($existing) {
    if ($existing['role'] === 'SUPERADMIN') {
        echo "✅ User {$email} is already a SUPERADMIN.\n";
        exit(0);
    }
    // Upgrade to SUPERADMIN
    DB::query('UPDATE User SET role = ?, password = ?, updatedAt = ? WHERE email = ?',
        ['SUPERADMIN', hash_password($password), date('Y-m-d H:i:s'), $email]);
    echo "✅ User {$email} promoted to SUPERADMIN (password updated).\n";
    exit(0);
}

$id  = DB::cuid();
$now = date('Y-m-d H:i:s');
DB::query(
    'INSERT INTO User (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [$id, $name, $email, hash_password($password), 'SUPERADMIN', $now, $now]
);

echo "✅ Superadmin created!\n";
echo "   Email:    {$email}\n";
echo "   Password: {$password}\n";
echo "   Please change the password after first login.\n";
