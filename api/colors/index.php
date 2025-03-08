
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];
$conn = getConnection();

switch ($method) {
    case 'GET':
        // Get all colors
        $stmt = $conn->prepare("SELECT * FROM colors");
        $stmt->execute();
        $result = $stmt->get_result();
        
        $colors = [];
        while ($row = $result->fetch_assoc()) {
            $colors[] = formatColor($row);
        }
        
        sendResponse($colors);
        break;
        
    case 'POST':
        // Create a new color
        $data = getRequestData();
        
        if (!isset($data['title'])) {
            sendError("Title is required");
        }
        
        $stmt = $conn->prepare("INSERT INTO colors (title, htmlColor, imageUrl, thickness, priceWithoutVat, priceWithVat, active) VALUES (?, ?, ?, ?, ?, ?, TRUE)");
        
        $stmt->bind_param("sssidd", 
            $data['title'], 
            $data['htmlColor'] ?? '#d2b48c', 
            $data['imageUrl'] ?? null, 
            $data['thickness'] ?? 18, 
            $data['priceWithoutVat'] ?? 0, 
            $data['priceWithVat'] ?? 0
        );
        
        if ($stmt->execute()) {
            $id = $conn->insert_id;
            
            // Fetch the new color
            $getStmt = $conn->prepare("SELECT * FROM colors WHERE id = ?");
            $getStmt->bind_param("i", $id);
            $getStmt->execute();
            $result = $getStmt->get_result();
            $color = $result->fetch_assoc();
            
            sendResponse(formatColor($color), 201);
        } else {
            sendError("Failed to create color: " . $stmt->error);
        }
        break;
        
    default:
        sendError("Method not supported", 405);
}

$conn->close();
?>
