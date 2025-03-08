
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'PUT') {
    sendError("Method not supported", 405);
}

// Get order ID from URL
$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    sendError("Order ID is required", 400);
}

$data = getRequestData();

if (!isset($data['status'])) {
    sendError("Status is required");
}

$conn = getConnection();
$stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
$stmt->bind_param("si", $data['status'], $id);

if ($stmt->execute()) {
    // Fetch the updated order with products
    $getOrderStmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
    $getOrderStmt->bind_param("i", $id);
    $getOrderStmt->execute();
    $orderResult = $getOrderStmt->get_result();
    $order = $orderResult->fetch_assoc();
    
    $getProductsStmt = $conn->prepare("SELECT * FROM products WHERE orderId = ?");
    $getProductsStmt->bind_param("i", $id);
    $getProductsStmt->execute();
    $productsResult = $getProductsStmt->get_result();
    
    $products = [];
    while ($product = $productsResult->fetch_assoc()) {
        $products[] = formatProduct($product);
    }
    
    sendResponse(formatOrder($order, $products));
} else {
    sendError("Failed to update order status: " . $stmt->error);
}

$conn->close();
?>
