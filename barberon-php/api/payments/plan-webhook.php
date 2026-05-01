<?php
/**
 * POST /api/payments/plan-webhook.php
 * Mercado Pago webhook — notified when a plan payment changes status.
 * MP sends: { action, api_version, data: { id }, type }
 */
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';

header('Content-Type: application/json; charset=utf-8');

// Get raw body
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true) ?? [];

// MP may also send payment_id as query param
$mpPaymentId = $data['data']['id'] ?? $_GET['data_id'] ?? $_GET['id'] ?? null;
$type        = $data['type'] ?? $_GET['type'] ?? null;

// Only handle payment notifications
if ($type !== 'payment' || !$mpPaymentId) {
    http_response_code(200);
    echo json_encode(['ok' => true]);
    exit;
}

// Get platform MP credentials
$settings = DB::fetchOne('SELECT mpAccessToken FROM AppSettings WHERE id = "singleton"');
$mpAccessToken = $settings['mpAccessToken'] ?? null;
if (!$mpAccessToken) {
    http_response_code(503);
    echo json_encode(['error' => 'MP not configured']);
    exit;
}

// Fetch payment from MP API
$ch = curl_init('https://api.mercadopago.com/v1/payments/' . $mpPaymentId);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $mpAccessToken],
    CURLOPT_TIMEOUT        => 10,
]);
$mpResponse = curl_exec($ch);
$httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code(200); // Always 200 to MP
    echo json_encode(['ok' => true, 'note' => 'payment not found in MP']);
    exit;
}

$payment      = json_decode($mpResponse, true);
$mpStatus     = $payment['status'] ?? 'unknown';           // approved | rejected | pending | cancelled
$externalRef  = $payment['external_reference'] ?? null;    // our PlanPayment.id

if (!$externalRef) {
    http_response_code(200);
    echo json_encode(['ok' => true, 'note' => 'no external_reference']);
    exit;
}

// Map MP status → our status
$statusMap = [
    'approved'    => 'approved',
    'rejected'    => 'rejected',
    'cancelled'   => 'cancelled',
    'refunded'    => 'cancelled',
    'charged_back'=> 'cancelled',
    'pending'     => 'pending',
    'in_process'  => 'pending',
    'in_mediation'=> 'pending',
    'authorized'  => 'pending',
];
$ourStatus = $statusMap[$mpStatus] ?? 'pending';
$now       = date('Y-m-d H:i:s');
$paidAt    = ($ourStatus === 'approved') ? $now : null;

// Update PlanPayment
$planPayment = DB::fetchOne('SELECT * FROM PlanPayment WHERE id = ?', [$externalRef]);
if (!$planPayment) {
    http_response_code(200);
    echo json_encode(['ok' => true, 'note' => 'PlanPayment not found']);
    exit;
}

DB::query(
    'UPDATE PlanPayment SET status = ?, mpPaymentId = ?, paidAt = ?, updatedAt = ? WHERE id = ?',
    [$ourStatus, (string)$mpPaymentId, $paidAt, $now, $externalRef]
);

// On approval: activate BarbershopPlan + activate Barbershop
if ($ourStatus === 'approved') {
    $planSubId    = $planPayment['barbershopPlanId'];
    $barbershopId = $planPayment['barbershopId'];
    $planId       = $planPayment['planId'];

    // Recalculate endDate from now based on plan period
    $plan = DB::fetchOne('SELECT period FROM Plan WHERE id = ?', [$planId]);
    $endDate = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
    switch ($plan['period'] ?? 'monthly') {
        case 'monthly':   $endDate->modify('+1 month');  break;
        case 'quarterly': $endDate->modify('+3 months'); break;
        case 'yearly':    $endDate->modify('+1 year');   break;
    }
    $endStr = $endDate->format('Y-m-d H:i:s');

    // Activate subscription
    DB::query(
        'UPDATE BarbershopPlan SET status = "active", startDate = ?, endDate = ?, updatedAt = ? WHERE id = ?',
        [$now, $endStr, $now, $planSubId]
    );

    // Activate barbershop
    DB::query(
        'UPDATE Barbershop SET active = 1, updatedAt = ? WHERE id = ?',
        [$now, $barbershopId]
    );
}

// On rejection/cancellation: cancel subscription
if (in_array($ourStatus, ['rejected', 'cancelled'])) {
    $planSubId = $planPayment['barbershopPlanId'];
    DB::query(
        'UPDATE BarbershopPlan SET status = "cancelled", updatedAt = ? WHERE id = ?',
        [$now, $planSubId]
    );
}

http_response_code(200);
echo json_encode(['ok' => true, 'status' => $ourStatus]);
