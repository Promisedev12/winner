<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../database/Database.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

// Initialize database connection
$db = new Database();

// GET: Fetch books
if ($method === 'GET') {
    $action = explode('/', trim($path, '/'));
    
    if (empty($action[0]) || $action[0] === 'books') {
        // Get all books or filter
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(100, intval($_GET['limit'])) : 8;
        $offset = ($page - 1) * $limit;
        
        try {
            $query = "SELECT id, title, description as excerpt, cover_image as image, author_id, category, 
                     likes, reviews_count, created_at as date, pages
                     FROM books WHERE status = 'published' ORDER BY created_at DESC 
                     LIMIT ? OFFSET ?";
            
            $stmt = $db->prepare($query);
            $stmt->bind_param('ii', $limit, $offset);
            $stmt->execute();
            $result = $stmt->get_result();
            $books = [];
            
            while ($row = $result->fetch_assoc()) {
                // Get author info
                $authorQuery = "SELECT id, name, avatar FROM users WHERE id = ?";
                $authorStmt = $db->prepare($authorQuery);
                $authorStmt->bind_param('i', $row['author_id']);
                $authorStmt->execute();
                $authorResult = $authorStmt->get_result();
                $author = $authorResult->fetch_assoc();
                
                $row['author'] = $author ?: ['name' => 'Unknown', 'avatar' => null];
                $books[] = $row;
            }
            
            ResponseHelper::success('Books fetched successfully', [
                'data' => $books,
                'page' => $page,
                'limit' => $limit
            ]);
        } catch (Exception $e) {
            ResponseHelper::error('Failed to fetch books: ' . $e->getMessage(), HTTP_INTERNAL_ERROR);
        }
    } elseif (isset($action[0]) && is_numeric($action[0])) {
        // Get single book by ID
        $bookId = intval($action[0]);
        
        try {
            $query = "SELECT * FROM books WHERE id = ? AND status = 'published'";
            $stmt = $db->prepare($query);
            $stmt->bind_param('i', $bookId);
            $stmt->execute();
            $result = $stmt->get_result();
            $book = $result->fetch_assoc();
            
            if ($book) {
                // Get author info
                $authorQuery = "SELECT id, name, avatar FROM users WHERE id = ?";
                $authorStmt = $db->prepare($authorQuery);
                $authorStmt->bind_param('i', $book['author_id']);
                $authorStmt->execute();
                $authorResult = $authorStmt->get_result();
                $book['author'] = $authorResult->fetch_assoc();
                
                ResponseHelper::success('Book fetched successfully', $book);
            } else {
                ResponseHelper::error('Book not found', HTTP_NOT_FOUND);
            }
        } catch (Exception $e) {
            ResponseHelper::error('Failed to fetch book: ' . $e->getMessage(), HTTP_INTERNAL_ERROR);
        }
    }
}

// POST: Create book (requires authentication)
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check authentication
    $token = isset(getallheaders()['Authorization']) ? str_replace('Bearer ', '', getallheaders()['Authorization']) : null;
    if (!$token) {
        ResponseHelper::error('Unauthorized', HTTP_UNAUTHORIZED);
    }
    
    // Validate required fields
    if (!isset($data['title']) || !isset($data['description'])) {
        ResponseHelper::error('Title and description are required', HTTP_BAD_REQUEST);
    }
    
    try {
        $query = "INSERT INTO books (title, description, cover_image, category, author_id, status, pages, created_at) 
                 VALUES (?, ?, ?, ?, ?, 'published', ?, NOW())";
        $stmt = $db->prepare($query);
        
        $userId = 1;
        $pages = isset($data['pages']) ? $data['pages'] : 200;
        $image = $data['cover_image'] ?? null;
        $category = $data['category'] ?? 'General';
        
        $stmt->bind_param('ssssii', 
            $data['title'], 
            $data['description'], 
            $image,
            $category,
            $userId,
            $pages
        );
        
        if ($stmt->execute()) {
            ResponseHelper::success('Book created successfully', ['id' => $db->insert_id], HTTP_CREATED);
        } else {
            ResponseHelper::error('Failed to create book', HTTP_INTERNAL_ERROR);
        }
    } catch (Exception $e) {
        ResponseHelper::error('Error: ' . $e->getMessage(), HTTP_INTERNAL_ERROR);
    }
}

// PUT: Update book
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = explode('/', trim($path, '/'));
    
    if (!isset($action[0]) || !is_numeric($action[0])) {
        ResponseHelper::error('Book ID is required', HTTP_BAD_REQUEST);
    }
    
    $bookId = intval($action[0]);
    
    try {
        $query = "UPDATE books SET title = ?, description = ?, cover_image = ?, category = ? WHERE id = ?";
        $stmt = $db->prepare($query);
        
        $image = $data['cover_image'] ?? null;
        $category = $data['category'] ?? 'General';
        
        $stmt->bind_param('ssssi',
            $data['title'],
            $data['description'],
            $image,
            $category,
            $bookId
        );
        
        if ($stmt->execute()) {
            ResponseHelper::success('Book updated successfully');
        } else {
            ResponseHelper::error('Failed to update book', HTTP_INTERNAL_ERROR);
        }
    } catch (Exception $e) {
        ResponseHelper::error('Error: ' . $e->getMessage(), HTTP_INTERNAL_ERROR);
    }
}

// DELETE: Delete book
elseif ($method === 'DELETE') {
    $action = explode('/', trim($path, '/'));
    
    if (!isset($action[0]) || !is_numeric($action[0])) {
        ResponseHelper::error('Book ID is required', HTTP_BAD_REQUEST);
    }
    
    $bookId = intval($action[0]);
    
    try {
        $query = "DELETE FROM books WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->bind_param('i', $bookId);
        
        if ($stmt->execute()) {
            ResponseHelper::success('Book deleted successfully');
        } else {
            ResponseHelper::error('Failed to delete book', HTTP_INTERNAL_ERROR);
        }
    } catch (Exception $e) {
        ResponseHelper::error('Error: ' . $e->getMessage(), HTTP_INTERNAL_ERROR);
    }
}

else {
    ResponseHelper::error('Method not allowed', 405);
}
