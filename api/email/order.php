
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS for all requests - this is crucial for cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request - browsers send this before actual POST requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Now proceed with the regular request handling
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendError("Method not supported", 405);
}

// Get and validate the request data
$input = file_get_contents('php://input');
error_log("Raw input received: " . substr($input, 0, 200));

$data = json_decode($input, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("JSON parsing error: " . json_last_error_msg());
    error_log("Failed to parse input: " . $input);
    sendError("Invalid JSON data: " . json_last_error_msg(), 400);
}

if (!isset($data['type']) || !isset($data['orderId']) || !isset($data['email'])) {
    sendError("Type, orderId, and email are required");
}

$type = $data['type'];
$orderId = $data['orderId'];
$email = $data['email'];
$isAdminEmail = isset($data['adminEmail']) && $data['adminEmail'] === 'true';

// Get order info
try {
    $conn = getConnection();
    $orderStmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
    $orderStmt->bind_param("s", $orderId);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();

    if ($orderResult->num_rows === 0) {
        sendError("Order not found", 404);
    }

    $order = $orderResult->fetch_assoc();

    // Get customer info for a more personalized email
    $customerId = $order['customerId'];
    $customerStmt = $conn->prepare("SELECT firstName, lastName, email FROM customers WHERE id = ?");
    $customerStmt->bind_param("s", $customerId);
    $customerStmt->execute();
    $customerResult = $customerStmt->get_result();
    $customer = $customerResult->fetch_assoc();

    // In a real application, you would send an actual email here
    // This is just a simulation
    $subject = "";
    $message = "";

    if ($isAdminEmail) {
        // Admin email
        switch ($type) {
            case 'new':
                $subject = "Novo naročilo #{$orderId}";
                $message = "Prejeli ste novo naročilo #{$orderId}.\n\nPodrobnosti naročila:\nStranka: {$customer['firstName']} {$customer['lastName']}\nEmail: {$customer['email']}\nZnesek: €{$order['totalCostWithVat']}\n\nPrijavite se v administratorsko ploščo za več podrobnosti.";
                break;
            case 'progress':
                $subject = "Naročilo #{$orderId} v obdelavi";
                $message = "Naročilo #{$orderId} je bilo označeno kot 'v obdelavi'.\n\nPodrobnosti naročila:\nStranka: {$customer['firstName']} {$customer['lastName']}\nEmail: {$customer['email']}\nZnesek: €{$order['totalCostWithVat']}";
                break;
            case 'completed':
                $subject = "Naročilo #{$orderId} zaključeno";
                $message = "Naročilo #{$orderId} je bilo označeno kot 'zaključeno'.\n\nPodrobnosti naročila:\nStranka: {$customer['firstName']} {$customer['lastName']}\nEmail: {$customer['email']}\nZnesek: €{$order['totalCostWithVat']}";
                break;
            default:
                sendError("Invalid email type");
        }
    } else {
        // Customer email
        switch ($type) {
            case 'new':
                $subject = "LCC Naročilo razreza - Novo naročilo #{$orderId}";
                $message = "Spoštovani {$customer['firstName']} {$customer['lastName']},\n\nZahvaljujemo se vam za vaše naročilo (#{$orderId}). V najkrajšem možnem času bomo začeli z obdelavo vašega naročila.\n\nPodrobnosti naročila:\nSkupni znesek: €{$order['totalCostWithVat']}\nNačin plačila: " . ucfirst(str_replace('_', ' ', $order['paymentMethod'])) . "\nNačin dostave: " . ($order['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . "\n\nLep pozdrav,\nEkipa LCC Naročilo razreza";
                break;
            case 'progress':
                $subject = "LCC Naročilo razreza - Naročilo #{$orderId} v obdelavi";
                $message = "Spoštovani {$customer['firstName']} {$customer['lastName']},\n\nVaše naročilo (#{$orderId}) je trenutno v obdelavi. Obvestili vas bomo, ko bo pripravljeno za prevzem ali dostavo.\n\nPodrobnosti naročila:\nSkupni znesek: €{$order['totalCostWithVat']}\nNačin dostave: " . ($order['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . "\n\nLep pozdrav,\nEkipa LCC Naročilo razreza";
                break;
            case 'completed':
                $subject = "LCC Naročilo razreza - Naročilo #{$orderId} zaključeno";
                $message = "Spoštovani {$customer['firstName']} {$customer['lastName']},\n\nVaše naročilo (#{$orderId}) je zaključeno in pripravljeno " . ($order['shippingMethod'] === 'pickup' ? 'za prevzem' : 'za dostavo') . ".\n\nPodrobnosti naročila:\nSkupni znesek: €{$order['totalCostWithVat']}\nNačin dostave: " . ($order['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . "\n\nV primeru vprašanj nas kontaktirajte na info@lcc-razrez.si\n\nLep pozdrav,\nEkipa LCC Naročilo razreza";
                break;
            default:
                sendError("Invalid email type");
        }
    }

    // Set up email headers for a more robust email
    $headers = 'From: LCC Naročilo razreza <info@lcc-razrez.si>' . "\r\n";
    $headers .= 'Reply-To: info@lcc-razrez.si' . "\r\n";
    $headers .= 'X-Mailer: PHP/' . phpversion() . "\r\n";
    $headers .= 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-type: text/plain; charset=UTF-8' . "\r\n";

    // In a production environment, you would uncomment this line to actually send the email
    // mail($email, $subject, $message, $headers);

    // Log the email (in a real app, you would send it)
    error_log("---- SENDING EMAIL ----");
    error_log("To: {$email}");
    error_log("Subject: {$subject}");
    error_log("Message: {$message}");
    error_log("Headers: {$headers}");
    error_log("---- END EMAIL ----");

    // Return success response (simulating email sent)
    sendResponse([
        "success" => true,
        "message" => "Email successfully sent to {$email}",
        "details" => [
            "subject" => $subject,
            "messagePreview" => substr($message, 0, 100) . "..."
        ]
    ]);
} catch (Exception $e) {
    error_log("Database error: " . $e->getMessage());
    sendError("Server error: " . $e->getMessage(), 500);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>
