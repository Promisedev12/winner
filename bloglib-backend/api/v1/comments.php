<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Comment.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Blog.php';
require_once __DIR__ . '/../../models/Book.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/ValidationHelper.php';
require_once __DIR__ . '/../../helpers/Sanitizer.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];

// Handle PATH_INFO safely
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($path_info, '/'));
$id = isset($request[0]) && is_numeric($request[0]) ? (int)$request[0] : null;
$action = isset($request[1]) ? $request[1] : null;

switch ($method) {
  case 'GET':
    if ($id) {
      getComment($id);
    } elseif ($action === 'blog' && isset($request[1])) {
      getBlogComments($request[1]);
    } elseif ($action === 'book' && isset($request[1])) {
      getBookComments($request[1]);
    } else {
      getAllComments();
    }
    break;

  case 'POST':
    AuthMiddleware::authenticate();
    if ($action === 'blog') {
      addBlogComment();
    } elseif ($action === 'book') {
      addBookComment();
    } else {
      addComment();
    }
    break;

  case 'PUT':
    AuthMiddleware::authenticate();
    if ($id) {
      updateComment($id);
    } else {
      ResponseHelper::error('Comment ID required', HTTP_BAD_REQUEST);
    }
    break;

  case 'DELETE':
    AuthMiddleware::authenticate();
    if ($id) {
      deleteComment($id);
    } else {
      ResponseHelper::error('Comment ID required', HTTP_BAD_REQUEST);
    }
    break;

  default:
    ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

function getAllComments()
{
  // Admin only can see all comments
  $user = AuthMiddleware::getAuthenticatedUser();
  $userRoles = $user->getUserRoles($user->id);
  if (!in_array(ROLE_ADMIN, $userRoles)) {
    ResponseHelper::forbidden('Admin access required');
  }

  $db = new Database();
  $conn = $db->getConnection();

  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $offset = ($page - 1) * $limit;
  $status = isset($_GET['status']) ? $_GET['status'] : null;

  $query = "SELECT c.*, u.name as user_name, u.avatar as user_avatar,
              CASE 
                WHEN c.blog_id IS NOT NULL THEN (SELECT title FROM blogs WHERE id = c.blog_id)
                WHEN c.book_id IS NOT NULL THEN (SELECT title FROM books WHERE id = c.book_id)
              END as content_title
              FROM comments c
              JOIN users u ON c.user_id = u.id
              WHERE 1=1";
  $params = [];

  if ($status) {
    $query .= " AND c.status = :status";
    $params[':status'] = $status;
  }

  $query .= " ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset";

  $stmt = $conn->prepare($query);
  foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
  }
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();

  $comments = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $comments[] = $row;
  }

  $countQuery = "SELECT COUNT(*) as total FROM comments WHERE 1=1";
  if ($status) {
    $countQuery .= " AND status = :status";
  }
  $countStmt = $conn->prepare($countQuery);
  if ($status) {
    $countStmt->bindParam(':status', $status);
  }
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

function getComment($id)
{
  $comment = new Comment();
  $result = $comment->findById($id);

  if ($result) {
    ResponseHelper::success($result);
  } else {
    ResponseHelper::notFound('Comment');
  }
}

function getBlogComments($blogId)
{
  $comment = new Comment();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;

  $result = $comment->getBlogComments($blogId, $page, $limit);

  ResponseHelper::success([
    'comments' => $result['comments'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function getBookComments($bookId)
{
  $comment = new Comment();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;

  // For books, we'll reuse the same logic but filter by book_id
  $db = new Database();
  $conn = $db->getConnection();
  $offset = ($page - 1) * $limit;

  $query = "SELECT c.*, u.name as user_name, u.avatar as user_avatar
              FROM comments c
              JOIN users u ON c.user_id = u.id
              WHERE c.book_id = :book_id AND c.status = 'approved'
              ORDER BY c.created_at DESC
              LIMIT :limit OFFSET :offset";

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':book_id', $bookId);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();

  $comments = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $comments[] = $row;
  }

  $countQuery = "SELECT COUNT(*) as total FROM comments WHERE book_id = :book_id AND status = 'approved'";
  $countStmt = $conn->prepare($countQuery);
  $countStmt->bindParam(':book_id', $bookId);
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

function addBlogComment()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  $required = ['blog_id', 'content'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  // Check if blog exists
  $blog = new Blog();
  if (!$blog->findById($data['blog_id'])) {
    ResponseHelper::notFound('Blog');
  }

  $comment = new Comment();
  $comment->content = ValidationHelper::sanitizeInput($data['content']);
  $comment->user_id = $user->id;
  $comment->blog_id = $data['blog_id'];
  $comment->book_id = null;
  $comment->parent_id = isset($data['parent_id']) ? $data['parent_id'] : null;
  $comment->status = 'pending'; // Auto-moderate or require approval

  if ($comment->create()) {
    ResponseHelper::success(['id' => $comment->id], 'Comment added successfully', HTTP_CREATED);
  } else {
    ResponseHelper::error('Failed to add comment', HTTP_INTERNAL_ERROR);
  }
}

function addBookComment()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  $required = ['book_id', 'content'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  // Check if book exists
  $book = new Book();
  if (!$book->findById($data['book_id'])) {
    ResponseHelper::notFound('Book');
  }

  $comment = new Comment();
  $comment->content = ValidationHelper::sanitizeInput($data['content']);
  $comment->user_id = $user->id;
  $comment->blog_id = null;
  $comment->book_id = $data['book_id'];
  $comment->parent_id = isset($data['parent_id']) ? $data['parent_id'] : null;
  $comment->status = 'pending';

  if ($comment->create()) {
    ResponseHelper::success(['id' => $comment->id], 'Comment added successfully', HTTP_CREATED);
  } else {
    ResponseHelper::error('Failed to add comment', HTTP_INTERNAL_ERROR);
  }
}

function addComment()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  if (!isset($data['content'])) {
    ResponseHelper::validationError(['content' => 'Content is required']);
  }

  if (!isset($data['blog_id']) && !isset($data['book_id'])) {
    ResponseHelper::validationError(['Either blog_id or book_id is required']);
  }

  $comment = new Comment();
  $comment->content = ValidationHelper::sanitizeInput($data['content']);
  $comment->user_id = $user->id;
  $comment->blog_id = isset($data['blog_id']) ? $data['blog_id'] : null;
  $comment->book_id = isset($data['book_id']) ? $data['book_id'] : null;
  $comment->parent_id = isset($data['parent_id']) ? $data['parent_id'] : null;
  $comment->status = 'pending';

  if ($comment->create()) {
    ResponseHelper::success(['id' => $comment->id], 'Comment added successfully', HTTP_CREATED);
  } else {
    ResponseHelper::error('Failed to add comment', HTTP_INTERNAL_ERROR);
  }
}

function updateComment($id)
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  $comment = new Comment();
  $existingComment = $comment->findById($id);

  if (!$existingComment) {
    ResponseHelper::notFound('Comment');
  }

  // Only author or admin can edit
  $userRoles = $user->getUserRoles($user->id);
  if ($existingComment['user_id'] != $user->id && !in_array(ROLE_ADMIN, $userRoles)) {
    ResponseHelper::forbidden('You can only edit your own comments');
  }

  if (isset($data['content'])) {
    $comment->content = ValidationHelper::sanitizeInput($data['content']);
    $query = "UPDATE comments SET content = :content WHERE id = :id";
    $db = new Database();
    $conn = $db->getConnection();
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':content', $comment->content);
    $stmt->bindParam(':id', $id);

    if ($stmt->execute()) {
      ResponseHelper::success(null, 'Comment updated successfully');
    } else {
      ResponseHelper::error('Failed to update comment', HTTP_INTERNAL_ERROR);
    }
  } else {
    ResponseHelper::error('No fields to update', HTTP_BAD_REQUEST);
  }
}

function deleteComment($id)
{
  $user = AuthMiddleware::getAuthenticatedUser();

  $comment = new Comment();
  $existingComment = $comment->findById($id);

  if (!$existingComment) {
    ResponseHelper::notFound('Comment');
  }

  // Only author or admin can delete
  $userRoles = $user->getUserRoles($user->id);
  if ($existingComment['user_id'] != $user->id && !in_array(ROLE_ADMIN, $userRoles)) {
    ResponseHelper::forbidden('You can only delete your own comments');
  }

  $query = "DELETE FROM comments WHERE id = :id";
  $db = new Database();
  $conn = $db->getConnection();
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':id', $id);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Comment deleted successfully');
  } else {
    ResponseHelper::error('Failed to delete comment', HTTP_INTERNAL_ERROR);
  }
}

// Admin functions
function approveComment($id)
{
  $user = AuthMiddleware::getAuthenticatedUser();
  $userRoles = $user->getUserRoles($user->id);
  if (!in_array(ROLE_ADMIN, $userRoles)) {
    ResponseHelper::forbidden('Admin access required');
  }

  $comment = new Comment();
  if ($comment->approve($id)) {
    ResponseHelper::success(null, 'Comment approved successfully');
  } else {
    ResponseHelper::error('Failed to approve comment', HTTP_INTERNAL_ERROR);
  }
}

function rejectComment($id)
{
  $user = AuthMiddleware::getAuthenticatedUser();
  $userRoles = $user->getUserRoles($user->id);
  if (!in_array(ROLE_ADMIN, $userRoles)) {
    ResponseHelper::forbidden('Admin access required');
  }

  $comment = new Comment();
  if ($comment->reject($id)) {
    ResponseHelper::success(null, 'Comment rejected successfully');
  } else {
    ResponseHelper::error('Failed to reject comment', HTTP_INTERNAL_ERROR);
  }
}

function likeComment($id)
{
  $user = AuthMiddleware::getAuthenticatedUser();

  $comment = new Comment();
  if ($comment->incrementLikes($id)) {
    ResponseHelper::success(null, 'Comment liked successfully');
  } else {
    ResponseHelper::error('Failed to like comment', HTTP_INTERNAL_ERROR);
  }
}
