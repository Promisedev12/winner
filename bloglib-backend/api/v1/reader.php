<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Blog.php';
require_once __DIR__ . '/../../models/Book.php';
require_once __DIR__ . '/../../models/Comment.php';
require_once __DIR__ . '/../../models/Bookmark.php';
require_once __DIR__ . '/../../models/Follow.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/ValidationHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

// Require authentication
AuthMiddleware::authenticate();

$method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($path_info, '/'));
$action = isset($request[0]) ? $request[0] : '';
$id = isset($request[1]) ? $request[1] : null;
$subaction = isset($request[2]) ? $request[2] : null;

$user = AuthMiddleware::getAuthenticatedUser();
$userId = $user->id;

switch ($method) {
  case 'GET':
    switch ($action) {
      case 'dashboard':
        getDashboardStats($userId);
        break;
      case 'history':
        getReadingHistory($userId);
        break;
      case 'bookmarks':
        getBookmarks($userId);
        break;
      case 'following':
        getFollowing($userId);
        break;
      case 'followers':
        getFollowers($userId);
        break;
      case 'recommendations':
        getRecommendations($userId);
        break;
      case 'continue-reading':
        getContinueReading($userId);
        break;
      case 'badges':
        getBadges($userId);
        break;
      case 'settings':
        getSettings($userId);
        break;
      case 'streak':
        getReadingStreak($userId);
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  case 'POST':
    switch ($action) {
      case 'bookmarks':
        addBookmark($userId);
        break;
      case 'follow':
        followUser($userId);
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  case 'PUT':
    switch ($action) {
      case 'progress':
        updateProgress($userId);
        break;
      case 'settings':
        updateSettings($userId);
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  case 'DELETE':
    switch ($action) {
      case 'bookmarks':
        if ($id && $subaction) {
          removeBookmark($userId, $id, $subaction);
        } else {
          ResponseHelper::error('Type and content ID required', HTTP_BAD_REQUEST);
        }
        break;
      case 'follow':
        if ($id) {
          unfollowUser($userId, $id);
        } else {
          ResponseHelper::error('User ID required', HTTP_BAD_REQUEST);
        }
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  default:
    ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

function getDashboardStats($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  // Get reading stats
  $statsQuery = "SELECT 
                  COUNT(DISTINCT rh.blog_id) as blogs_read,
                  COUNT(DISTINCT rh.book_id) as books_read,
                  COUNT(DISTINCT bm.id) as bookmarks_count,
                  COUNT(DISTINCT f.id) as following_count,
                  (SELECT COUNT(*) FROM follows WHERE following_id = :user_id) as followers_count
                FROM users u
                LEFT JOIN reading_history rh ON u.id = rh.user_id
                LEFT JOIN bookmarks bm ON u.id = bm.user_id
                LEFT JOIN follows f ON u.id = f.follower_id
                WHERE u.id = :user_id";
  $statsStmt = $conn->prepare($statsQuery);
  $statsStmt->bindParam(':user_id', $userId);
  $statsStmt->execute();
  $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

  // Get reading streak
  $streakQuery = "SELECT COUNT(DISTINCT DATE(last_read)) as streak
                  FROM reading_history
                  WHERE user_id = :user_id
                  AND last_read >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                  GROUP BY DATE(last_read)
                  ORDER BY last_read DESC";
  $streakStmt = $conn->prepare($streakQuery);
  $streakStmt->bindParam(':user_id', $userId);
  $streakStmt->execute();
  $streak = $streakStmt->fetch(PDO::FETCH_ASSOC);

  // Get recent activity
  $activityQuery = "SELECT 
                      'read' as type,
                      CASE 
                        WHEN rh.blog_id IS NOT NULL THEN (SELECT title FROM blogs WHERE id = rh.blog_id)
                        WHEN rh.book_id IS NOT NULL THEN (SELECT title FROM books WHERE id = rh.book_id)
                      END as content_title,
                      rh.last_read as created_at
                    FROM reading_history rh
                    WHERE rh.user_id = :user_id
                    ORDER BY rh.last_read DESC
                    LIMIT 5";
  $activityStmt = $conn->prepare($activityQuery);
  $activityStmt->bindParam(':user_id', $userId);
  $activityStmt->execute();
  $activities = $activityStmt->fetchAll(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'stats' => [
      'blogs_read' => (int)$stats['blogs_read'],
      'books_read' => (int)$stats['books_read'],
      'bookmarks' => (int)$stats['bookmarks_count'],
      'following' => (int)$stats['following_count'],
      'followers' => (int)$stats['followers_count'],
      'reading_streak' => (int)$streak['streak'] ?? 0
    ],
    'recent_activity' => $activities
  ]);
}

function getReadingHistory($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $offset = ($page - 1) * $limit;
  $type = isset($_GET['type']) ? $_GET['type'] : 'all';

  $query = "SELECT 
              rh.*,
              CASE 
                WHEN rh.blog_id IS NOT NULL THEN 'blog'
                WHEN rh.book_id IS NOT NULL THEN 'book'
              END as content_type,
              CASE 
                WHEN rh.blog_id IS NOT NULL THEN (SELECT title FROM blogs WHERE id = rh.blog_id)
                WHEN rh.book_id IS NOT NULL THEN (SELECT title FROM books WHERE id = rh.book_id)
              END as title,
              CASE 
                WHEN rh.blog_id IS NOT NULL THEN (SELECT featured_image FROM blogs WHERE id = rh.blog_id)
                WHEN rh.book_id IS NOT NULL THEN (SELECT cover_image FROM books WHERE id = rh.book_id)
              END as image,
              CASE 
                WHEN rh.blog_id IS NOT NULL THEN (SELECT author_id FROM blogs WHERE id = rh.blog_id)
                WHEN rh.book_id IS NOT NULL THEN (SELECT author_id FROM books WHERE id = rh.book_id)
              END as author_id,
              CASE 
                WHEN rh.blog_id IS NOT NULL THEN (SELECT u.name FROM blogs b JOIN users u ON b.author_id = u.id WHERE b.id = rh.blog_id)
                WHEN rh.book_id IS NOT NULL THEN (SELECT u.name FROM books bk JOIN users u ON bk.author_id = u.id WHERE bk.id = rh.book_id)
              END as author_name
            FROM reading_history rh
            WHERE rh.user_id = :user_id";

  if ($type === 'blog') {
    $query .= " AND rh.blog_id IS NOT NULL";
  } elseif ($type === 'book') {
    $query .= " AND rh.book_id IS NOT NULL";
  }

  $query .= " ORDER BY rh.last_read DESC LIMIT :limit OFFSET :offset";

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();

  $history = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $history[] = $row;
  }

  $countQuery = "SELECT COUNT(*) as total FROM reading_history WHERE user_id = :user_id";
  $countStmt = $conn->prepare($countQuery);
  $countStmt->bindParam(':user_id', $userId);
  $countStmt->execute();
  $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

  ResponseHelper::success([
    'history' => $history,
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $total,
      'last_page' => ceil($total / $limit)
    ]
  ]);
}

function getBookmarks($userId)
{
  $bookmark = new Bookmark();
  $type = isset($_GET['type']) ? $_GET['type'] : null;
  $bookmarks = $bookmark->getUserBookmarks($userId, $type);

  ResponseHelper::success($bookmarks);
}

function addBookmark($userId)
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['type']) || !isset($data['content_id'])) {
    ResponseHelper::validationError(['type' => 'Type and content_id are required']);
  }

  $bookmark = new Bookmark();
  if ($bookmark->add($userId, $data['type'], $data['content_id'])) {
    ResponseHelper::success(null, 'Bookmark added successfully');
  } else {
    ResponseHelper::error('Failed to add bookmark', HTTP_INTERNAL_ERROR);
  }
}

function removeBookmark($userId, $type, $contentId)
{
  $bookmark = new Bookmark();
  if ($bookmark->remove($userId, $type, $contentId)) {
    ResponseHelper::success(null, 'Bookmark removed successfully');
  } else {
    ResponseHelper::error('Failed to remove bookmark', HTTP_INTERNAL_ERROR);
  }
}

function getFollowing($userId)
{
  $follow = new Follow();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $result = $follow->getFollowing($userId, $page, $limit);

  ResponseHelper::success([
    'following' => $result['following'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function getFollowers($userId)
{
  $follow = new Follow();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $result = $follow->getFollowers($userId, $page, $limit);

  ResponseHelper::success([
    'followers' => $result['followers'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function followUser($userId)
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['user_id'])) {
    ResponseHelper::validationError(['user_id' => 'User ID is required']);
  }

  $follow = new Follow();
  if ($follow->follow($userId, $data['user_id'])) {
    ResponseHelper::success(null, 'User followed successfully');
  } else {
    ResponseHelper::error('Failed to follow user', HTTP_INTERNAL_ERROR);
  }
}

function unfollowUser($userId, $followingId)
{
  $follow = new Follow();
  if ($follow->unfollow($userId, $followingId)) {
    ResponseHelper::success(null, 'User unfollowed successfully');
  } else {
    ResponseHelper::error('Failed to unfollow user', HTTP_INTERNAL_ERROR);
  }
}

function getRecommendations($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  // Get user's interests from reading history
  $interestsQuery = "SELECT 
                      CASE 
                        WHEN rh.blog_id IS NOT NULL THEN (SELECT category_id FROM blogs WHERE id = rh.blog_id)
                        WHEN rh.book_id IS NOT NULL THEN (SELECT category_id FROM books WHERE id = rh.book_id)
                      END as category_id,
                      COUNT(*) as read_count
                    FROM reading_history rh
                    WHERE rh.user_id = :user_id
                    GROUP BY category_id
                    ORDER BY read_count DESC
                    LIMIT 3";
  $interestsStmt = $conn->prepare($interestsQuery);
  $interestsStmt->bindParam(':user_id', $userId);
  $interestsStmt->execute();
  $interests = $interestsStmt->fetchAll(PDO::FETCH_ASSOC);

  $categoryIds = array_column($interests, 'category_id');

  // Get recommendations based on interests
  $recommendations = [];

  if (!empty($categoryIds)) {
    // Get blog recommendations
    $blogQuery = "SELECT b.*, u.name as author_name 
                  FROM blogs b
                  JOIN users u ON b.author_id = u.id
                  WHERE b.category_id IN (" . implode(',', $categoryIds) . ")
                  AND b.status = 'published'
                  AND b.id NOT IN (SELECT blog_id FROM reading_history WHERE user_id = :user_id AND blog_id IS NOT NULL)
                  ORDER BY b.views DESC
                  LIMIT 5";
    $blogStmt = $conn->prepare($blogQuery);
    $blogStmt->bindParam(':user_id', $userId);
    $blogStmt->execute();
    $blogRecs = $blogStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get book recommendations
    $bookQuery = "SELECT bk.*, u.name as author_name 
                  FROM books bk
                  JOIN users u ON bk.author_id = u.id
                  WHERE bk.category_id IN (" . implode(',', $categoryIds) . ")
                  AND bk.status = 'published'
                  AND bk.id NOT IN (SELECT book_id FROM reading_history WHERE user_id = :user_id AND book_id IS NOT NULL)
                  ORDER BY bk.downloads DESC
                  LIMIT 5";
    $bookStmt = $conn->prepare($bookQuery);
    $bookStmt->bindParam(':user_id', $userId);
    $bookStmt->execute();
    $bookRecs = $bookStmt->fetchAll(PDO::FETCH_ASSOC);

    $recommendations = array_merge($blogRecs, $bookRecs);
    shuffle($recommendations);
    $recommendations = array_slice($recommendations, 0, 6);
  }

  ResponseHelper::success($recommendations);
}

function getContinueReading($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $query = "SELECT 
              rh.*,
              CASE 
                WHEN rh.blog_id IS NOT NULL THEN 'blog'
                WHEN rh.book_id IS NOT NULL THEN 'book'
              END as content_type,
              CASE 
                WHEN rh.blog_id IS NOT NULL THEN (SELECT title FROM blogs WHERE id = rh.blog_id)
                WHEN rh.book_id IS NOT NULL THEN (SELECT title FROM books WHERE id = rh.book_id)
              END as title,
              CASE 
                WHEN rh.blog_id IS NOT NULL THEN (SELECT featured_image FROM blogs WHERE id = rh.blog_id)
                WHEN rh.book_id IS NOT NULL THEN (SELECT cover_image FROM books WHERE id = rh.book_id)
              END as image,
              CASE 
                WHEN rh.blog_id IS NOT NULL THEN (SELECT author_id FROM blogs WHERE id = rh.blog_id)
                WHEN rh.book_id IS NOT NULL THEN (SELECT author_id FROM books WHERE id = rh.book_id)
              END as author_id,
              CASE 
                WHEN rh.blog_id IS NOT NULL THEN (SELECT u.name FROM blogs b JOIN users u ON b.author_id = u.id WHERE b.id = rh.blog_id)
                WHEN rh.book_id IS NOT NULL THEN (SELECT u.name FROM books bk JOIN users u ON bk.author_id = u.id WHERE bk.id = rh.book_id)
              END as author_name
            FROM reading_history rh
            WHERE rh.user_id = :user_id
            AND rh.progress < 100
            ORDER BY rh.last_read DESC
            LIMIT 5";

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->execute();

  $continueReading = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $continueReading[] = $row;
  }

  ResponseHelper::success($continueReading);
}

function updateProgress($userId)
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['type']) || !isset($data['content_id']) || !isset($data['progress'])) {
    ResponseHelper::validationError(['type' => 'Type, content_id, and progress are required']);
  }

  $db = new Database();
  $conn = $db->getConnection();

  if ($data['type'] === 'blog') {
    $query = "INSERT INTO reading_history (user_id, blog_id, progress, last_read) 
              VALUES (:user_id, :content_id, :progress, NOW())
              ON DUPLICATE KEY UPDATE progress = :progress, last_read = NOW()";
  } elseif ($data['type'] === 'book') {
    $query = "INSERT INTO reading_history (user_id, book_id, progress, last_read) 
              VALUES (:user_id, :content_id, :progress, NOW())
              ON DUPLICATE KEY UPDATE progress = :progress, last_read = NOW()";
  } else {
    ResponseHelper::error('Invalid type', HTTP_BAD_REQUEST);
  }

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->bindParam(':content_id', $data['content_id']);
  $stmt->bindParam(':progress', $data['progress']);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Progress updated successfully');
  } else {
    ResponseHelper::error('Failed to update progress', HTTP_INTERNAL_ERROR);
  }
}

function getBadges($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  // Get user's reading stats
  $statsQuery = "SELECT 
                  COUNT(DISTINCT rh.blog_id) as blogs_read,
                  COUNT(DISTINCT rh.book_id) as books_read,
                  (SELECT COUNT(*) FROM reading_history WHERE user_id = :user_id) as total_read
                FROM reading_history rh
                WHERE rh.user_id = :user_id";
  $statsStmt = $conn->prepare($statsQuery);
  $statsStmt->bindParam(':user_id', $userId);
  $statsStmt->execute();
  $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

  $badges = [];

  // Early Reader Badge
  if ($stats['total_read'] >= 1) {
    $badges[] = [
      'name' => 'Early Reader',
      'icon' => '🌟',
      'earned' => true,
      'date' => 'Joined and started reading'
    ];
  }

  // Bookworm Badge
  if ($stats['books_read'] >= 5) {
    $badges[] = [
      'name' => 'Bookworm',
      'icon' => '📚',
      'earned' => true,
      'date' => 'Read 5+ books'
    ];
  } else {
    $badges[] = [
      'name' => 'Bookworm',
      'icon' => '📚',
      'earned' => false,
      'progress' => $stats['books_read'] . '/5 books'
    ];
  }

  // Blog Enthusiast Badge
  if ($stats['blogs_read'] >= 10) {
    $badges[] = [
      'name' => 'Blog Enthusiast',
      'icon' => '✍️',
      'earned' => true,
      'date' => 'Read 10+ blogs'
    ];
  } else {
    $badges[] = [
      'name' => 'Blog Enthusiast',
      'icon' => '✍️',
      'earned' => false,
      'progress' => $stats['blogs_read'] . '/10 blogs'
    ];
  }

  ResponseHelper::success($badges);
}

function getReadingStreak($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $query = "SELECT COUNT(DISTINCT DATE(last_read)) as streak,
            MAX(DATE(last_read)) as last_read_date
            FROM reading_history
            WHERE user_id = :user_id
            AND last_read >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->execute();
  $result = $stmt->fetch(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'streak' => (int)$result['streak'] ?? 0,
    'last_read' => $result['last_read_date'] ?? null
  ]);
}

function getSettings($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $query = "SELECT * FROM reader_settings WHERE user_id = :user_id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->execute();
  $settings = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$settings) {
    $settings = [
      'email_notifications' => true,
      'reading_goal' => 10,
      'dark_mode' => false,
      'font_size' => 'medium'
    ];
  }

  ResponseHelper::success($settings);
}

function updateSettings($userId)
{
  $data = json_decode(file_get_contents("php://input"), true);

  $db = new Database();
  $conn = $db->getConnection();

  // Check if settings exist
  $checkQuery = "SELECT id FROM reader_settings WHERE user_id = :user_id";
  $checkStmt = $conn->prepare($checkQuery);
  $checkStmt->bindParam(':user_id', $userId);
  $checkStmt->execute();

  if ($checkStmt->rowCount() > 0) {
    $query = "UPDATE reader_settings SET 
              email_notifications = :email_notifications,
              reading_goal = :reading_goal,
              dark_mode = :dark_mode,
              font_size = :font_size
              WHERE user_id = :user_id";
  } else {
    $query = "INSERT INTO reader_settings (user_id, email_notifications, reading_goal, dark_mode, font_size)
              VALUES (:user_id, :email_notifications, :reading_goal, :dark_mode, :font_size)";
  }

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->bindValue(':email_notifications', isset($data['email_notifications']) ? (int)$data['email_notifications'] : 1);
  $stmt->bindParam(':reading_goal', $data['reading_goal']);
  $stmt->bindValue(':dark_mode', isset($data['dark_mode']) ? (int)$data['dark_mode'] : 0);
  $stmt->bindParam(':font_size', $data['font_size']);
  $stmt->execute();

  ResponseHelper::success(null, 'Settings updated successfully');
}
