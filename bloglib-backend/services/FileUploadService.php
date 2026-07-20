<?php
class FileUploadService
{

  public function uploadImage($file, $destination, $maxSize = 5242880)
  {
    // Validate file
    if ($file['error'] !== UPLOAD_ERR_OK) {
      return ['success' => false, 'error' => 'Upload failed'];
    }

    if ($file['size'] > $maxSize) {
      return ['success' => false, 'error' => 'File too large'];
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
      return ['success' => false, 'error' => 'Invalid file type'];
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = UPLOAD_DIR . $destination . '/' . $filename;

    // Create directory if not exists
    if (!file_exists(dirname($filepath))) {
      mkdir(dirname($filepath), 0777, true);
    }

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
      return [
        'success' => true,
        'filename' => $filename,
        'path' => '/uploads/' . $destination . '/' . $filename
      ];
    }

    return ['success' => false, 'error' => 'Failed to save file'];
  }

  public function uploadBook($file, $destination, $maxSize = 52428800)
  {
    if ($file['error'] !== UPLOAD_ERR_OK) {
      return ['success' => false, 'error' => 'Upload failed'];
    }

    if ($file['size'] > $maxSize) {
      return ['success' => false, 'error' => 'File too large (max 50MB)'];
    }

    $allowedTypes = ['application/pdf', 'application/epub+zip'];
    if (!in_array($file['type'], $allowedTypes)) {
      return ['success' => false, 'error' => 'Invalid file type. Only PDF and EPUB allowed'];
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = UPLOAD_DIR . $destination . '/' . $filename;

    if (!file_exists(dirname($filepath))) {
      mkdir(dirname($filepath), 0777, true);
    }

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
      return [
        'success' => true,
        'filename' => $filename,
        'path' => '/uploads/' . $destination . '/' . $filename,
        'type' => $file['type']
      ];
    }

    return ['success' => false, 'error' => 'Failed to save file'];
  }

  public function deleteFile($path)
  {
    $fullPath = UPLOAD_DIR . str_replace('/uploads/', '', $path);
    if (file_exists($fullPath)) {
      return unlink($fullPath);
    }
    return false;
  }
}
