
<?php
// Database configuration
define('DB_HOST', '35.214.216.147');
define('DB_NAME', 'dbfvbowjpcotpt');
define('DB_USER', 'ug3xluzozpqp5');
define('DB_PASS', '1zzppmgbsiqy');

// Create database connection
function getConnection() {
    // Log connection attempt
    error_log("Attempting to connect to database: " . DB_HOST);
    
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        die("Connection failed: " . $conn->connect_error);
    }
    
    error_log("Database connection successful");
    
    // Set character set
    $conn->set_charset("utf8mb4");
    
    return $conn;
}

// For debugging purposes
if (isset($_GET['test_connection'])) {
    header('Content-Type: application/json');
    try {
        $conn = getConnection();
        echo json_encode(['status' => 'success', 'message' => 'Database connection successful']);
        $conn->close();
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}
?>
