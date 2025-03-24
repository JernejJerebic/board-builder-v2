
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';
require_once '../../includes/mailer.php';

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
    
    // Get the complete order and customer information for emails
    $orderStmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
    $orderStmt->bind_param("s", $orderId);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();
    $order = $orderResult->fetch_assoc();
    
    $customerStmt = $conn->prepare("SELECT * FROM customers WHERE id = ?");
    $customerStmt->bind_param("i", $customerId);
    $customerStmt->execute();
    $customerResult = $customerStmt->get_result();
    $customer = $customerResult->fetch_assoc();
    
    // Send order confirmation email to customer
    $emailResult = sendOrderConfirmationEmail($orderId, $data['customer']['email'], $order, $customer);
    
    // Log the email result
    addLog(
        $emailResult['success'] ? 'info' : 'error',
        $emailResult['success'] ? "Order confirmation email sent" : "Failed to send order confirmation email",
        ['orderId' => $orderId, 'recipient' => $data['customer']['email']]
    );
    
    // Send admin notification email
    $adminEmailResult = sendAdminOrderNotification($orderId, $order, $customer);
    
    // Log the admin email result
    addLog(
        $adminEmailResult['success'] ? 'info' : 'error',
        $adminEmailResult['success'] ? "Admin notification email sent" : "Failed to send admin notification email",
        ['orderId' => $orderId]
    );
    
    sendResponse([
        'success' => true,
        'message' => 'Order created successfully',
        'orderId' => $orderId,
        'emailSent' => $emailResult['success']
    ], 201);
    
} catch (Exception $e) {
    // Rollback on error
    $conn->rollback();
    
    // Log error
    error_log("Order creation error: " . $e->getMessage());
    addLog('error', "Order creation error", ['error' => $e->getMessage()]);
    
    sendError("Failed to create order: " . $e->getMessage());
}

$conn->close();
?>
