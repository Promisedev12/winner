<?php
// No need to define constants here - they come from config.php

class ResponseHelper
{

  public static function success($data = null, $message = 'Success', $code = 200)
  {
    http_response_code($code);
    echo json_encode([
      'success' => true,
      'message' => $message,
      'data' => $data,
      'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
  }

  public static function error($message = 'Error', $code = 400, $errors = null)
  {
    http_response_code($code);
    echo json_encode([
      'success' => false,
      'message' => $message,
      'errors' => $errors,
      'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
  }

  public static function notFound($resource = 'Resource')
  {
    self::error($resource . ' not found', 404);
  }

  public static function unauthorized($message = 'Unauthorized access')
  {
    self::error($message, 401);
  }

  public static function forbidden($message = 'Access forbidden')
  {
    self::error($message, 403);
  }

  public static function validationError($errors)
  {
    self::error('Validation failed', 422, $errors);
  }

  public static function paginate($data, $total, $page, $limit)
  {
    return [
      'data' => $data,
      'pagination' => [
        'total' => (int)$total,
        'per_page' => (int)$limit,
        'current_page' => (int)$page,
        'last_page' => (int)ceil($total / $limit),
        'from' => (($page - 1) * $limit) + 1,
        'to' => min($page * $limit, $total)
      ]
    ];
  }
}
