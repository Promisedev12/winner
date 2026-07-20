<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';

$method = $_SERVER['REQUEST_METHOD'];
$request_body = file_get_contents('php://input');
$data = json_decode($request_body, true);

// Get action from path
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$action = explode('/', trim($path_info, '/'));
$action = !empty($action[0]) ? $action[0] : 'login';

// Handle different auth actions
switch ($action) {
    case 'register':
        handleRegister($data);
        break;
    
    case 'login':
        handleLogin($data);
        break;
    
    case 'logout':
        handleLogout();
        break;
    
    case 'refresh':
        handleRefresh();
        break;
    
    default:
        ResponseHelper::error('Invalid auth action', HTTP_BAD_REQUEST);
}

function handleRegister($data) {
    if (!isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
        ResponseHelper::error('Email, password, and name are required', HTTP_BAD_REQUEST);
    }

    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];
    $name = $data['name'];

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        ResponseHelper::error('Invalid email format', HTTP_BAD_REQUEST);
    }

    // Validate password (minimum 6 characters)
    if (strlen($password) < 6) {
        ResponseHelper::error('Password must be at least 6 characters', HTTP_BAD_REQUEST);
    }

    // Demo: Simulate user creation (In production, use actual database)
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    $user = [
        'id' => rand(1, 10000),
        'name' => $name,
        'email' => $email,
        'avatar' => null,
        'roles' => ['reader'],
        'status' => STATUS_ACTIVE,
        'created_at' => date('Y-m-d H:i:s')
    ];

    // Generate JWT token
    $token = generateToken($user);

    ResponseHelper::success('Registration successful', [
        'user' => $user,
        'token' => $token
    ], HTTP_CREATED);
}

function handleLogin($data) {
    if (!isset($data['email']) || !isset($data['password'])) {
        ResponseHelper::error('Email and password are required', HTTP_BAD_REQUEST);
    }

    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];

    // Demo: Simulate user lookup (In production, query database)
    // For demo purposes, accept any email/password combination
    if (strlen($email) === 0 || strlen($password) === 0) {
        ResponseHelper::error('Invalid credentials', HTTP_UNAUTHORIZED);
    }

    $user = [
        'id' => rand(1, 10000),
        'name' => explode('@', $email)[0],
        'email' => $email,
        'avatar' => null,
        'roles' => ['reader'],
        'status' => STATUS_ACTIVE,
        'created_at' => date('Y-m-d H:i:s')
    ];

    // Generate JWT token
    $token = generateToken($user);

    ResponseHelper::success('Login successful', [
        'user' => $user,
        'token' => $token
    ]);
}

function handleLogout() {
    // In production, you might want to invalidate the token
    ResponseHelper::success('Logout successful');
}

function handleRefresh() {
    // Get current token from headers
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

    if (!$token) {
        ResponseHelper::error('Token is required', HTTP_UNAUTHORIZED);
    }

    // Verify and refresh token
    $decoded = verifyToken($token);
    if (!$decoded) {
        ResponseHelper::error('Invalid or expired token', HTTP_UNAUTHORIZED);
    }

    $newToken = generateToken((array)$decoded);
    ResponseHelper::success('Token refreshed', ['token' => $newToken]);
}

function generateToken($user) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'iss' => JWT_ISSUER,
        'aud' => JWT_AUDIENCE,
        'iat' => time(),
        'exp' => time() + JWT_EXPIRY,
        'user' => $user
    ]);

    $headerEncoded = base64_encode($header);
    $payloadEncoded = base64_encode($payload);
    $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
    $signatureEncoded = base64_encode($signature);

    return "$headerEncoded.$payloadEncoded.$signatureEncoded";
}

function verifyToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }

    $headerEncoded = $parts[0];
    $payloadEncoded = $parts[1];
    $signatureEncoded = $parts[2];

    $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET, true);
    $signatureEncodedCheck = base64_encode($signature);

    if ($signatureEncoded !== $signatureEncodedCheck) {
        return false;
    }

    $payload = json_decode(base64_decode($payloadEncoded));
    if ($payload->exp < time()) {
        return false;
    }

    return $payload->user ?? null;
}
