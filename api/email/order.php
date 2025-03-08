
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendError("Method not supported", 405);
}

$data = getRequestData();

if (!isset($data['type']) || !isset($data['orderId']) || !isset($data['email'])) {
    sendError("Type, orderId, and email are required");
}

$type = $data['type'];
$orderId = $data['orderId'];
$email = $data['email'];

// Get order info
$conn = getConnection();
$orderStmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
$orderStmt->bind_param("i", $orderId);
$orderStmt->execute();
$orderResult = $orderStmt->get_result();

if ($orderResult->num_rows === 0) {
    sendError("Order not found", 404);
}

$order = $orderResult->fetch_assoc();

// In a real application, you would send an actual email here
// This is just a simulation
$subject = "";
$message = "";

switch ($type) {
    case 'new':
        $subject = "Novo naročilo #{$orderId}";
        $message = "Spoštovani,\n\nZahvaljujemo se vam za vaše naročilo (#{$orderId}). V najkrajšem možnem času bomo začeli z obdelavo vašega naročila.\n\nLep pozdrav";
        break;
    case 'progress':
        $subject = "Naročilo #{$orderId} v obdelavi";
        $message = "Spoštovani,\n\nVaše naročilo (#{$orderId}) je trenutno v obdelavi. Obvestili vas bomo, ko bo pripravljeno za prevzem ali dostavo.\n\nLep pozdrav";
        break;
    case 'completed':
        $subject = "Naročilo #{$orderId} zaključeno";
        $message = "Spoštovani,\n\nVaše naročilo (#{$orderId}) je zaključeno in pripravljeno " . ($order['shippingMethod'] === 'pickup' ? 'za prevzem' : 'za dostavo') . ".\n\nLep pozdrav";
        break;
    default:
        sendError("Invalid email type");
}

// Log the email (in a real app, you would send it)
error_log("---- SENDING EMAIL ----");
error_log("To: {$email}");
error_log("Subject: {$subject}");
error_log("Message: {$message}");
error_log("---- END EMAIL ----");

// Return success response (simulating email sent)
sendResponse([
    "success" => true,
    "message" => "Email successfully sent to {$email}"
]);

$conn->close();
?>
