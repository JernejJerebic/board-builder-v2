
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
    $subject = "Novo naročilo";
    $message = createAdminEmailContent($orderId, $order, $customer);
} else {
    // Customer email
    switch ($type) {
        case 'new':
            $subject = "LCC Naročilo razreza - Novo naročilo";
            $message = createCustomerOrderConfirmation($orderId, $order, $customer);
            break;
        case 'progress':
            $subject = "LCC Naročilo razreza - Naročilo v obdelavi";
            $message = createOrderStatusEmail('progress', $orderId, $order, $customer);
            break;
        case 'completed':
            $subject = "LCC Naročilo razreza - Naročilo zaključeno";
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
 * Create customer information HTML
 */
function createCustomerInfoSection($customer) {
    $companyInfo = !empty($customer['companyName']) ? 
        "<tr><th>Podjetje:</th><td>" . htmlspecialchars($customer['companyName']) . "</td></tr>" : '';
    
    $vatInfo = !empty($customer['vatId']) ? 
        "<tr><th>ID za DDV:</th><td>" . htmlspecialchars($customer['vatId']) . "</td></tr>" : '';
    
    $phone = !empty($customer['phone']) ? htmlspecialchars($customer['phone']) : 'Ni podan';
    
    return '
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
                <td>' . $phone . '</td>
            </tr>
            ' . $companyInfo . '
            ' . $vatInfo . '
            <tr>
                <th>Naslov:</th>
                <td>' . htmlspecialchars($customer['street'] . ', ' . $customer['zipCode'] . ' ' . $customer['city']) . '</td>
            </tr>
        </table>
    ';
}

/**
 * Create HTML email content for customer order confirmation
 */
function createCustomerOrderConfirmation($orderId, $orderDetails, $customer) {
    $paymentMethod = getPaymentMethodName($orderDetails['paymentMethod']);
    $shippingMethod = $orderDetails['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava';
    $customerName = htmlspecialchars($customer['firstName'] . ' ' . $customer['lastName']);
    $customerInfo = createCustomerInfoSection($customer);
    
    return '
    <!DOCTYPE html>
    <html lang="sl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
            .logo { max-width: 200px; height: auto; }
            .content { padding: 20px 0; }
            h1 { color: #1D6EC1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            table th, table td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
            .footer { text-align: center; padding: 20px 0; color: #888; font-size: 14px; border-top: 1px solid #eee; }
            @media (max-width: 600px) {
                .container { width: 100%; padding: 10px; }
                table { font-size: 14px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" class="logo">
                <h1>Potrditev naročila</h1>
            </div>
            <div class="content">
                <p>Spoštovani ' . $customerName . ',</p>
                <p>Zahvaljujemo se vam za vaše naročilo. V najkrajšem možnem času bomo začeli z obdelavo.</p>
                
                ' . $customerInfo . '
                
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
            <div class="footer">
                <p>Za dodatne informacije nas kontaktirajte na <a href="mailto:info@lcc.si">info@lcc.si</a> ali po telefonu na +386 7 393 07 00.</p>
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
    $customerName = htmlspecialchars($customer['firstName'] . ' ' . $customer['lastName']);
    $customerInfo = createCustomerInfoSection($customer);
    
    if ($type === 'progress') {
        $title = 'Naročilo v obdelavi';
        $statusMessage = "Vaše naročilo je trenutno v obdelavi. Obvestili vas bomo, ko bo pripravljeno za prevzem ali dostavo.";
    } else {
        $title = 'Naročilo zaključeno';
        $statusMessage = "Vaše naročilo je zaključeno in pripravljeno " . 
            ($orderDetails['shippingMethod'] === 'pickup' ? 'za prevzem' : 'za dostavo') . ".";
    }
    
    return '
    <!DOCTYPE html>
    <html lang="sl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
            .logo { max-width: 200px; height: auto; }
            .content { padding: 20px 0; }
            h1 { color: #1D6EC1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            table th, table td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
            .footer { text-align: center; padding: 20px 0; color: #888; font-size: 14px; border-top: 1px solid #eee; }
            @media (max-width: 600px) {
                .container { width: 100%; padding: 10px; }
                table { font-size: 14px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" class="logo">
                <h1>' . $title . '</h1>
            </div>
            <div class="content">
                <p>Spoštovani ' . $customerName . ',</p>
                <p>' . $statusMessage . '</p>
                
                ' . $customerInfo . '
                
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
                
                <p>V primeru vprašanj nas kontaktirajte na <a href="mailto:info@lcc.si">info@lcc.si</a>.</p>
                <p>Lep pozdrav,<br>Ekipa LCC Naročilo razreza</p>
            </div>
            <div class="footer">
                <p>Za dodatne informacije nas kontaktirajte na <a href="mailto:info@lcc.si">info@lcc.si</a> ali po telefonu na +386 7 393 07 00.</p>
            </div>
        </div>
    </body>
    </html>';
}

/**
 * Create HTML email content for admin notifications
 */
function createAdminEmailContent($orderId, $orderDetails, $customer) {
    $customerInfo = createCustomerInfoSection($customer);
    
    return '
    <!DOCTYPE html>
    <html lang="sl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
            .logo { max-width: 200px; height: auto; }
            .content { padding: 20px 0; }
            h1 { color: #1D6EC1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            table th, table td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
            .button { display: inline-block; padding: 10px 20px; background-color: #1D6EC1; color: #ffffff; text-decoration: none; border-radius: 4px; }
            .footer { text-align: center; padding: 20px 0; color: #888; font-size: 14px; border-top: 1px solid #eee; }
            @media (max-width: 600px) {
                .container { width: 100%; padding: 10px; }
                table { font-size: 14px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" class="logo">
                <h1>Novo naročilo</h1>
            </div>
            <div class="content">
                <p>Prejeli ste novo naročilo <strong>#' . htmlspecialchars($orderId) . '</strong>.</p>
                
                ' . $customerInfo . '
                
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
            <div class="footer">
                <p>Za dodatne informacije pokličite na +386 7 393 07 00.</p>
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
