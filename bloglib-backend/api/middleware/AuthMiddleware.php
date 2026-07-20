<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../helpers/JWT.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';

class AuthMiddleware
{

  public static function authenticate()
  {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    if (empty($authHeader)) {
      ResponseHelper::unauthorized('No token provided');
    }

    $token = str_replace('Bearer ', '', $authHeader);
    $payload = JWT::verify($token);

    if (!$payload) {
      ResponseHelper::unauthorized('Invalid or expired token');
    }

    return $payload;
  }

  public static function getAuthenticatedUser()
  {
    $payload = self::authenticate();
    require_once __DIR__ . '/../../models/User.php';

    $user = new User();
    if ($user->findById($payload['user_id'])) {
      return $user;
    }

    ResponseHelper::unauthorized('User not found');
    return null;
  }
}
