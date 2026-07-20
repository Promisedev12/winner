<?php
require_once __DIR__ . '/../config/database.php';

class Category
{
  private $conn;
  private $table = 'categories';

  public $id;
  public $name;
  public $slug;
  public $description;
  public $created_at;

  public function __construct()
  {
    $database = new Database();
    $this->conn = $database->getConnection();
  }

  public function create()
  {
    $query = "INSERT INTO " . $this->table . " SET name = :name, slug = :slug, description = :description";
    $stmt = $this->conn->prepare($query);

    $this->name = htmlspecialchars(strip_tags($this->name));
    $this->slug = htmlspecialchars(strip_tags($this->slug));

    $stmt->bindParam(':name', $this->name);
    $stmt->bindParam(':slug', $this->slug);
    $stmt->bindParam(':description', $this->description);

    if ($stmt->execute()) {
      $this->id = $this->conn->lastInsertId();
      return true;
    }
    return false;
  }

  public function getAll()
  {
    $query = "SELECT * FROM " . $this->table . " ORDER BY name";
    $stmt = $this->conn->prepare($query);
    $stmt->execute();

    $categories = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $categories[] = $row;
    }
    return $categories;
  }

  public function findById($id)
  {
    $query = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 0,1";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
      $this->id = $row['id'];
      $this->name = $row['name'];
      $this->slug = $row['slug'];
      $this->description = $row['description'];
      return true;
    }
    return false;
  }

  public function update()
  {
    $query = "UPDATE " . $this->table . " SET name = :name, slug = :slug, description = :description WHERE id = :id";
    $stmt = $this->conn->prepare($query);

    $stmt->bindParam(':name', $this->name);
    $stmt->bindParam(':slug', $this->slug);
    $stmt->bindParam(':description', $this->description);
    $stmt->bindParam(':id', $this->id);

    return $stmt->execute();
  }

  public function delete()
  {
    $query = "DELETE FROM " . $this->table . " WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $this->id);
    return $stmt->execute();
  }

  public function getBlogCount($categoryId)
  {
    $query = "SELECT COUNT(*) as count FROM blogs WHERE category_id = :category_id AND status = 'published'";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':category_id', $categoryId);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row['count'];
  }
}
