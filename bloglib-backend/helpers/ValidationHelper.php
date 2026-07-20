<?php
class ValidationHelper
{

  public static function validateEmail($email)
  {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
  }

  public static function validatePassword($password)
  {
    return strlen($password) >= 6;
  }

  public static function validatePhone($phone)
  {
    return preg_match('/^[0-9+\-\s()]+$/', $phone);
  }

  public static function sanitizeInput($data)
  {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
  }

  public static function sanitizeArray($array)
  {
    return array_map([self::class, 'sanitizeInput'], $array);
  }

  public static function validateRequired($data, $fields)
  {
    $errors = [];
    foreach ($fields as $field) {
      if (!isset($data[$field]) || empty(trim($data[$field]))) {
        $errors[$field] = ucfirst($field) . ' is required';
      }
    }
    return empty($errors) ? true : $errors;
  }

  public static function validateString($value, $min = 1, $max = null)
  {
    $length = strlen($value);
    if ($length < $min) return false;
    if ($max && $length > $max) return false;
    return true;
  }

  public static function validateNumber($value, $min = null, $max = null)
  {
    if (!is_numeric($value)) return false;
    if ($min !== null && $value < $min) return false;
    if ($max !== null && $value > $max) return false;
    return true;
  }
}
