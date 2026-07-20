<?php
require_once __DIR__ . '/../config/database.php';

class Payment
{
  private $conn;
  private $table = 'payments';

  public $id;
  public $user_id;
  public $book_id;
  public $subscription_id;
  public $amount;
  public $commission;
  public $author_earnings;
  public $payment_method;
  public $transaction_id;
  public $status;
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
                      book_id = :book_id,
                      subscription_id = :subscription_id,
                      amount = :amount,
                      commission = :commission,
                      author_earnings = :author_earnings,
                      payment_method = :payment_method,
                      transaction_id = :transaction_id,
                      status = :status";

    $stmt = $this->conn->prepare($query);

    $stmt->bindParam(':user_id', $this->user_id);
    $stmt->bindParam(':book_id', $this->book_id);
    $stmt->bindParam(':subscription_id', $this->subscription_id);
    $stmt->bindParam(':amount', $this->amount);
    $stmt->bindParam(':commission', $this->commission);
    $stmt->bindParam(':author_earnings', $this->author_earnings);
    $stmt->bindParam(':payment_method', $this->payment_method);
    $stmt->bindParam(':transaction_id', $this->transaction_id);
    $stmt->bindParam(':status', $this->status);

    if ($stmt->execute()) {
      $this->id = $this->conn->lastInsertId();
      return true;
    }
    return false;
  }

  public function getUserPayments($userId, $page = 1, $limit = 20)
  {
    $offset = ($page - 1) * $limit;
    $query = "SELECT * FROM " . $this->table . " 
                  WHERE user_id = :user_id 
                  ORDER BY created_at DESC 
                  LIMIT :limit OFFSET :offset";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $payments = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $payments[] = $row;
    }

    $countQuery = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE user_id = :user_id";
    $countStmt = $this->conn->prepare($countQuery);
    $countStmt->bindParam(':user_id', $userId);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    return [
      'payments' => $payments,
      'total' => $total
    ];
  }

  public function getAuthorEarnings($authorId)
  {
    $query = "SELECT SUM(author_earnings) as total FROM " . $this->table . " 
                  WHERE book_id IN (SELECT id FROM books WHERE author_id = :author_id) 
                  AND status = 'completed'";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':author_id', $authorId);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row['total'] ?? 0;
  }

  public function updateStatus($id, $status)
  {
    $query = "UPDATE " . $this->table . " SET status = :status WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':id', $id);
    return $stmt->execute();
  }
}
