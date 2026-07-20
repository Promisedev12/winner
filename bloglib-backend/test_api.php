<?php
require_once __DIR__ . '/config/config.php';

echo "<h1>BlogLib API Test</h1>";
echo "<h2>Configuration Test</h2>";
echo "<pre>";
echo "HTTP_OK: " . HTTP_OK . "\n";
echo "ROLE_ADMIN: " . ROLE_ADMIN . "\n";
echo "DB_NAME: " . DB_NAME . "\n";
echo "JWT_SECRET: " . substr(JWT_SECRET, 0, 10) . "...\n";
echo "</pre>";

echo "<h2>Database Connection Test</h2>";
try {
  $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  echo "<p style='color:green'>✓ Database connection successful</p>";

  // Test tables exist
  $tables = ['users', 'blogs', 'books', 'comments'];
  foreach ($tables as $table) {
    $result = $pdo->query("SHOW TABLES LIKE '$table'");
    if ($result->rowCount() > 0) {
      echo "<p style='color:green'>✓ Table '$table' exists</p>";
    } else {
      echo "<p style='color:orange'>✗ Table '$table' does not exist - run migrations</p>";
    }
  }
} catch (PDOException $e) {
  echo "<p style='color:red'>✗ Database error: " . $e->getMessage() . "</p>";
}

echo "<h2>API Endpoints</h2>";
echo "<ul>";
echo "<li><a href='/bloglib-backend/api/v1/auth.php/register' target='_blank'>POST /api/v1/auth.php/register</a></li>";
echo "<li><a href='/bloglib-backend/api/v1/auth.php/login' target='_blank'>POST /api/v1/auth.php/login</a></li>";
echo "<li><a href='/bloglib-backend/api/v1/blogs.php' target='_blank'>GET /api/v1/blogs.php</a></li>";
echo "<li><a href='/bloglib-backend/api/v1/books.php' target='_blank'>GET /api/v1/books.php</a></li>";
echo "</ul>";
