<?php
/**
 * POST /api/payments/plan-checkout.php
 * Creates a Mercado Pago preference for a barbershop plan subscription.
 * Body: { planId, barbershopId }
 * Returns: { checkoutUrl, preferenceId, planPaymentId }
 */
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();

header('Content-Type: application/json; charset=utf-8');

$method = request_method();
if ($method !== 'POST') json_error('Method not allowed', 405);

// Must be logged-in admin or superadmin
$user = current_user();
if (!$user || !in_array($user['role'], ['ADMIN', 'SUPERADMIN'])) {
    json_error('Não autorizado', 401);
}

$body         = request_body();
$planId       = $body['planId']       ?? null;
$barbershopId = $body['barbershopId'] ?? null;

if (!$planId || !$barbershopId) json_error('planId e barbershopId obrigatórios', 400);

// Validate plan
$plan = DB::fetchOne('SELECT * FROM Plan WHERE id = ? AND active = 1', [$planId]);
if (!$plan) json_error('Plano não encontrado', 404);
$plan['features'] = json_decode($plan['features'] ?? '[]', true);

// Validate barbershop
$shop = DB::fetchOne('SELECT id, name FROM Barbershop WHERE id = ?', [$barbershopId]);
if (!$shop) json_error('Barbearia não encontrada', 404);

// Get platform MP credentials from AppSettings
$settings = DB::fetchOne('SELECT mpAccessToken, mpPublicKey FROM AppSettings WHERE id = "singleton"');
$mpAccessToken = $settings['mpAccessToken'] ?? null;
if (!$mpAccessToken) json_error('Pagamento via Mercado Pago não configurado pelo administrador da plataforma.', 503);

// Period descriptions
$periodMap = ['monthly' => '1 mês', 'quarterly' => '3 meses', 'yearly' => '1 ano'];
$periodLabel = $periodMap[$plan['period']] ?? $plan['period'];

// Calculate end date
$now    = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
$endDate = clone $now;
switch ($plan['period']) {
    case 'monthly':   $endDate->modify('+1 month');  break;
    case 'quarterly': $endDate->modify('+3 months'); break;
    case 'yearly':    $endDate->modify('+1 year');   break;
}

// Create BarbershopPlan record (pending)
$planSubId = DB::cuid();
$nowStr    = $now->format('Y-m-d H:i:s');
$endStr    = $endDate->format('Y-m-d H:i:s');

// Check for existing pending/active plan
$existing = DB::fetchOne(
    'SELECT id, status FROM BarbershopPlan WHERE barbershopId = ? AND status IN ("active","pending") ORDER BY createdAt DESC LIMIT 1',
    [$barbershopId]
);

if ($existing && $existing['status'] === 'active') {
    json_error('Esta barbearia já possui um plano ativo. Aguarde o vencimento para renovar.', 409);
}

// Use existing pending or create new
if ($existing && $existing['status'] === 'pending') {
    $planSubId = $existing['id'];
} else {
    DB::query(
        'INSERT INTO BarbershopPlan (id, barbershopId, planId, status, startDate, endDate, autoRenew, createdAt, updatedAt)
         VALUES (?, ?, ?, "pending", ?, ?, 0, ?, ?)',
        [$planSubId, $barbershopId, $planId, $nowStr, $endStr, $nowStr, $nowStr]
    );
}

// Create PlanPayment record
$paymentId = DB::cuid();
DB::query(
    'INSERT INTO PlanPayment (id, barbershopPlanId, barbershopId, planId, amount, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, "pending", ?, ?)',
    [$paymentId, $planSubId, $barbershopId, $planId, (float)$plan['price'], $nowStr, $nowStr]
);

// Build Mercado Pago preference
$base        = BASE_URL;
$scheme      = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host        = $_SERVER['HTTP_HOST'] ?? 'localhost';
$siteUrl     = $scheme . '://' . $host . $base;

$preferenceData = [
    'items' => [[
        'id'          => $planId,
        'title'       => 'Barberon — Plano ' . $plan['name'] . ' (' . $periodLabel . ')',
        'description' => 'Assinatura ' . $plan['name'] . ' para ' . $shop['name'],
        'quantity'    => 1,
        'unit_price'  => (float)$plan['price'],
        'currency_id' => 'BRL',
    ]],
    'external_reference' => $paymentId,
    'notification_url'   => $siteUrl . '/api/payments/plan-webhook.php',
    'back_urls' => [
        'success' => $siteUrl . '/admin/?page=plan&status=success',
        'failure' => $siteUrl . '/admin/?page=plan&status=failure',
        'pending' => $siteUrl . '/admin/?page=plan&status=pending',
    ],
    'auto_return'        => 'approved',
    'payment_methods'    => ['excluded_payment_types' => []],
    'statement_descriptor' => 'BARBERON',
    'metadata' => [
        'planPaymentId'  => $paymentId,
        'barbershopPlanId' => $planSubId,
        'barbershopId'   => $barbershopId,
        'planId'         => $planId,
    ],
];

// Call MP API
$ch = curl_init('https://api.mercadopago.com/checkout/preferences');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($preferenceData),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $mpAccessToken,
    ],
    CURLOPT_TIMEOUT        => 15,
]);
$mpResponse = curl_exec($ch);
$httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 201) {
    $err = json_decode($mpResponse, true);
    json_error('Erro ao criar preferência MP: ' . ($err['message'] ?? $mpResponse), 502);
}

$mpData      = json_decode($mpResponse, true);
$preferenceId = $mpData['id']      ?? null;
$checkoutUrl  = $mpData['init_point'] ?? null;
$sandboxUrl   = $mpData['sandbox_init_point'] ?? $checkoutUrl;

// Save preference info to PlanPayment
DB::query(
    'UPDATE PlanPayment SET mpPreferenceId = ?, checkoutUrl = ?, updatedAt = ? WHERE id = ?',
    [$preferenceId, $checkoutUrl, $nowStr, $paymentId]
);

json_response([
    'checkoutUrl'    => $checkoutUrl,
    'sandboxUrl'     => $sandboxUrl,
    'preferenceId'   => $preferenceId,
    'planPaymentId'  => $paymentId,
    'barbershopPlanId' => $planSubId,
]);
