<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/ValidationHelper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
  ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

$data = json_decode(file_get_contents("php://input"), true);

$required = ['name', 'email', 'message'];
$errors = ValidationHelper::validateRequired($data, $required);
if ($errors !== true) {
  ResponseHelper::validationError($errors);
}

if (!ValidationHelper::validateEmail($data['email'])) {
  ResponseHelper::validationError(['email' => 'Invalid email format']);
}

// In production, you'd send an email here
// For now, just return success

ResponseHelper::success(null, 'Message sent successfully');
