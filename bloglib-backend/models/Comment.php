<?php
require_once __DIR__ . '/../config/database.php';

class Comment
{
  private $conn;
  private $table = 'comments';

  public $id;
  public $content;
  public $user_id;
  public $blog_id;
  public $book_id;
  public $parent_id;
  public $likes;
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
                  SET content = :content,
                      user_id = :user_id,
                      blog_id = :blog_id,
                      book_id = :book_id,
                      parent_id = :parent_id,
                      status = :status";

    $stmt = $this->conn->prepare($query);

    $this->content = htmlspecialchars(strip_tags($this->content));

    $stmt->bindParam(':content', $this->content);
    $stmt->bindParam(':user_id', $this->user_id);
    $stmt->bindParam(':blog_id', $this->blog_id);
    $stmt->bindParam(':book_id', $this->book_id);
    $stmt->bindParam(':parent_id', $this->parent_id);
    $stmt->bindParam(':status', $this->status);

    if ($stmt->execute()) {
      $this->id = $this->conn->lastInsertId();
      return true;
    }
    return false;
  }

  public function findById($id)
  {
    $query = "SELECT c.*, u.name as user_name, u.avatar as user_avatar 
                  FROM " . $this->table . " c
                  LEFT JOIN users u ON c.user_id = u.id
                  WHERE c.id = :id LIMIT 0,1";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
      $this->id = $row['id'];
      $this->content = $row['content'];
      $this->user_id = $row['user_id'];
      $this->blog_id = $row['blog_id'];
      $this->book_id = $row['book_id'];
      $this->parent_id = $row['parent_id'];
      $this->likes = $row['likes'];
      $this->status = $row['status'];
      $this->created_at = $row['created_at'];
      return $row;
    }
    return null;
  }

  public function getBlogComments($blogId, $page = 1, $limit = 20)
  {
    $offset = ($page - 1) * $limit;
    $query = "SELECT c.*, u.name as user_name, u.avatar as user_avatar 
                  FROM " . $this->table . " c
                  LEFT JOIN users u ON c.user_id = u.id
                  WHERE c.blog_id = :blog_id AND c.status = 'approved'
                  ORDER BY c.created_at DESC
                  LIMIT :limit OFFSET :offset";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':blog_id', $blogId);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $comments = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $comments[] = $row;
    }

    $countQuery = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE blog_id = :blog_id AND status = 'approved'";
    $countStmt = $this->conn->prepare($countQuery);
    $countStmt->bindParam(':blog_id', $blogId);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    return [
      'comments' => $comments,
      'total' => $total
    ];
  }

  public function approve($id)
  {
    $query = "UPDATE " . $this->table . " SET status = 'approved' WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $id);
    return $stmt->execute();
  }

  public function reject($id)
  {
    $query = "DELETE FROM " . $this->table . " WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $id);
    return $stmt->execute();
  }

  public function incrementLikes($id)
  {
    $query = "UPDATE " . $this->table . " SET likes = likes + 1 WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $id);
    return $stmt->execute();
  }
}
