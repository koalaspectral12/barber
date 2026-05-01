<?php
/**
 * GET  /api/bookings/index.php  — list bookings for current user
 * POST /api/bookings/index.php  — create a booking
 * DELETE /api/bookings/index.php?id=xxx — cancel a booking
 */
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();

header('Content-Type: application/json; charset=utf-8');

$method = request_method();
$user   = require_auth();

// ── GET: list user bookings ───────────────────────────────────────────────────
if ($method === 'GET') {
    $rows = DB::fetchAll(
        'SELECT bk.*, s.name AS serviceName, s.price, s.imageUrl AS serviceImage,
                bs.id AS barbershopId, bs.name AS barbershopName, bs.imageUrl AS barbershopImage
         FROM Booking bk
         JOIN BarbershopService s  ON s.id  = bk.serviceId
         JOIN Barbershop bs        ON bs.id = s.barbershopId
         WHERE bk.userId = ?
         ORDER BY bk.date DESC',
        [$user['id']]
    );
    foreach ($rows as &$r) {
        $r['price'] = (float) $r['price'];
        $r['service'] = [
            'id'           => $r['serviceId'],
            'name'         => $r['serviceName'],
            'price'        => $r['price'],
            'imageUrl'     => $r['serviceImage'],
            'barbershop'   => [
                'id'       => $r['barbershopId'],
                'name'     => $r['barbershopName'],
                'imageUrl' => $r['barbershopImage'],
            ],
        ];
    }
    json_response($rows);
}

// ── POST: create a booking ────────────────────────────────────────────────────
if ($method === 'POST') {
    $body          = request_body();
    $serviceId     = $body['serviceId']     ?? null;
    $date          = $body['date']          ?? null;
    $paymentMethod = $body['paymentMethod'] ?? 'local';

    if (!$serviceId || !$date) {
        json_error('serviceId e date são obrigatórios', 400);
    }

    // Validate service exists
    $service = DB::fetchOne('SELECT id FROM BarbershopService WHERE id = ? LIMIT 1', [$serviceId]);
    if (!$service) json_error('Serviço não encontrado', 404);

    // Check conflict
    $conflict = DB::fetchOne(
        'SELECT id FROM Booking WHERE serviceId = ? AND date = ? LIMIT 1',
        [$serviceId, $date]
    );
    if ($conflict) json_error('Horário já reservado', 409);

    $id  = DB::uuid();
    $now = date('Y-m-d H:i:s');

    try {
        DB::query(
            'INSERT INTO Booking (id, userId, serviceId, date, paymentMethod, paymentStatus, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [$id, $user['id'], $serviceId, $date, $paymentMethod, 'pending', $now, $now]
        );
    } catch (\Throwable $e) {
        // Fallback without payment columns
        try {
            DB::query(
                'INSERT INTO Booking (id, userId, serviceId, date, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                [$id, $user['id'], $serviceId, $date, $now, $now]
            );
        } catch (\Throwable $e2) {
            json_error('Erro ao criar agendamento: ' . $e2->getMessage(), 500);
        }
    }

    $booking = DB::fetchOne(
        'SELECT bk.*, s.name AS serviceName, s.price, bs.name AS barbershopName
         FROM Booking bk
         JOIN BarbershopService s ON s.id = bk.serviceId
         JOIN Barbershop bs ON bs.id = s.barbershopId
         WHERE bk.id = ?',
        [$id]
    );
    json_response($booking, 201);
}

// ── DELETE: cancel a booking ──────────────────────────────────────────────────
if ($method === 'DELETE') {
    $bookingId = $_GET['id'] ?? null;
    if (!$bookingId) json_error('id é obrigatório', 400);

    $booking = DB::fetchOne('SELECT * FROM Booking WHERE id = ? LIMIT 1', [$bookingId]);
    if (!$booking) json_error('Agendamento não encontrado', 404);
    if ($booking['userId'] !== $user['id'] && $user['role'] === 'CUSTOMER') {
        json_error('Acesso negado', 403);
    }

    DB::delete('Booking', ['id' => $bookingId]);
    json_response(['ok' => true]);
}

json_error('Method not allowed', 405);
