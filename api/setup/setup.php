
<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Output some debug info
echo "Setup script started...<br>";
echo "Current directory: " . __DIR__ . "<br>";
echo "Trying to include database.php...<br>";

// Try to include the database.php file
try {
    require_once '../config/database.php';
    echo "Database.php included successfully<br>";
} catch (Exception $e) {
    echo "Error including database.php: " . $e->getMessage() . "<br>";
    exit;
}

// Function to initialize the database
function setupDatabase() {
    echo "Setting up database...<br>";
    
    $conn = getConnection();
    
    // Read SQL file
    $sqlFile = __DIR__ . '/setup_database.sql';
    echo "Reading SQL from: " . $sqlFile . "<br>";
    
    if (!file_exists($sqlFile)) {
        echo "SQL file not found!<br>";
        return;
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Execute multi query
    echo "Executing SQL queries...<br>";
    if ($conn->multi_query($sql)) {
        echo "Database setup completed successfully.<br>";
        
        // Process all results to free the connection
        do {
            if ($result = $conn->store_result()) {
                $result->free();
            }
        } while ($conn->next_result());
        
    } else {
        echo "Error setting up database: " . $conn->error . "<br>";
    }
    
    $conn->close();
}

// Call the setup function
setupDatabase();
echo "Setup process completed.";
?>
