<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Bookmark.php';
require_once __DIR__ . '/../../models/Follow.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/ValidationHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($path_info, '/'));
$action = isset($request[0]) ? $request[0] : '';
$id = isset($request[1]) ? (int)$request[1] : null;

switch ($method) {
  case 'GET':
    if ($action === 'profile' && $id) {
      getPublicProfile($id);
    } elseif ($action === 'me') {
      getMyProfile();
    } elseif ($action === 'followers' && $id) {
      getFollowers($id);
    } elseif ($action === 'following' && $id) {
      getFollowing($id);
    } else {
      RoleMiddleware::requireAdmin();
      getAllUsers();
    }
    break;

  case 'POST':
    if ($action === 'follow') {
      followUser();
    } elseif ($action === 'bookmark') {
      bookmarkContent();
    } elseif ($action === 'apply-role') {
      applyForRole();
    } else {
      ResponseHelper::error('Invalid action', HTTP_BAD_REQUEST);
    }
    break;

  case 'DELETE':
    if ($action === 'unfollow') {
      unfollowUser();
    } elseif ($action === 'bookmark') {
      removeBookmark();
    } else {
      ResponseHelper::error('Invalid action', HTTP_BAD_REQUEST);
    }
    break;

  case 'PUT':
    if ($action === 'update-role') {
      // This endpoint requires admin - for admin to approve/reject
      RoleMiddleware::requireAdmin();
      updateUserRole();
    } elseif ($action === 'update-status') {
      RoleMiddleware::requireAdmin();
      updateUserStatus();
    } elseif ($action === 'apply-role') {
      // This endpoint is for regular users to apply for roles
      updateMyRole();
    } else {
      ResponseHelper::error('Invalid action', HTTP_BAD_REQUEST);
    }
    break;

  default:
    ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
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

function getPublicProfile($userId)
{
  $user = new User();
  if (!$user->findById($userId)) {
    ResponseHelper::notFound('User');
  }

  $roles = $user->getUserRoles($userId);
  $blogCount = getBlogCount($userId);
  $bookCount = getBookCount($userId);
  $followersCount = getFollowersCount($userId);
  $followingCount = getFollowingCount($userId);

  ResponseHelper::success([
    'id' => $user->id,
    'name' => $user->name,
    'avatar' => $user->avatar,
    'bio' => $user->bio,
    'roles' => $roles,
    'stats' => [
      'blogs' => $blogCount,
      'books' => $bookCount,
      'followers' => $followersCount,
      'following' => $followingCount
    ],
    'joined' => $user->created_at
  ]);
}

function getMyProfile()
{
  $user = AuthMiddleware::getAuthenticatedUser();
  $roles = $user->getUserRoles($user->id);

  ResponseHelper::success([
    'id' => $user->id,
    'name' => $user->name,
    'email' => $user->email,
    'avatar' => $user->avatar,
    'bio' => $user->bio,
    'phone' => $user->phone,
    'email_verified' => $user->email_verified,
    'status' => $user->status,
    'roles' => $roles,
    'created_at' => $user->created_at
  ]);
}

function followUser()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $currentUser = AuthMiddleware::getAuthenticatedUser();

  if (!isset($data['user_id'])) {
    ResponseHelper::validationError(['user_id' => 'User ID is required']);
  }

  $follow = new Follow();
  if ($follow->follow($currentUser->id, $data['user_id'])) {
    ResponseHelper::success(null, 'User followed successfully');
  } else {
    ResponseHelper::error('Failed to follow user', HTTP_INTERNAL_ERROR);
  }
}

function unfollowUser()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $currentUser = AuthMiddleware::getAuthenticatedUser();

  if (!isset($data['user_id'])) {
    ResponseHelper::validationError(['user_id' => 'User ID is required']);
  }

  $follow = new Follow();
  if ($follow->unfollow($currentUser->id, $data['user_id'])) {
    ResponseHelper::success(null, 'User unfollowed successfully');
  } else {
    ResponseHelper::error('Failed to unfollow user', HTTP_INTERNAL_ERROR);
  }
}

function bookmarkContent()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $currentUser = AuthMiddleware::getAuthenticatedUser();

  if (!isset($data['type']) || !isset($data['content_id'])) {
    ResponseHelper::validationError(['type' => 'Type and content_id are required']);
  }

  $bookmark = new Bookmark();
  if ($bookmark->add($currentUser->id, $data['type'], $data['content_id'])) {
    ResponseHelper::success(null, 'Content bookmarked successfully');
  } else {
    ResponseHelper::error('Failed to bookmark content', HTTP_INTERNAL_ERROR);
  }
}

function removeBookmark()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $currentUser = AuthMiddleware::getAuthenticatedUser();

  if (!isset($data['type']) || !isset($data['content_id'])) {
    ResponseHelper::validationError(['type' => 'Type and content_id are required']);
  }

  $bookmark = new Bookmark();
  if ($bookmark->remove($currentUser->id, $data['type'], $data['content_id'])) {
    ResponseHelper::success(null, 'Bookmark removed successfully');
  } else {
    ResponseHelper::error('Failed to remove bookmark', HTTP_INTERNAL_ERROR);
  }
}

function applyForRole()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  if (!isset($data['role']) || !in_array($data['role'], ['blogger', 'author'])) {
    ResponseHelper::validationError(['role' => 'Valid role (blogger or author) is required']);
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

  // Check if already applied
  $checkQuery = "SELECT * FROM user_roles WHERE user_id = :user_id AND role_id = :role_id";
  $checkStmt = $conn->prepare($checkQuery);
  $checkStmt->bindParam(':user_id', $user->id);
  $checkStmt->bindParam(':role_id', $role['id']);
  $checkStmt->execute();

  if ($checkStmt->rowCount() > 0) {
    ResponseHelper::error('Application already submitted', HTTP_CONFLICT);
  }

  $query = "INSERT INTO user_roles (user_id, role_id, approved, applied_at) VALUES (:user_id, :role_id, 0, NOW())";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $user->id);
  $stmt->bindParam(':role_id', $role['id']);

  if ($stmt->execute()) {
    // Get updated roles
    $updatedRoles = $user->getUserRoles($user->id);
    ResponseHelper::success([
      'roles' => $updatedRoles
    ], 'Application submitted successfully');
  } else {
    ResponseHelper::error('Failed to submit application', HTTP_INTERNAL_ERROR);
  }
}
function updateMyRole()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  if (!isset($data['role']) || !in_array($data['role'], ['blogger', 'author'])) {
    ResponseHelper::validationError(['role' => 'Valid role (blogger or author) is required']);
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

  // Check if already has this role approved
  $checkQuery = "SELECT * FROM user_roles WHERE user_id = :user_id AND role_id = :role_id AND approved = 1";
  $checkStmt = $conn->prepare($checkQuery);
  $checkStmt->bindParam(':user_id', $user->id);
  $checkStmt->bindParam(':role_id', $role['id']);
  $checkStmt->execute();

  if ($checkStmt->rowCount() > 0) {
    ResponseHelper::error('You already have this role', HTTP_CONFLICT);
  }

  // Check if already applied (pending)
  $pendingQuery = "SELECT * FROM user_roles WHERE user_id = :user_id AND role_id = :role_id AND approved = 0";
  $pendingStmt = $conn->prepare($pendingQuery);
  $pendingStmt->bindParam(':user_id', $user->id);
  $pendingStmt->bindParam(':role_id', $role['id']);
  $pendingStmt->execute();

  if ($pendingStmt->rowCount() > 0) {
    ResponseHelper::error('Application already pending approval', HTTP_CONFLICT);
  }

  $query = "INSERT INTO user_roles (user_id, role_id, approved, applied_at) VALUES (:user_id, :role_id, 0, NOW())";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $user->id);
  $stmt->bindParam(':role_id', $role['id']);

  if ($stmt->execute()) {
    // Get updated roles
    $updatedRoles = $user->getUserRoles($user->id);
    ResponseHelper::success([
      'roles' => $updatedRoles
    ], 'Role application submitted successfully. Please wait for admin approval.');
  } else {
    ResponseHelper::error('Failed to submit application', HTTP_INTERNAL_ERROR);
  }
}
function updateUserRole()
{
  $data = json_decode(file_get_contents("php://input"), true);

  $required = ['user_id', 'role', 'action'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  $db = new Database();
  $conn = $db->getConnection();

  $roleQuery = "SELECT id FROM roles WHERE name = :name";
  $roleStmt = $conn->prepare($roleQuery);
  $roleStmt->bindParam(':name', $data['role']);
  $roleStmt->execute();
  $role = $roleStmt->fetch(PDO::FETCH_ASSOC);

  if (!$role) {
    ResponseHelper::error('Invalid role', HTTP_BAD_REQUEST);
  }

  if ($data['action'] === 'approve') {
    $query = "UPDATE user_roles SET approved = 1, approved_at = NOW() 
              WHERE user_id = :user_id AND role_id = :role_id";
  } elseif ($data['action'] === 'remove') {
    $query = "DELETE FROM user_roles WHERE user_id = :user_id AND role_id = :role_id";
  } else {
    ResponseHelper::error('Invalid action. Use "approve" or "remove"', HTTP_BAD_REQUEST);
  }

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $data['user_id']);
  $stmt->bindParam(':role_id', $role['id']);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Role updated successfully');
  } else {
    ResponseHelper::error('Failed to update role', HTTP_INTERNAL_ERROR);
  }
}

function updateUserStatus()
{
  $data = json_decode(file_get_contents("php://input"), true);

  $required = ['user_id', 'status'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  if (!in_array($data['status'], ['active', 'suspended', 'banned'])) {
    ResponseHelper::validationError(['status' => 'Invalid status']);
  }

  $user = new User();
  if ($user->updateStatus($data['user_id'], $data['status'])) {
    ResponseHelper::success(null, 'User status updated successfully');
  } else {
    ResponseHelper::error('Failed to update user status', HTTP_INTERNAL_ERROR);
  }
}

// Helper functions
function getBlogCount($userId)
{
  $db = new Database();
  $conn = $db->getConnection();
  $query = "SELECT COUNT(*) as count FROM blogs WHERE author_id = :author_id AND status = 'published'";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':author_id', $userId);
  $stmt->execute();
  $result = $stmt->fetch(PDO::FETCH_ASSOC);
  return $result['count'];
}

function getBookCount($userId)
{
  $db = new Database();
  $conn = $db->getConnection();
  $query = "SELECT COUNT(*) as count FROM books WHERE author_id = :author_id AND status = 'published'";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':author_id', $userId);
  $stmt->execute();
  $result = $stmt->fetch(PDO::FETCH_ASSOC);
  return $result['count'];
}

function getFollowersCount($userId)
{
  $db = new Database();
  $conn = $db->getConnection();
  $query = "SELECT COUNT(*) as count FROM follows WHERE following_id = :user_id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->execute();
  $result = $stmt->fetch(PDO::FETCH_ASSOC);
  return $result['count'];
}

function getFollowingCount($userId)
{
  $db = new Database();
  $conn = $db->getConnection();
  $query = "SELECT COUNT(*) as count FROM follows WHERE follower_id = :user_id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->execute();
  $result = $stmt->fetch(PDO::FETCH_ASSOC);
  return $result['count'];
}

function getFollowers($userId)
{
  $follow = new Follow();
  $followers = $follow->getFollowers($userId);
  ResponseHelper::success($followers);
}

function getFollowing($userId)
{
  $follow = new Follow();
  $following = $follow->getFollowing($userId);
  ResponseHelper::success($following);
}
