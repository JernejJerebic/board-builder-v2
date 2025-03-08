
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'PUT') {
    sendError("Method not supported", 405);
}

// Get color ID from URL
$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    sendError("Color ID is required", 400);
}

$data = getRequestData();

if (!isset($data['active'])) {
    sendError("Active status is required");
}

$active = $data['active'] ? 1 : 0;

$conn = getConnection();
$stmt = $conn->prepare("UPDATE colors SET active = ? WHERE id = ?");
$stmt->bind_param("ii", $active, $id);

if ($stmt->execute()) {
    // Fetch the updated color
    $getStmt = $conn->prepare("SELECT * FROM colors WHERE id = ?");
    $getStmt->bind_param("i", $id);
    $getStmt->execute();
    $result = $getStmt->get_result();
    $color = $result->fetch_assoc();
    
    sendResponse(formatColor($color));
} else {
    sendError("Failed to update color status: " . $stmt->error);
}

$conn->close();
?>
