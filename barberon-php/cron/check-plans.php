<?php
/**
 * cron/check-plans.php
 * ─────────────────────────────────────────────────────────────
 * Run this daily via cPanel Cron Jobs:
 *   php /home/your_user/public_html/barberon/cron/check-plans.php
 *
 * What it does:
 *   1. Finds all active BarbershopPlan rows whose endDate has passed.
 *   2. Marks them as 'expired'.
 *   3. Sets the related Barbershop.active = 0 (hides it from listings/bookings).
 *   4. Logs the actions to cron/check-plans.log
 */

// CLI safety — allow from CLI or localhost only
$isCli = PHP_SAPI === 'cli';
if (!$isCli) {
    $remoteIp = $_SERVER['REMOTE_ADDR'] ?? '';
    if (!in_array($remoteIp, ['127.0.0.1', '::1'])) {
        http_response_code(403);
        echo 'Forbidden';
        exit;
    }
}

define('APP_ENV', 'cron');

// Bootstrap
$root = dirname(__DIR__);
require_once $root . '/includes/config.php';
require_once $root . '/includes/db.php';

$now    = date('Y-m-d H:i:s');
$logFile = __DIR__ . '/check-plans.log';

function log_line(string $msg): void {
    global $logFile;
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL;
    file_put_contents($logFile, $line, FILE_APPEND);
    if (PHP_SAPI === 'cli') echo $line;
}

log_line('=== check-plans.php started ===');

// ── 1. Expire overdue active plans ───────────────────────────
$expiredPlans = DB::fetchAll(
    'SELECT bp.id, bp.barbershopId, b.name AS shopName
       FROM BarbershopPlan bp
       JOIN Barbershop b ON b.id = bp.barbershopId
      WHERE bp.status = "active" AND bp.endDate < ?',
    [$now]
);

$deactivated = 0;
foreach ($expiredPlans as $row) {
    // Mark plan expired
    DB::query(
        'UPDATE BarbershopPlan SET status = "expired", updatedAt = ? WHERE id = ?',
        [$now, $row['id']]
    );

    // Deactivate barbershop
    DB::query(
        'UPDATE Barbershop SET active = 0, updatedAt = ? WHERE id = ?',
        [$now, $row['barbershopId']]
    );

    log_line('Expired plan for barbershop "' . $row['shopName'] . '" (id=' . $row['barbershopId'] . ')');
    $deactivated++;
}

// ── 2. Also catch barbershops with no plan at all that are active ─
// (optional – uncomment if you want to enforce plan requirement for ALL shops)
/*
$noPlan = DB::fetchAll(
    'SELECT b.id, b.name FROM Barbershop b
      WHERE b.active = 1
        AND NOT EXISTS (
          SELECT 1 FROM BarbershopPlan bp
           WHERE bp.barbershopId = b.id AND bp.status = "active"
        )'
);
foreach ($noPlan as $row) {
    DB::query('UPDATE Barbershop SET active = 0 WHERE id = ?', [$row['id']]);
    log_line('Deactivated barbershop without plan: "' . $row['name'] . '" (id=' . $row['id'] . ')');
    $deactivated++;
}
*/

// ── 3. Warn plans expiring in 3 or 7 days (future: send email) ──
$soonPlans = DB::fetchAll(
    'SELECT bp.id, bp.endDate, bp.barbershopId, b.name AS shopName,
            ba.userId,
            u.email AS adminEmail, u.name AS adminName
       FROM BarbershopPlan bp
       JOIN Barbershop b  ON b.id  = bp.barbershopId
  LEFT JOIN BarbershopAdmin ba ON ba.barbershopId = bp.barbershopId
  LEFT JOIN User u ON u.id = ba.userId
      WHERE bp.status = "active"
        AND bp.endDate BETWEEN ? AND DATE_ADD(?, INTERVAL 7 DAY)',
    [$now, $now]
);

foreach ($soonPlans as $row) {
    $daysLeft = (int)((strtotime($row['endDate']) - time()) / 86400);
    log_line(
        'WARN: Plan for "' . $row['shopName'] . '" expires in ' . $daysLeft . ' day(s) ' .
        '(admin: ' . ($row['adminEmail'] ?? 'unknown') . ')'
    );
    // TODO: integrate email sending here (PHPMailer / SMTP)
}

log_line("Done. Deactivated: {$deactivated} barbershop(s). Expiring soon: " . count($soonPlans));
log_line('=== check-plans.php finished ===');
echo 'OK' . PHP_EOL;
