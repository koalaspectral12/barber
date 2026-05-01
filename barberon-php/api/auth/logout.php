<?php
require_once __DIR__ . '/../../includes/auth.php';
cors_headers();
header('Content-Type: application/json; charset=utf-8');
sign_out();
json_response(['ok' => true]);
