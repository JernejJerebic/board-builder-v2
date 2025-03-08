
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError("Method not supported", 405);
}

$email = isset($_GET['email']) ? $_GET['email'] : null;

if (!$email) {
    sendError("Email is required", 400);
}

$conn = getConnection();
$stmt = $conn->prepare("SELECT * FROM customers WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $customer = $result->fetch_assoc();
    sendResponse(formatCustomer($customer));
} else {
    sendResponse(null);
}

$conn->close();
?>
