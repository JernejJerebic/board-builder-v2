
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
error_log("Email request received: type={$type}, orderId={$orderId}, email={$email}, isAdmin={$isAdmin}");

// Prepare email content based on type
$subject = "";
$message = "";

if ($isAdmin) {
    // Admin notification
    $subject = "Novo naročilo #{$orderId}";
    $message = createAdminEmailContent($orderId, $order, $customer);
} else {
    // Customer email
    switch ($type) {
        case 'new':
            $subject = "LCC Naročilo razreza - Novo naročilo #{$orderId}";
            $message = createCustomerOrderConfirmation($orderId, $order, $customer);
            break;
        case 'progress':
            $subject = "LCC Naročilo razreza - Naročilo #{$orderId} v obdelavi";
            $message = createOrderStatusEmail('progress', $orderId, $order, $customer);
            break;
        case 'completed':
            $subject = "LCC Naročilo razreza - Naročilo #{$orderId} zaključeno";
            $message = createOrderStatusEmail('completed', $orderId, $order, $customer);
            break;
        default:
            sendError("Invalid email type");
    }
}

// Send the email using direct mail() function
$headers = 'From: LCC Naročilo razreza <info@lcc.si>' . "\r\n";
$headers .= 'Reply-To: info@lcc.si' . "\r\n";
$headers .= 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-Type: text/html; charset=UTF-8' . "\r\n";

$success = mail($email, $subject, $message, $headers);

if ($success) {
    error_log("Email successfully sent to {$email}");
    
    sendResponse([
        "success" => true, 
        "message" => "Email successfully sent to {$email}"
    ]);
} else {
    $error = error_get_last();
    error_log("Failed to send email to {$email}: " . ($error ? $error['message'] : 'Unknown error'));
    
    sendError("Failed to send email: " . ($error ? $error['message'] : 'Unknown error'));
}

$conn->close();

/**
 * Create HTML email content for customer order confirmation
 */
function createCustomerOrderConfirmation($orderId, $orderDetails, $customer) {
    $paymentMethod = getPaymentMethodName($orderDetails['paymentMethod']);
    $shippingMethod = $orderDetails['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava';
    
    return '
    <!DOCTYPE html>
    <html lang="sl">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
            .content { padding: 20px 0; }
            h1 { color: #1D6EC1; }
            table { width: 100%; border-collapse: collapse; }
            table th, table td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Potrditev naročila #' . htmlspecialchars($orderId) . '</h1>
            </div>
            <div class="content">
                <p>Spoštovani ' . htmlspecialchars($customer['firstName'] . ' ' . $customer['lastName']) . ',</p>
                <p>Zahvaljujemo se vam za vaše naročilo. V najkrajšem možnem času bomo začeli z obdelavo.</p>
                
                <h2>Podrobnosti naročila</h2>
                <table>
                    <tr>
                        <th>Skupni znesek:</th>
                        <td>€' . number_format($orderDetails['totalCostWithVat'], 2) . '</td>
                    </tr>
                    <tr>
                        <th>Način plačila:</th>
                        <td>' . $paymentMethod . '</td>
                    </tr>
                    <tr>
                        <th>Način dostave:</th>
                        <td>' . $shippingMethod . '</td>
                    </tr>
                </table>
                
                <p>Za vsa vprašanja smo vam na voljo.</p>
                <p>Lep pozdrav,<br>Ekipa LCC Naročilo razreza</p>
            </div>
        </div>
    </body>
    </html>';
}

/**
 * Create HTML email content for order status updates
 */
function createOrderStatusEmail($type, $orderId, $orderDetails, $customer) {
    $statusMessage = '';
    $title = '';
    
    if ($type === 'progress') {
        $title = 'Naročilo v obdelavi';
        $statusMessage = "Vaše naročilo (#{$orderId}) je trenutno v obdelavi. Obvestili vas bomo, ko bo pripravljeno za prevzem ali dostavo.";
    } else {
        $title = 'Naročilo zaključeno';
        $statusMessage = "Vaše naročilo (#{$orderId}) je zaključeno in pripravljeno " . 
            ($orderDetails['shippingMethod'] === 'pickup' ? 'za prevzem' : 'za dostavo') . ".";
    }
    
    return '
    <!DOCTYPE html>
    <html lang="sl">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
            .content { padding: 20px 0; }
            h1 { color: #1D6EC1; }
            table { width: 100%; border-collapse: collapse; }
            table th, table td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>' . $title . ' #' . htmlspecialchars($orderId) . '</h1>
            </div>
            <div class="content">
                <p>Spoštovani ' . htmlspecialchars($customer['firstName'] . ' ' . $customer['lastName']) . ',</p>
                <p>' . $statusMessage . '</p>
                
                <h2>Podrobnosti naročila</h2>
                <table>
                    <tr>
                        <th>Številka naročila:</th>
                        <td>#' . htmlspecialchars($orderId) . '</td>
                    </tr>
                    <tr>
                        <th>Skupni znesek:</th>
                        <td>€' . number_format($orderDetails['totalCostWithVat'], 2) . '</td>
                    </tr>
                    <tr>
                        <th>Način dostave:</th>
                        <td>' . ($orderDetails['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . '</td>
                    </tr>
                </table>
                
                <p>V primeru vprašanj nas kontaktirajte na <a href="mailto:info@lcc-razrez.si">info@lcc-razrez.si</a>.</p>
                <p>Lep pozdrav,<br>Ekipa LCC Naročilo razreza</p>
            </div>
        </div>
    </body>
    </html>';
}

/**
 * Create HTML email content for admin notifications
 */
function createAdminEmailContent($orderId, $orderDetails, $customer) {
    return '
    <!DOCTYPE html>
    <html lang="sl">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
            .content { padding: 20px 0; }
            h1 { color: #1D6EC1; }
            table { width: 100%; border-collapse: collapse; }
            table th, table td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
            .button { display: inline-block; padding: 10px 20px; background-color: #1D6EC1; color: #ffffff; text-decoration: none; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Novo naročilo #' . htmlspecialchars($orderId) . '</h1>
            </div>
            <div class="content">
                <p>Prejeli ste novo naročilo <strong>#' . htmlspecialchars($orderId) . '</strong>.</p>
                
                <h2>Podatki o stranki</h2>
                <table>
                    <tr>
                        <th>Ime in priimek:</th>
                        <td>' . htmlspecialchars($customer['firstName'] . ' ' . $customer['lastName']) . '</td>
                    </tr>
                    <tr>
                        <th>Email:</th>
                        <td>' . htmlspecialchars($customer['email']) . '</td>
                    </tr>
                    <tr>
                        <th>Telefon:</th>
                        <td>' . htmlspecialchars($customer['phone']) . '</td>
                    </tr>
                </table>
                
                <h2>Podrobnosti naročila</h2>
                <table>
                    <tr>
                        <th>Skupni znesek:</th>
                        <td>€' . number_format($orderDetails['totalCostWithVat'], 2) . '</td>
                    </tr>
                    <tr>
                        <th>Način plačila:</th>
                        <td>' . getPaymentMethodName($orderDetails['paymentMethod']) . '</td>
                    </tr>
                    <tr>
                        <th>Način dostave:</th>
                        <td>' . ($orderDetails['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . '</td>
                    </tr>
                </table>
                
                <p><a href="https://your-domain.com/admin/order-detail.php?id=' . htmlspecialchars($orderId) . '" class="button">Oglejte si naročilo</a></p>
            </div>
        </div>
    </body>
    </html>';
}

/**
 * Get human-readable payment method name
 * 
 * @param string $method Payment method key
 * @return string Human-readable name
 */
function getPaymentMethodName($method) {
    switch($method) {
        case 'bank_transfer':
            return 'Bančno nakazilo';
        case 'credit_card':
            return 'Kreditna kartica';
        case 'pickup_at_shop':
            return 'Plačilo ob prevzemu v trgovini';
        case 'payment_on_delivery':
            return 'Plačilo ob dostavi';
        default:
            return 'Neznano';
    }
}
?>
