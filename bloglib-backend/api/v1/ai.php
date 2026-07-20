<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../services/AIService.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$path_info = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($path_info, '/'));
$action = isset($request[0]) ? $request[0] : '';

if ($method !== 'POST') {
  ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

// Require authentication for AI features
AuthMiddleware::authenticate();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['action'])) {
  ResponseHelper::validationError(['action' => 'Action is required']);
}

$aiService = new AIService();
$result = null;

switch ($data['action']) {
  case 'generate_article':
    if (!isset($data['topic'])) {
      ResponseHelper::validationError(['topic' => 'Topic is required']);
    }
    $result = $aiService->generateArticle($data['topic']);
    break;

  case 'rewrite':
    if (!isset($data['content'])) {
      ResponseHelper::validationError(['content' => 'Content is required']);
    }
    $style = isset($data['style']) ? $data['style'] : 'professional';
    $result = $aiService->rewriteContent($data['content'], $style);
    break;

  case 'grammar':
    if (!isset($data['text'])) {
      ResponseHelper::validationError(['text' => 'Text is required']);
    }
    $result = $aiService->checkGrammar($data['text']);
    break;

  case 'seo_title':
    if (!isset($data['topic'])) {
      ResponseHelper::validationError(['topic' => 'Topic is required']);
    }
    $result = $aiService->generateSEOTitle($data['topic']);
    break;

  case 'seo_keywords':
    if (!isset($data['topic'])) {
      ResponseHelper::validationError(['topic' => 'Topic is required']);
    }
    $result = $aiService->generateSEOKeywords($data['topic']);
    break;

  case 'outline':
    if (!isset($data['topic'])) {
      ResponseHelper::validationError(['topic' => 'Topic is required']);
    }
    $result = $aiService->generateOutline($data['topic']);
    break;

  case 'summarize':
    if (!isset($data['content'])) {
      ResponseHelper::validationError(['content' => 'Content is required']);
    }
    $result = $aiService->summarizeContent($data['content']);
    break;

  case 'book_outline':
    if (!isset($data['topic'])) {
      ResponseHelper::validationError(['topic' => 'Topic is required']);
    }
    $result = $aiService->generateBookOutline($data['topic']);
    break;

  case 'continue_writing':
    if (!isset($data['text'])) {
      ResponseHelper::validationError(['text' => 'Text is required']);
    }
    $result = $aiService->continueWriting($data['text']);
    break;

  default:
    ResponseHelper::error('Invalid action', HTTP_BAD_REQUEST);
}

ResponseHelper::success(['response' => $result], 'AI processing completed');
