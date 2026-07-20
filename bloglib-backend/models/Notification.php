<?php
require_once __DIR__ . '/../config/database.php';

class Notification
{
  private $conn;
  private $table = 'notifications';

  public $id;
  public $user_id;
  public $title;
  public $message;
  public $type;
  public $is_read;
  public $data;
  public $created_at;

  public function __construct()
  {
    $database = new Database();
    $this->conn = $database->getConnection();
  }

  public function create()
  {
    $query = "INSERT INTO " . $this->table . "
                  SET user_id = :user_id,
                      title = :title,
                      message = :message,
                      type = :type,
                      data = :data";

    $stmt = $this->conn->prepare($query);

    $this->title = htmlspecialchars(strip_tags($this->title));
    $this->message = htmlspecialchars(strip_tags($this->message));

    $stmt->bindParam(':user_id', $this->user_id);
    $stmt->bindParam(':title', $this->title);
    $stmt->bindParam(':message', $this->message);
    $stmt->bindParam(':type', $this->type);
    $stmt->bindParam(':data', $this->data);

    if ($stmt->execute()) {
      $this->id = $this->conn->lastInsertId();
      return true;
    }
    return false;
  }

  public function getUserNotifications($userId, $limit = 20)
  {
    $query = "SELECT * FROM " . $this->table . " 
                  WHERE user_id = :user_id 
                  ORDER BY created_at DESC 
                  LIMIT :limit";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();

    $notifications = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $notifications[] = $row;
    }
    return $notifications;
  }

  public function markAsRead($id)
  {
    $query = "UPDATE " . $this->table . " SET is_read = 1 WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $id);
    return $stmt->execute();
  }

  public function markAllAsRead($userId)
  {
    $query = "UPDATE " . $this->table . " SET is_read = 1 WHERE user_id = :user_id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    return $stmt->execute();
  }

  public function getUnreadCount($userId)
  {
    $query = "SELECT COUNT(*) as count FROM " . $this->table . " 
                  WHERE user_id = :user_id AND is_read = 0";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row['count'];
  }

  public function broadcast($title, $message, $type, $userIds = null)
  {
    if ($userIds === null) {
      // Send to all users
      $query = "INSERT INTO " . $this->table . " (user_id, title, message, type)
                      SELECT id, :title, :message, :type FROM users WHERE status = 'active'";
      $stmt = $this->conn->prepare($query);
      $stmt->bindParam(':title', $title);
      $stmt->bindParam(':message', $message);
      $stmt->bindParam(':type', $type);
      return $stmt->execute();
    } else {
      // Send to specific users
      $placeholders = implode(',', array_fill(0, count($userIds), '?'));
      $query = "INSERT INTO " . $this->table . " (user_id, title, message, type)
                      VALUES " . implode(',', array_fill(0, count($userIds), "(?, ?, ?, ?)"));
      $stmt = $this->conn->prepare($query);

      $params = [];
      foreach ($userIds as $userId) {
        $params[] = $userId;
        $params[] = $title;
        $params[] = $message;
        $params[] = $type;
      }
      return $stmt->execute($params);
    }
  }
}
