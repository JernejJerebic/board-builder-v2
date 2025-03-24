
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

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
$customerStmt = $conn->prepare("SELECT firstName, lastName, email FROM customers WHERE id = ?");
$customerStmt->bind_param("i", $customerId);
$customerStmt->execute();
$customerResult = $customerStmt->get_result();
$customer = $customerResult->fetch_assoc();

// Set up email data based on type
$subject = "";
$message = "";

switch ($type) {
    case 'new':
        $subject = "LCC Naročilo razreza - Novo naročilo #{$orderId}";
        $message = "Spoštovani {$customer['firstName']} {$customer['lastName']},\n\n";
        $message .= "Zahvaljujemo se vam za vaše naročilo (#{$orderId}). V najkrajšem možnem času bomo začeli z obdelavo vašega naročila.\n\n";
        $message .= "Podrobnosti naročila:\n";
        $message .= "Skupni znesek: €" . number_format($order['totalCostWithVat'], 2) . "\n";
        $message .= "Način plačila: " . ucfirst(str_replace('_', ' ', $order['paymentMethod'])) . "\n";
        $message .= "Način dostave: " . ($order['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . "\n\n";
        $message .= "Lep pozdrav,\nEkipa LCC Naročilo razreza";
        break;
        
    case 'progress':
        $subject = "LCC Naročilo razreza - Naročilo #{$orderId} v obdelavi";
        $message = "Spoštovani {$customer['firstName']} {$customer['lastName']},\n\n";
        $message .= "Vaše naročilo (#{$orderId}) je trenutno v obdelavi. Obvestili vas bomo, ko bo pripravljeno za prevzem ali dostavo.\n\n";
        $message .= "Podrobnosti naročila:\n";
        $message .= "Skupni znesek: €" . number_format($order['totalCostWithVat'], 2) . "\n";
        $message .= "Način dostave: " . ($order['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . "\n\n";
        $message .= "Lep pozdrav,\nEkipa LCC Naročilo razreza";
        break;
        
    case 'completed':
        $subject = "LCC Naročilo razreza - Naročilo #{$orderId} zaključeno";
        $message = "Spoštovani {$customer['firstName']} {$customer['lastName']},\n\n";
        $message .= "Vaše naročilo (#{$orderId}) je zaključeno in pripravljeno " . ($order['shippingMethod'] === 'pickup' ? 'za prevzem' : 'za dostavo') . ".\n\n";
        $message .= "Podrobnosti naročila:\n";
        $message .= "Skupni znesek: €" . number_format($order['totalCostWithVat'], 2) . "\n";
        $message .= "Način dostave: " . ($order['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . "\n\n";
        $message .= "V primeru vprašanj nas kontaktirajte na info@lcc-razrez.si\n\n";
        $message .= "Lep pozdrav,\nEkipa LCC Naročilo razreza";
        break;
        
    default:
        sendError("Invalid email type");
}

// Set up email headers
$headers = 'From: LCC Naročilo razreza <info@lcc-razrez.si>' . "\r\n";
$headers .= 'Reply-To: info@lcc-razrez.si' . "\r\n";
$headers .= 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-type: text/plain; charset=UTF-8' . "\r\n";

// Log the email information
error_log("Attempting to send email: Type={$type}, OrderID={$orderId}, To={$email}");
error_log("Subject: {$subject}");
error_log("Message: {$message}");

// Send the email
$mailSent = mail($email, $subject, $message, $headers);

if ($mailSent) {
    // Log success
    error_log("Email sent successfully to {$email}");
    addLog('info', "Email sent successfully", [
        'type' => $type,
        'orderId' => $orderId,
        'recipient' => $email
    ]);
    
    // Return success response
    sendResponse([
        "success" => true, 
        "message" => "Email successfully sent to {$email}"
    ]);
} else {
    // Log error
    $error = error_get_last();
    error_log("Failed to send email: " . ($error ? $error['message'] : 'Unknown error'));
    addLog('error', "Failed to send email", [
        'type' => $type,
        'orderId' => $orderId,
        'recipient' => $email,
        'error' => $error ? $error['message'] : 'Unknown error'
    ]);
    
    // Return error response
    sendError("Failed to send email. Please try again later.");
}

$conn->close();
?>
