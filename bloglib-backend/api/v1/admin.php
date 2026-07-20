<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Blog.php';
require_once __DIR__ . '/../../models/Book.php';
require_once __DIR__ . '/../../models/Comment.php';
require_once __DIR__ . '/../../models/Payment.php';
require_once __DIR__ . '/../../models/Subscription.php';
require_once __DIR__ . '/../../models/Notification.php';
require_once __DIR__ . '/../../models/ActivityLog.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/ValidationHelper.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

// All admin routes require admin role
RoleMiddleware::requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($path_info, '/'));
$action = isset($request[0]) ? $request[0] : '';
$id = isset($request[1]) ? (int)$request[1] : null;

switch ($method) {
  case 'GET':
    switch ($action) {
      case 'dashboard':
        getDashboardStats();
        break;
      case 'reported-content':
        getReportedContent();
        break;
      case 'pending-approvals':
        getPendingApprovals();
        break;
      case 'platform-stats':
        getPlatformStats();
        break;
      case 'activity-logs':
        getActivityLogs();
        break;
      case 'subscriptions':
        getAllSubscriptions();
        break;
      case 'settings':
        getSystemSettings();
        break;
      case 'users':
        getAllUsers();
        break;
      case 'blogs':
        getAllBlogs();
        break;
      case 'books':
        getAllBooks();
        break;
      case 'revenue':
        getRevenueStats();
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  case 'POST':
    switch ($action) {
      case 'moderate-blog':
        moderateBlog();
        break;
      case 'moderate-book':
        moderateBook();
        break;
      case 'broadcast':
        broadcastNotification();
        break;
      case 'approve-role':
        approveRole();
        break;
      case 'reject-role':
        rejectRole();
        break;
      case 'update-settings':
        updateSystemSettings();
        break;
      case 'cancel-subscription':
        cancelSubscription();
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  case 'PUT':
    switch ($action) {
      case 'update-user-status':
        updateUserStatus();
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  case 'DELETE':
    switch ($action) {
      case 'delete-user':
        deleteUser();
        break;
      case 'delete-blog':
        deleteBlog();
        break;
      case 'delete-book':
        deleteBook();
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  default:
    ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

function getDashboardStats()
{
  $db = new Database();
  $conn = $db->getConnection();

  // Get user stats
  $userQuery = "SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
                    SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today
                  FROM users";
  $userStmt = $conn->prepare($userQuery);
  $userStmt->execute();
  $userStats = $userStmt->fetch(PDO::FETCH_ASSOC);

  // Get blog stats
  $blogQuery = "SELECT 
                    COUNT(*) as total_blogs,
                    SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_blogs,
                    SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today
                  FROM blogs";
  $blogStmt = $conn->prepare($blogQuery);
  $blogStmt->execute();
  $blogStats = $blogStmt->fetch(PDO::FETCH_ASSOC);

  // Get book stats
  $bookQuery = "SELECT 
                    COUNT(*) as total_books,
                    SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_books,
                    SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today
                  FROM books";
  $bookStmt = $conn->prepare($bookQuery);
  $bookStmt->execute();
  $bookStats = $bookStmt->fetch(PDO::FETCH_ASSOC);

  // Get revenue
  $revenueQuery = "SELECT 
                        COALESCE(SUM(amount), 0) as total_revenue,
                        COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) THEN amount ELSE 0 END), 0) as monthly_revenue
                      FROM payments WHERE status = 'completed'";
  $revenueStmt = $conn->prepare($revenueQuery);
  $revenueStmt->execute();
  $revenueStats = $revenueStmt->fetch(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'users' => $userStats,
    'blogs' => $blogStats,
    'books' => $bookStats,
    'revenue' => $revenueStats
  ]);
}

function getReportedContent()
{
  $db = new Database();
  $conn = $db->getConnection();

  $type = isset($_GET['type']) ? $_GET['type'] : null;

  $query = "SELECT r.*, 
                     u1.name as reporter_name,
                     u1.email as reporter_email,
                     CASE 
                        WHEN r.content_type = 'blog' THEN (SELECT title FROM blogs WHERE id = r.content_id)
                        WHEN r.content_type = 'book' THEN (SELECT title FROM books WHERE id = r.content_id)
                        WHEN r.content_type = 'comment' THEN (SELECT content FROM comments WHERE id = r.content_id)
                     END as content_title
              FROM reports r
              LEFT JOIN users u1 ON r.reporter_id = u1.id
              WHERE 1=1";

  if ($type) {
    $query .= " AND r.content_type = :type";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':type', $type);
  } else {
    $stmt = $conn->prepare($query);
  }

  $stmt->execute();

  $reports = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $reports[] = $row;
  }

  ResponseHelper::success($reports);
}

function getPendingApprovals()
{
  $db = new Database();
  $conn = $db->getConnection();

  $query = "SELECT ur.*, u.name, u.email, u.created_at as user_joined, r.name as role_name
              FROM user_roles ur
              JOIN users u ON ur.user_id = u.id
              JOIN roles r ON ur.role_id = r.id
              WHERE ur.approved = 0
              ORDER BY ur.applied_at DESC";

  $stmt = $conn->prepare($query);
  $stmt->execute();

  $applications = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $applications[] = $row;
  }

  ResponseHelper::success($applications);
}

function approveRole()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['user_id']) || !isset($data['role'])) {
    ResponseHelper::validationError(['user_id' => 'User ID and role are required']);
  }

  $db = new Database();
  $conn = $db->getConnection();

  // Get role id
  $roleQuery = "SELECT id FROM roles WHERE name = :name";
  $roleStmt = $conn->prepare($roleQuery);
  $roleStmt->bindParam(':name', $data['role']);
  $roleStmt->execute();
  $role = $roleStmt->fetch(PDO::FETCH_ASSOC);

  if (!$role) {
    ResponseHelper::error('Invalid role', HTTP_BAD_REQUEST);
  }

  $query = "UPDATE user_roles SET approved = 1, approved_at = NOW() 
              WHERE user_id = :user_id AND role_id = :role_id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $data['user_id']);
  $stmt->bindParam(':role_id', $role['id']);

  if ($stmt->execute()) {
    // Send notification to user
    $notification = new Notification();
    $notification->user_id = $data['user_id'];
    $notification->title = 'Role Approved';
    $notification->message = 'Your application for ' . ucfirst($data['role']) . ' role has been approved!';
    $notification->type = 'role_approved';
    $notification->create();

    ResponseHelper::success(null, 'Role approved successfully');
  } else {
    ResponseHelper::error('Failed to approve role', HTTP_INTERNAL_ERROR);
  }
}

function rejectRole()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['user_id']) || !isset($data['role'])) {
    ResponseHelper::validationError(['user_id' => 'User ID and role are required']);
  }

  $db = new Database();
  $conn = $db->getConnection();

  // Get role id
  $roleQuery = "SELECT id FROM roles WHERE name = :name";
  $roleStmt = $conn->prepare($roleQuery);
  $roleStmt->bindParam(':name', $data['role']);
  $roleStmt->execute();
  $role = $roleStmt->fetch(PDO::FETCH_ASSOC);

  if (!$role) {
    ResponseHelper::error('Invalid role', HTTP_BAD_REQUEST);
  }

  $query = "DELETE FROM user_roles WHERE user_id = :user_id AND role_id = :role_id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $data['user_id']);
  $stmt->bindParam(':role_id', $role['id']);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Role rejected successfully');
  } else {
    ResponseHelper::error('Failed to reject role', HTTP_INTERNAL_ERROR);
  }
}

function getPlatformStats()
{
  $db = new Database();
  $conn = $db->getConnection();

  // Monthly user growth
  $userGrowth = [];
  for ($i = 11; $i >= 0; $i--) {
    $month = date('Y-m', strtotime("-$i months"));
    $monthName = date('M', strtotime("-$i months"));
    $query = "SELECT COUNT(*) as count FROM users WHERE DATE_FORMAT(created_at, '%Y-%m') = :month";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':month', $month);
    $stmt->execute();
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    $userGrowth[] = [
      'month' => $monthName,
      'new_users' => (int)$count['count']
    ];
  }

  // Content distribution
  $blogCount = $conn->query("SELECT COUNT(*) as count FROM blogs WHERE status = 'published'")->fetch(PDO::FETCH_ASSOC);
  $bookCount = $conn->query("SELECT COUNT(*) as count FROM books WHERE status = 'published'")->fetch(PDO::FETCH_ASSOC);

  $contentDist = [
    ['type' => 'blogs', 'count' => (int)$blogCount['count']],
    ['type' => 'books', 'count' => (int)$bookCount['count']]
  ];

  // Role distribution
  $roleQuery = "SELECT r.name, COUNT(ur.user_id) as count
                  FROM roles r
                  LEFT JOIN user_roles ur ON r.id = ur.role_id AND ur.approved = 1
                  GROUP BY r.id";
  $roleStmt = $conn->prepare($roleQuery);
  $roleStmt->execute();
  $roleDist = [];
  while ($row = $roleStmt->fetch(PDO::FETCH_ASSOC)) {
    $roleDist[] = $row;
  }

  ResponseHelper::success([
    'monthly_growth' => $userGrowth,
    'content_distribution' => $contentDist,
    'role_distribution' => $roleDist
  ]);
}

function getActivityLogs()
{
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
  $filters = [];

  if (isset($_GET['user_id'])) $filters['user_id'] = $_GET['user_id'];
  if (isset($_GET['action'])) $filters['action'] = $_GET['action'];
  if (isset($_GET['date_from'])) $filters['date_from'] = $_GET['date_from'];
  if (isset($_GET['date_to'])) $filters['date_to'] = $_GET['date_to'];

  $activityLog = new ActivityLog();
  $result = $activityLog->getLogs($page, $limit, $filters);

  ResponseHelper::success([
    'logs' => $result['logs'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function getAllSubscriptions()
{
  $subscription = new Subscription();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;

  $result = $subscription->getAll($page, $limit);

  ResponseHelper::success([
    'subscriptions' => $result['subscriptions'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function cancelSubscription()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['subscription_id'])) {
    ResponseHelper::validationError(['subscription_id' => 'Subscription ID is required']);
  }

  $subscription = new Subscription();
  if ($subscription->cancel($data['subscription_id'])) {
    ResponseHelper::success(null, 'Subscription cancelled successfully');
  } else {
    ResponseHelper::error('Failed to cancel subscription', HTTP_INTERNAL_ERROR);
  }
}

function getSystemSettings()
{
  $db = new Database();
  $conn = $db->getConnection();

  $query = "SELECT * FROM system_settings";
  $stmt = $conn->prepare($query);
  $stmt->execute();

  $settings = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $settings[$row['setting_key']] = $row['setting_value'];
  }

  // Default settings if none exist
  if (empty($settings)) {
    $settings = [
      'site_name' => 'BlogLib',
      'site_description' => 'Modern Blog Platform + Smart E-Library + AI Writing Assistant',
      'contact_email' => 'admin@bloglib.com',
      'support_email' => 'support@bloglib.com',
      'smtp_host' => 'smtp.gmail.com',
      'smtp_port' => '587',
      'smtp_user' => '',
      'currency' => 'USD',
      'commission_rate' => '30',
      'min_payout' => '50',
      'enable_registrations' => '1',
      'email_verification' => '1',
      'moderation_enabled' => '1',
      'ai_enabled' => '1'
    ];
  }

  ResponseHelper::success($settings);
}

function updateSystemSettings()
{
  $data = json_decode(file_get_contents("php://input"), true);

  $db = new Database();
  $conn = $db->getConnection();

  // First, clear existing settings
  $conn->exec("DELETE FROM system_settings");

  // Insert new settings
  $query = "INSERT INTO system_settings (setting_key, setting_value) VALUES (:key, :value)";
  $stmt = $conn->prepare($query);

  foreach ($data as $key => $value) {
    $stmt->bindParam(':key', $key);
    $stmt->bindParam(':value', $value);
    $stmt->execute();
  }

  ResponseHelper::success(null, 'Settings updated successfully');
}

function moderateBlog()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['blog_id']) || !isset($data['action'])) {
    ResponseHelper::validationError(['blog_id' => 'Blog ID and action are required']);
  }

  $db = new Database();
  $conn = $db->getConnection();

  if ($data['action'] === 'approve') {
    $query = "UPDATE blogs SET status = 'published', published_at = NOW() WHERE id = :id";
  } elseif ($data['action'] === 'reject') {
    $query = "UPDATE blogs SET status = 'archived' WHERE id = :id";
  } else {
    ResponseHelper::error('Invalid action. Use "approve" or "reject"', HTTP_BAD_REQUEST);
  }

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':id', $data['blog_id']);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Blog moderated successfully');
  } else {
    ResponseHelper::error('Failed to moderate blog', HTTP_INTERNAL_ERROR);
  }
}

function moderateBook()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['book_id']) || !isset($data['action'])) {
    ResponseHelper::validationError(['book_id' => 'Book ID and action are required']);
  }

  $db = new Database();
  $conn = $db->getConnection();

  if ($data['action'] === 'approve') {
    $query = "UPDATE books SET status = 'published', published_at = NOW() WHERE id = :id";
  } elseif ($data['action'] === 'reject') {
    $query = "UPDATE books SET status = 'archived' WHERE id = :id";
  } else {
    ResponseHelper::error('Invalid action. Use "approve" or "reject"', HTTP_BAD_REQUEST);
  }

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':id', $data['book_id']);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Book moderated successfully');
  } else {
    ResponseHelper::error('Failed to moderate book', HTTP_INTERNAL_ERROR);
  }
}

function broadcastNotification()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['title']) || !isset($data['message']) || !isset($data['audience'])) {
    ResponseHelper::validationError(['title' => 'Title, message, and audience are required']);
  }

  $notification = new Notification();

  if ($data['audience'] === 'all') {
    $result = $notification->broadcast($data['title'], $data['message'], 'broadcast');
  } elseif ($data['audience'] === 'bloggers') {
    $db = new Database();
    $conn = $db->getConnection();
    $userQuery = "SELECT DISTINCT ur.user_id FROM user_roles ur 
                      JOIN roles r ON ur.role_id = r.id 
                      WHERE r.name = 'blogger' AND ur.approved = 1";
    $userStmt = $conn->prepare($userQuery);
    $userStmt->execute();
    $userIds = $userStmt->fetchAll(PDO::FETCH_COLUMN);
    $result = $notification->broadcast($data['title'], $data['message'], 'broadcast', $userIds);
  } elseif ($data['audience'] === 'authors') {
    $db = new Database();
    $conn = $db->getConnection();
    $userQuery = "SELECT DISTINCT ur.user_id FROM user_roles ur 
                      JOIN roles r ON ur.role_id = r.id 
                      WHERE r.name = 'author' AND ur.approved = 1";
    $userStmt = $conn->prepare($userQuery);
    $userStmt->execute();
    $userIds = $userStmt->fetchAll(PDO::FETCH_COLUMN);
    $result = $notification->broadcast($data['title'], $data['message'], 'broadcast', $userIds);
  } elseif ($data['audience'] === 'subscribers') {
    $db = new Database();
    $conn = $db->getConnection();
    $userQuery = "SELECT DISTINCT user_id FROM subscriptions WHERE status = 'active'";
    $userStmt = $conn->prepare($userQuery);
    $userStmt->execute();
    $userIds = $userStmt->fetchAll(PDO::FETCH_COLUMN);
    $result = $notification->broadcast($data['title'], $data['message'], 'broadcast', $userIds);
  } else {
    ResponseHelper::error('Invalid audience. Use "all", "bloggers", "authors", or "subscribers"', HTTP_BAD_REQUEST);
  }

  if ($result) {
    ResponseHelper::success(null, 'Notification broadcast sent successfully');
  } else {
    ResponseHelper::error('Failed to send broadcast', HTTP_INTERNAL_ERROR);
  }
}

function getAllUsers()
{
  $user = new User();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $role = isset($_GET['role']) ? $_GET['role'] : null;
  $status = isset($_GET['status']) ? $_GET['status'] : null;
  $search = isset($_GET['search']) ? $_GET['search'] : null;

  $filters = [
    'role' => $role,
    'status' => $status,
    'search' => $search
  ];

  $result = $user->getAll($page, $limit, $filters);

  ResponseHelper::success([
    'users' => $result['users'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function getAllBlogs()
{
  $blog = new Blog();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $status = isset($_GET['status']) ? $_GET['status'] : null;
  $search = isset($_GET['search']) ? $_GET['search'] : null;

  $filters = [
    'status' => $status,
    'search' => $search
  ];

  $result = $blog->getAll($page, $limit, $filters);

  ResponseHelper::success([
    'blogs' => $result['blogs'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function getAllBooks()
{
  $book = new Book();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $status = isset($_GET['status']) ? $_GET['status'] : null;
  $search = isset($_GET['search']) ? $_GET['search'] : null;

  $filters = [
    'status' => $status,
    'search' => $search
  ];

  $result = $book->getAll($page, $limit, $filters);

  ResponseHelper::success([
    'books' => $result['books'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function getRevenueStats()
{
  $db = new Database();
  $conn = $db->getConnection();

  $range = isset($_GET['range']) ? $_GET['range'] : 'year';

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
  } else {
    $query = "SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as date,
                    SUM(amount) as revenue,
                    COUNT(*) as transactions
                  FROM payments
                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                  AND status = 'completed'
                  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                  ORDER BY date ASC";
  }

  $stmt = $conn->prepare($query);
  $stmt->execute();
  $revenueData = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Get total stats
  $totalQuery = "SELECT 
                    COALESCE(SUM(amount), 0) as total_revenue,
                    COALESCE(SUM(commission), 0) as total_commission,
                    COUNT(*) as total_transactions
                  FROM payments
                  WHERE status = 'completed'";
  $totalStmt = $conn->prepare($totalQuery);
  $totalStmt->execute();
  $totalStats = $totalStmt->fetch(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'revenue_data' => $revenueData,
    'total_stats' => $totalStats
  ]);
}

function updateUserStatus()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['user_id']) || !isset($data['status'])) {
    ResponseHelper::validationError(['user_id' => 'User ID and status are required']);
  }

  if (!in_array($data['status'], ['active', 'suspended', 'banned'])) {
    ResponseHelper::error('Invalid status', HTTP_BAD_REQUEST);
  }

  $user = new User();
  if ($user->updateStatus($data['user_id'], $data['status'])) {
    ResponseHelper::success(null, 'User status updated successfully');
  } else {
    ResponseHelper::error('Failed to update user status', HTTP_INTERNAL_ERROR);
  }
}

function deleteUser()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['user_id'])) {
    ResponseHelper::validationError(['user_id' => 'User ID is required']);
  }

  $db = new Database();
  $conn = $db->getConnection();

  $query = "DELETE FROM users WHERE id = :id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':id', $data['user_id']);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'User deleted successfully');
  } else {
    ResponseHelper::error('Failed to delete user', HTTP_INTERNAL_ERROR);
  }
}

function deleteBlog()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['blog_id'])) {
    ResponseHelper::validationError(['blog_id' => 'Blog ID is required']);
  }

  $db = new Database();
  $conn = $db->getConnection();

  $query = "DELETE FROM blogs WHERE id = :id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':id', $data['blog_id']);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Blog deleted successfully');
  } else {
    ResponseHelper::error('Failed to delete blog', HTTP_INTERNAL_ERROR);
  }
}

function deleteBook()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['book_id'])) {
    ResponseHelper::validationError(['book_id' => 'Book ID is required']);
  }

  $db = new Database();
  $conn = $db->getConnection();

  $query = "DELETE FROM books WHERE id = :id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':id', $data['book_id']);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Book deleted successfully');
  } else {
    ResponseHelper::error('Failed to delete book', HTTP_INTERNAL_ERROR);
  }
}
