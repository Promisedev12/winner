<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/helpers/ResponseHelper.php';

// Simple router
$request_uri = $_SERVER['REQUEST_URI'];
$script_name = $_SERVER['SCRIPT_NAME'];

// Remove base path
$path = str_replace(dirname($script_name), '', $request_uri);
$path = parse_url($path, PHP_URL_PATH);
$path = ltrim($path, '/');

// API Routes
if (strpos($path, 'api/v1/') === 0) {
  $endpoint = str_replace('api/v1/', '', $path);

  // Remove query string if present
  $endpoint = strtok($endpoint, '?');

  $file = __DIR__ . '/api/v1/' . $endpoint . '.php';

  if (file_exists($file)) {
    require_once $file;
  } else {
    ResponseHelper::error('API endpoint not found', HTTP_NOT_FOUND);
  }
} else {
  // Root endpoint - API info
  if ($path === '' || $path === 'index.php') {
    echo json_encode([
      'name' => APP_NAME,
      'version' => APP_VERSION,
      'status' => 'running',
      'endpoints' => [
        '/api/v1/auth.php' => 'Authentication endpoints',
        '/api/v1/blogs.php' => 'Blog management',
        '/api/v1/books.php' => 'Book management',
        '/api/v1/users.php' => 'User management',
        '/api/v1/ai.php' => 'AI assistant',
        '/api/v1/payments.php' => 'Payment processing',
        '/api/v1/admin.php' => 'Admin functions'
      ]
    ], JSON_PRETTY_PRINT);
  } else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
  }
}
