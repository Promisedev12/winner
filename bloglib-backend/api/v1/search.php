<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Blog.php';
require_once __DIR__ . '/../../models/Book.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
  ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

$query = isset($_GET['q']) ? $_GET['q'] : '';
$type = isset($_GET['type']) ? $_GET['type'] : 'all';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;

if (empty($query)) {
  ResponseHelper::error('Search query is required', HTTP_BAD_REQUEST);
}

$results = [];
$total = 0;

if ($type === 'all' || $type === 'blogs') {
  $blog = new Blog();
  $blogResults = $blog->getAll($page, $limit, ['search' => $query, 'status' => 'published']);
  $results['blogs'] = $blogResults['blogs'];
  $total += $blogResults['total'];
}

if ($type === 'all' || $type === 'books') {
  $book = new Book();
  $bookResults = $book->getAll($page, $limit, ['search' => $query, 'status' => 'published']);
  $results['books'] = $bookResults['books'];
  $total += $bookResults['total'];
}

ResponseHelper::success([
  'results' => $results,
  'total' => $total,
  'query' => $query,
  'type' => $type
]);
