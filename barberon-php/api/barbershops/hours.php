<?php
/**
 * GET  /api/barbershops/hours.php?barbershopId=xxx  — available time slots
 * Params: barbershopId, date (YYYY-MM-DD), serviceId
 */
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');

$barbershopId = $_GET['barbershopId'] ?? null;
$date         = $_GET['date']         ?? null;

if (!$barbershopId || !$date) {
    json_error('barbershopId e date são obrigatórios', 400);
}

// Parse date
$ts = strtotime($date);
if (!$ts) json_error('Data inválida', 400);

$dayOfWeek = (int) date('w', $ts); // 0=Sun … 6=Sat

// Get working hours for that day
$hours = DB::fetchOne(
    'SELECT * FROM BarbershopHours WHERE barbershopId = ? AND dayOfWeek = ? LIMIT 1',
    [$barbershopId, $dayOfWeek]
);

if (!$hours) {
    json_response(['slots' => [], 'message' => 'Barbearia fechada neste dia']);
}

// Generate slots
$slotMin  = (int) ($hours['slotMinutes'] ?? 30);
$open     = strtotime($date . ' ' . $hours['openTime']);
$close    = strtotime($date . ' ' . $hours['closeTime']);
$slots    = [];

for ($t = $open; $t < $close; $t += $slotMin * 60) {
    $slots[] = date('H:i', $t);
}

// Get already booked slots for this barbershop on this date
$booked = DB::fetchAll(
    'SELECT TIME_FORMAT(b.date, "%H:%i") as time
     FROM Booking b
     JOIN BarbershopService s ON s.id = b.serviceId
     WHERE s.barbershopId = ? AND DATE(b.date) = ?',
    [$barbershopId, $date]
);
$bookedTimes = array_column($booked, 'time');

$available = array_map(fn($s) => [
    'time'      => $s,
    'available' => !in_array($s, $bookedTimes),
], $slots);

json_response(['slots' => $available, 'date' => $date]);
