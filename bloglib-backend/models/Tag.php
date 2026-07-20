<?php
require_once __DIR__ . '/../config/database.php';

class Tag
{
  private $conn;
  private $table = 'tags';

  public function __construct()
  {
    $database = new Database();
    $this->conn = $database->getConnection();
  }

  public function getAll()
  {
    $query = "SELECT * FROM " . $this->table . " ORDER BY name";
    $stmt = $this->conn->prepare($query);
    $stmt->execute();

    $tags = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $tags[] = $row;
    }
    return $tags;
  }

  public function getPopular($limit = 20)
  {
    $query = "SELECT t.*, COUNT(bt.blog_id) as usage_count
                  FROM " . $this->table . " t
                  LEFT JOIN blog_tags bt ON t.id = bt.tag_id
                  GROUP BY t.id
                  ORDER BY usage_count DESC
                  LIMIT :limit";
    $stmt = $this->conn->prepare($query);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();

    $tags = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $tags[] = $row;
    }
    return $tags;
  }

  public function findOrCreate($name)
  {
    $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $name)));

    // Check if exists
    $query = "SELECT id FROM " . $this->table . " WHERE name = :name OR slug = :slug";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':slug', $slug);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $row = $stmt->fetch(PDO::FETCH_ASSOC);
      return $row['id'];
    }

    // Create new tag
    $insertQuery = "INSERT INTO " . $this->table . " (name, slug) VALUES (:name, :slug)";
    $insertStmt = $this->conn->prepare($insertQuery);
    $insertStmt->bindParam(':name', $name);
    $insertStmt->bindParam(':slug', $slug);
    $insertStmt->execute();

    return $this->conn->lastInsertId();
  }

  public function getBlogsByTag($tagSlug, $page = 1, $limit = 20)
  {
    $offset = ($page - 1) * $limit;
    $query = "SELECT b.*, u.name as author_name
                  FROM blogs b
                  JOIN blog_tags bt ON b.id = bt.blog_id
                  JOIN tags t ON bt.tag_id = t.id
                  JOIN users u ON b.author_id = u.id
                  WHERE t.slug = :slug AND b.status = 'published'
                  ORDER BY b.published_at DESC
                  LIMIT :limit OFFSET :offset";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':slug', $tagSlug);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $blogs = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $blogs[] = $row;
    }

    $countQuery = "SELECT COUNT(*) as total
                       FROM blogs b
                       JOIN blog_tags bt ON b.id = bt.blog_id
                       JOIN tags t ON bt.tag_id = t.id
                       WHERE t.slug = :slug AND b.status = 'published'";
    $countStmt = $this->conn->prepare($countQuery);
    $countStmt->bindParam(':slug', $tagSlug);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    return [
      'blogs' => $blogs,
      'total' => $total
    ];
  }
}
