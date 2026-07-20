<?php
require_once __DIR__ . '/../config/config.php';

class JWT
{

  private static function base64UrlEncode($data)
  {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }

  private static function base64UrlDecode($data)
  {
    return base64_decode(strtr($data, '-_', '+/'));
  }

  public static function generate($payload, $expiry = null)
  {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = $expiry ? time() + $expiry : time() + JWT_EXPIRY;

    $base64UrlHeader = self::base64UrlEncode($header);
    $base64UrlPayload = self::base64UrlEncode(json_encode($payload));

    $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = self::base64UrlEncode($signature);

    return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
  }

  public static function verify($token)
  {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
      return false;
    }

    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;

    $signature = self::base64UrlDecode($base64UrlSignature);
    $expectedSignature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, JWT_SECRET, true);

    if (!hash_equals($signature, $expectedSignature)) {
      return false;
    }

    $payload = json_decode(self::base64UrlDecode($base64UrlPayload), true);

    if ($payload['exp'] < time()) {
      return false;
    }

    return $payload;
  }

  public static function getUserIdFromToken()
  {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    if (empty($authHeader)) {
      return null;
    }

    $token = str_replace('Bearer ', '', $authHeader);
    $payload = self::verify($token);

    return $payload ? $payload['user_id'] : null;
  }
}
