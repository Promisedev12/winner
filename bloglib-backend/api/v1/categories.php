<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Category.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
  ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

$category = new Category();
$categories = $category->getAll();

ResponseHelper::success($categories);
