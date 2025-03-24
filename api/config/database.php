
<?php
// Database configuration
define('DB_HOST', '34.214.216.147');
define('DB_NAME', 'dbfvbowjpcotpt');
define('DB_USER', 'ug3xluzozpqp5');
define('DB_PASS', '1zzppmgbsiqy');

// Create database connection
function getConnection() {
    $timestamp = date('Y-m-d H:i:s');
    
    // Log connection attempt
    error_log("[{$timestamp}] Attempting to connect to database: " . DB_HOST);
    
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        error_log("[{$timestamp}] Database connection failed: " . $conn->connect_error);
        die("Connection failed: " . $conn->connect_error);
    }
    
    error_log("[{$timestamp}] Database connection successful");
    
    // Set character set
    $conn->set_charset("utf8mb4");
    
    return $conn;
}

// For debugging purposes
if (isset($_GET['test_connection'])) {
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    
    $timestamp = date('Y-m-d H:i:s');
    error_log("[{$timestamp}] Database connection test requested");
    
    try {
        $conn = getConnection();
        echo json_encode([
            'status' => 'success', 
            'message' => 'Database connection successful',
            'timestamp' => $timestamp,
            'server_info' => [
                'server_name' => $_SERVER['SERVER_NAME'],
                'request_uri' => $_SERVER['REQUEST_URI'],
                'remote_addr' => $_SERVER['REMOTE_ADDR'],
                'http_host' => $_SERVER['HTTP_HOST'] ?? 'not set'
            ]
        ]);
        $conn->close();
    } catch (Exception $e) {
        error_log("[{$timestamp}] Database connection test error: " . $e->getMessage());
        echo json_encode([
            'status' => 'error', 
            'message' => $e->getMessage(),
            'timestamp' => $timestamp
        ]);
    }
    exit;
}
?>
