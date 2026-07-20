<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Book.php';
require_once __DIR__ . '/../../models/Payment.php';
require_once __DIR__ . '/../../models/Comment.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/ValidationHelper.php';
require_once __DIR__ . '/../../helpers/Sanitizer.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

// Require author or admin role
RoleMiddleware::requireAuthor();

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
      case 'books':
        if ($id) {
          getBook($id, $user->id);
        } else {
          getBooks($user->id);
        }
        break;
      case 'royalties':
        getRoyalties($user->id);
        break;
      case 'transactions':
        getTransactions($user->id);
        break;
      case 'reviews':
        getReviews($user->id);
        break;
      case 'analytics':
        getAnalytics($user->id);
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
      case 'books':
        createBook($user->id);
        break;
      case 'upload-cover':
        uploadCover($user->id);
        break;
      case 'upload-book':
        uploadBookFile($user->id);
        break;
      case 'withdraw':
        requestWithdrawal($user->id);
        break;
      case 'reviews':
        if ($id && $subaction === 'reply') {
          replyToReview($id, $user->id);
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
      case 'books':
        if ($id) {
          updateBook($id, $user->id);
        } else {
          ResponseHelper::error('Book ID required', HTTP_BAD_REQUEST);
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
      case 'books':
        if ($id) {
          deleteBook($id, $user->id);
        } else {
          ResponseHelper::error('Book ID required', HTTP_BAD_REQUEST);
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

  // Get book stats
  $bookQuery = "SELECT 
                  COUNT(*) as total_books,
                  SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_books,
                  SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_books,
                  SUM(downloads) as total_downloads,
                  AVG(rating) as avg_rating,
                  SUM(reviews_count) as total_reviews
                FROM books WHERE author_id = :user_id";
  $bookStmt = $conn->prepare($bookQuery);
  $bookStmt->bindParam(':user_id', $userId);
  $bookStmt->execute();
  $bookStats = $bookStmt->fetch(PDO::FETCH_ASSOC);

  // Get revenue
  $revenueQuery = "SELECT 
                    COALESCE(SUM(author_earnings), 0) as total_earnings,
                    COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) THEN author_earnings ELSE 0 END), 0) as monthly_earnings
                  FROM payments 
                  WHERE book_id IN (SELECT id FROM books WHERE author_id = :user_id)
                  AND status = 'completed'";
  $revenueStmt = $conn->prepare($revenueQuery);
  $revenueStmt->bindParam(':user_id', $userId);
  $revenueStmt->execute();
  $revenueStats = $revenueStmt->fetch(PDO::FETCH_ASSOC);

  // Get recent books
  $recentQuery = "SELECT id, title, cover_image, status, downloads, rating, created_at 
                  FROM books 
                  WHERE author_id = :user_id 
                  ORDER BY created_at DESC 
                  LIMIT 5";
  $recentStmt = $conn->prepare($recentQuery);
  $recentStmt->bindParam(':user_id', $userId);
  $recentStmt->execute();
  $recentBooks = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

  // Get monthly downloads for chart
  $chartQuery = "SELECT 
                  DATE_FORMAT(created_at, '%b') as month,
                  SUM(downloads) as downloads
                FROM books
                WHERE author_id = :user_id AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY MONTH(created_at)
                ORDER BY created_at ASC";
  $chartStmt = $conn->prepare($chartQuery);
  $chartStmt->bindParam(':user_id', $userId);
  $chartStmt->execute();
  $chartData = $chartStmt->fetchAll(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'stats' => [
      'total_books' => (int)$bookStats['total_books'],
      'published_books' => (int)$bookStats['published_books'],
      'draft_books' => (int)$bookStats['draft_books'],
      'total_downloads' => (int)$bookStats['total_downloads'],
      'avg_rating' => $bookStats['avg_rating'] ? round($bookStats['avg_rating'], 1) : 0,
      'total_reviews' => (int)$bookStats['total_reviews'],
      'total_earnings' => (float)$revenueStats['total_earnings'],
      'monthly_earnings' => (float)$revenueStats['monthly_earnings']
    ],
    'chart_data' => $chartData,
    'recent_books' => $recentBooks
  ]);
}

function getBooks($userId)
{
  $book = new Book();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $status = isset($_GET['status']) ? $_GET['status'] : null;
  $search = isset($_GET['search']) ? $_GET['search'] : null;

  $result = $book->getUserBooks($userId, $page, $limit);

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

function getBook($id, $userId)
{
  $book = new Book();
  if (!$book->findById($id)) {
    ResponseHelper::notFound('Book');
  }

  if ($book->author_id != $userId) {
    ResponseHelper::forbidden('You can only view your own books');
  }

  ResponseHelper::success([
    'id' => $book->id,
    'title' => $book->title,
    'subtitle' => $book->subtitle,
    'slug' => $book->slug,
    'description' => $book->description,
    'cover_image' => $book->cover_image,
    'file_url' => $book->file_url,
    'file_type' => $book->file_type,
    'category_id' => $book->category_id,
    'price' => $book->price,
    'is_premium' => $book->is_premium,
    'pages' => $book->pages,
    'language' => $book->language,
    'edition' => $book->edition,
    'isbn' => $book->isbn,
    'status' => $book->status,
    'downloads' => $book->downloads,
    'rating' => $book->rating,
    'reviews_count' => $book->reviews_count,
    'created_at' => $book->created_at,
    'updated_at' => $book->updated_at
  ]);
}

function createBook($userId)
{
  $data = json_decode(file_get_contents("php://input"), true);

  $required = ['title', 'description', 'file_url'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  $book = new Book();
  $book->title = ValidationHelper::sanitizeInput($data['title']);
  $book->subtitle = isset($data['subtitle']) ? ValidationHelper::sanitizeInput($data['subtitle']) : null;
  $book->slug = Sanitizer::sanitizeSlug($data['title']);
  $book->description = $data['description'];
  $book->cover_image = isset($data['cover_image']) ? $data['cover_image'] : null;
  $book->file_url = $data['file_url'];
  $book->file_type = isset($data['file_type']) ? $data['file_type'] : 'pdf';
  $book->author_id = $userId;
  $book->category_id = isset($data['category_id']) ? (int)$data['category_id'] : null;
  $book->price = isset($data['price']) ? (float)$data['price'] : 0;
  $book->is_premium = isset($data['is_premium']) ? $data['is_premium'] : ($book->price > 0);
  $book->pages = isset($data['pages']) ? (int)$data['pages'] : null;
  $book->language = isset($data['language']) ? $data['language'] : 'English';
  $book->edition = isset($data['edition']) ? $data['edition'] : null;
  $book->isbn = isset($data['isbn']) ? $data['isbn'] : null;
  $book->status = isset($data['status']) ? $data['status'] : BOOK_DRAFT;

  if ($book->status === BOOK_PUBLISHED) {
    $book->published_at = date('Y-m-d H:i:s');
  }

  if ($book->create()) {
    ResponseHelper::success(['id' => $book->id], 'Book created successfully', HTTP_CREATED);
  } else {
    ResponseHelper::error('Failed to create book', HTTP_INTERNAL_ERROR);
  }
}

function updateBook($id, $userId)
{
  $data = json_decode(file_get_contents("php://input"), true);

  $book = new Book();
  if (!$book->findById($id)) {
    ResponseHelper::notFound('Book');
  }

  if ($book->author_id != $userId) {
    ResponseHelper::forbidden('You can only edit your own books');
  }

  if (isset($data['title'])) {
    $book->title = ValidationHelper::sanitizeInput($data['title']);
    $book->slug = Sanitizer::sanitizeSlug($data['title']);
  }
  if (isset($data['subtitle'])) {
    $book->subtitle = ValidationHelper::sanitizeInput($data['subtitle']);
  }
  if (isset($data['description'])) {
    $book->description = $data['description'];
  }
  if (isset($data['cover_image'])) {
    $book->cover_image = $data['cover_image'];
  }
  if (isset($data['category_id'])) {
    $book->category_id = (int)$data['category_id'];
  }
  if (isset($data['price'])) {
    $book->price = (float)$data['price'];
    $book->is_premium = $book->price > 0;
  }
  if (isset($data['pages'])) {
    $book->pages = (int)$data['pages'];
  }
  if (isset($data['language'])) {
    $book->language = $data['language'];
  }
  if (isset($data['edition'])) {
    $book->edition = $data['edition'];
  }
  if (isset($data['isbn'])) {
    $book->isbn = $data['isbn'];
  }
  if (isset($data['status'])) {
    $book->status = $data['status'];
    if ($book->status === BOOK_PUBLISHED && !$book->published_at) {
      $book->published_at = date('Y-m-d H:i:s');
    }
  }

  if ($book->update()) {
    ResponseHelper::success(null, 'Book updated successfully');
  } else {
    ResponseHelper::error('Failed to update book', HTTP_INTERNAL_ERROR);
  }
}

function deleteBook($id, $userId)
{
  $book = new Book();
  if (!$book->findById($id)) {
    ResponseHelper::notFound('Book');
  }

  if ($book->author_id != $userId) {
    ResponseHelper::forbidden('You can only delete your own books');
  }

  if ($book->delete()) {
    ResponseHelper::success(null, 'Book deleted successfully');
  } else {
    ResponseHelper::error('Failed to delete book', HTTP_INTERNAL_ERROR);
  }
}

function getRoyalties($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $range = isset($_GET['range']) ? $_GET['range'] : 'year';

  if ($range === 'month') {
    $query = "SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                SUM(author_earnings) as earnings,
                COUNT(*) as sales
              FROM payments
              WHERE book_id IN (SELECT id FROM books WHERE author_id = :user_id)
              AND status = 'completed'
              AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
              ORDER BY date ASC";
  } else {
    $query = "SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as date,
                SUM(author_earnings) as earnings,
                COUNT(*) as sales
              FROM payments
              WHERE book_id IN (SELECT id FROM books WHERE author_id = :user_id)
              AND status = 'completed'
              AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
              GROUP BY DATE_FORMAT(created_at, '%Y-%m')
              ORDER BY date ASC";
  }

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->execute();
  $earningsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Get total stats
  $totalQuery = "SELECT 
                  COALESCE(SUM(author_earnings), 0) as total_earnings,
                  COALESCE(SUM(author_earnings), 0) - COALESCE(SUM(author_earnings) * 0.3, 0) as platform_fee,
                  COUNT(*) as total_sales
                FROM payments
                WHERE book_id IN (SELECT id FROM books WHERE author_id = :user_id)
                AND status = 'completed'";
  $totalStmt = $conn->prepare($totalQuery);
  $totalStmt->bindParam(':user_id', $userId);
  $totalStmt->execute();
  $totalStats = $totalStmt->fetch(PDO::FETCH_ASSOC);

  // Get pending payout
  $pendingQuery = "SELECT 
                    COALESCE(SUM(author_earnings), 0) as pending
                  FROM payments
                  WHERE book_id IN (SELECT id FROM books WHERE author_id = :user_id)
                  AND status = 'pending'";
  $pendingStmt = $conn->prepare($pendingQuery);
  $pendingStmt->bindParam(':user_id', $userId);
  $pendingStmt->execute();
  $pendingStats = $pendingStmt->fetch(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'earnings_data' => $earningsData,
    'total_stats' => [
      'total_earnings' => (float)$totalStats['total_earnings'],
      'platform_fee' => (float)$totalStats['platform_fee'],
      'total_sales' => (int)$totalStats['total_sales'],
      'pending_payout' => (float)$pendingStats['pending']
    ]
  ]);
}

function getTransactions($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $offset = ($page - 1) * $limit;

  $query = "SELECT p.*, b.title as book_title, u.name as user_name
            FROM payments p
            JOIN books b ON p.book_id = b.id
            JOIN users u ON p.user_id = u.id
            WHERE b.author_id = :user_id
            ORDER BY p.created_at DESC
            LIMIT :limit OFFSET :offset";

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();

  $transactions = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $transactions[] = $row;
  }

  $countQuery = "SELECT COUNT(*) as total FROM payments p
                 JOIN books b ON p.book_id = b.id
                 WHERE b.author_id = :user_id";
  $countStmt = $conn->prepare($countQuery);
  $countStmt->bindParam(':user_id', $userId);
  $countStmt->execute();
  $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

  ResponseHelper::success([
    'transactions' => $transactions,
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $total,
      'last_page' => ceil($total / $limit)
    ]
  ]);
}

function getReviews($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $offset = ($page - 1) * $limit;
  $rating = isset($_GET['rating']) ? (int)$_GET['rating'] : null;

  $query = "SELECT c.*, u.name as user_name, u.avatar as user_avatar, b.title as book_title
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN books b ON c.book_id = b.id
            WHERE b.author_id = :user_id AND c.status = 'approved'";

  if ($rating) {
    $query .= " AND c.rating = :rating";
  }

  $query .= " ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset";

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  if ($rating) {
    $stmt->bindParam(':rating', $rating);
  }
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();

  $reviews = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $reviews[] = $row;
  }

  $countQuery = "SELECT COUNT(*) as total FROM comments c
                 JOIN books b ON c.book_id = b.id
                 WHERE b.author_id = :user_id AND c.status = 'approved'";
  $countStmt = $conn->prepare($countQuery);
  $countStmt->bindParam(':user_id', $userId);
  $countStmt->execute();
  $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

  // Get rating stats
  $ratingStatsQuery = "SELECT 
                        AVG(c.rating) as avg_rating,
                        COUNT(*) as total_reviews,
                        SUM(CASE WHEN c.rating = 5 THEN 1 ELSE 0 END) as five_star,
                        SUM(CASE WHEN c.rating = 4 THEN 1 ELSE 0 END) as four_star,
                        SUM(CASE WHEN c.rating = 3 THEN 1 ELSE 0 END) as three_star,
                        SUM(CASE WHEN c.rating = 2 THEN 1 ELSE 0 END) as two_star,
                        SUM(CASE WHEN c.rating = 1 THEN 1 ELSE 0 END) as one_star
                      FROM comments c
                      JOIN books b ON c.book_id = b.id
                      WHERE b.author_id = :user_id AND c.status = 'approved'";
  $ratingStatsStmt = $conn->prepare($ratingStatsQuery);
  $ratingStatsStmt->bindParam(':user_id', $userId);
  $ratingStatsStmt->execute();
  $ratingStats = $ratingStatsStmt->fetch(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'reviews' => $reviews,
    'rating_stats' => [
      'avg_rating' => $ratingStats['avg_rating'] ? round($ratingStats['avg_rating'], 1) : 0,
      'total_reviews' => (int)$ratingStats['total_reviews'],
      'five_star' => (int)$ratingStats['five_star'],
      'four_star' => (int)$ratingStats['four_star'],
      'three_star' => (int)$ratingStats['three_star'],
      'two_star' => (int)$ratingStats['two_star'],
      'one_star' => (int)$ratingStats['one_star']
    ],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $total,
      'last_page' => ceil($total / $limit)
    ]
  ]);
}

function replyToReview($id, $userId)
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['reply'])) {
    ResponseHelper::validationError(['reply' => 'Reply content is required']);
  }

  $db = new Database();
  $conn = $db->getConnection();

  // Get original review
  $reviewQuery = "SELECT c.*, b.author_id FROM comments c
                  JOIN books b ON c.book_id = b.id
                  WHERE c.id = :id AND c.status = 'approved'";
  $reviewStmt = $conn->prepare($reviewQuery);
  $reviewStmt->bindParam(':id', $id);
  $reviewStmt->execute();
  $review = $reviewStmt->fetch(PDO::FETCH_ASSOC);

  if (!$review) {
    ResponseHelper::notFound('Review');
  }

  if ($review['author_id'] != $userId) {
    ResponseHelper::forbidden('You can only reply to reviews on your own books');
  }

  $query = "INSERT INTO comments (content, user_id, book_id, parent_id, status) 
            VALUES (:content, :user_id, :book_id, :parent_id, 'approved')";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':content', $data['reply']);
  $stmt->bindParam(':user_id', $userId);
  $stmt->bindParam(':book_id', $review['book_id']);
  $stmt->bindParam(':parent_id', $id);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Reply posted successfully');
  } else {
    ResponseHelper::error('Failed to post reply', HTTP_INTERNAL_ERROR);
  }
}

function getAnalytics($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $range = isset($_GET['range']) ? $_GET['range'] : 'year';

  // Downloads by month
  if ($range === 'month') {
    $query = "SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                SUM(downloads) as downloads
              FROM books
              WHERE author_id = :user_id AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
              ORDER BY date ASC";
  } else {
    $query = "SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as date,
                SUM(downloads) as downloads
              FROM books
              WHERE author_id = :user_id AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
              GROUP BY DATE_FORMAT(created_at, '%Y-%m')
              ORDER BY date ASC";
  }

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->execute();
  $downloadsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Get top books
  $topQuery = "SELECT id, title, downloads, rating, reviews_count, price
               FROM books 
               WHERE author_id = :user_id AND status = 'published'
               ORDER BY downloads DESC 
               LIMIT 5";
  $topStmt = $conn->prepare($topQuery);
  $topStmt->bindParam(':user_id', $userId);
  $topStmt->execute();
  $topBooks = $topStmt->fetchAll(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'downloads_data' => $downloadsData,
    'top_books' => $topBooks
  ]);
}

function getSettings($userId)
{
  $db = new Database();
  $conn = $db->getConnection();

  $query = "SELECT * FROM author_settings WHERE user_id = :user_id";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->execute();
  $settings = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$settings) {
    $settings = [
      'notification_email' => true,
      'auto_approve_reviews' => false,
      'default_price' => 0,
      'currency' => 'USD'
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
  $checkQuery = "SELECT id FROM author_settings WHERE user_id = :user_id";
  $checkStmt = $conn->prepare($checkQuery);
  $checkStmt->bindParam(':user_id', $userId);
  $checkStmt->execute();

  if ($checkStmt->rowCount() > 0) {
    $query = "UPDATE author_settings SET 
              notification_email = :notification_email,
              auto_approve_reviews = :auto_approve_reviews,
              default_price = :default_price,
              currency = :currency
              WHERE user_id = :user_id";
  } else {
    $query = "INSERT INTO author_settings (user_id, notification_email, auto_approve_reviews, default_price, currency)
              VALUES (:user_id, :notification_email, :auto_approve_reviews, :default_price, :currency)";
  }

  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->bindValue(':notification_email', isset($data['notification_email']) ? (int)$data['notification_email'] : 1);
  $stmt->bindValue(':auto_approve_reviews', isset($data['auto_approve_reviews']) ? (int)$data['auto_approve_reviews'] : 0);
  $stmt->bindParam(':default_price', $data['default_price']);
  $stmt->bindParam(':currency', $data['currency']);
  $stmt->execute();

  ResponseHelper::success(null, 'Settings updated successfully');
}

function uploadCover($userId)
{
  // Handle file upload
  if (!isset($_FILES['cover']) || $_FILES['cover']['error'] !== UPLOAD_ERR_OK) {
    ResponseHelper::error('No file uploaded or upload error', HTTP_BAD_REQUEST);
  }

  $file = $_FILES['cover'];
  $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!in_array($file['type'], $allowedTypes)) {
    ResponseHelper::error('Invalid file type. Use JPEG, PNG, or WebP', HTTP_BAD_REQUEST);
  }

  if ($file['size'] > 5242880) {
    ResponseHelper::error('File too large. Max size: 5MB', HTTP_BAD_REQUEST);
  }

  $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
  $filename = 'cover_' . $userId . '_' . time() . '.' . $extension;
  $uploadPath = UPLOAD_DIR . 'covers/' . $filename;

  if (!file_exists(UPLOAD_DIR . 'covers/')) {
    mkdir(UPLOAD_DIR . 'covers/', 0777, true);
  }

  if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
    ResponseHelper::success([
      'url' => '/uploads/covers/' . $filename,
      'filename' => $filename
    ], 'Cover uploaded successfully');
  } else {
    ResponseHelper::error('Failed to upload file', HTTP_INTERNAL_ERROR);
  }
}

function uploadBookFile($userId)
{
  if (!isset($_FILES['book']) || $_FILES['book']['error'] !== UPLOAD_ERR_OK) {
    ResponseHelper::error('No file uploaded or upload error', HTTP_BAD_REQUEST);
  }

  $file = $_FILES['book'];
  $allowedTypes = ['application/pdf', 'application/epub+zip'];

  if (!in_array($file['type'], $allowedTypes)) {
    ResponseHelper::error('Invalid file type. Use PDF or EPUB', HTTP_BAD_REQUEST);
  }

  if ($file['size'] > 52428800) {
    ResponseHelper::error('File too large. Max size: 50MB', HTTP_BAD_REQUEST);
  }

  $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
  $filename = 'book_' . $userId . '_' . time() . '.' . $extension;
  $uploadPath = UPLOAD_DIR . 'books/' . $filename;

  if (!file_exists(UPLOAD_DIR . 'books/')) {
    mkdir(UPLOAD_DIR . 'books/', 0777, true);
  }

  if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
    ResponseHelper::success([
      'url' => '/uploads/books/' . $filename,
      'filename' => $filename,
      'type' => $file['type']
    ], 'Book file uploaded successfully');
  } else {
    ResponseHelper::error('Failed to upload file', HTTP_INTERNAL_ERROR);
  }
}

function requestWithdrawal($userId)
{
  $data = json_decode(file_get_contents("php://input"), true);

  if (!isset($data['amount']) || !isset($data['method'])) {
    ResponseHelper::validationError(['amount' => 'Amount and method are required']);
  }

  if ($data['amount'] < 50) {
    ResponseHelper::error('Minimum withdrawal amount is $50', HTTP_BAD_REQUEST);
  }

  // Check available balance
  $db = new Database();
  $conn = $db->getConnection();

  $balanceQuery = "SELECT COALESCE(SUM(author_earnings), 0) as total
                   FROM payments
                   WHERE book_id IN (SELECT id FROM books WHERE author_id = :user_id)
                   AND status = 'completed'";
  $balanceStmt = $conn->prepare($balanceQuery);
  $balanceStmt->bindParam(':user_id', $userId);
  $balanceStmt->execute();
  $balance = $balanceStmt->fetch(PDO::FETCH_ASSOC);

  if ($data['amount'] > $balance['total']) {
    ResponseHelper::error('Insufficient balance', HTTP_BAD_REQUEST);
  }

  // Create withdrawal request
  $query = "INSERT INTO withdrawals (user_id, amount, method, status, requested_at) 
            VALUES (:user_id, :amount, :method, 'pending', NOW())";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':user_id', $userId);
  $stmt->bindParam(':amount', $data['amount']);
  $stmt->bindParam(':method', $data['method']);

  if ($stmt->execute()) {
    ResponseHelper::success(null, 'Withdrawal request submitted successfully');
  } else {
    ResponseHelper::error('Failed to submit withdrawal request', HTTP_INTERNAL_ERROR);
  }
}
