
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

// Get all PHP environment information
$phpInfo = [];
$phpInfo['php_version'] = phpversion();
$phpInfo['extensions'] = get_loaded_extensions();
$phpInfo['php_sapi'] = php_sapi_name();
$phpInfo['memory_limit'] = ini_get('memory_limit');
$phpInfo['max_execution_time'] = ini_get('max_execution_time');
$phpInfo['upload_max_filesize'] = ini_get('upload_max_filesize');
$phpInfo['post_max_size'] = ini_get('post_max_size');

// Get server information
$serverInfo = [];
foreach ($_SERVER as $key => $value) {
    if (!is_array($value) && !is_object($value)) {
        $serverInfo[$key] = $value;
    }
}

// Test file system access
$fileSystemInfo = [];
$fileSystemInfo['document_root'] = $_SERVER['DOCUMENT_ROOT'];
$fileSystemInfo['current_script'] = __FILE__;
$fileSystemInfo['is_writable_temp'] = is_writable(sys_get_temp_dir());
$fileSystemInfo['tmp_dir'] = sys_get_temp_dir();
$fileSystemInfo['current_dir_writable'] = is_writable(dirname(__FILE__));

// Return a comprehensive JSON response with diagnostic information
echo json_encode([
    'status' => 'success',
    'message' => 'API is working properly',
    'timestamp' => $timestamp,
    'php_info' => $phpInfo,
    'server_info' => $serverInfo,
    'file_system_info' => $fileSystemInfo,
    'headers_sent' => [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
        'Content-Type' => 'application/json'
    ]
]);
?>
