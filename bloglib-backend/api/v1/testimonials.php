<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
  ResponseHelper::error('Method not allowed', HTTP_BAD_REQUEST);
}

// In production, you'd have a testimonials table
// For now, return static testimonials
$testimonials = [
  [
    'id' => 1,
    'name' => 'Sarah Johnson',
    'role' => 'Tech Blogger',
    'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    'content' => 'BlogLib has transformed how I create content. The AI writing assistant is a game-changer!',
    'rating' => 5
  ],
  [
    'id' => 2,
    'name' => 'Dr. Michael Lee',
    'role' => 'Published Author',
    'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    'content' => 'The e-library system is incredible. My readers love the online reading experience.',
    'rating' => 5
  ],
  [
    'id' => 3,
    'name' => 'Emma Davis',
    'role' => 'Content Creator',
    'avatar' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    'content' => 'Best platform for writers and readers. The community is amazing and supportive.',
    'rating' => 5
  ]
];

ResponseHelper::success($testimonials);
