<?php
class Sanitizer
{

  public static function sanitizeString($input)
  {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
  }

  public static function sanitizeEmail($email)
  {
    return filter_var(trim($email), FILTER_SANITIZE_EMAIL);
  }

  public static function sanitizeInt($input)
  {
    return filter_var($input, FILTER_VALIDATE_INT);
  }

  public static function sanitizeFloat($input)
  {
    return filter_var($input, FILTER_VALIDATE_FLOAT);
  }

  public static function sanitizeUrl($url)
  {
    return filter_var($url, FILTER_SANITIZE_URL);
  }

  public static function sanitizeSlug($slug)
  {
    $slug = strtolower(trim($slug));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    return trim($slug, '-');
  }
}
