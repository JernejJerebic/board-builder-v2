
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendError("Method not supported", 405);
}

// Get request data
$data = getRequestData();

// Validate required fields
if (!isset($data['customer']) || !isset($data['products']) || empty($data['products'])) {
    sendError("Customer data and at least one product are required");
}

$conn = getConnection();

// Start transaction
$conn->begin_transaction();

try {
    // Check if customer exists
    $email = $data['customer']['email'];
    $customerExists = false;
    $customerId = null;
    
    if ($email) {
        $checkStmt = $conn->prepare("SELECT id FROM customers WHERE email = ?");
        $checkStmt->bind_param("s", $email);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        
        if ($result->num_rows > 0) {
            $customer = $result->fetch_assoc();
            $customerId = $customer['id'];
            $customerExists = true;
        }
    }
    
    // Insert or update customer
    if ($customerExists) {
        // Update existing customer
        $updateStmt = $conn->prepare("
            UPDATE customers 
            SET firstName = ?, lastName = ?, companyName = ?, vatId = ?, 
                phone = ?, street = ?, city = ?, zipCode = ? 
            WHERE id = ?
        ");
        
        $updateStmt->bind_param(
            "ssssssssi",
            $data['customer']['firstName'],
            $data['customer']['lastName'],
            $data['customer']['companyName'],
            $data['customer']['vatId'],
            $data['customer']['phone'],
            $data['customer']['street'],
            $data['customer']['city'],
            $data['customer']['zipCode'],
            $customerId
        );
        
        $updateStmt->execute();
    } else {
        // Insert new customer
        $insertStmt = $conn->prepare("
            INSERT INTO customers (
                firstName, lastName, companyName, vatId, email, 
                phone, street, city, zipCode
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $insertStmt->bind_param(
            "sssssssss",
            $data['customer']['firstName'],
            $data['customer']['lastName'],
            $data['customer']['companyName'],
            $data['customer']['vatId'],
            $data['customer']['email'],
            $data['customer']['phone'],
            $data['customer']['street'],
            $data['customer']['city'],
            $data['customer']['zipCode']
        );
        
        $insertStmt->execute();
        $customerId = $conn->insert_id;
    }
    
    // Generate a unique order ID (UUID)
    $orderId = uniqid();
    
    // Insert order
    $orderStmt = $conn->prepare("
        INSERT INTO orders (
            id, customerId, orderDate, totalCostWithoutVat, totalCostWithVat, 
            shippingMethod, paymentMethod, status
        ) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)
    ");
    
    $orderStmt->bind_param(
        "siddsss", 
        $orderId,
        $customerId, 
        $data['totalCostWithoutVat'], 
        $data['totalCostWithVat'], 
        $data['shippingMethod'], 
        $data['paymentMethod'], 
        $data['status']
    );
    
    $orderStmt->execute();
    
    // Insert products for this order
    foreach ($data['products'] as $product) {
        $productStmt = $conn->prepare("
            INSERT INTO products (
                orderId, colorId, length, width, thickness, surfaceArea,
                borderTop, borderRight, borderBottom, borderLeft,
                drilling, quantity, pricePerUnit, totalPrice
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        ");
        
        $borderTop = $product['borders']['top'] ? 1 : 0;
        $borderRight = $product['borders']['right'] ? 1 : 0;
        $borderBottom = $product['borders']['bottom'] ? 1 : 0;
        $borderLeft = $product['borders']['left'] ? 1 : 0;
        $drilling = $product['drilling'] ? 1 : 0;
        
        $productStmt->bind_param(
            "siiidiiiiiidd",
            $orderId,
            $product['colorId'],
            $product['length'],
            $product['width'],
            $product['thickness'],
            $product['surfaceArea'],
            $borderTop,
            $borderRight,
            $borderBottom,
            $borderLeft,
            $drilling,
            $product['quantity'],
            $product['pricePerUnit'],
            $product['totalPrice']
        );
        
        $productStmt->execute();
    }
    
    // Update customer's last purchase and total purchases
    $updateCustomerStmt = $conn->prepare("
        UPDATE customers 
        SET lastPurchase = CURDATE(), 
            totalPurchases = totalPurchases + ? 
        WHERE id = ?
    ");
    
    $updateCustomerStmt->bind_param("di", $data['totalCostWithVat'], $customerId);
    $updateCustomerStmt->execute();
    
    // Commit transaction
    $conn->commit();
    
    // Send order confirmation email
    sendOrderEmail($orderId, $data['customer']['email'], $customerId);
    
    // Send admin notification email
    sendAdminOrderNotification($orderId);
    
    sendResponse([
        'success' => true,
        'message' => 'Order created successfully',
        'orderId' => $orderId
    ], 201);
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    
    // Log error
    error_log("Order creation error: " . $e->getMessage());
    
    sendError("Failed to create order: " . $e->getMessage());
}

$conn->close();

// Function to send order confirmation email
function sendOrderEmail($orderId, $customerEmail, $customerId) {
    global $conn;
    
    try {
        // Get customer info
        $stmt = $conn->prepare("SELECT firstName, lastName FROM customers WHERE id = ?");
        $stmt->bind_param("i", $customerId);
        $stmt->execute();
        $result = $stmt->get_result();
        $customer = $result->fetch_assoc();
        
        // Get order info
        $orderStmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
        $orderStmt->bind_param("s", $orderId);
        $orderStmt->execute();
        $orderResult = $orderStmt->get_result();
        $order = $orderResult->fetch_assoc();
        
        // Set up email data
        $subject = "LCC Naročilo razreza - Novo naročilo #{$orderId}";
        $message = "Spoštovani {$customer['firstName']} {$customer['lastName']},\n\n";
        $message .= "Zahvaljujemo se vam za vaše naročilo (#{$orderId}). V najkrajšem možnem času bomo začeli z obdelavo vašega naročila.\n\n";
        $message .= "Podrobnosti naročila:\n";
        $message .= "Skupni znesek: €" . number_format($order['totalCostWithVat'], 2) . "\n";
        $message .= "Način plačila: " . ucfirst(str_replace('_', ' ', $order['paymentMethod'])) . "\n";
        $message .= "Način dostave: " . ($order['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava') . "\n\n";
        $message .= "Lep pozdrav,\nEkipa LCC Naročilo razreza";
        
        // Set up headers
        $headers = "From: LCC Naročilo razreza <info@lcc-razrez.si>\r\n";
        $headers .= "Reply-To: info@lcc-razrez.si\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        
        // Log the email that would be sent
        error_log("Sending order confirmation email to {$customerEmail}");
        error_log("Subject: {$subject}");
        error_log("Message: {$message}");
        
        // Send email
        if (mail($customerEmail, $subject, $message, $headers)) {
            error_log("Order confirmation email sent successfully to {$customerEmail}");
            return true;
        } else {
            error_log("Failed to send order confirmation email to {$customerEmail}");
            return false;
        }
    } catch (Exception $e) {
        error_log("Error sending order confirmation email: " . $e->getMessage());
        return false;
    }
}

// Function to send admin notification email
function sendAdminOrderNotification($orderId) {
    global $conn;
    
    try {
        // Get order info
        $orderStmt = $conn->prepare("SELECT o.*, c.firstName, c.lastName, c.email FROM orders o JOIN customers c ON o.customerId = c.id WHERE o.id = ?");
        $orderStmt->bind_param("s", $orderId);
        $orderStmt->execute();
        $orderResult = $orderStmt->get_result();
        $order = $orderResult->fetch_assoc();
        
        // Admin email
        $adminEmail = "info@lcc-razrez.si";
        
        // Set up email data
        $subject = "Novo naročilo #{$orderId}";
        $message = "Prejeli ste novo naročilo #{$orderId}.\n\n";
        $message .= "Podrobnosti naročila:\n";
        $message .= "Stranka: {$order['firstName']} {$order['lastName']}\n";
        $message .= "Email: {$order['email']}\n";
        $message .= "Znesek: €" . number_format($order['totalCostWithVat'], 2) . "\n\n";
        $message .= "Prijavite se v administratorsko ploščo za več podrobnosti.";
        
        // Set up headers
        $headers = "From: LCC Naročilo razreza <noreply@lcc-razrez.si>\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        
        // Log the email that would be sent
        error_log("Sending admin notification email to {$adminEmail}");
        error_log("Subject: {$subject}");
        error_log("Message: {$message}");
        
        // Send email
        if (mail($adminEmail, $subject, $message, $headers)) {
            error_log("Admin notification email sent successfully");
            return true;
        } else {
            error_log("Failed to send admin notification email");
            return false;
        }
    } catch (Exception $e) {
        error_log("Error sending admin notification email: " . $e->getMessage());
        return false;
    }
}
?>
