<?php
/**
 * GET /api/barbershops/hours.php
 * Params: barbershopId, date (YYYY-MM-DD), serviceId (optional)
 *
 * Returns available time slots for a given barbershop + date.
 * If serviceId is provided, uses that service's duration to generate slots.
 * Falls back to the barbershop's slotMinutes if no service duration is found.
 */
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');

$barbershopId = $_GET['barbershopId'] ?? null;
$date         = $_GET['date']         ?? null;
$serviceId    = $_GET['serviceId']    ?? null;

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
    json_response(['slots' => [], 'message' => 'Data no passado']);
}

// Get working hours for that day
$hours = DB::fetchOne(
    'SELECT * FROM BarbershopHours WHERE barbershopId = ? AND dayOfWeek = ? LIMIT 1',
    [$barbershopId, $dayOfWeek]
);

if (!$hours) {
    json_response(['slots' => [], 'message' => 'Barbearia fechada neste dia']);
}

// Determine slot duration in minutes
// Priority: service.duration > BarbershopHours.slotMinutes
$slotMin = (int)($hours['slotMinutes'] ?? 30);

if ($serviceId) {
    $svc = DB::fetchOne(
        'SELECT duration FROM BarbershopService WHERE id = ? LIMIT 1',
        [$serviceId]
    );
    if ($svc && !empty($svc['duration'])) {
        // duration stored as "HH:MM" — convert to minutes
        [$h, $m] = explode(':', $svc['duration']);
        $dMin = (int)$h * 60 + (int)$m;
        if ($dMin > 0) $slotMin = $dMin;
    }
}

// Generate time slots between open and close
$open  = strtotime($date . ' ' . $hours['openTime']);
$close = strtotime($date . ' ' . $hours['closeTime']);

if ($open >= $close) {
    json_response(['slots' => [], 'message' => 'Horário de funcionamento inválido']);
}

$slots = [];
for ($t = $open; $t + ($slotMin * 60) <= $close; $t += $slotMin * 60) {
    $slots[] = date('H:i', $t);
}

// Get already booked slots for this barbershop on this date
// Each booking occupies its service's duration worth of time
$booked = DB::fetchAll(
    'SELECT TIME_FORMAT(bk.date, "%H:%i") AS time,
            IFNULL(svc.duration, "00:30") AS duration
     FROM Booking bk
     JOIN BarbershopService svc ON svc.id = bk.serviceId
     WHERE svc.barbershopId = ? AND DATE(bk.date) = ?',
    [$barbershopId, $date]
);

// Build set of occupied time ranges
$blockedMinutes = []; // minutes-since-midnight that are occupied
foreach ($booked as $b) {
    [$bh, $bm] = explode(':', $b['time']);
    $startMin = (int)$bh * 60 + (int)$bm;
    [$dh, $dm] = explode(':', $b['duration'] ?: '00:30');
    $durMin   = (int)$dh * 60 + (int)$dm;
    if ($durMin <= 0) $durMin = 30;
    for ($i = 0; $i < $durMin; $i++) {
        $blockedMinutes[$startMin + $i] = true;
    }
}

// Mark slots available/booked considering service duration overlap
$available = array_map(function ($slotTime) use ($blockedMinutes, $slotMin) {
    [$sh, $sm] = explode(':', $slotTime);
    $startMin  = (int)$sh * 60 + (int)$sm;
    // Check if ANY minute in [startMin, startMin+slotMin) is blocked
    $isBlocked = false;
    for ($i = 0; $i < $slotMin; $i++) {
        if (isset($blockedMinutes[$startMin + $i])) { $isBlocked = true; break; }
    }
    return ['time' => $slotTime, 'available' => !$isBlocked];
}, $slots);

// If today, remove past slots
if ($ts === $todayTs) {
    $nowMin = (int)date('H') * 60 + (int)date('i');
    $available = array_values(array_filter($available, function ($s) use ($nowMin) {
        [$h, $m] = explode(':', $s['time']);
        return ((int)$h * 60 + (int)$m) > $nowMin;
    }));
}

json_response([
    'slots'       => $available,
    'date'        => $date,
    'slotMinutes' => $slotMin,
    'message'     => empty($available) ? 'Nenhum horário disponível' : null,
]);
