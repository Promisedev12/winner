<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Blog.php';
require_once __DIR__ . '/../../models/Comment.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/ValidationHelper.php';
require_once __DIR__ . '/../../helpers/Sanitizer.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

// Require blogger or admin role
RoleMiddleware::requireBlogger();

$method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($path_info, '/'));
$action = isset($request[0]) ? $request[0] : '';
$id = isset($request[1]) ? (int)$request[1] : null;
$subaction = isset($request[2]) ? $request[2] : null;

$user = AuthMiddleware::getAuthenticatedUser();

switch ($method) {
  case 'GET':
    switch ($action) {
      case 'dashboard':
        getDashboardStats($user->id);
        break;
      case 'posts':
        if ($id) {
          getPost($id, $user->id);
        } else {
          getPosts($user->id);
        }
        break;
      case 'drafts':
        getDrafts($user->id);
        break;
      case 'scheduled':
        getScheduledPosts($user->id);
        break;
      case 'analytics':
        getAnalytics($user->id);
        break;
      case 'comments':
        getComments($user->id);
        break;
      case 'settings':
        getSettings($user->id);
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  case 'POST':
    switch ($action) {
      case 'posts':
        createPost($user->id);
        break;
      case 'scheduled':
        if ($id && $subaction === 'publish') {
          publishScheduled($id, $user->id);
        } else {
          ResponseHelper::error('Invalid action', HTTP_BAD_REQUEST);
        }
        break;
      case 'comments':
        if ($id && $subaction === 'approve') {
          approveComment($id, $user->id);
        } elseif ($id && $subaction === 'reply') {
          replyToComment($id, $user->id);
        } else {
          ResponseHelper::error('Invalid action', HTTP_BAD_REQUEST);
        }
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  case 'PUT':
    switch ($action) {
      case 'posts':
        if ($id) {
          updatePost($id, $user->id);
        } else {
          ResponseHelper::error('Post ID required', HTTP_BAD_REQUEST);
        }
        break;
      case 'settings':
        updateSettings($user->id);
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  case 'DELETE':
    switch ($action) {
      case 'posts':
        if ($id) {
          deletePost($id, $user->id);
        } else {
          ResponseHelper::error('Post ID required', HTTP_BAD_REQUEST);
        }
        break;
      case 'comments':
        if ($id) {
          deleteComment($id, $user->id);
        } else {
          ResponseHelper::error('Comment ID required', HTTP_BAD_REQUEST);
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

  // Get post stats
  $postQuery = "SELECT 
                  COUNT(*) as total_posts,
                  SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_posts,
                  SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_posts,
                  SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_posts,
                  SUM(views) as total_views,
                  SUM(likes) as total_likes
                FROM blogs WHERE author_id = :user_id";
  $postStmt = $conn->prepare($postQuery);
  $postStmt->bindParam(':user_id', $userId);
  $postStmt->execute();
  $postStats = $postStmt->fetch(PDO::FETCH_ASSOC);

  // Get comment stats
  $commentQuery = "SELECT COUNT(*) as total_comments 
                   FROM comments c
                   JOIN blogs b ON c.blog_id = b.id
                   WHERE b.author_id = :user_id AND c.status = 'pending'";
  $commentStmt = $conn->prepare($commentQuery);
  $commentStmt->bindParam(':user_id', $userId);
  $commentStmt->execute();
  $pendingComments = $commentStmt->fetch(PDO::FETCH_ASSOC);

  // Get monthly views for chart
  $chartQuery = "SELECT 
                  DATE_FORMAT(created_at, '%b') as month,
                  SUM(views) as views,
                  SUM(likes) as likes
                FROM blogs
                WHERE author_id = :user_id AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY MONTH(created_at)
                ORDER BY created_at ASC";
  $chartStmt = $conn->prepare($chartQuery);
  $chartStmt->bindParam(':user_id', $userId);
  $chartStmt->execute();
  $chartData = $chartStmt->fetchAll(PDO::FETCH_ASSOC);

  // Get recent posts
  $recentQuery = "SELECT id, title, status, views, likes, created_at 
                  FROM blogs 
                  WHERE author_id = :user_id 
                  ORDER BY created_at DESC 
                  LIMIT 5";
  $recentStmt = $conn->prepare($recentQuery);
  $recentStmt->bindParam(':user_id', $userId);
  $recentStmt->execute();
  $recentPosts = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'stats' => [
      'total_posts' => (int)$postStats['total_posts'],
      'published_posts' => (int)$postStats['published_posts'],
      'draft_posts' => (int)$postStats['draft_posts'],
      'scheduled_posts' => (int)$postStats['scheduled_posts'],
      'total_views' => (int)$postStats['total_views'],
      'total_likes' => (int)$postStats['total_likes'],
      'pending_comments' => (int)$pendingComments['total_comments']
    ],
    'chart_data' => $chartData,
    'recent_posts' => $recentPosts
  ]);
}

function getPosts($userId)
{
  $blog = new Blog();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $status = isset($_GET['status']) ? $_GET['status'] : null;
  $search = isset($_GET['search']) ? $_GET['search'] : null;

  $result = $blog->getUserBlogs($userId, $page, $limit, $status, $search);

  ResponseHelper::success([
    'posts' => $result['blogs'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function getPost($id, $userId)
{
  $blog = new Blog();
  if (!$blog->findById($id)) {
    ResponseHelper::notFound('Post');
  }

  if ($blog->author_id != $userId) {
    ResponseHelper::forbidden('You can only view your own posts');
  }

  $tags = $blog->getTags($id);

  ResponseHelper::success([
    'id' => $blog->id,
    'title' => $blog->title,
    'slug' => $blog->slug,
    'content' => $blog->content,
    'excerpt' => $blog->excerpt,
    'featured_image' => $blog->featured_image,
    'category_id' => $blog->category_id,
    'tags' => $tags,
    'status' => $blog->status,
    'scheduled_for' => $blog->scheduled_for,
    'seo_title' => $blog->seo_title,
    'seo_description' => $blog->seo_description,
    'views' => $blog->views,
    'likes' => $blog->likes,
    'created_at' => $blog->created_at,
    'updated_at' => $blog->updated_at
  ]);
}

function createPost($userId)
{
  $data = json_decode(file_get_contents("php://input"), true);

  $required = ['title', 'content'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  $blog = new Blog();
  $blog->title = ValidationHelper::sanitizeInput($data['title']);
  $blog->slug = Sanitizer::sanitizeSlug($data['title']);
  $blog->content = $data['content'];
  $blog->excerpt = isset($data['excerpt']) ? ValidationHelper::sanitizeInput($data['excerpt']) : substr(strip_tags($data['content']), 0, 200);
  $blog->featured_image = isset($data['featured_image']) ? $data['featured_image'] : null;
  $blog->author_id = $userId;
  $blog->category_id = isset($data['category_id']) ? (int)$data['category_id'] : null;
  $blog->status = isset($data['status']) ? $data['status'] : BLOG_DRAFT;
  $blog->seo_title = isset($data['seo_title']) ? $data['seo_title'] : null;
  $blog->seo_description = isset($data['seo_description']) ? $data['seo_description'] : null;

  if ($blog->status === BLOG_SCHEDULED && isset($data['scheduled_for'])) {
    $blog->scheduled_for = date('Y-m-d H:i:s', strtotime($data['scheduled_for']));
  }

  if ($blog->create()) {
    if (isset($data['tags']) && is_array($data['tags'])) {
      $blog->addTags($blog->id, $data['tags']);
    }

    ResponseHelper::success(['id' => $blog->id], 'Post created successfully', HTTP_CREATED);
  } else {
    ResponseHelper::error('Failed to create post', HTTP_INTERNAL_ERROR);
  }
}

function updatePost($id, $userId)
{
  $data = json_decode(file_get_contents("php://input"), true);

  $blog = new Blog();
  if (!$blog->findById($id)) {
    ResponseHelper::notFound('Post');
  }

  if ($blog->author_id != $userId) {
    ResponseHelper::forbidden('You can only edit your own posts');
  }

  if (isset($data['title'])) {
    $blog->title = ValidationHelper::sanitizeInput($data['title']);
    $blog->slug = Sanitizer::sanitizeSlug($data['title']);
  }
  if (isset($data['content'])) {
    $blog->content = $data['content'];
  }
  if (isset($data['excerpt'])) {
    $blog->excerpt = ValidationHelper::sanitizeInput($data['excerpt']);
  }
  if (isset($data['featured_image'])) {
    $blog->featured_image = $data['featured_image'];
  }
  if (isset($data['category_id'])) {
    $blog->category_id = (int)$data['category_id'];
  }
  if (isset($data['status'])) {
    $blog->status = $data['status'];
    if ($blog->status === BLOG_PUBLISHED && !$blog->published_at) {
      $blog->published_at = date('Y-m-d H:i:s');
    }
  }
  if (isset($data['seo_title'])) {
    $blog->seo_title = $data['seo_title'];
  }
  if (isset($data['seo_description'])) {
    $blog->seo_description = $data['seo_description'];
  }

  if ($blog->update()) {
    if (isset($data['tags'])) {
      $blog->deleteTags($id);
      if (is_array($data['tags']) && !empty($data['tags'])) {
        $blog->addTags($id, $data['tags']);
      }
    }

    ResponseHelper::success(null, 'Post updated successfully');
  } else {
    ResponseHelper::error('Failed to update post', HTTP_INTERNAL_ERROR);
  }
}

function deletePost($id, $userId)
{
  $blog = new Blog();
  if (!$blog->findById($id)) {
    ResponseHelper::notFound('Post');
  }

  if ($blog->author_id != $userId) {
    ResponseHelper::forbidden('You can only delete your own posts');
  }

  if ($blog->delete()) {
    ResponseHelper::success(null, 'Post deleted successfully');
  } else {
    ResponseHelper::error('Failed to delete post', HTTP_INTERNAL_ERROR);
  }
}

function getDrafts($userId)
{
  $blog = new Blog();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;

  $result = $blog->getUserBlogs($userId, $page, $limit, BLOG_DRAFT);

  ResponseHelper::success([
    'drafts' => $result['blogs'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function getScheduledPosts($userId)
{
  $blog = new Blog();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;

  $result = $blog->getUserBlogs($userId, $page, $limit, BLOG_SCHEDULED);

  ResponseHelper::success([
    'scheduled' => $result['blogs'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function publishScheduled($id, $userId)
{
  $blog = new Blog();
  if (!$blog->findById($id)) {
    ResponseHelper::notFound('Post');
  }

  if ($blog->author_id != $userId) {
    ResponseHelper::forbidden('You can only publish your own posts');
  }

  $blog->status = BLOG_PUBLISHED;
  $blog->published_at = date('Y-m-d H:i:s');

  if ($blog->update()) {
    ResponseHelper::success(null, 'Post published successfully');
  } else {
    ResponseHelper::error('Failed to publish post', HTTP_INTERNAL_ERROR);
  }
}

function getAnalytics($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $range = isset($_GET['range']) ? $_GET['range'] : 'month';

  if ($range === 'week') {
    $query = "SELECT 
                DATE_FORMAT(created_at, '%a') as date,
                SUM(views) as views,
                SUM(likes) as likes,
                COUNT(*) as posts
              FROM blogs
              WHERE author_id = :user_id AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              GROUP BY DATE(created_at)
              ORDER BY created_at ASC";
  } else {
    $query = "SELECT 
                DATE_FORMAT(created_at, '%b') as date,
                SUM(views) as views,
                SUM(likes) as likes,
                COUNT(*) as posts
              FROM blogs
              WHERE author_id = :user_id AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
              GROUP BY MONTH(created_at)
              ORDER BY created_at ASC";
  }

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->execute();
  $chartData = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Get top posts
  $topQuery = "SELECT id, title, views, likes, comments_count 
               FROM blogs 
               WHERE author_id = :user_id AND status = 'published'
               ORDER BY views DESC 
               LIMIT 5";
  $topStmt = $conn->prepare($topQuery);
  $topStmt->bindParam(':user_id', $userId);
  $topStmt->execute();
  $topPosts = $topStmt->fetchAll(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'chart_data' => $chartData,
    'top_posts' => $topPosts
  ]);
}

function getComments($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $offset = ($page - 1) * $limit;
  $status = isset($_GET['status']) ? $_GET['status'] : null;

  $query = "SELECT c.*, u.name as user_name, u.avatar as user_avatar, b.title as post_title
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN blogs b ON c.blog_id = b.id
            WHERE b.author_id = :user_id";

  if ($status) {
    $query .= " AND c.status = :status";
  }

  $query .= " ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset";

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  if ($status) {
    $stmt->bindParam(':status', $status);
  }
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();

  $comments = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $comments[] = $row;
  }

  $countQuery = "SELECT COUNT(*) as total FROM comments c
                 JOIN blogs b ON c.blog_id = b.id
                 WHERE b.author_id = :user_id";
  $countStmt = $conn->prepare($countQuery);
  $countStmt->bindParam(':user_id', $userId);
  $countStmt->execute();
  $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

  ResponseHelper::success([
    'comments' => $comments,
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $total,
      'last_page' => ceil($total / $limit)
    ]
  ]);
}

function approveComment($id, $userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  // Verify comment belongs to user's blog
  $checkQuery = "SELECT c.id FROM comments c
                 JOIN blogs b ON c.blog_id = b.id
                 WHERE c.id = :id AND b.author_id = :user_id";
  $checkStmt = $conn->prepare($checkQuery);
  $checkStmt->bindParam(':id', $id);
  $checkStmt->bindParam(':user_id', $userId);
  $checkStmt->execute();

  if ($checkStmt->rowCount() === 0) {
    ResponseHelper::forbidden('You can only moderate comments on your own posts');
  }

  $query = "UPDATE comments SET status = 'approved' WHERE id = :id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':id', $id);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Comment approved successfully');
  } else {
    ResponseHelper::error('Failed to approve comment', HTTP_INTERNAL_ERROR);
  }
}

function deleteComment($id, $userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  // Verify comment belongs to user's blog
  $checkQuery = "SELECT c.id FROM comments c
                 JOIN blogs b ON c.blog_id = b.id
                 WHERE c.id = :id AND b.author_id = :user_id";
  $checkStmt = $conn->prepare($checkQuery);
  $checkStmt->bindParam(':id', $id);
  $checkStmt->bindParam(':user_id', $userId);
  $checkStmt->execute();

  if ($checkStmt->rowCount() === 0) {
    ResponseHelper::forbidden('You can only delete comments on your own posts');
  }

  $query = "DELETE FROM comments WHERE id = :id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':id', $id);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Comment deleted successfully');
  } else {
    ResponseHelper::error('Failed to delete comment', HTTP_INTERNAL_ERROR);
  }
}

function replyToComment($id, $userId)
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['reply'])) {
    ResponseHelper::validationError(['reply' => 'Reply content is required']);
  }

  $db = new Database();
  $conn = $db->getConnection();

  // Get original comment to find blog_id
  $commentQuery = "SELECT c.*, b.author_id FROM comments c
                   JOIN blogs b ON c.blog_id = b.id
                   WHERE c.id = :id";
  $commentStmt = $conn->prepare($commentQuery);
  $commentStmt->bindParam(':id', $id);
  $commentStmt->execute();
  $originalComment = $commentStmt->fetch(PDO::FETCH_ASSOC);

  if (!$originalComment) {
    ResponseHelper::notFound('Comment');
  }

  if ($originalComment['author_id'] != $userId) {
    ResponseHelper::forbidden('You can only reply to comments on your own posts');
  }

  $query = "INSERT INTO comments (content, user_id, blog_id, parent_id, status) 
            VALUES (:content, :user_id, :blog_id, :parent_id, 'approved')";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':content', $data['reply']);
  $stmt->bindParam(':user_id', $userId);
  $stmt->bindParam(':blog_id', $originalComment['blog_id']);
  $stmt->bindParam(':parent_id', $id);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Reply posted successfully');
  } else {
    ResponseHelper::error('Failed to post reply', HTTP_INTERNAL_ERROR);
  }
}

function getSettings($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $query = "SELECT notification_email, auto_approve_comments, default_post_status 
            FROM blogger_settings WHERE user_id = :user_id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->execute();
  $settings = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$settings) {
    $settings = [
      'notification_email' => true,
      'auto_approve_comments' => false,
      'default_post_status' => 'draft'
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
  $checkQuery = "SELECT id FROM blogger_settings WHERE user_id = :user_id";
  $checkStmt = $conn->prepare($checkQuery);
  $checkStmt->bindParam(':user_id', $userId);
  $checkStmt->execute();

  if ($checkStmt->rowCount() > 0) {
    $query = "UPDATE blogger_settings SET 
              notification_email = :notification_email,
              auto_approve_comments = :auto_approve_comments,
              default_post_status = :default_post_status
              WHERE user_id = :user_id";
  } else {
    $query = "INSERT INTO blogger_settings (user_id, notification_email, auto_approve_comments, default_post_status)
              VALUES (:user_id, :notification_email, :auto_approve_comments, :default_post_status)";
  }

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->bindValue(':notification_email', isset($data['notification_email']) ? (int)$data['notification_email'] : 1);
  $stmt->bindValue(':auto_approve_comments', isset($data['auto_approve_comments']) ? (int)$data['auto_approve_comments'] : 0);
  $stmt->bindParam(':default_post_status', $data['default_post_status']);
  $stmt->execute();

  ResponseHelper::success(null, 'Settings updated successfully');
}
