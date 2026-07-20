<?php
require_once __DIR__ . '/../config/database.php';

class Subscription
{
  private $conn;
  private $table = 'subscriptions';

  public $id;
  public $user_id;
  public $plan;
  public $price;
  public $status;
  public $start_date;
  public $end_date;
  public $payment_method;
  public $created_at;
  public $updated_at;

  public function __construct()
  {
    $database = new Database();
    $this->conn = $database->getConnection();
  }

  public function create()
  {
    $query = "INSERT INTO " . $this->table . "
                  SET user_id = :user_id,
                      plan = :plan,
                      price = :price,
                      status = :status,
                      start_date = :start_date,
                      end_date = :end_date,
                      payment_method = :payment_method";

    $stmt = $this->conn->prepare($query);

    $stmt->bindParam(':user_id', $this->user_id);
    $stmt->bindParam(':plan', $this->plan);
    $stmt->bindParam(':price', $this->price);
    $stmt->bindParam(':status', $this->status);
    $stmt->bindParam(':start_date', $this->start_date);
    $stmt->bindParam(':end_date', $this->end_date);
    $stmt->bindParam(':payment_method', $this->payment_method);

    if ($stmt->execute()) {
      $this->id = $this->conn->lastInsertId();
      return true;
    }
    return false;
  }

  public function getUserSubscription($userId)
  {
    $query = "SELECT * FROM " . $this->table . " 
                  WHERE user_id = :user_id AND status = 'active' 
                  ORDER BY created_at DESC LIMIT 0,1";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
      $this->id = $row['id'];
      $this->user_id = $row['user_id'];
      $this->plan = $row['plan'];
      $this->price = $row['price'];
      $this->status = $row['status'];
      $this->start_date = $row['start_date'];
      $this->end_date = $row['end_date'];
      $this->payment_method = $row['payment_method'];
      return $row;
    }
    return null;
  }

  public function cancel($id)
  {
    $query = "UPDATE " . $this->table . " SET status = 'cancelled' WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $id);
    return $stmt->execute();
  }

  public function getAll($page = 1, $limit = 20)
  {
    $offset = ($page - 1) * $limit;
    $query = "SELECT s.*, u.name as user_name, u.email as user_email 
                  FROM " . $this->table . " s
                  JOIN users u ON s.user_id = u.id
                  ORDER BY s.created_at DESC 
                  LIMIT :limit OFFSET :offset";

    $stmt = $this->conn->prepare($query);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $subscriptions = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $subscriptions[] = $row;
    }

    $countQuery = "SELECT COUNT(*) as total FROM " . $this->table;
    $countStmt = $this->conn->prepare($countQuery);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    return [
      'subscriptions' => $subscriptions,
      'total' => $total
    ];
  }
}
