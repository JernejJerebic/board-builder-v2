
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';
require_once '../../includes/mailer.php';

// Enable CORS
enableCORS();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Process only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Method not supported", 405);
}

// Get request data
$data = getRequestData();

// Validate required fields
if (!isset($data['type']) || !isset($data['orderId']) || !isset($data['email'])) {
    sendError("Type, orderId, and email are required");
}

$type = $data['type'];
$orderId = $data['orderId'];
$email = $data['email'];
$isAdmin = isset($data['adminEmail']) && $data['adminEmail'] === 'true';

// Get the order information
$conn = getConnection();
$orderStmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
$orderStmt->bind_param("s", $orderId);
$orderStmt->execute();
$orderResult = $orderStmt->get_result();

if ($orderResult->num_rows === 0) {
    sendError("Order not found", 404);
}

$order = $orderResult->fetch_assoc();

// Get customer info
$customerId = $order['customerId'];
$customerStmt = $conn->prepare("SELECT * FROM customers WHERE id = ?");
$customerStmt->bind_param("i", $customerId);
$customerStmt->execute();
$customerResult = $customerStmt->get_result();
$customer = $customerResult->fetch_assoc();

// Log the email request
addLog('info', "Email request received", [
    'type' => $type,
    'orderId' => $orderId,
    'email' => $email,
    'isAdmin' => $isAdmin
]);

// Send email based on type and recipient
if ($isAdmin) {
    // Send admin notification
    $result = sendAdminOrderNotification($orderId, $order, $customer);
} else {
    // Send customer email
    switch ($type) {
        case 'new':
            $result = sendOrderConfirmationEmail($orderId, $email, $order, $customer);
            break;
        case 'progress':
        case 'completed':
            $result = sendOrderStatusEmail($type, $orderId, $email, $order, $customer);
            break;
        default:
            sendError("Invalid email type");
    }
}

// Return appropriate response
if ($result['success']) {
    sendResponse([
        "success" => true, 
        "message" => "Email successfully sent to {$email}"
    ]);
} else {
    sendError($result['message']);
}

$conn->close();
?>
