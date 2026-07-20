<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Tag.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
  ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

$tag = new Tag();
$tags = $tag->getAll();

ResponseHelper::success($tags);
