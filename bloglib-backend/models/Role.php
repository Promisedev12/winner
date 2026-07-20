<?php
require_once __DIR__ . '/../config/database.php';

class Role
{
  private $conn;
  private $table = 'roles';

  public function __construct()
  {
    $database = new Database();
    $this->conn = $database->getConnection();
  }

  public function getAll()
  {
    $query = "SELECT * FROM " . $this->table . " ORDER BY id";
    $stmt = $this->conn->prepare($query);
    $stmt->execute();

    $roles = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $roles[] = $row;
    }
    return $roles;
  }

  public function findByName($name)
  {
    $query = "SELECT * FROM " . $this->table . " WHERE name = :name LIMIT 0,1";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':name', $name);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC);
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

  public function hasRole($userId, $roleName)
  {
    $roles = $this->getUserRoles($userId);
    return in_array($roleName, $roles);
  }

  public function getPendingApplications($roleName = null)
  {
    $query = "SELECT ur.*, u.name, u.email, u.created_at as user_joined
                  FROM user_roles ur
                  JOIN users u ON ur.user_id = u.id
                  JOIN roles r ON ur.role_id = r.id
                  WHERE ur.approved = 0";

    if ($roleName) {
      $query .= " AND r.name = :role_name";
    }

    $stmt = $this->conn->prepare($query);
    if ($roleName) {
      $stmt->bindParam(':role_name', $roleName);
    }
    $stmt->execute();

    $applications = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $applications[] = $row;
    }
    return $applications;
  }

  public function approveRole($userId, $roleId)
  {
    $query = "UPDATE user_roles SET approved = 1, approved_at = NOW() 
                  WHERE user_id = :user_id AND role_id = :role_id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':role_id', $roleId);
    return $stmt->execute();
  }

  public function rejectRole($userId, $roleId)
  {
    $query = "DELETE FROM user_roles WHERE user_id = :user_id AND role_id = :role_id";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':role_id', $roleId);
    return $stmt->execute();
  }
}
