<?php
/**
 * /api/admin/plans.php
 * SUPERADMIN: full CRUD on Plan table
 * ADMIN:      GET only (view available plans + own subscription)
 */
require_once __DIR__ . '/../../includes/auth.php';

header('Content-Type: application/json; charset=utf-8');

$ctx = get_admin_context();
if (!$ctx) json_error('Não autorizado', 401);

$method = request_method();

// ── GET ──────────────────────────────────────────────────────
if ($method === 'GET') {
    // ?subscription=1  →  return this barbershop's active plan
    if (!empty($_GET['subscription'])) {
        $barbershopId = $_GET['barbershopId'] ?? $ctx['barbershopId'];
        if (!$barbershopId && $ctx['role'] !== 'SUPERADMIN') json_error('barbershopId obrigatório', 400);

        $sub = DB::fetchOne(
            'SELECT bp.*, p.name AS planName, p.period, p.price, p.features, p.customPage, p.exclusiveApp
               FROM BarbershopPlan bp
               JOIN Plan p ON p.id = bp.planId
              WHERE bp.barbershopId = ?
              ORDER BY bp.createdAt DESC LIMIT 1',
            [$barbershopId]
        );
        json_response($sub ?: null);
    }

    // ?barbershop_plans=1  →  all subscriptions (superadmin)
    if (!empty($_GET['barbershop_plans'])) {
        if ($ctx['role'] !== 'SUPERADMIN') json_error('Acesso negado', 403);
        $rows = DB::fetchAll(
            'SELECT bp.*, p.name AS planName, p.period, p.price, b.name AS shopName
               FROM BarbershopPlan bp
               JOIN Plan p ON p.id = bp.planId
               JOIN Barbershop b ON b.id = bp.barbershopId
              ORDER BY bp.createdAt DESC'
        );
        json_response($rows);
    }

    // Default: list all active plans
    $plans = DB::fetchAll('SELECT * FROM Plan WHERE active = 1 ORDER BY price ASC');
    foreach ($plans as &$p) {
        $p['features']    = json_decode($p['features'] ?? '[]', true);
        $p['customPage']  = (bool)$p['customPage'];
        $p['exclusiveApp']= (bool)$p['exclusiveApp'];
        $p['price']       = (float)$p['price'];
    }
    json_response($plans);
}

// ── POST — create plan OR manual activate (superadmin only) ──
if ($method === 'POST') {
    if ($ctx['role'] !== 'SUPERADMIN') json_error('Acesso negado', 403);
    $body = request_body();
    $action = $_GET['action'] ?? null;

    // Manual plan activation (superadmin grants plan without payment)
    if ($action === 'manual_activate') {
        $barbershopId = $body['barbershopId'] ?? null;
        $planId       = $body['planId']       ?? null;
        if (!$barbershopId || !$planId) json_error('barbershopId e planId obrigatórios', 400);

        $plan = DB::fetchOne('SELECT * FROM Plan WHERE id = ? AND active = 1', [$planId]);
        if (!$plan) json_error('Plano não encontrado', 404);

        $now     = date('Y-m-d H:i:s');
        $endDate = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
        switch ($plan['period']) {
            case 'monthly':   $endDate->modify('+1 month');  break;
            case 'quarterly': $endDate->modify('+3 months'); break;
            case 'yearly':    $endDate->modify('+1 year');   break;
        }
        $endStr = $endDate->format('Y-m-d H:i:s');

        // Cancel any existing active plan
        DB::query(
            'UPDATE BarbershopPlan SET status = "cancelled", updatedAt = ? WHERE barbershopId = ? AND status = "active"',
            [$now, $barbershopId]
        );

        $subId = DB::cuid();
        DB::query(
            'INSERT INTO BarbershopPlan (id, barbershopId, planId, status, startDate, endDate, autoRenew, createdAt, updatedAt)
             VALUES (?, ?, ?, "active", ?, ?, 0, ?, ?)',
            [$subId, $barbershopId, $planId, $now, $endStr, $now, $now]
        );

        // Activate barbershop
        DB::query('UPDATE Barbershop SET active = 1, updatedAt = ? WHERE id = ?', [$now, $barbershopId]);

        json_response(['ok' => true, 'id' => $subId]);
    }

    $name        = trim($body['name']        ?? '');
    $period      = $body['period']      ?? 'monthly';
    $price       = (float)($body['price'] ?? 0);
    $description = trim($body['description'] ?? '');
    $features    = $body['features']    ?? [];
    $maxServices = (int)($body['maxServices'] ?? 20);
    $customPage  = (int)(bool)($body['customPage']   ?? false);
    $exclusiveApp= (int)(bool)($body['exclusiveApp'] ?? false);

    if (!$name) json_error('Nome obrigatório', 400);
    if (!in_array($period, ['monthly','quarterly','yearly'])) json_error('Período inválido', 400);
    if ($price <= 0) json_error('Preço inválido', 400);

    $id  = DB::cuid();
    $now = date('Y-m-d H:i:s');
    DB::query(
        'INSERT INTO Plan (id, name, period, price, description, features, maxServices, customPage, exclusiveApp, active, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)',
        [$id, $name, $period, $price, $description, json_encode($features), $maxServices, $customPage, $exclusiveApp, $now, $now]
    );
    $plan = DB::fetchOne('SELECT * FROM Plan WHERE id = ?', [$id]);
    $plan['features']    = json_decode($plan['features'], true);
    $plan['customPage']  = (bool)$plan['customPage'];
    $plan['exclusiveApp']= (bool)$plan['exclusiveApp'];
    $plan['price']       = (float)$plan['price'];
    json_response($plan, 201);
}

// ── PUT — update plan (superadmin only) ──────────────────────
if ($method === 'PUT') {
    if ($ctx['role'] !== 'SUPERADMIN') json_error('Acesso negado', 403);
    $id   = $_GET['id'] ?? null;
    $body = request_body();

    if (!$id) json_error('id obrigatório', 400);
    $existing = DB::fetchOne('SELECT id FROM Plan WHERE id = ?', [$id]);
    if (!$existing) json_error('Plano não encontrado', 404);

    $fields = [];
    $params = [];
    if (isset($body['name']))        { $fields[] = 'name = ?';         $params[] = trim($body['name']); }
    if (isset($body['period']))      { $fields[] = 'period = ?';       $params[] = $body['period']; }
    if (isset($body['price']))       { $fields[] = 'price = ?';        $params[] = (float)$body['price']; }
    if (isset($body['description'])) { $fields[] = 'description = ?';  $params[] = $body['description']; }
    if (isset($body['features']))    { $fields[] = 'features = ?';     $params[] = json_encode($body['features']); }
    if (isset($body['maxServices'])) { $fields[] = 'maxServices = ?';  $params[] = (int)$body['maxServices']; }
    if (isset($body['customPage']))  { $fields[] = 'customPage = ?';   $params[] = (int)(bool)$body['customPage']; }
    if (isset($body['exclusiveApp'])){ $fields[] = 'exclusiveApp = ?'; $params[] = (int)(bool)$body['exclusiveApp']; }
    if (isset($body['active']))      { $fields[] = 'active = ?';       $params[] = (int)(bool)$body['active']; }

    if ($fields) {
        $params[] = $id;
        DB::query('UPDATE Plan SET ' . implode(', ', $fields) . ' WHERE id = ?', $params);
    }

    $plan = DB::fetchOne('SELECT * FROM Plan WHERE id = ?', [$id]);
    $plan['features']    = json_decode($plan['features'], true);
    $plan['customPage']  = (bool)$plan['customPage'];
    $plan['exclusiveApp']= (bool)$plan['exclusiveApp'];
    $plan['price']       = (float)$plan['price'];
    json_response($plan);
}

// ── DELETE — cancel subscription OR deactivate plan ──────────
if ($method === 'DELETE') {
    if ($ctx['role'] !== 'SUPERADMIN') json_error('Acesso negado', 403);
    $action = $_GET['action'] ?? null;

    // Cancel a barbershop subscription
    if ($action === 'cancel') {
        $subId = $_GET['id'] ?? null;
        if (!$subId) json_error('id obrigatório', 400);
        $sub = DB::fetchOne('SELECT id, barbershopId FROM BarbershopPlan WHERE id = ?', [$subId]);
        if (!$sub) json_error('Assinatura não encontrada', 404);
        $now = date('Y-m-d H:i:s');
        DB::query('UPDATE BarbershopPlan SET status = "cancelled", updatedAt = ? WHERE id = ?', [$now, $subId]);
        DB::query('UPDATE Barbershop SET active = 0, updatedAt = ? WHERE id = ?', [$now, $sub['barbershopId']]);
        json_response(['ok' => true]);
    }

    // Deactivate a plan definition
    $id = $_GET['id'] ?? null;
    if (!$id) json_error('id obrigatório', 400);
    DB::query('UPDATE Plan SET active = 0 WHERE id = ?', [$id]);
    json_response(['ok' => true]);
}

// ── POST (extra actions) — manual activate ───────────────────
// Called from admin UI as POST /api/admin/plans.php?action=manual_activate
// This is handled separately since POST already does plan creation.
// We check for ?action= param BEFORE the plan-creation flow.

json_error('Method not allowed', 405);
