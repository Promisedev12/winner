<?php
class RateLimitMiddleware
{

  public static function check($key, $limit = RATE_LIMIT_REQUESTS, $window = RATE_LIMIT_WINDOW)
  {
    $ip = $_SERVER['REMOTE_ADDR'];
    $identifier = $ip . '_' . $key;

    $file = __DIR__ . '/../../logs/ratelimit_' . $identifier . '.json';
    $currentTime = time();

    $requests = [];
    if (file_exists($file)) {
      $data = json_decode(file_get_contents($file), true);
      $requests = array_filter($data, function ($timestamp) use ($currentTime, $window) {
        return $timestamp > $currentTime - $window;
      });
    }

    if (count($requests) >= $limit) {
      ResponseHelper::error('Rate limit exceeded. Please try again later.', 429);
      return false;
    }

    $requests[] = $currentTime;
    file_put_contents($file, json_encode($requests));

    return true;
  }
}
