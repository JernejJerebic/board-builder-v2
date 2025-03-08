
<?php
// Database configuration
define('DB_HOST', '35.214.216.147');
define('DB_NAME', 'dbfvbowjpcotpt');
define('DB_USER', 'ug3xluzozpqp5');
define('DB_PASS', '1zzppmgbsiqy');

// Create database connection
function getConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    // Set character set
    $conn->set_charset("utf8mb4");
    
    return $conn;
}
?>
