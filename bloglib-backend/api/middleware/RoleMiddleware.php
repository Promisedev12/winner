<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/AuthMiddleware.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../helpers/ResponseHelper.php';

class RoleMiddleware
{

  public static function requireRole($roles)
  {
    $user = AuthMiddleware::getAuthenticatedUser();

    if (!is_array($roles)) {
      $roles = [$roles];
    }

    $userRoles = $user->getUserRoles($user->id);

    foreach ($roles as $role) {
      if (in_array($role, $userRoles)) {
        return $user;
      }
    }

    ResponseHelper::forbidden('Insufficient permissions');
    return null;
  }

  public static function requireAdmin()
  {
    return self::requireRole(ROLE_ADMIN);
  }

  public static function requireBlogger()
  {
    return self::requireRole([ROLE_BLOGGER, ROLE_ADMIN]);
  }

  public static function requireAuthor()
  {
    return self::requireRole([ROLE_AUTHOR, ROLE_ADMIN]);
  }
}
