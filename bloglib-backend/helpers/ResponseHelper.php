<?php

class ResponseHelper {
    /**
     * Send success response
     */
    public static function success($message = 'Success', $data = null, $statusCode = HTTP_OK) {
        http_response_code($statusCode);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }

    /**
     * Send error response
     */
    public static function error($message = 'Error', $statusCode = HTTP_BAD_REQUEST, $errors = null) {
        http_response_code($statusCode);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ]);
        exit;
    }

    /**
     * Send paginated response
     */
    public static function paginated($message, $data, $page, $limit, $total, $statusCode = HTTP_OK) {
        http_response_code($statusCode);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        exit;
    }
}
