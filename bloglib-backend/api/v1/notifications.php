<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Notification.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($path_info, '/'));
$action = isset($request[0]) ? $request[0] : '';

$user = AuthMiddleware::getAuthenticatedUser();
$notification = new Notification();

switch ($method) {
  case 'GET':
    if ($action === 'my') {
      getMyNotifications();
    } elseif ($action === 'unread-count') {
      getUnreadCount();
    } else {
      ResponseHelper::error('Invalid action', HTTP_BAD_REQUEST);
    }
    break;

  case 'PUT':
    if ($action === 'mark-read') {
      markAsRead();
    } elseif ($action === 'mark-all-read') {
      markAllAsRead();
    } else {
      ResponseHelper::error('Invalid action', HTTP_BAD_REQUEST);
    }
    break;

  default:
    ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

function getMyNotifications()
{
  global $notification, $user;

  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
  $notifications = $notification->getUserNotifications($user->id, $limit);

  ResponseHelper::success($notifications);
}

function getUnreadCount()
{
  global $notification, $user;

  $count = $notification->getUnreadCount($user->id);

  ResponseHelper::success(['unread_count' => $count]);
}

function markAsRead()
{
  $data = json_decode(file_get_contents("php://input"), true);
  global $notification;

  if (!isset($data['notification_id'])) {
    ResponseHelper::validationError(['notification_id' => 'Notification ID is required']);
  }

  if ($notification->markAsRead($data['notification_id'])) {
    ResponseHelper::success(null, 'Notification marked as read');
  } else {
    ResponseHelper::error('Failed to mark notification as read', HTTP_INTERNAL_ERROR);
  }
}

function markAllAsRead()
{
  global $notification, $user;

  if ($notification->markAllAsRead($user->id)) {
    ResponseHelper::success(null, 'All notifications marked as read');
  } else {
    ResponseHelper::error('Failed to mark notifications as read', HTTP_INTERNAL_ERROR);
  }
}
