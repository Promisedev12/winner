<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
  ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

$db = new Database();
$conn = $db->getConnection();

// Get total users
$userQuery = "SELECT COUNT(*) as total_users FROM users WHERE status = 'active'";
$userStmt = $conn->prepare($userQuery);
$userStmt->execute();
$totalUsers = $userStmt->fetch(PDO::FETCH_ASSOC);

// Get total blogs (published)
$blogQuery = "SELECT COUNT(*) as total_blogs FROM blogs WHERE status = 'published'";
$blogStmt = $conn->prepare($blogQuery);
$blogStmt->execute();
$totalBlogs = $blogStmt->fetch(PDO::FETCH_ASSOC);

// Get total books (published)
$bookQuery = "SELECT COUNT(*) as total_books FROM books WHERE status = 'published'";
$bookStmt = $conn->prepare($bookQuery);
$bookStmt->execute();
$totalBooks = $bookStmt->fetch(PDO::FETCH_ASSOC);

// Calculate satisfaction rate (mock - in production you'd calculate from reviews/ratings)
$satisfactionRate = 98; // Default

ResponseHelper::success([
  'total_users' => (int)$totalUsers['total_users'],
  'total_blogs' => (int)$totalBlogs['total_blogs'],
  'total_books' => (int)$totalBooks['total_books'],
  'satisfaction_rate' => $satisfactionRate
]);
