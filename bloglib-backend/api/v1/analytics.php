<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

// Require admin role for analytics
RoleMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($path_info, '/'));
$action = isset($request[0]) ? $request[0] : '';

if ($method !== 'GET') {
  ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

$db = new Database();
$conn = $db->getConnection();

switch ($action) {
  case 'revenue':
    getRevenueAnalytics();
    break;
  case 'users':
    getUserAnalytics();
    break;
  case 'content':
    getContentAnalytics();
    break;
  case 'engagement':
    getEngagementAnalytics();
    break;
  default:
    ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
}

function getRevenueAnalytics()
{
  global $conn;

  $range = isset($_GET['range']) ? $_GET['range'] : 'month';

  if ($range === 'month') {
    $query = "SELECT 
                    DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                    SUM(amount) as revenue,
                    COUNT(*) as transactions
                  FROM payments
                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                  AND status = 'completed'
                  GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
                  ORDER BY date ASC";
  } elseif ($range === 'year') {
    $query = "SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as date,
                    SUM(amount) as revenue,
                    COUNT(*) as transactions
                  FROM payments
                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                  AND status = 'completed'
                  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                  ORDER BY date ASC";
  } else {
    $query = "SELECT 
                    SUM(amount) as total_revenue,
                    AVG(amount) as avg_transaction,
                    COUNT(*) as total_transactions
                  FROM payments
                  WHERE status = 'completed'";
  }

  $stmt = $conn->prepare($query);
  $stmt->execute();
  $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

  ResponseHelper::success($result);
}

function getUserAnalytics()
{
  global $conn;

  $query = "SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as new_users,
                SUM(CASE WHEN email_verified = 1 THEN 1 ELSE 0 END) as verified_users
              FROM users
              WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
              GROUP BY DATE_FORMAT(created_at, '%Y-%m')
              ORDER BY month ASC";

  $stmt = $conn->prepare($query);
  $stmt->execute();
  $userGrowth = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // User retention
  $retentionQuery = "SELECT 
                        COUNT(DISTINCT u.id) as total_users,
                        COUNT(DISTINCT CASE WHEN l.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN u.id END) as active_30d
                      FROM users u
                      LEFT JOIN activity_logs l ON u.id = l.user_id";
  $retentionStmt = $conn->prepare($retentionQuery);
  $retentionStmt->execute();
  $retention = $retentionStmt->fetch(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'growth' => $userGrowth,
    'retention' => $retention
  ]);
}

function getContentAnalytics()
{
  global $conn;

  $blogQuery = "SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as blogs_published,
                    SUM(views) as total_views,
                    SUM(likes) as total_likes
                  FROM blogs
                  WHERE status = 'published'
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                  ORDER BY month ASC";

  $blogStmt = $conn->prepare($blogQuery);
  $blogStmt->execute();
  $blogStats = $blogStmt->fetchAll(PDO::FETCH_ASSOC);

  $bookQuery = "SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as books_published,
                    SUM(downloads) as total_downloads
                  FROM books
                  WHERE status = 'published'
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                  ORDER BY month ASC";

  $bookStmt = $conn->prepare($bookQuery);
  $bookStmt->execute();
  $bookStats = $bookStmt->fetchAll(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'blogs' => $blogStats,
    'books' => $bookStats
  ]);
}

function getEngagementAnalytics()
{
  global $conn;

  $query = "SELECT 
                AVG(views) as avg_views,
                AVG(likes) as avg_likes,
                AVG(comments) as avg_comments
              FROM blogs
              WHERE status = 'published'";

  $stmt = $conn->prepare($query);
  $stmt->execute();
  $averages = $stmt->fetch(PDO::FETCH_ASSOC);

  // Top performing content
  $topBlogs = "SELECT title, views, likes, comments 
                 FROM blogs 
                 WHERE status = 'published' 
                 ORDER BY views DESC 
                 LIMIT 10";
  $blogStmt = $conn->prepare($topBlogs);
  $blogStmt->execute();
  $topBlogs = $blogStmt->fetchAll(PDO::FETCH_ASSOC);

  $topBooks = "SELECT title, downloads, rating 
                 FROM books 
                 WHERE status = 'published' 
                 ORDER BY downloads DESC 
                 LIMIT 10";
  $bookStmt = $conn->prepare($topBooks);
  $bookStmt->execute();
  $topBooks = $bookStmt->fetchAll(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'averages' => $averages,
    'top_blogs' => $topBlogs,
    'top_books' => $topBooks
  ]);
}
