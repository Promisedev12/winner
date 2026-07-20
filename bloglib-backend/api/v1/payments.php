<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Payment.php';
require_once __DIR__ . '/../../models/Subscription.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'], '/'));
$action = isset($request[1]) ? $request[1] : '';

switch ($method) {
  case 'GET':
    if ($action === 'my-payments') {
      getMyPayments();
    } elseif ($action === 'earnings') {
      getAuthorEarnings();
    } elseif ($action === 'subscription') {
      getMySubscription();
    } else {
      RoleMiddleware::requireAdmin();
      getAllPayments();
    }
    break;

  case 'POST':
    if ($action === 'subscribe') {
      createSubscription();
    } elseif ($action === 'purchase-book') {
      purchaseBook();
    } elseif ($action === 'cancel-subscription') {
      cancelSubscription();
    } else {
      ResponseHelper::error('Invalid action', HTTP_BAD_REQUEST);
    }
    break;

  default:
    ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

function getMyPayments()
{
  $user = AuthMiddleware::getAuthenticatedUser();
  $payment = new Payment();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;

  $result = $payment->getUserPayments($user->id, $page, $limit);

  ResponseHelper::success([
    'payments' => $result['payments'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function getAuthorEarnings()
{
  $user = AuthMiddleware::getAuthenticatedUser();

  // Check if user is author or admin
  $roles = $user->getUserRoles($user->id);
  if (!in_array(ROLE_AUTHOR, $roles) && !in_array(ROLE_ADMIN, $roles)) {
    ResponseHelper::forbidden('Only authors can view earnings');
  }

  $payment = new Payment();
  $totalEarnings = $payment->getAuthorEarnings($user->id);

  // Get monthly breakdown
  $db = new Database();
  $conn = $db->getConnection();
  $query = "SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                SUM(author_earnings) as earnings,
                COUNT(*) as sales
              FROM payments
              WHERE book_id IN (SELECT id FROM books WHERE author_id = :author_id)
              AND status = 'completed'
              GROUP BY DATE_FORMAT(created_at, '%Y-%m')
              ORDER BY month DESC
              LIMIT 12";
  $stmt = $conn->prepare($query);
  $stmt->bindParam(':author_id', $user->id);
  $stmt->execute();
  $monthly = $stmt->fetchAll(PDO::FETCH_ASSOC);

  ResponseHelper::success([
    'total_earnings' => $totalEarnings,
    'monthly_breakdown' => $monthly
  ]);
}

function getMySubscription()
{
  $user = AuthMiddleware::getAuthenticatedUser();
  $subscription = new Subscription();
  $current = $subscription->getUserSubscription($user->id);

  ResponseHelper::success($current);
}

function createSubscription()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  if (!isset($data['plan']) || !in_array($data['plan'], ['creator', 'enterprise'])) {
    ResponseHelper::validationError(['plan' => 'Valid plan is required']);
  }

  $prices = [
    'creator' => 12,
    'enterprise' => 99
  ];

  $subscription = new Subscription();
  $subscription->user_id = $user->id;
  $subscription->plan = $data['plan'];
  $subscription->price = $prices[$data['plan']];
  $subscription->status = 'active';
  $subscription->start_date = date('Y-m-d');
  $subscription->end_date = date('Y-m-d', strtotime('+1 month'));
  $subscription->payment_method = $data['payment_method'] ?? 'credit_card';

  if ($subscription->create()) {
    ResponseHelper::success(['subscription_id' => $subscription->id], 'Subscription created successfully');
  } else {
    ResponseHelper::error('Failed to create subscription', HTTP_INTERNAL_ERROR);
  }
}

function purchaseBook()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  if (!isset($data['book_id'])) {
    ResponseHelper::validationError(['book_id' => 'Book ID is required']);
  }

  // Get book details
  $book = new Book();
  if (!$book->findById($data['book_id'])) {
    ResponseHelper::notFound('Book');
  }

  if (!$book->is_premium) {
    ResponseHelper::error('This book is free', HTTP_BAD_REQUEST);
  }

  $commission = $book->price * (PLATFORM_COMMISSION / 100);
  $authorEarnings = $book->price * (AUTHOR_COMMISSION / 100);

  $payment = new Payment();
  $payment->user_id = $user->id;
  $payment->book_id = $book->id;
  $payment->amount = $book->price;
  $payment->commission = $commission;
  $payment->author_earnings = $authorEarnings;
  $payment->payment_method = $data['payment_method'] ?? 'credit_card';
  $payment->transaction_id = uniqid('txn_');
  $payment->status = 'completed';

  if ($payment->create()) {
    // Increment book downloads
    $book->incrementDownloads($book->id);

    ResponseHelper::success(['payment_id' => $payment->id], 'Purchase successful');
  } else {
    ResponseHelper::error('Payment failed', HTTP_INTERNAL_ERROR);
  }
}

function cancelSubscription()
{
  $user = AuthMiddleware::getAuthenticatedUser();
  $subscription = new Subscription();
  $current = $subscription->getUserSubscription($user->id);

  if (!$current) {
    ResponseHelper::error('No active subscription found', HTTP_NOT_FOUND);
  }

  if ($subscription->cancel($current['id'])) {
    ResponseHelper::success(null, 'Subscription cancelled successfully');
  } else {
    ResponseHelper::error('Failed to cancel subscription', HTTP_INTERNAL_ERROR);
  }
}

function getAllPayments()
{
  $db = new Database();
  $conn = $db->getConnection();

  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $offset = ($page - 1) * $limit;

  $query = "SELECT p.*, u.name as user_name, b.title as book_title
              FROM payments p
              LEFT JOIN users u ON p.user_id = u.id
              LEFT JOIN books b ON p.book_id = b.id
              ORDER BY p.created_at DESC
              LIMIT :limit OFFSET :offset";

  $stmt = $conn->prepare($query);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();

  $payments = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $payments[] = $row;
  }

  $countQuery = "SELECT COUNT(*) as total FROM payments";
  $countStmt = $conn->prepare($countQuery);
  $countStmt->execute();
  $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

  ResponseHelper::success([
    'payments' => $payments,
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $total,
      'last_page' => ceil($total / $limit)
    ]
  ]);
}
