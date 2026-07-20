<?php
// Application configuration
session_start();

// Error reporting - disable in production
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('UTC');

// ============ HTTP STATUS CODES ============
if (!defined('HTTP_OK')) define('HTTP_OK', 200);
if (!defined('HTTP_CREATED')) define('HTTP_CREATED', 201);
if (!defined('HTTP_BAD_REQUEST')) define('HTTP_BAD_REQUEST', 400);
if (!defined('HTTP_UNAUTHORIZED')) define('HTTP_UNAUTHORIZED', 401);
if (!defined('HTTP_FORBIDDEN')) define('HTTP_FORBIDDEN', 403);
if (!defined('HTTP_NOT_FOUND')) define('HTTP_NOT_FOUND', 404);
if (!defined('HTTP_CONFLICT')) define('HTTP_CONFLICT', 409);
if (!defined('HTTP_UNPROCESSABLE')) define('HTTP_UNPROCESSABLE', 422);
if (!defined('HTTP_INTERNAL_ERROR')) define('HTTP_INTERNAL_ERROR', 500);

// ============ USER ROLES ============
if (!defined('ROLE_READER')) define('ROLE_READER', 'reader');
if (!defined('ROLE_BLOGGER')) define('ROLE_BLOGGER', 'blogger');
if (!defined('ROLE_AUTHOR')) define('ROLE_AUTHOR', 'author');
if (!defined('ROLE_ADMIN')) define('ROLE_ADMIN', 'admin');

// ============ USER STATUS ============
if (!defined('STATUS_ACTIVE')) define('STATUS_ACTIVE', 'active');
if (!defined('STATUS_SUSPENDED')) define('STATUS_SUSPENDED', 'suspended');
if (!defined('STATUS_BANNED')) define('STATUS_BANNED', 'banned');

// ============ BLOG STATUS ============
if (!defined('BLOG_DRAFT')) define('BLOG_DRAFT', 'draft');
if (!defined('BLOG_PUBLISHED')) define('BLOG_PUBLISHED', 'published');
if (!defined('BLOG_SCHEDULED')) define('BLOG_SCHEDULED', 'scheduled');
if (!defined('BLOG_ARCHIVED')) define('BLOG_ARCHIVED', 'archived');

// ============ BOOK STATUS ============
if (!defined('BOOK_DRAFT')) define('BOOK_DRAFT', 'draft');
if (!defined('BOOK_PUBLISHED')) define('BOOK_PUBLISHED', 'published');
if (!defined('BOOK_ARCHIVED')) define('BOOK_ARCHIVED', 'archived');

// ============ PAYMENT STATUS ============
if (!defined('PAYMENT_PENDING')) define('PAYMENT_PENDING', 'pending');
if (!defined('PAYMENT_COMPLETED')) define('PAYMENT_COMPLETED', 'completed');
if (!defined('PAYMENT_FAILED')) define('PAYMENT_FAILED', 'failed');
if (!defined('PAYMENT_REFUNDED')) define('PAYMENT_REFUNDED', 'refunded');

// ============ SUBSCRIPTION PLANS ============
if (!defined('PLAN_CREATOR')) define('PLAN_CREATOR', 'creator');
if (!defined('PLAN_ENTERPRISE')) define('PLAN_ENTERPRISE', 'enterprise');

// ============ CORS HEADERS ============
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  http_response_code(200);
  exit();
}

// ============ JWT CONFIGURATION ============
if (!defined('JWT_SECRET')) define('JWT_SECRET', 'your-super-secret-jwt-key-change-this-to-something-secure');
if (!defined('JWT_ISSUER')) define('JWT_ISSUER', 'bloglib-api');
if (!defined('JWT_AUDIENCE')) define('JWT_AUDIENCE', 'bloglib-client');
if (!defined('JWT_EXPIRY')) define('JWT_EXPIRY', 86400);

// ============ APP SETTINGS ============
if (!defined('APP_NAME')) define('APP_NAME', 'BlogLib API');
if (!defined('APP_VERSION')) define('APP_VERSION', '1.0.0');
if (!defined('API_BASE_URL')) define('API_BASE_URL', 'http://localhost/bloglib-backend/api/v1');

// ============ FILE UPLOAD SETTINGS ============
if (!defined('UPLOAD_DIR')) define('UPLOAD_DIR', __DIR__ . '/../uploads/');
if (!defined('MAX_FILE_SIZE')) define('MAX_FILE_SIZE', 50 * 1024 * 1024);
if (!defined('ALLOWED_IMAGE_TYPES')) define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp']);
if (!defined('ALLOWED_BOOK_TYPES')) define('ALLOWED_BOOK_TYPES', ['application/pdf', 'application/epub+zip']);

// ============ PAGINATION ============
if (!defined('ITEMS_PER_PAGE')) define('ITEMS_PER_PAGE', 20);

// ============ COMMISSION RATES ============
if (!defined('PLATFORM_COMMISSION')) define('PLATFORM_COMMISSION', 30);
if (!defined('AUTHOR_COMMISSION')) define('AUTHOR_COMMISSION', 70);

// ============ RATE LIMITING ============
if (!defined('RATE_LIMIT_REQUESTS')) define('RATE_LIMIT_REQUESTS', 100);
if (!defined('RATE_LIMIT_WINDOW')) define('RATE_LIMIT_WINDOW', 60);

// ============ DATABASE CONFIGURATION ============
if (!defined('DB_HOST')) define('DB_HOST', 'localhost');
if (!defined('DB_NAME')) define('DB_NAME', 'bloglib_db');
if (!defined('DB_USER')) define('DB_USER', 'root');
if (!defined('DB_PASS')) define('DB_PASS', '');

// ============ EMAIL CONFIGURATION ============
if (!defined('SMTP_HOST')) define('SMTP_HOST', 'smtp.gmail.com');
if (!defined('SMTP_PORT')) define('SMTP_PORT', 587);
if (!defined('SMTP_USER')) define('SMTP_USER', '');
if (!defined('SMTP_PASS')) define('SMTP_PASS', '');
if (!defined('SMTP_FROM')) define('SMTP_FROM', 'noreply@bloglib.com');

// ============ APP URLS ============
if (!defined('APP_URL')) define('APP_URL', 'http://localhost:3000');
