<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/ValidationHelper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
  ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email'])) {
  ResponseHelper::validationError(['email' => 'Email is required']);
}

if (!ValidationHelper::validateEmail($data['email'])) {
  ResponseHelper::validationError(['email' => 'Invalid email format']);
}

// In production, you'd save to a newsletter_subscribers table
// For now, just return success

ResponseHelper::success(null, 'Subscribed successfully');
