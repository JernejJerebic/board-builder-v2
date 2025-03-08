
<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set JSON content type
header('Content-Type: application/json');

// Set CORS headers explicitly
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Log request details
$timestamp = date('Y-m-d H:i:s');
error_log("[{$timestamp}] Test endpoint accessed. Remote IP: {$_SERVER['REMOTE_ADDR']}, User Agent: {$_SERVER['HTTP_USER_AGENT']}");

// Return a simple JSON response with diagnostic information
echo json_encode([
    'status' => 'success',
    'message' => 'API is working properly',
    'timestamp' => $timestamp,
    'php_version' => phpversion(),
    'server_info' => [
        'server_name' => $_SERVER['SERVER_NAME'],
        'request_uri' => $_SERVER['REQUEST_URI'],
        'remote_addr' => $_SERVER['REMOTE_ADDR'],
        'http_host' => $_SERVER['HTTP_HOST'],
        'request_method' => $_SERVER['REQUEST_METHOD']
    ]
]);
?>
