<?php
/**
 * GET /api/barbershops/hours.php
 * Params: barbershopId, date (YYYY-MM-DD), serviceId (optional)
 *
 * Returns available time slots for a given barbershop + date.
 * - If today is closed, still allows queries for future dates.
 * - If selected date is closed (no hours row), returns empty slots with message.
 * - Supports serviceId to use that service's duration for slot sizing.
 */
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();

header('Content-Type: application/json; charset=utf-8');

$barbershopId = $_GET['barbershopId'] ?? null;
$date         = $_GET['date']         ?? null;
$serviceId    = $_GET['serviceId']    ?? null;

// Allow fetching weekly schedule (no date) — returns all hours rows
if ($barbershopId && !$date) {
    $rows = DB::fetchAll(
        'SELECT * FROM BarbershopHours WHERE barbershopId = ? ORDER BY dayOfWeek',
        [$barbershopId]
    );
    foreach ($rows as &$h) $h['slotMinutes'] = (int)$h['slotMinutes'];
    json_response($rows);
}

if (!$barbershopId || !$date) {
    json_error('barbershopId e date são obrigatórios', 400);
}

// Parse date
$ts = strtotime($date);
if (!$ts) json_error('Data inválida', 400);

$dayOfWeek = (int) date('w', $ts); // 0=Sun … 6=Sat

// Reject past dates
$todayTs = strtotime(date('Y-m-d'));
if ($ts < $todayTs) {
    json_response([
        'slots'   => [],
        'date'    => $date,
        'closed'  => false,
        'message' => 'Data no passado',
    ]);
}

// Get working hours for that specific day
$hours = DB::fetchOne(
    'SELECT * FROM BarbershopHours WHERE barbershopId = ? AND dayOfWeek = ? LIMIT 1',
    [$barbershopId, $dayOfWeek]
);

// No hours row means the barbershop does not work on that day
if (!$hours) {
    json_response([
        'slots'   => [],
        'date'    => $date,
        'closed'  => true,
        'message' => 'Barbearia fechada neste dia. Escolha outra data.',
    ]);
}

// Also handle explicit closed flag if the column exists
if (!empty($hours['closed'])) {
    json_response([
        'slots'   => [],
        'date'    => $date,
        'closed'  => true,
        'message' => 'Barbearia fechada neste dia. Escolha outra data.',
    ]);
}

// Determine slot duration in minutes
// Priority: service.duration > BarbershopHours.slotMinutes > default 30
$slotMin = max(1, (int)($hours['slotMinutes'] ?? 30));
if ($slotMin < 5) $slotMin = 30; // safety floor

if ($serviceId) {
    $svc = DB::fetchOne(
        'SELECT duration FROM BarbershopService WHERE id = ? LIMIT 1',
        [$serviceId]
    );
    if ($svc && !empty($svc['duration'])) {
        [$h, $m] = explode(':', $svc['duration'] . ':00');
        $dMin = (int)$h * 60 + (int)$m;
        if ($dMin >= 5) $slotMin = $dMin;
    }
}

// Generate time slots between open and close
$openTime  = $hours['openTime']  ?? '08:00';
$closeTime = $hours['closeTime'] ?? '18:00';

$open  = strtotime($date . ' ' . $openTime);
$close = strtotime($date . ' ' . $closeTime);

if (!$open || !$close || $open >= $close) {
    json_response([
        'slots'      => [],
        'date'       => $date,
        'closed'     => false,
        'message'    => 'Horário de funcionamento inválido',
        'slotMinutes'=> $slotMin,
    ]);
}

$slots = [];
for ($t = $open; $t + ($slotMin * 60) <= $close; $t += $slotMin * 60) {
    $slots[] = date('H:i', $t);
}

// Get already booked slots for this barbershop on this date
$booked = DB::fetchAll(
    'SELECT TIME_FORMAT(bk.date, "%H:%i") AS time,
            IFNULL(svc.duration, "00:30")  AS duration
     FROM Booking bk
     JOIN BarbershopService svc ON svc.id = bk.serviceId
     WHERE svc.barbershopId = ? AND DATE(bk.date) = ?
       AND bk.paymentStatus NOT IN ("cancelled","rejected")',
    [$barbershopId, $date]
);

// Build set of occupied minutes (minutes since midnight)
$blockedMinutes = [];
foreach ($booked as $b) {
    $timeParts = explode(':', $b['time'] . ':00');
    $startMin  = (int)$timeParts[0] * 60 + (int)$timeParts[1];
    $durParts  = explode(':', $b['duration'] ?: '00:30');
    $durMin    = (int)$durParts[0] * 60 + (int)$durParts[1];
    if ($durMin <= 0) $durMin = 30;
    for ($i = 0; $i < $durMin; $i++) {
        $blockedMinutes[$startMin + $i] = true;
    }
}

// Mark slots available/booked, checking service duration overlap
$available = array_map(function ($slotTime) use ($blockedMinutes, $slotMin) {
    $parts    = explode(':', $slotTime);
    $startMin = (int)$parts[0] * 60 + (int)$parts[1];
    $blocked  = false;
    for ($i = 0; $i < $slotMin; $i++) {
        if (isset($blockedMinutes[$startMin + $i])) { $blocked = true; break; }
    }
    return ['time' => $slotTime, 'available' => !$blocked];
}, $slots);

// If today: remove past slots (with a 5-min buffer so the slot is actually usable)
if ($ts === $todayTs) {
    $nowMin = (int)date('H') * 60 + (int)date('i') + 5;
    $available = array_values(array_filter($available, function ($s) use ($nowMin) {
        $p = explode(':', $s['time']);
        return ((int)$p[0] * 60 + (int)$p[1]) > $nowMin;
    }));
}

$hasAvail = !empty(array_filter($available, fn($s) => $s['available']));

json_response([
    'slots'       => $available,
    'date'        => $date,
    'closed'      => false,
    'slotMinutes' => $slotMin,
    'message'     => $hasAvail ? null : 'Nenhum horário disponível neste dia.',
]);
