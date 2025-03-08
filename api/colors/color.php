
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];
$conn = getConnection();

// Get color ID from URL
$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    sendError("Color ID is required", 400);
}

switch ($method) {
    case 'GET':
        // Get color by ID
        $stmt = $conn->prepare("SELECT * FROM colors WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $color = $result->fetch_assoc();
            sendResponse(formatColor($color));
        } else {
            sendError("Color not found", 404);
        }
        break;
        
    case 'PUT':
        // Update color
        $data = getRequestData();
        
        // Build update query dynamically based on provided fields
        $updateFields = [];
        $bindTypes = "";
        $bindValues = [];
        
        if (isset($data['title'])) {
            $updateFields[] = "title = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['title'];
        }
        
        if (isset($data['htmlColor'])) {
            $updateFields[] = "htmlColor = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['htmlColor'];
        }
        
        if (isset($data['imageUrl'])) {
            $updateFields[] = "imageUrl = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['imageUrl'];
        }
        
        if (isset($data['thickness'])) {
            $updateFields[] = "thickness = ?";
            $bindTypes .= "i";
            $bindValues[] = $data['thickness'];
        }
        
        if (isset($data['priceWithoutVat'])) {
            $updateFields[] = "priceWithoutVat = ?";
            $bindTypes .= "d";
            $bindValues[] = $data['priceWithoutVat'];
        }
        
        if (isset($data['priceWithVat'])) {
            $updateFields[] = "priceWithVat = ?";
            $bindTypes .= "d";
            $bindValues[] = $data['priceWithVat'];
        }
        
        if (isset($data['active'])) {
            $updateFields[] = "active = ?";
            $bindTypes .= "i";
            $bindValues[] = $data['active'] ? 1 : 0;
        }
        
        if (empty($updateFields)) {
            sendError("No fields to update");
        }
        
        $sql = "UPDATE colors SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $bindTypes .= "i";
        $bindValues[] = $id;
        
        $stmt = $conn->prepare($sql);
        
        // Dynamically bind parameters
        $params = array_merge([$bindTypes], $bindValues);
        $stmt->bind_param(...$params);
        
        if ($stmt->execute()) {
            // Fetch the updated color
            $getStmt = $conn->prepare("SELECT * FROM colors WHERE id = ?");
            $getStmt->bind_param("i", $id);
            $getStmt->execute();
            $result = $getStmt->get_result();
            $color = $result->fetch_assoc();
            
            sendResponse(formatColor($color));
        } else {
            sendError("Failed to update color: " . $stmt->error);
        }
        break;
        
    case 'DELETE':
        // Delete color
        $stmt = $conn->prepare("DELETE FROM colors WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            sendResponse(["success" => true, "message" => "Color deleted"]);
        } else {
            sendError("Failed to delete color: " . $stmt->error);
        }
        break;
        
    default:
        sendError("Method not supported", 405);
}

$conn->close();
?>
