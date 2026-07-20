<?php
require_once __DIR__ . '/../config/database.php';

class User
{
  private $conn;
  private $table = 'users';

  public $id;
  public $name;
  public $email;
  public $password;
  public $avatar;
  public $bio;
  public $phone;
  public $email_verified;
  public $status;
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
                  SET name = :name,
                      email = :email,
                      password = :password,
                      avatar = :avatar,
                      bio = :bio,
                      phone = :phone";

    $stmt = $this->conn->prepare($query);

    $this->name = htmlspecialchars(strip_tags($this->name));
    $this->email = htmlspecialchars(strip_tags($this->email));
    $this->password = password_hash($this->password, PASSWORD_BCRYPT);

    $stmt->bindParam(':name', $this->name);
    $stmt->bindParam(':email', $this->email);
    $stmt->bindParam(':password', $this->password);
    $stmt->bindParam(':avatar', $this->avatar);
    $stmt->bindParam(':bio', $this->bio);
    $stmt->bindParam(':phone', $this->phone);

    if ($stmt->execute()) {
      $this->id = $this->conn->lastInsertId();
      return true;
    }

    return false;
  }

  public function findByEmail($email)
  {
    $query = "SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 0,1";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
      $this->id = $row['id'];
      $this->name = $row['name'];
      $this->email = $row['email'];
      $this->password = $row['password'];
      $this->avatar = $row['avatar'];
      $this->bio = $row['bio'];
      $this->phone = $row['phone'];
      $this->email_verified = $row['email_verified'];
      $this->status = $row['status'];
      $this->created_at = $row['created_at'];
      $this->updated_at = $row['updated_at'];
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
      $this->name = $row['name'];
      $this->email = $row['email'];
      $this->avatar = $row['avatar'];
      $this->bio = $row['bio'];
      $this->phone = $row['phone'];
      $this->email_verified = $row['email_verified'];
      $this->status = $row['status'];
      $this->created_at = $row['created_at'];
      $this->updated_at = $row['updated_at'];
      return true;
    }

    return false;
  }

  public function update()
  {
    $query = "UPDATE " . $this->table . "
                  SET name = :name,
                      avatar = :avatar,
                      bio = :bio,
                      phone = :phone
                  WHERE id = :id";

    $stmt = $this->conn->prepare($query);

    $this->name = htmlspecialchars(strip_tags($this->name));

    $stmt->bindParam(':name', $this->name);
    $stmt->bindParam(':avatar', $this->avatar);
    $stmt->bindParam(':bio', $this->bio);
    $stmt->bindParam(':phone', $this->phone);
    $stmt->bindParam(':id', $this->id);

    return $stmt->execute();
  }

  public function updatePassword()
  {
    $query = "UPDATE " . $this->table . " SET password = :password WHERE id = :id";
    $stmt = $this->conn->prepare($query);

    $this->password = password_hash($this->password, PASSWORD_BCRYPT);

    $stmt->bindParam(':password', $this->password);
    $stmt->bindParam(':id', $this->id);

    return $stmt->execute();
  }

  public function verifyEmail()
  {
    $query = "UPDATE " . $this->table . " SET email_verified = 1 WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $this->id);
    return $stmt->execute();
  }

  public function getUserRoles($userId)
  {
    $query = "SELECT r.name FROM user_roles ur 
                  JOIN roles r ON ur.role_id = r.id 
                  WHERE ur.user_id = :user_id AND ur.approved = 1";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();

    $roles = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $roles[] = $row['name'];
    }

    return $roles;
  }

  public function hasRole($userId, $role)
  {
    $roles = $this->getUserRoles($userId);
    return in_array($role, $roles);
  }

  public function getAll($page = 1, $limit = 20, $filters = [])
  {
    $offset = ($page - 1) * $limit;
    $query = "SELECT * FROM " . $this->table . " WHERE 1=1";
    $params = [];

    if (isset($filters['role'])) {
      $query .= " AND id IN (SELECT user_id FROM user_roles ur 
                       JOIN roles r ON ur.role_id = r.id WHERE r.name = :role)";
      $params[':role'] = $filters['role'];
    }

    if (isset($filters['status'])) {
      $query .= " AND status = :status";
      $params[':status'] = $filters['status'];
    }

    if (isset($filters['search'])) {
      $query .= " AND (name LIKE :search OR email LIKE :search)";
      $params[':search'] = "%{$filters['search']}%";
    }

    $query .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";

    $stmt = $this->conn->prepare($query);

    foreach ($params as $key => $value) {
      $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();

    $users = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      unset($row['password']);
      $users[] = $row;
    }

    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE 1=1";
    // Add same filters...
    $countStmt = $this->conn->prepare($countQuery);
    $countStmt->execute();
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    return [
      'users' => $users,
      'total' => $total
    ];
  }

  public function updateStatus($userId, $status)
  {
    $query = "UPDATE " . $this->table . " SET status = :status WHERE id = :id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':id', $userId);
    return $stmt->execute();
  }
}
