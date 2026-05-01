<?php
/**
 * GET  /api/admin/stats.php — dashboard statistics
 */
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$isSuperAdmin = $ctx['role'] === 'SUPERADMIN';
$shopId       = $ctx['barbershopId'];

try {
    if ($isSuperAdmin) {
        $totalBarbershops = (int) DB::fetchOne('SELECT COUNT(*) AS c FROM Barbershop')['c'];
        $totalServices    = (int) DB::fetchOne('SELECT COUNT(*) AS c FROM BarbershopService')['c'];
        $totalBookings    = (int) DB::fetchOne('SELECT COUNT(*) AS c FROM Booking')['c'];
        $totalBarbers     = (int) DB::fetchOne('SELECT COUNT(*) AS c FROM User WHERE role = ?', ['BARBER'])['c'];
        $totalAdmins      = (int) DB::fetchOne('SELECT COUNT(*) AS c FROM User WHERE role = ?', ['ADMIN'])['c'];
        $upcomingBookings = (int) DB::fetchOne("SELECT COUNT(*) AS c FROM Booking WHERE date >= NOW()")['c'];

        $recentBookings = DB::fetchAll(
            'SELECT bk.id, bk.date, bk.paymentStatus,
                    u.name AS userName, u.email AS userEmail, u.image AS userImage,
                    s.name AS serviceName, bs.name AS barbershopName
             FROM Booking bk
             JOIN User u ON u.id = bk.userId
             JOIN BarbershopService s ON s.id = bk.serviceId
             JOIN Barbershop bs ON bs.id = s.barbershopId
             ORDER BY bk.createdAt DESC LIMIT 5'
        );
    } else {
        $totalBarbershops = 1;
        $totalServices    = (int) DB::fetchOne(
            'SELECT COUNT(*) AS c FROM BarbershopService WHERE barbershopId = ?', [$shopId])['c'];
        $totalBookings    = (int) DB::fetchOne(
            'SELECT COUNT(*) AS c FROM Booking bk JOIN BarbershopService s ON s.id = bk.serviceId WHERE s.barbershopId = ?', [$shopId])['c'];
        $totalBarbers     = (int) DB::fetchOne(
            'SELECT COUNT(*) AS c FROM Barber WHERE barbershopId = ?', [$shopId])['c'];
        $totalAdmins      = 0;
        $upcomingBookings = (int) DB::fetchOne(
            'SELECT COUNT(*) AS c FROM Booking bk JOIN BarbershopService s ON s.id = bk.serviceId WHERE s.barbershopId = ? AND bk.date >= NOW()', [$shopId])['c'];

        $recentBookings = DB::fetchAll(
            'SELECT bk.id, bk.date, bk.paymentStatus,
                    u.name AS userName, u.email AS userEmail, u.image AS userImage,
                    s.name AS serviceName, bs.name AS barbershopName
             FROM Booking bk
             JOIN User u ON u.id = bk.userId
             JOIN BarbershopService s ON s.id = bk.serviceId
             JOIN Barbershop bs ON bs.id = s.barbershopId
             WHERE s.barbershopId = ?
             ORDER BY bk.createdAt DESC LIMIT 5',
            [$shopId]
        );
    }
    $totalUsers = (int) DB::fetchOne('SELECT COUNT(*) AS c FROM User WHERE role = ?', ['CUSTOMER'])['c'];

    json_response([
        'totalBarbershops' => $totalBarbershops,
        'totalServices'    => $totalServices,
        'totalBookings'    => $totalBookings,
        'totalUsers'       => $totalUsers,
        'totalBarbers'     => $totalBarbers,
        'totalAdmins'      => $totalAdmins,
        'upcomingBookings' => $upcomingBookings,
        'recentBookings'   => $recentBookings,
        'isSuperAdmin'     => $isSuperAdmin,
    ]);
} catch (\Throwable $e) {
    json_error('Erro ao buscar estatísticas: ' . $e->getMessage(), 500);
}
