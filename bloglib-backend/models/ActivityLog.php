<?php
require_once __DIR__ . '/../config/database.php';

class ActivityLog
{
  private $conn;
  private $table = 'activity_logs';

  public function __construct()
  {
    $database = new Database();
    $this->conn = $database->getConnection();
  }

  public function log($userId, $action, $details = null, $ipAddress = null, $userAgent = null)
  {
    $query = "INSERT INTO " . $this->table . "
                  SET user_id = :user_id,
                      action = :action,
                      details = :details,
                      ip_address = :ip_address,
                      user_agent = :user_agent";

    $stmt = $this->conn->prepare($query);

    $ipAddress = $ipAddress ?? $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $userAgent ?? $_SERVER['HTTP_USER_AGENT'] ?? null;

    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':action', $action);
    $stmt->bindParam(':details', $details);
    $stmt->bindParam(':ip_address', $ipAddress);
    $stmt->bindParam(':user_agent', $userAgent);

    return $stmt->execute();
  }

  public function getLogs($page = 1, $limit = 50, $filters = [])
  {
    $offset = ($page - 1) * $limit;
    $query = "SELECT al.*, u.name as user_name 
                  FROM " . $this->table . " al
                  LEFT JOIN users u ON al.user_id = u.id
                  WHERE 1=1";
    $params = [];

    if (isset($filters['user_id'])) {
      $query .= " AND al.user_id = :user_id";
      $params[':user_id'] = $filters['user_id'];
    }

    if (isset($filters['action'])) {
      $query .= " AND al.action LIKE :action";
      $params[':action'] = "%{$filters['action']}%";
    }

    if (isset($filters['date_from'])) {
      $query .= " AND al.created_at >= :date_from";
      $params[':date_from'] = $filters['date_from'];
    }

    if (isset($filters['date_to'])) {
      $query .= " AND al.created_at <= :date_to";
      $params[':date_to'] = $filters['date_to'];
    }

    $query .= " ORDER BY al.created_at DESC LIMIT :limit OFFSET :offset";

    $stmt = $this->conn->prepare($query);

    foreach ($params as $key => $value) {
      $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();

    $logs = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $logs[] = $row;
    }

    $countQuery = "SELECT COUNT(*) as total FROM " . $this->table;
    $countStmt = $this->conn->prepare($countQuery);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    return [
      'logs' => $logs,
      'total' => $total
    ];
  }

  public function cleanup($days = 30)
  {
    $query = "DELETE FROM " . $this->table . " WHERE created_at < DATE_SUB(NOW(), INTERVAL :days DAY)";
    $stmt = $this->conn->prepare($query);
    $stmt->bindValue(':days', $days, PDO::PARAM_INT);
    return $stmt->execute();
  }
}
