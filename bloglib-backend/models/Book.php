<?php
require_once __DIR__ . '/../config/database.php';

class Book
{
  private $conn;
  private $table = 'books';

  public $id;
  public $title;
  public $subtitle;
  public $slug;
  public $description;
  public $cover_image;
  public $file_url;
  public $file_type;
  public $author_id;
  public $category_id;
  public $price;
  public $is_premium;
  public $downloads;
  public $rating;
  public $reviews_count;
  public $pages;
  public $language;
  public $edition;
  public $isbn;
  public $status;
  public $published_at;
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
                  SET title = :title,
                      subtitle = :subtitle,
                      slug = :slug,
                      description = :description,
                      cover_image = :cover_image,
                      file_url = :file_url,
                      file_type = :file_type,
                      author_id = :author_id,
                      category_id = :category_id,
                      price = :price,
                      is_premium = :is_premium,
                      pages = :pages,
                      language = :language,
                      edition = :edition,
                      isbn = :isbn,
                      status = :status,
                      published_at = :published_at";

    $stmt = $this->conn->prepare($query);

    $this->title = htmlspecialchars(strip_tags($this->title));
    $this->slug = htmlspecialchars(strip_tags($this->slug));

    $stmt->bindParam(':title', $this->title);
    $stmt->bindParam(':subtitle', $this->subtitle);
    $stmt->bindParam(':slug', $this->slug);
    $stmt->bindParam(':description', $this->description);
    $stmt->bindParam(':cover_image', $this->cover_image);
    $stmt->bindParam(':file_url', $this->file_url);
    $stmt->bindParam(':file_type', $this->file_type);
    $stmt->bindParam(':author_id', $this->author_id);
    $stmt->bindParam(':category_id', $this->category_id);
    $stmt->bindParam(':price', $this->price);
    $stmt->bindParam(':is_premium', $this->is_premium);
    $stmt->bindParam(':pages', $this->pages);
    $stmt->bindParam(':language', $this->language);
    $stmt->bindParam(':edition', $this->edition);
    $stmt->bindParam(':isbn', $this->isbn);
    $stmt->bindParam(':status', $this->status);
    $stmt->bindParam(':published_at', $this->published_at);

    if ($stmt->execute()) {
      $this->id = $this->conn->lastInsertId();
      return true;
    }
    return false;
  }

  public function findById($id)
  {
    $query = "SELECT b.*, u.name as author_name, c.name as category_name 
                  FROM " . $this->table . " b
                  LEFT JOIN users u ON b.author_id = u.id
                  LEFT JOIN categories c ON b.category_id = c.id
                  WHERE b.id = :id LIMIT 0,1";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
      $this->id = $row['id'];
      $this->title = $row['title'];
      $this->subtitle = $row['subtitle'];
      $this->slug = $row['slug'];
      $this->description = $row['description'];
      $this->cover_image = $row['cover_image'];
      $this->file_url = $row['file_url'];
      $this->file_type = $row['file_type'];
      $this->author_id = $row['author_id'];
      $this->category_id = $row['category_id'];
      $this->price = $row['price'];
      $this->is_premium = $row['is_premium'];
      $this->downloads = $row['downloads'];
      $this->rating = $row['rating'];
      $this->reviews_count = $row['reviews_count'];
      $this->pages = $row['pages'];
      $this->language = $row['language'];
      $this->edition = $row['edition'];
      $this->isbn = $row['isbn'];
      $this->status = $row['status'];
      $this->published_at = $row['published_at'];
      $this->created_at = $row['created_at'];
      return true;
    }
    return false;
  }

  public function update()
  {
    $query = "UPDATE " . $this->table . "
                  SET title = :title,
                      subtitle = :subtitle,
                      slug = :slug,
                      description = :description,
                      cover_image = :cover_image,
                      category_id = :category_id,
                      price = :price,
                      is_premium = :is_premium,
                      pages = :pages,
                      language = :language,
                      edition = :edition,
                      isbn = :isbn,
                      status = :status
                  WHERE id = :id";

    $stmt = $this->conn->prepare($query);

    $stmt->bindParam(':title', $this->title);
    $stmt->bindParam(':subtitle', $this->subtitle);
    $stmt->bindParam(':slug', $this->slug);
    $stmt->bindParam(':description', $this->description);
    $stmt->bindParam(':cover_image', $this->cover_image);
    $stmt->bindParam(':category_id', $this->category_id);
    $stmt->bindParam(':price', $this->price);
    $stmt->bindParam(':is_premium', $this->is_premium);
    $stmt->bindParam(':pages', $this->pages);
    $stmt->bindParam(':language', $this->language);
    $stmt->bindParam(':edition', $this->edition);
    $stmt->bindParam(':isbn', $this->isbn);
    $stmt->bindParam(':status', $this->status);
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

  public function incrementDownloads($id)
  {
    $query = "UPDATE " . $this->table . " SET downloads = downloads + 1 WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $id);
    return $stmt->execute();
  }

  public function updateRating($id, $newRating)
  {
    $query = "UPDATE " . $this->table . " 
                  SET rating = (rating * reviews_count + :new_rating) / (reviews_count + 1),
                      reviews_count = reviews_count + 1
                  WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':new_rating', $newRating);
    $stmt->bindParam(':id', $id);
    return $stmt->execute();
  }

  public function getAll($page = 1, $limit = 20, $filters = [])
  {
    $offset = ($page - 1) * $limit;
    $query = "SELECT b.*, u.name as author_name, c.name as category_name 
                  FROM " . $this->table . " b
                  LEFT JOIN users u ON b.author_id = u.id
                  LEFT JOIN categories c ON b.category_id = c.id
                  WHERE 1=1";
    $params = [];

    if (isset($filters['status'])) {
      $query .= " AND b.status = :status";
      $params[':status'] = $filters['status'];
    }

    if (isset($filters['category']) && $filters['category']) {
      $query .= " AND b.category_id = :category";
      $params[':category'] = $filters['category'];
    }

    if (isset($filters['search']) && $filters['search']) {
      $query .= " AND (b.title LIKE :search OR b.description LIKE :search)";
      $params[':search'] = "%{$filters['search']}%";
    }

    if (isset($filters['is_premium'])) {
      $query .= " AND b.is_premium = :is_premium";
      $params[':is_premium'] = $filters['is_premium'];
    }

    $query .= " ORDER BY b.downloads DESC LIMIT :limit OFFSET :offset";

    $stmt = $this->conn->prepare($query);

    foreach ($params as $key => $value) {
      $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();

    $books = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $books[] = $row;
    }

    $countQuery = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE 1=1";
    $countStmt = $this->conn->prepare($countQuery);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    return [
      'books' => $books,
      'total' => $total
    ];
  }
  

  public function getUserBooks($userId, $page = 1, $limit = 20)
  {
    $offset = ($page - 1) * $limit;
    $query = "SELECT * FROM " . $this->table . " 
                  WHERE author_id = :author_id 
                  ORDER BY created_at DESC 
                  LIMIT :limit OFFSET :offset";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':author_id', $userId);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $books = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $books[] = $row;
    }

    $countQuery = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE author_id = :author_id";
    $countStmt = $this->conn->prepare($countQuery);
    $countStmt->bindParam(':author_id', $userId);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    return [
      'books' => $books,
      'total' => $total
    ];
  }
}
