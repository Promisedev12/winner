  <?php
  require_once __DIR__ . '/../config/database.php';

  class Follow
  {
    private $conn;
    private $table = 'follows';

    public function __construct()
    {
      $database = new Database();
      $this->conn = $database->getConnection();
    }

    public function follow($followerId, $followingId)
    {
      if ($followerId == $followingId) {
        return false;
      }

      $query = "INSERT INTO " . $this->table . " (follower_id, following_id) VALUES (:follower_id, :following_id)";
      $stmt = $this->conn->prepare($query);
      $stmt->bindParam(':follower_id', $followerId);
      $stmt->bindParam(':following_id', $followingId);

      return $stmt->execute();
    }

    public function unfollow($followerId, $followingId)
    {
      $query = "DELETE FROM " . $this->table . " WHERE follower_id = :follower_id AND following_id = :following_id";
      $stmt = $this->conn->prepare($query);
      $stmt->bindParam(':follower_id', $followerId);
      $stmt->bindParam(':following_id', $followingId);

      return $stmt->execute();
    }

    public function isFollowing($followerId, $followingId)
    {
      $query = "SELECT id FROM " . $this->table . " WHERE follower_id = :follower_id AND following_id = :following_id";
      $stmt = $this->conn->prepare($query);
      $stmt->bindParam(':follower_id', $followerId);
      $stmt->bindParam(':following_id', $followingId);
      $stmt->execute();

      return $stmt->rowCount() > 0;
    }

    public function getFollowers($userId, $page = 1, $limit = 20)
    {
      $offset = ($page - 1) * $limit;
      $query = "SELECT u.id, u.name, u.email, u.avatar, u.bio, f.created_at as followed_since
                  FROM " . $this->table . " f
                  JOIN users u ON f.follower_id = u.id
                  WHERE f.following_id = :user_id
                  ORDER BY f.created_at DESC
                  LIMIT :limit OFFSET :offset";

      $stmt = $this->conn->prepare($query);
      $stmt->bindParam(':user_id', $userId);
      $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
      $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
      $stmt->execute();

      $followers = [];
      while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $followers[] = $row;
      }

      $countQuery = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE following_id = :user_id";
      $countStmt = $this->conn->prepare($countQuery);
      $countStmt->bindParam(':user_id', $userId);
      $countStmt->execute();
      $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

      return [
        'followers' => $followers,
        'total' => $total
      ];
    }

    public function getFollowing($userId, $page = 1, $limit = 20)
    {
      $offset = ($page - 1) * $limit;
      $query = "SELECT u.id, u.name, u.email, u.avatar, u.bio, f.created_at as followed_since
                  FROM " . $this->table . " f
                  JOIN users u ON f.following_id = u.id
                  WHERE f.follower_id = :user_id
                  ORDER BY f.created_at DESC
                  LIMIT :limit OFFSET :offset";

      $stmt = $this->conn->prepare($query);
      $stmt->bindParam(':user_id', $userId);
      $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
      $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
      $stmt->execute();

      $following = [];
      while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $following[] = $row;
      }

      $countQuery = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE follower_id = :user_id";
      $countStmt = $this->conn->prepare($countQuery);
      $countStmt->bindParam(':user_id', $userId);
      $countStmt->execute();
      $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

      return [
        'following' => $following,
        'total' => $total
      ];
    }

    public function getFollowCounts($userId)
    {
      $query = "SELECT 
                    (SELECT COUNT(*) FROM follows WHERE following_id = :user_id) as followers_count,
                    (SELECT COUNT(*) FROM follows WHERE follower_id = :user_id) as following_count";
      $stmt = $this->conn->prepare($query);
      $stmt->bindParam(':user_id', $userId);
      $stmt->execute();

      return $stmt->fetch(PDO::FETCH_ASSOC);
    }
  }
  ?>