
<?php
require_once '../config/database.php';

// Function to initialize the database
function setupDatabase() {
    $conn = getConnection();
    
    // Read SQL file
    $sql = file_get_contents('setup_database.sql');
    
    // Execute multi query
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
