<?php
require_once __DIR__ . '/../config/database.php';

class Bookmark
{
  private $conn;
  private $table = 'bookmarks';

  public function __construct()
  {
    $database = new Database();
    $this->conn = $database->getConnection();
  }

  public function add($userId, $type, $contentId)
  {
    if ($type === 'blog') {
      $query = "INSERT INTO " . $this->table . " (user_id, blog_id) VALUES (:user_id, :content_id)";
    } elseif ($type === 'book') {
      $query = "INSERT INTO " . $this->table . " (user_id, book_id) VALUES (:user_id, :content_id)";
    } else {
      return false;
    }

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':content_id', $contentId);

    return $stmt->execute();
  }

  public function remove($userId, $type, $contentId)
  {
    if ($type === 'blog') {
      $query = "DELETE FROM " . $this->table . " WHERE user_id = :user_id AND blog_id = :content_id";
    } elseif ($type === 'book') {
      $query = "DELETE FROM " . $this->table . " WHERE user_id = :user_id AND book_id = :content_id";
    } else {
      return false;
    }

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':content_id', $contentId);

    return $stmt->execute();
  }

  public function getUserBookmarks($userId, $type = null)
  {
    if ($type === 'blog') {
      $query = "SELECT b.*, bl.title, bl.slug, bl.featured_image 
                      FROM " . $this->table . " b
                      JOIN blogs bl ON b.blog_id = bl.id
                      WHERE b.user_id = :user_id AND b.blog_id IS NOT NULL
                      ORDER BY b.created_at DESC";
    } elseif ($type === 'book') {
      $query = "SELECT b.*, bk.title, bk.slug, bk.cover_image, bk.author_id, u.name as author_name
                      FROM " . $this->table . " b
                      JOIN books bk ON b.book_id = bk.id
                      JOIN users u ON bk.author_id = u.id
                      WHERE b.user_id = :user_id AND b.book_id IS NOT NULL
                      ORDER BY b.created_at DESC";
    } else {
      $query = "SELECT b.*, 
                      bl.title as blog_title, bl.slug as blog_slug,
                      bk.title as book_title, bk.slug as book_slug
                      FROM " . $this->table . " b
                      LEFT JOIN blogs bl ON b.blog_id = bl.id
                      LEFT JOIN books bk ON b.book_id = bk.id
                      WHERE b.user_id = :user_id
                      ORDER BY b.created_at DESC";
    }

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();

    $bookmarks = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $bookmarks[] = $row;
    }
    return $bookmarks;
  }

  public function isBookmarked($userId, $type, $contentId)
  {
    if ($type === 'blog') {
      $query = "SELECT id FROM " . $this->table . " WHERE user_id = :user_id AND blog_id = :content_id";
    } else {
      $query = "SELECT id FROM " . $this->table . " WHERE user_id = :user_id AND book_id = :content_id";
    }

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':content_id', $contentId);
    $stmt->execute();

    return $stmt->rowCount() > 0;
  }
}
