<?php



require_once __DIR__ . '/../../config/config.php';

require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/ValidationHelper.php';
require_once __DIR__ . '/../../helpers/JWT.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($path_info, '/'));
$action = isset($request[0]) ? $request[0] : '';

switch ($method) {
  case 'POST':
    switch ($action) {
      case 'register':
        register();
        break;
      case 'login':
        login();
        break;
      case 'logout':
        logout();
        break;
      case 'refresh':
        refresh();
        break;
      case 'forgot-password':
        forgotPassword();
        break;
      case 'reset-password':
        resetPassword();
        break;
      case 'verify-email':
        verifyEmail();
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  case 'GET':
    switch ($action) {
      case 'me':
        getMe();
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  case 'PUT':
    switch ($action) {
      case 'update-profile':
        updateProfile();
        break;
      case 'change-password':
        changePassword();
        break;
      default:
        ResponseHelper::error('Invalid action', HTTP_NOT_FOUND);
    }
    break;

  default:
    ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}
function register()
{
  $data = json_decode(file_get_contents("php://input"), true);

  // Validate required fields
  $required = ['name', 'email', 'password'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  // Validate email
  if (!ValidationHelper::validateEmail($data['email'])) {
    ResponseHelper::validationError(['email' => 'Invalid email format']);
  }

  // Validate password
  if (!ValidationHelper::validatePassword($data['password'])) {
    ResponseHelper::validationError(['password' => 'Password must be at least 6 characters']);
  }

  // Check if user exists
  $user = new User();
  if ($user->findByEmail($data['email'])) {
    ResponseHelper::error('Email already registered', HTTP_CONFLICT);
  }

  // Create user
  $user->name = ValidationHelper::sanitizeInput($data['name']);
  $user->email = ValidationHelper::sanitizeInput($data['email']);
  $user->password = $data['password'];
  $user->avatar = null;
  $user->bio = null;
  $user->phone = null;

  if ($user->create()) {
    $db = new Database();
    $conn = $db->getConnection();

    // Get reader role ID
    $roleQuery = "SELECT id FROM roles WHERE name = 'reader'";
    $roleStmt = $conn->prepare($roleQuery);
    $roleStmt->execute();
    $readerRole = $roleStmt->fetch(PDO::FETCH_ASSOC);

    // Assign reader role by default
    $assignQuery = "INSERT INTO user_roles (user_id, role_id, approved, approved_at) 
                        VALUES (:user_id, :role_id, 1, NOW())";
    $assignStmt = $conn->prepare($assignQuery);
    $assignStmt->bindParam(':user_id', $user->id);
    $assignStmt->bindParam(':role_id', $readerRole['id']);
    $assignStmt->execute();

    // If user selected a role during registration, create pending application
    if (isset($data['selected_role']) && in_array($data['selected_role'], ['blogger', 'author'])) {
      $roleQuery = "SELECT id FROM roles WHERE name = :name";
      $roleStmt = $conn->prepare($roleQuery);
      $roleStmt->bindParam(':name', $data['selected_role']);
      $roleStmt->execute();
      $selectedRole = $roleStmt->fetch(PDO::FETCH_ASSOC);

      if ($selectedRole) {
        $applyQuery = "INSERT INTO user_roles (user_id, role_id, approved, applied_at) 
                               VALUES (:user_id, :role_id, 0, NOW())";
        $applyStmt = $conn->prepare($applyQuery);
        $applyStmt->bindParam(':user_id', $user->id);
        $applyStmt->bindParam(':role_id', $selectedRole['id']);
        $applyStmt->execute();
      }
    }

    // Generate verification token
    $verificationToken = bin2hex(random_bytes(32));
    $updateQuery = "UPDATE users SET verification_token = :token WHERE id = :id";
    $stmt = $conn->prepare($updateQuery);
    $stmt->bindParam(':token', $verificationToken);
    $stmt->bindParam(':id', $user->id);
    $stmt->execute();

    // Get user roles
    $userRoles = $user->getUserRoles($user->id);

    // Generate JWT
    $token = JWT::generate([
      'user_id' => $user->id,
      'email' => $user->email,
      'roles' => $userRoles
    ]);

    ResponseHelper::success([
      'user' => [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'roles' => $userRoles
      ],
      'token' => $token
    ], 'Registration successful', HTTP_CREATED);
  } else {
    ResponseHelper::error('Registration failed', HTTP_INTERNAL_ERROR);
  }
}
function login()
{
  $data = json_decode(file_get_contents("php://input"), true);

  $required = ['email', 'password'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  $user = new User();
  if (!$user->findByEmail($data['email'])) {
    ResponseHelper::error('Invalid credentials', HTTP_UNAUTHORIZED);
  }

  if (!password_verify($data['password'], $user->password)) {
    ResponseHelper::error('Invalid credentials', HTTP_UNAUTHORIZED);
  }

  if ($user->status !== STATUS_ACTIVE) {
    ResponseHelper::error('Account is ' . $user->status, HTTP_FORBIDDEN);
  }

  // Get user roles
  $roles = $user->getUserRoles($user->id);

  // Generate JWT
  $token = JWT::generate([
    'user_id' => $user->id,
    'email' => $user->email,
    'roles' => $roles
  ]);

  // Log activity
  $logQuery = "INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent) 
                 VALUES (:user_id, 'login', 'User logged in', :ip, :ua)";
  $db = new Database();
  $conn = $db->getConnection();
  $stmt = $conn->prepare($logQuery);
  $ip = $_SERVER['REMOTE_ADDR'];
  $ua = $_SERVER['HTTP_USER_AGENT'];
  $stmt->bindParam(':user_id', $user->id);
  $stmt->bindParam(':ip', $ip);
  $stmt->bindParam(':ua', $ua);
  $stmt->execute();

  ResponseHelper::success([
    'user' => [
      'id' => $user->id,
      'name' => $user->name,
      'email' => $user->email,
      'avatar' => $user->avatar,
      'roles' => $roles
    ],
    'token' => $token
  ], 'Login successful');
}
function logout()
{
  // In a stateless JWT system, logout is handled client-side
  // Just return success
  ResponseHelper::success(null, 'Logged out successfully');
}

function refresh()
{
  $payload = AuthMiddleware::authenticate();
  $newToken = JWT::generate([
    'user_id' => $payload['user_id'],
    'email' => $payload['email']
  ]);

  ResponseHelper::success(['token' => $newToken], 'Token refreshed');
}

function getMe()
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

function updateProfile()
{
  $user = AuthMiddleware::getAuthenticatedUser();
  $data = json_decode(file_get_contents("php://input"), true);

  if (isset($data['name'])) {
    $user->name = ValidationHelper::sanitizeInput($data['name']);
  }
  if (isset($data['bio'])) {
    $user->bio = ValidationHelper::sanitizeInput($data['bio']);
  }
  if (isset($data['phone'])) {
    $user->phone = ValidationHelper::sanitizeInput($data['phone']);
  }

  if ($user->update()) {
    ResponseHelper::success(null, 'Profile updated successfully');
  } else {
    ResponseHelper::error('Failed to update profile', HTTP_INTERNAL_ERROR);
  }
}

function changePassword()
{
  $user = AuthMiddleware::getAuthenticatedUser();
  $data = json_decode(file_get_contents("php://input"), true);

  $required = ['current_password', 'new_password'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  // Verify current password
  if (!password_verify($data['current_password'], $user->password)) {
    ResponseHelper::error('Current password is incorrect', HTTP_UNAUTHORIZED);
  }

  // Validate new password
  if (!ValidationHelper::validatePassword($data['new_password'])) {
    ResponseHelper::validationError(['new_password' => 'Password must be at least 6 characters']);
  }

  $user->password = $data['new_password'];
  if ($user->updatePassword()) {
    ResponseHelper::success(null, 'Password changed successfully');
  } else {
    ResponseHelper::error('Failed to change password', HTTP_INTERNAL_ERROR);
  }
}

function forgotPassword()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['email'])) {
    ResponseHelper::validationError(['email' => 'Email is required']);
  }

  $user = new User();
  if (!$user->findByEmail($data['email'])) {
    ResponseHelper::success(null, 'If the email exists, a reset link will be sent');
  }

  // Generate reset token
  $resetToken = bin2hex(random_bytes(32));
  $resetExpires = date('Y-m-d H:i:s', strtotime('+1 hour'));

  $db = new Database();
  $conn = $db->getConnection();
  $query = "UPDATE users SET reset_token = :token, reset_expires = :expires WHERE id = :id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':token', $resetToken);
  $stmt->bindParam(':expires', $resetExpires);
  $stmt->bindParam(':id', $user->id);
  $stmt->execute();

  // TODO: Send reset email

  ResponseHelper::success(null, 'If the email exists, a reset link will be sent');
}

function resetPassword()
{
  $data = json_decode(file_get_contents("php://input"), true);

  $required = ['token', 'new_password'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  $db = new Database();
  $conn = $db->getConnection();
  $query = "SELECT * FROM users WHERE reset_token = :token AND reset_expires > NOW()";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':token', $data['token']);
  $stmt->execute();

  if ($stmt->rowCount() === 0) {
    ResponseHelper::error('Invalid or expired reset token', HTTP_BAD_REQUEST);
  }

  $userData = $stmt->fetch(PDO::FETCH_ASSOC);
  $user = new User();
  $user->id = $userData['id'];
  $user->password = $data['new_password'];

  if ($user->updatePassword()) {
    // Clear reset token
    $clearQuery = "UPDATE users SET reset_token = NULL, reset_expires = NULL WHERE id = :id";
    $clearStmt = $conn->prepare($clearQuery);
    $clearStmt->bindParam(':id', $user->id);
    $clearStmt->execute();

    ResponseHelper::success(null, 'Password reset successfully');
  } else {
    ResponseHelper::error('Failed to reset password', HTTP_INTERNAL_ERROR);
  }
}

function verifyEmail()
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['token'])) {
    ResponseHelper::validationError(['token' => 'Verification token is required']);
  }

  $db = new Database();
  $conn = $db->getConnection();
  $query = "SELECT * FROM users WHERE verification_token = :token";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':token', $data['token']);
  $stmt->execute();

  if ($stmt->rowCount() === 0) {
    ResponseHelper::error('Invalid verification token', HTTP_BAD_REQUEST);
  }

  $userData = $stmt->fetch(PDO::FETCH_ASSOC);
  $user = new User();
  $user->id = $userData['id'];

  if ($user->verifyEmail()) {
    // Clear verification token
    $clearQuery = "UPDATE users SET verification_token = NULL WHERE id = :id";
    $clearStmt = $conn->prepare($clearQuery);
    $clearStmt->bindParam(':id', $user->id);
    $clearStmt->execute();

    ResponseHelper::success(null, 'Email verified successfully');
  } else {
    ResponseHelper::error('Failed to verify email', HTTP_INTERNAL_ERROR);
  }
}
