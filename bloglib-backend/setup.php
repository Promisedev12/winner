<?php
require_once __DIR__ . '/config/config.php';

echo "<h1>BlogLib Backend Setup Test</h1>";

// Test PHP Version
echo "<h3>PHP Version: " . phpversion() . "</h3>";

// Test Database Connection
echo "<h3>Testing Database Connection...</h3>";
try {
  $pdo = new PDO("mysql:host=" . DB_HOST, DB_USER, DB_PASS);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  // Create database if not exists
  $sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
  $pdo->exec($sql);
  echo "<p style='color:green'>✓ Database '" . DB_NAME . "' created or already exists</p>";

  // Select database
  $pdo->exec("USE " . DB_NAME);

  // Test connection
  $stmt = $pdo->query("SELECT 1");
  echo "<p style='color:green'>✓ Database connection successful</p>";
} catch (PDOException $e) {
  echo "<p style='color:red'>✗ Database error: " . $e->getMessage() . "</p>";
}

// Test directories
echo "<h3>Testing Directories...</h3>";
$directories = ['uploads', 'uploads/blogs', 'uploads/books', 'uploads/avatars', 'logs'];
foreach ($directories as $dir) {
  $path = __DIR__ . '/' . $dir;
  if (!file_exists($path)) {
    mkdir($path, 0777, true);
    echo "<p style='color:orange'>✓ Created directory: $dir</p>";
  } else {
    echo "<p style='color:green'>✓ Directory exists: $dir</p>";
  }
}

// Test API endpoints
echo "<h3>Testing API Endpoints...</h3>";
echo "<ul>";
echo "<li><a href='/bloglib-backend/api/v1/blogs.php' target='_blank'>GET /api/v1/blogs.php</a></li>";
echo "<li><a href='/bloglib-backend/api/v1/books.php' target='_blank'>GET /api/v1/books.php</a></li>";
echo "<li><a href='/bloglib-backend/api/v1/auth.php/me' target='_blank'>GET /api/v1/auth.php/me (requires auth)</a></li>";
echo "</ul>";

echo "<h3>Next Steps:</h3>";
echo "<ol>";
echo "<li>Run the SQL migrations from /database/migrations/ folder</li>";
echo "<li>Test registration: POST to /api/v1/auth.php/register</li>";
echo "<li>Test login: POST to /api/v1/auth.php/login</li>";
echo "</ol>";
