<?php
/**
 * /api/admin/page-builder.php
 * GET    ?barbershopId=xxx  — load page config
 * PUT                       — save page config
 * Requires ADMIN or SUPERADMIN. ADMIN can only manage their own barbershop.
 */
require_once __DIR__ . '/../../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();

// ── GET ──────────────────────────────────────────────────────
if ($method === 'GET') {
    $barbershopId = $_GET['barbershopId'] ?? $ctx['barbershopId'];
    if (!$barbershopId) json_error('barbershopId obrigatório', 400);
    if ($ctx['role'] !== 'SUPERADMIN' && $barbershopId !== $ctx['barbershopId']) json_error('Acesso negado', 403);

    $cfg = DB::fetchOne('SELECT * FROM BarberPageConfig WHERE barbershopId = ?', [$barbershopId]);
    if ($cfg) {
        $cfg['carouselImages'] = json_decode($cfg['carouselImages'] ?? '[]', true);
        $cfg['modules']        = json_decode($cfg['modules']        ?? '[]', true);
        $cfg['appMode']        = (bool)$cfg['appMode'];
    } else {
        // Return defaults
        $cfg = [
            'barbershopId'  => $barbershopId,
            'primaryColor'  => '#f59e0b',
            'accentColor'   => '#1a1a1a',
            'bgColor'       => '#0f0f0f',
            'fontFamily'    => 'Inter',
            'heroTitle'     => null,
            'heroSubtitle'  => null,
            'heroImageUrl'  => null,
            'carouselImages'=> [],
            'modules'       => ['hero','services','hours','location','gallery'],
            'customCss'     => null,
            'whatsappNumber'=> null,
            'instagramUrl'  => null,
            'appMode'       => false,
            'appName'       => null,
            'appLogoUrl'    => null,
            'appIconUrl'    => null,
        ];
    }

    // Include plan info so frontend knows what's allowed
    $plan = DB::fetchOne(
        'SELECT p.customPage, p.exclusiveApp
           FROM BarbershopPlan bp
           JOIN Plan p ON p.id = bp.planId
          WHERE bp.barbershopId = ? AND bp.status = "active"
          ORDER BY bp.createdAt DESC LIMIT 1',
        [$barbershopId]
    );
    $cfg['_planAllowsCustomPage']   = $ctx['role'] === 'SUPERADMIN' || (bool)($plan['customPage'] ?? false);
    $cfg['_planAllowsExclusiveApp'] = $ctx['role'] === 'SUPERADMIN' || (bool)($plan['exclusiveApp'] ?? false);

    json_response($cfg);
}

// ── PUT — save page config ────────────────────────────────────
if ($method === 'PUT') {
    $body         = request_body();
    $barbershopId = $body['barbershopId'] ?? $ctx['barbershopId'];
    if (!$barbershopId) json_error('barbershopId obrigatório', 400);
    if ($ctx['role'] !== 'SUPERADMIN' && $barbershopId !== $ctx['barbershopId']) json_error('Acesso negado', 403);

    // Check plan allows customPage (superadmin bypasses)
    if ($ctx['role'] !== 'SUPERADMIN') {
        $plan = DB::fetchOne(
            'SELECT p.customPage, p.exclusiveApp
               FROM BarbershopPlan bp
               JOIN Plan p ON p.id = bp.planId
              WHERE bp.barbershopId = ? AND bp.status = "active"
              ORDER BY bp.createdAt DESC LIMIT 1',
            [$barbershopId]
        );
        if (!$plan || !$plan['customPage']) {
            json_error('Seu plano não inclui personalização de página. Faça upgrade para Trimestral ou Anual.', 403);
        }
        // Block exclusive app for non-yearly plans
        if (!empty($body['appMode']) && $body['appMode'] && !$plan['exclusiveApp']) {
            json_error('Modo App Exclusivo disponível apenas no plano Anual.', 403);
        }
    }

    $now     = date('Y-m-d H:i:s');
    $existing = DB::fetchOne('SELECT id FROM BarberPageConfig WHERE barbershopId = ?', [$barbershopId]);

    $fields = [
        'primaryColor'   => $body['primaryColor']   ?? '#f59e0b',
        'accentColor'    => $body['accentColor']    ?? '#1a1a1a',
        'bgColor'        => $body['bgColor']        ?? '#0f0f0f',
        'fontFamily'     => $body['fontFamily']     ?? 'Inter',
        'heroTitle'      => $body['heroTitle']      ?? null,
        'heroSubtitle'   => $body['heroSubtitle']   ?? null,
        'heroImageUrl'   => $body['heroImageUrl']   ?? null,
        'carouselImages' => json_encode($body['carouselImages'] ?? []),
        'modules'        => json_encode($body['modules']        ?? ['hero','services','hours','location']),
        'customCss'      => $body['customCss']      ?? null,
        'whatsappNumber' => $body['whatsappNumber'] ?? null,
        'instagramUrl'   => $body['instagramUrl']   ?? null,
        'appMode'        => (int)(bool)($body['appMode']   ?? false),
        'appName'        => $body['appName']        ?? null,
        'appLogoUrl'     => $body['appLogoUrl']     ?? null,
        'appIconUrl'     => $body['appIconUrl']     ?? null,
    ];

    if ($existing) {
        $sets   = implode(', ', array_map(fn($k) => "$k = ?", array_keys($fields)));
        $params = array_values($fields);
        $params[] = $barbershopId;
        DB::query("UPDATE BarberPageConfig SET $sets, updatedAt = '$now' WHERE barbershopId = ?", $params);
    } else {
        $id       = DB::cuid();
        $cols     = 'id, barbershopId, ' . implode(', ', array_keys($fields)) . ', createdAt, updatedAt';
        $placeholders = '?, ?, ' . implode(', ', array_fill(0, count($fields), '?')) . ', ?, ?';
        $params   = array_merge([$id, $barbershopId], array_values($fields), [$now, $now]);
        DB::query("INSERT INTO BarberPageConfig ($cols) VALUES ($placeholders)", $params);
    }

    $cfg = DB::fetchOne('SELECT * FROM BarberPageConfig WHERE barbershopId = ?', [$barbershopId]);
    $cfg['carouselImages'] = json_decode($cfg['carouselImages'], true);
    $cfg['modules']        = json_decode($cfg['modules'],        true);
    $cfg['appMode']        = (bool)$cfg['appMode'];
    json_response($cfg);
}

json_error('Method not allowed', 405);
