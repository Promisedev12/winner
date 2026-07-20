<?php


require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Book.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/ValidationHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($path_info, '/'));
$action = isset($request[0]) ? $request[0] : '';
$id = isset($request[1]) ? (int)$request[1] : null;

switch ($method) {
  case 'GET':
    if ($id) {
      getBook($id);
    } else {
      getAllBooks();
    }
    break;
    
  case 'POST':
    RoleMiddleware::requireAuthor();
    createBook();
    break;

  case 'PUT':
    RoleMiddleware::requireAuthor();
    if ($id) {
      updateBook($id);
    } else {
      ResponseHelper::error('Book ID required', HTTP_BAD_REQUEST);
    }
    break;

  case 'DELETE':
    RoleMiddleware::requireAuthor();
    if ($id) {
      deleteBook($id);
    } else {
      ResponseHelper::error('Book ID required', HTTP_BAD_REQUEST);
    }
    break;

  default:
    ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

function getAllBooks()
{
  $book = new Book();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $status = isset($_GET['status']) ? $_GET['status'] : 'published';
  $category = isset($_GET['category']) ? $_GET['category'] : null;
  $search = isset($_GET['search']) ? $_GET['search'] : null;
  $isPremium = isset($_GET['premium']) ? filter_var($_GET['premium'], FILTER_VALIDATE_BOOLEAN) : null;

  $filters = [
    'status' => $status,
    'category' => $category,
    'search' => $search,
    'is_premium' => $isPremium
  ];

  $result = $book->getAll($page, $limit, $filters);

  ResponseHelper::success([
    'books' => $result['books'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function getBook($id)
{
  $book = new Book();
  if ($book->findById($id)) {
    ResponseHelper::success([
      'id' => $book->id,
      'title' => $book->title,
      'subtitle' => $book->subtitle,
      'slug' => $book->slug,
      'description' => $book->description,
      'cover_image' => $book->cover_image,
      'file_url' => $book->file_url,
      'file_type' => $book->file_type,
      'author_id' => $book->author_id,
  
      'category_id' => $book->category_id,
  
      'price' => $book->price,
      'is_premium' => $book->is_premium,
      'downloads' => $book->downloads,
      'rating' => $book->rating,
      'reviews_count' => $book->reviews_count,
      'pages' => $book->pages,
      'language' => $book->language,
      'edition' => $book->edition,
      'isbn' => $book->isbn,
      'status' => $book->status,
      'published_at' => $book->published_at,
      'created_at' => $book->created_at
    ]);
  } else {
    ResponseHelper::notFound('Book');
  }
}

function createBook()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  $required = ['title', 'description', 'file_url'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  $book = new Book();
  $book->title = ValidationHelper::sanitizeInput($data['title']);
  $book->subtitle = isset($data['subtitle']) ? ValidationHelper::sanitizeInput($data['subtitle']) : null;
  $book->slug = Sanitizer::sanitizeSlug($data['title']);
  $book->description = $data['description'];
  $book->cover_image = isset($data['cover_image']) ? $data['cover_image'] : null;
  $book->file_url = $data['file_url'];
  $book->file_type = isset($data['file_type']) ? $data['file_type'] : 'pdf';
  $book->author_id = $user->id;
  $book->category_id = isset($data['category_id']) ? (int)$data['category_id'] : null;
  $book->price = isset($data['price']) ? (float)$data['price'] : 0;
  $book->is_premium = isset($data['is_premium']) ? $data['is_premium'] : ($book->price > 0);
  $book->pages = isset($data['pages']) ? (int)$data['pages'] : null;
  $book->language = isset($data['language']) ? $data['language'] : 'English';
  $book->edition = isset($data['edition']) ? $data['edition'] : null;
  $book->isbn = isset($data['isbn']) ? $data['isbn'] : null;
  $book->status = isset($data['status']) ? $data['status'] : BOOK_DRAFT;

  if ($book->status === BOOK_PUBLISHED) {
    $book->published_at = date('Y-m-d H:i:s');
  }

  if ($book->create()) {
    ResponseHelper::success(['id' => $book->id], 'Book created successfully', HTTP_CREATED);
  } else {
    ResponseHelper::error('Failed to create book', HTTP_INTERNAL_ERROR);
  }
}

function updateBook($id)
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  $book = new Book();
  if (!$book->findById($id)) {
    ResponseHelper::notFound('Book');
  }

  if ($book->author_id != $user->id && !$user->hasRole($user->id, ROLE_ADMIN)) {
    ResponseHelper::forbidden('You can only edit your own books');
  }

  if (isset($data['title'])) {
    $book->title = ValidationHelper::sanitizeInput($data['title']);
    $book->slug = Sanitizer::sanitizeSlug($data['title']);
  }
  if (isset($data['subtitle'])) {
    $book->subtitle = ValidationHelper::sanitizeInput($data['subtitle']);
  }
  if (isset($data['description'])) {
    $book->description = $data['description'];
  }
  if (isset($data['cover_image'])) {
    $book->cover_image = $data['cover_image'];
  }
  if (isset($data['category_id'])) {
    $book->category_id = (int)$data['category_id'];
  }
  if (isset($data['price'])) {
    $book->price = (float)$data['price'];
    $book->is_premium = $book->price > 0;
  }
  if (isset($data['pages'])) {
    $book->pages = (int)$data['pages'];
  }
  if (isset($data['language'])) {
    $book->language = $data['language'];
  }
  if (isset($data['edition'])) {
    $book->edition = $data['edition'];
  }
  if (isset($data['isbn'])) {
    $book->isbn = $data['isbn'];
  }
  if (isset($data['status'])) {
    $book->status = $data['status'];
    if ($book->status === BOOK_PUBLISHED && !$book->published_at) {
      $book->published_at = date('Y-m-d H:i:s');
    }
  }

  if ($book->update()) {
    ResponseHelper::success(null, 'Book updated successfully');
  } else {
    ResponseHelper::error('Failed to update book', HTTP_INTERNAL_ERROR);
  }
}

function deleteBook($id)
{
  $user = AuthMiddleware::getAuthenticatedUser();

  $book = new Book();
  if (!$book->findById($id)) {
    ResponseHelper::notFound('Book');
  }

  if ($book->author_id != $user->id && !$user->hasRole($user->id, ROLE_ADMIN)) {
    ResponseHelper::forbidden('You can only delete your own books');
  }

  if ($book->delete()) {
    ResponseHelper::success(null, 'Book deleted successfully');
  } else {
    ResponseHelper::error('Failed to delete book', HTTP_INTERNAL_ERROR);
  }
}
