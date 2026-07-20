<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Blog.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../../helpers/ValidationHelper.php';
require_once __DIR__ . '/../../helpers/Sanitizer.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];

// Handle PATH_INFO safely
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($path_info, '/'));
$id = isset($request[0]) && is_numeric($request[0]) ? (int)$request[0] : null;

switch ($method) {
  case 'GET':
    if ($id) {
      getBlog($id);
    } else {
      getAllBlogs();
    }
    break;
  
  case 'POST':
    RoleMiddleware::requireBlogger();
    createBlog();
    break;

  case 'PUT':
    RoleMiddleware::requireBlogger();
    if ($id) {
      updateBlog($id);
    } else {
      ResponseHelper::error('Blog ID required', HTTP_BAD_REQUEST);
    }
    break;

  case 'DELETE':
    RoleMiddleware::requireBlogger();
    if ($id) {
      deleteBlog($id);
    } else {
      ResponseHelper::error('Blog ID required', HTTP_BAD_REQUEST);
    }
    break;

  default:
    ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

function getAllBlogs()
{
  $blog = new Blog();
  $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
  $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : ITEMS_PER_PAGE;
  $status = isset($_GET['status']) ? $_GET['status'] : 'published';
  $category = isset($_GET['category']) ? $_GET['category'] : null;
  $search = isset($_GET['search']) ? $_GET['search'] : null;
  $author = isset($_GET['author']) ? (int)$_GET['author'] : null;

  $filters = [
    'status' => $status,
    'category' => $category,
    'search' => $search,
    'author' => $author
  ];

  $result = $blog->getAll($page, $limit, $filters);

  ResponseHelper::success([
    'blogs' => $result['blogs'],
    'pagination' => [
      'current_page' => $page,
      'per_page' => $limit,
      'total' => $result['total'],
      'last_page' => ceil($result['total'] / $limit)
    ]
  ]);
}

function getBlog($id)
{
  $blog = new Blog();
  if ($blog->findById($id)) {
    // Increment view count
    $blog->incrementViews($id);

    // Get tags
    $tags = $blog->getTags($id);

    // Get author info
    $author = new User();
    $author->findById($blog->author_id);

    ResponseHelper::success([
      'id' => $blog->id,
      'title' => $blog->title,
      'slug' => $blog->slug,
      'content' => $blog->content,
      'excerpt' => $blog->excerpt,
      'featured_image' => $blog->featured_image,
      'author' => [
        'id' => $author->id,
        'name' => $author->name,
        'avatar' => $author->avatar
      ],
      'category_id' => $blog->category_id,
      'tags' => $tags,
      'views' => $blog->views,
      'likes' => $blog->likes,
      'status' => $blog->status,
      'published_at' => $blog->published_at,
      'created_at' => $blog->created_at,
      'updated_at' => $blog->updated_at
    ]);
  } else {
    ResponseHelper::notFound('Blog');
  }
}

function createBlog()
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  $required = ['title', 'content'];
  $errors = ValidationHelper::validateRequired($data, $required);
  if ($errors !== true) {
    ResponseHelper::validationError($errors);
  }

  $blog = new Blog();
  $blog->title = ValidationHelper::sanitizeInput($data['title']);
  $blog->slug = Sanitizer::sanitizeSlug($data['title']);
  $blog->content = $data['content'];
  $blog->excerpt = isset($data['excerpt']) ? ValidationHelper::sanitizeInput($data['excerpt']) : substr(strip_tags($data['content']), 0, 200);
  $blog->featured_image = isset($data['featured_image']) ? $data['featured_image'] : null;
  $blog->author_id = $user->id;
  $blog->category_id = isset($data['category_id']) ? (int)$data['category_id'] : null;
  $blog->status = isset($data['status']) ? $data['status'] : BLOG_DRAFT;
  $blog->seo_title = isset($data['seo_title']) ? $data['seo_title'] : null;
  $blog->seo_description = isset($data['seo_description']) ? $data['seo_description'] : null;

  if ($blog->status === BLOG_SCHEDULED && isset($data['scheduled_for'])) {
    $blog->scheduled_for = date('Y-m-d H:i:s', strtotime($data['scheduled_for']));
  }

  if ($blog->create()) {
    // Add tags if provided
    if (isset($data['tags']) && is_array($data['tags'])) {
      $blog->addTags($blog->id, $data['tags']);
    }

    ResponseHelper::success(['id' => $blog->id], 'Blog created successfully', HTTP_CREATED);
  } else {
    ResponseHelper::error('Failed to create blog', HTTP_INTERNAL_ERROR);
  }
}

function updateBlog($id)
{
  $data = json_decode(file_get_contents("php://input"), true);
  $user = AuthMiddleware::getAuthenticatedUser();

  $blog = new Blog();
  if (!$blog->findById($id)) {
    ResponseHelper::notFound('Blog');
  }

  // Check if user is author or admin
  $userRoles = $user->getUserRoles($user->id);
  if ($blog->author_id != $user->id && !in_array(ROLE_ADMIN, $userRoles)) {
    ResponseHelper::forbidden('You can only edit your own blogs');
  }

  if (isset($data['title'])) {
    $blog->title = ValidationHelper::sanitizeInput($data['title']);
    $blog->slug = Sanitizer::sanitizeSlug($data['title']);
  }
  if (isset($data['content'])) {
    $blog->content = $data['content'];
  }
  if (isset($data['excerpt'])) {
    $blog->excerpt = ValidationHelper::sanitizeInput($data['excerpt']);
  }
  if (isset($data['featured_image'])) {
    $blog->featured_image = $data['featured_image'];
  }
  if (isset($data['category_id'])) {
    $blog->category_id = (int)$data['category_id'];
  }
  if (isset($data['status'])) {
    $blog->status = $data['status'];
    if ($blog->status === BLOG_PUBLISHED && !$blog->published_at) {
      $blog->published_at = date('Y-m-d H:i:s');
    }
  }
  if (isset($data['seo_title'])) {
    $blog->seo_title = $data['seo_title'];
  }
  if (isset($data['seo_description'])) {
    $blog->seo_description = $data['seo_description'];
  }

  if ($blog->update()) {
    // Update tags if provided
    if (isset($data['tags'])) {
      $blog->deleteTags($id);
      if (is_array($data['tags']) && !empty($data['tags'])) {
        $blog->addTags($id, $data['tags']);
      }
    }

    ResponseHelper::success(null, 'Blog updated successfully');
  } else {
    ResponseHelper::error('Failed to update blog', HTTP_INTERNAL_ERROR);
  }
}

function deleteBlog($id)
{
  $user = AuthMiddleware::getAuthenticatedUser();

  $blog = new Blog();
  if (!$blog->findById($id)) {
    ResponseHelper::notFound('Blog');
  }

  // Check if user is author or admin
  $userRoles = $user->getUserRoles($user->id);
  if ($blog->author_id != $user->id && !in_array(ROLE_ADMIN, $userRoles)) {
    ResponseHelper::forbidden('You can only delete your own blogs');
  }

  if ($blog->delete()) {
    ResponseHelper::success(null, 'Blog deleted successfully');
  } else {
    ResponseHelper::error('Failed to delete blog', HTTP_INTERNAL_ERROR);
  }
}
