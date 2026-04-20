<?php
/**
 * GET  /api/admin/hours.php?barbershopId=xxx  — get hours
 * PUT  /api/admin/hours.php                   — upsert hours (body: {barbershopId, hours[]})
 */
require_once __DIR__ . '/../../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();

if ($method === 'GET') {
    $barbershopId = $_GET['barbershopId'] ?? $ctx['barbershopId'];
    if (!$barbershopId) json_error('barbershopId obrigatório', 400);
    if ($ctx['role'] !== 'SUPERADMIN' && $barbershopId !== $ctx['barbershopId']) {
        json_error('Sem permissão', 403);
    }
    $hours = DB::fetchAll(
        'SELECT * FROM BarbershopHours WHERE barbershopId = ? ORDER BY dayOfWeek',
        [$barbershopId]
    );
    foreach ($hours as &$h) $h['slotMinutes'] = (int) $h['slotMinutes'];
    json_response($hours);
}

if ($method === 'PUT') {
    $body         = request_body();
    $barbershopId = $body['barbershopId'] ?? $ctx['barbershopId'];
    $hoursInput   = $body['hours']        ?? [];

    if (!$barbershopId) json_error('barbershopId obrigatório', 400);
    if ($ctx['role'] !== 'SUPERADMIN' && $barbershopId !== $ctx['barbershopId']) {
        json_error('Sem permissão', 403);
    }

    $updated = 0;
    foreach ($hoursInput as $h) {
        $day = (int) $h['dayOfWeek'];
        if (!($h['enabled'] ?? true)) {
            DB::query(
                'DELETE FROM BarbershopHours WHERE barbershopId = ? AND dayOfWeek = ?',
                [$barbershopId, $day]
            );
            continue;
        }
        // Upsert via REPLACE or INSERT … ON DUPLICATE KEY UPDATE
        DB::query(
            'INSERT INTO BarbershopHours (id, barbershopId, dayOfWeek, openTime, closeTime, slotMinutes)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE openTime = VALUES(openTime), closeTime = VALUES(closeTime), slotMinutes = VALUES(slotMinutes)',
            [DB::cuid(), $barbershopId, $day, $h['openTime'], $h['closeTime'], (int)($h['slotMinutes'] ?? 30)]
        );
        $updated++;
    }
    json_response(['ok' => true, 'updated' => $updated]);
}

json_error('Method not allowed', 405);
