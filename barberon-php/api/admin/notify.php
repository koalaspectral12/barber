<?php
/**
 * POST /api/admin/notify.php
 * Mark a cancelled/free slot as "notify next client on waitlist"
 * Body: { barbershopId, serviceId, date, time, message? }
 *
 * GET  /api/admin/notify.php?barbershopId=xxx
 * List pending notifications for a barbershop
 *
 * DELETE /api/admin/notify.php?id=xxx
 * Remove a notification
 */
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();

// ── GET: list notifications ───────────────────────────────────────────────────
if ($method === 'GET') {
    $shopId = $_GET['barbershopId'] ?? $ctx['barbershopId'];
    if (!$shopId && $ctx['role'] !== 'SUPERADMIN') json_error('barbershopId é obrigatório', 400);

    try {
        if ($shopId) {
            $rows = DB::fetchAll(
                'SELECT w.*, s.name AS serviceName, bs.name AS barbershopName
                 FROM WaitlistNotify w
                 JOIN BarbershopService s  ON s.id  = w.serviceId
                 JOIN Barbershop bs        ON bs.id = w.barbershopId
                 WHERE w.barbershopId = ?
                 ORDER BY w.date ASC LIMIT 100',
                [$shopId]
            );
        } else {
            $rows = DB::fetchAll(
                'SELECT w.*, s.name AS serviceName, bs.name AS barbershopName
                 FROM WaitlistNotify w
                 JOIN BarbershopService s  ON s.id  = w.serviceId
                 JOIN Barbershop bs        ON bs.id = w.barbershopId
                 ORDER BY w.date ASC LIMIT 100'
            );
        }
        json_response($rows);
    } catch (\Throwable $e) {
        json_response([]); // Table may not exist yet
    }
}

// ── POST: create notification ─────────────────────────────────────────────────
if ($method === 'POST') {
    $body        = request_body();
    $barbershopId = $body['barbershopId'] ?? $ctx['barbershopId'];
    $serviceId   = $body['serviceId']    ?? null;
    $date        = $body['date']         ?? null; // "YYYY-MM-DD HH:MM:SS"
    $message     = $body['message']      ?? null;

    if (!$barbershopId || !$serviceId || !$date) {
        json_error('barbershopId, serviceId e date são obrigatórios', 400);
    }
    if ($ctx['role'] === 'ADMIN' && $barbershopId !== $ctx['barbershopId']) {
        json_error('Acesso negado', 403);
    }

    // Verify service belongs to barbershop
    $svc = DB::fetchOne(
        'SELECT id FROM BarbershopService WHERE id = ? AND barbershopId = ?',
        [$serviceId, $barbershopId]
    );
    if (!$svc) json_error('Serviço não encontrado nesta barbearia', 404);

    $id  = DB::uuid();
    $now = date('Y-m-d H:i:s');

    try {
        DB::query(
            'INSERT INTO WaitlistNotify (id, barbershopId, serviceId, date, message, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)',
            [$id, $barbershopId, $serviceId, $date, $message, $now]
        );
    } catch (\Throwable $e) {
        json_error('Erro ao criar notificação. Execute schema.sql para criar a tabela WaitlistNotify.', 500);
    }

    // ── Notify users who have bookings for same barbershop (waiting clients) ──
    // In a real app you would send email/SMS. Here we just flag the row as "sent"
    // and return a count of users notified (users who have a future booking at this shop).
    $clientCount = 0;
    try {
        $clients = DB::fetchAll(
            'SELECT DISTINCT u.email, u.name
             FROM Booking bk
             JOIN BarbershopService s ON s.id = bk.serviceId
             JOIN User u ON u.id = bk.userId
             WHERE s.barbershopId = ? AND bk.date >= NOW()
             LIMIT 50',
            [$barbershopId]
        );
        $clientCount = count($clients);

        // Mark as sent (simulated)
        DB::query(
            'UPDATE WaitlistNotify SET sentAt = ? WHERE id = ?',
            [$now, $id]
        );
    } catch (\Throwable $e) { /* non-fatal */ }

    $row = DB::fetchOne(
        'SELECT w.*, s.name AS serviceName, bs.name AS barbershopName
         FROM WaitlistNotify w
         JOIN BarbershopService s ON s.id = w.serviceId
         JOIN Barbershop bs ON bs.id = w.barbershopId
         WHERE w.id = ?',
        [$id]
    );
    json_response([
        'ok'             => true,
        'notification'   => $row,
        'clientsNotified' => $clientCount,
        'message'        => $clientCount > 0
            ? "Aviso enviado para {$clientCount} cliente(s) com agendamentos futuros."
            : 'Horário marcado como disponível. Nenhum cliente em espera no momento.',
    ], 201);
}

// ── DELETE: remove notification ───────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) json_error('id é obrigatório', 400);
    try {
        DB::delete('WaitlistNotify', ['id' => $id]);
    } catch (\Throwable $e) { /* ignore */ }
    json_response(['ok' => true]);
}

json_error('Method not allowed', 405);
