<?php
/**
 * GET    /api/admin/bookings.php        — list bookings
 * DELETE /api/admin/bookings.php?id=xxx — cancel booking
 */
require_once __DIR__ . '/../../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();

if ($method === 'GET') {
    if ($ctx['role'] === 'SUPERADMIN') {
        $rows = DB::fetchAll(
            'SELECT bk.*, u.name AS userName, u.email AS userEmail,
                    s.name AS serviceName, s.price,
                    bs.id AS barbershopId, bs.name AS barbershopName
             FROM Booking bk
             JOIN User u ON u.id = bk.userId
             JOIN BarbershopService s ON s.id = bk.serviceId
             JOIN Barbershop bs ON bs.id = s.barbershopId
             ORDER BY bk.date DESC LIMIT 200'
        );
    } else {
        $rows = DB::fetchAll(
            'SELECT bk.*, u.name AS userName, u.email AS userEmail,
                    s.name AS serviceName, s.price,
                    bs.id AS barbershopId, bs.name AS barbershopName
             FROM Booking bk
             JOIN User u ON u.id = bk.userId
             JOIN BarbershopService s ON s.id = bk.serviceId
             JOIN Barbershop bs ON bs.id = s.barbershopId
             WHERE bs.id = ?
             ORDER BY bk.date DESC LIMIT 200',
            [$ctx['barbershopId']]
        );
    }
    foreach ($rows as &$r) $r['price'] = (float)$r['price'];
    json_response($rows);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) json_error('id é obrigatório', 400);

    $bk = DB::fetchOne(
        'SELECT bk.*, s.barbershopId FROM Booking bk JOIN BarbershopService s ON s.id = bk.serviceId WHERE bk.id = ?',
        [$id]
    );
    if (!$bk) json_error('Agendamento não encontrado', 404);
    if ($ctx['role'] === 'ADMIN' && $bk['barbershopId'] !== $ctx['barbershopId']) json_error('Acesso negado', 403);

    DB::delete('Booking', ['id' => $id]);
    json_response(['ok' => true]);
}

json_error('Method not allowed', 405);
