
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'lcc_aplikacija');
define('DB_USER', 'lcc_aplikacija');
define('DB_PASS', 'thisisjustademoapp');

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
