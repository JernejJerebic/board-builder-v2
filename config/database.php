
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
?>
