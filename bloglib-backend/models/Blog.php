<?php
require_once __DIR__ . '/../config/database.php';

class Blog
{
  private $conn;
  private $table = 'blogs';

  public $id;
  public $title;
  public $slug;
  public $content;
  public $excerpt;
  public $featured_image;
  public $author_id;
  public $category_id;
  public $status;
  public $views;
  public $likes;
  public $scheduled_for;
  public $published_at;
  public $seo_title;
  public $seo_description;
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
                      slug = :slug,
                      content = :content,
                      excerpt = :excerpt,
                      featured_image = :featured_image,
                      author_id = :author_id,
                      category_id = :category_id,
                      status = :status,
                      scheduled_for = :scheduled_for,
                      published_at = :published_at,
                      seo_title = :seo_title,
                      seo_description = :seo_description";

    $stmt = $this->conn->prepare($query);

    $this->title = htmlspecialchars(strip_tags($this->title));
    $this->slug = htmlspecialchars(strip_tags($this->slug));
    $this->excerpt = htmlspecialchars(strip_tags($this->excerpt));

    $stmt->bindParam(':title', $this->title);
    $stmt->bindParam(':slug', $this->slug);
    $stmt->bindParam(':content', $this->content);
    $stmt->bindParam(':excerpt', $this->excerpt);
    $stmt->bindParam(':featured_image', $this->featured_image);
    $stmt->bindParam(':author_id', $this->author_id);
    $stmt->bindParam(':category_id', $this->category_id);
    $stmt->bindParam(':status', $this->status);
    $stmt->bindParam(':scheduled_for', $this->scheduled_for);
    $stmt->bindParam(':published_at', $this->published_at);
    $stmt->bindParam(':seo_title', $this->seo_title);
    $stmt->bindParam(':seo_description', $this->seo_description);

    if ($stmt->execute()) {
      $this->id = $this->conn->lastInsertId();
      return true;
    }
    return false;
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
      $this->title = $row['title'];
      $this->slug = $row['slug'];
      $this->content = $row['content'];
      $this->excerpt = $row['excerpt'];
      $this->featured_image = $row['featured_image'];
      $this->author_id = $row['author_id'];
      $this->category_id = $row['category_id'];
      $this->status = $row['status'];
      $this->views = $row['views'];
      $this->likes = $row['likes'];
      $this->scheduled_for = $row['scheduled_for'];
      $this->published_at = $row['published_at'];
      $this->seo_title = $row['seo_title'];
      $this->seo_description = $row['seo_description'];
      $this->created_at = $row['created_at'];
      $this->updated_at = $row['updated_at'];
      return true;
    }
    return false;
  }

  public function findBySlug($slug)
  {
    $query = "SELECT * FROM " . $this->table . " WHERE slug = :slug LIMIT 0,1";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':slug', $slug);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
      $this->id = $row['id'];
      $this->title = $row['title'];
      $this->slug = $row['slug'];
      $this->content = $row['content'];
      $this->excerpt = $row['excerpt'];
      $this->featured_image = $row['featured_image'];
      $this->author_id = $row['author_id'];
      $this->category_id = $row['category_id'];
      $this->status = $row['status'];
      $this->views = $row['views'];
      $this->likes = $row['likes'];
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
                      slug = :slug,
                      content = :content,
                      excerpt = :excerpt,
                      featured_image = :featured_image,
                      category_id = :category_id,
                      status = :status,
                      seo_title = :seo_title,
                      seo_description = :seo_description
                  WHERE id = :id";

    $stmt = $this->conn->prepare($query);

    $stmt->bindParam(':title', $this->title);
    $stmt->bindParam(':slug', $this->slug);
    $stmt->bindParam(':content', $this->content);
    $stmt->bindParam(':excerpt', $this->excerpt);
    $stmt->bindParam(':featured_image', $this->featured_image);
    $stmt->bindParam(':category_id', $this->category_id);
    $stmt->bindParam(':status', $this->status);
    $stmt->bindParam(':seo_title', $this->seo_title);
    $stmt->bindParam(':seo_description', $this->seo_description);
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

  public function incrementViews($id)
  {
    $query = "UPDATE " . $this->table . " SET views = views + 1 WHERE id = :id";
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

  public function getTags($blogId)
  {
    $query = "SELECT t.id, t.name, t.slug FROM tags t
                  JOIN blog_tags bt ON t.id = bt.tag_id
                  WHERE bt.blog_id = :blog_id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':blog_id', $blogId);
    $stmt->execute();

    $tags = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $tags[] = $row;
    }
    return $tags;
  }

  public function addTags($blogId, $tags)
  {
    foreach ($tags as $tagName) {
      // Check if tag exists
      $tagQuery = "SELECT id FROM tags WHERE name = :name";
      $tagStmt = $this->conn->prepare($tagQuery);
      $tagStmt->bindParam(':name', $tagName);
      $tagStmt->execute();

      if ($tagStmt->rowCount() > 0) {
        $tag = $tagStmt->fetch(PDO::FETCH_ASSOC);
        $tagId = $tag['id'];
      } else {
        // Create new tag
        $insertTag = "INSERT INTO tags (name, slug) VALUES (:name, :slug)";
        $insertStmt = $this->conn->prepare($insertTag);
        $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $tagName)));
        $insertStmt->bindParam(':name', $tagName);
        $insertStmt->bindParam(':slug', $slug);
        $insertStmt->execute();
        $tagId = $this->conn->lastInsertId();
      }

      // Associate tag with blog
      $linkQuery = "INSERT INTO blog_tags (blog_id, tag_id) VALUES (:blog_id, :tag_id)";
      $linkStmt = $this->conn->prepare($linkQuery);
      $linkStmt->bindParam(':blog_id', $blogId);
      $linkStmt->bindParam(':tag_id', $tagId);
      $linkStmt->execute();
    }
    return true;
  }

  public function deleteTags($blogId)
  {
    $query = "DELETE FROM blog_tags WHERE blog_id = :blog_id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':blog_id', $blogId);
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

    if (isset($filters['author']) && $filters['author']) {
      $query .= " AND b.author_id = :author";
      $params[':author'] = $filters['author'];
    }

    if (isset($filters['search']) && $filters['search']) {
      $query .= " AND (b.title LIKE :search OR b.content LIKE :search)";
      $params[':search'] = "%{$filters['search']}%";
    }

    $query .= " ORDER BY b.created_at DESC LIMIT :limit OFFSET :offset";

    $stmt = $this->conn->prepare($query);

    foreach ($params as $key => $value) {
      $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();

    $blogs = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $blogs[] = $row;
    }

    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE 1=1";
    // Add same filters to count query...
    $countStmt = $this->conn->prepare($countQuery);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    return [
      'blogs' => $blogs,
      'total' => $total
    ];
  }


  



  public function getUserBlogs($userId, $page = 1, $limit = 20)
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

    $blogs = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $blogs[] = $row;
    }

    $countQuery = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE author_id = :author_id";
    $countStmt = $this->conn->prepare($countQuery);
    $countStmt->bindParam(':author_id', $userId);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    return [
      'blogs' => $blogs,
      'total' => $total
    ];
  }
}
