<?php
// Enable CORS
function enableCORS() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Send JSON response
function sendResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Send error response
function sendError($message, $status = 400) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode(['error' => $message]);
    exit;
}

// Get JSON data from request
function getRequestData() {
    $json = file_get_contents('php://input');
    return json_decode($json, true);
}

// Format data for API responses
function formatCustomer($row) {
    return [
        'id' => (string)$row['id'],
        'firstName' => $row['firstName'],
        'lastName' => $row['lastName'],
        'companyName' => $row['companyName'],
        'vatId' => $row['vatId'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'street' => $row['street'],
        'city' => $row['city'],
        'zipCode' => $row['zipCode'],
        'lastPurchase' => $row['lastPurchase'],
        'totalPurchases' => (float)$row['totalPurchases']
    ];
}

function formatColor($row) {
    return [
        'id' => (string)$row['id'],
        'title' => $row['title'],
        'htmlColor' => $row['htmlColor'],
        'imageUrl' => $row['imageUrl'],
        'thickness' => (int)$row['thickness'],
        'priceWithoutVat' => (float)$row['priceWithoutVat'],
        'priceWithVat' => (float)$row['priceWithVat'],
        'active' => (bool)$row['active']
    ];
}

function formatOrder($row, $products = []) {
    return [
        'id' => (string)$row['id'],
        'customerId' => (string)$row['customerId'],
        'orderDate' => $row['orderDate'],
        'products' => $products,
        'totalCostWithoutVat' => (float)$row['totalCostWithoutVat'],
        'totalCostWithVat' => (float)$row['totalCostWithVat'],
        'shippingMethod' => $row['shippingMethod'],
        'paymentMethod' => $row['paymentMethod'],
        'status' => $row['status']
    ];
}

function formatProduct($row) {
    return [
        'id' => (string)$row['id'],
        'colorId' => (string)$row['colorId'],
        'length' => (int)$row['length'],
        'width' => (int)$row['width'],
        'thickness' => (int)$row['thickness'],
        'surfaceArea' => (float)$row['surfaceArea'],
        'borders' => [
            'top' => (bool)$row['borderTop'],
            'right' => (bool)$row['borderRight'],
            'bottom' => (bool)$row['borderBottom'],
            'left' => (bool)$row['borderLeft']
        ],
        'drilling' => (bool)$row['drilling'],
        'quantity' => (int)$row['quantity'],
        'pricePerUnit' => (float)$row['pricePerUnit'],
        'totalPrice' => (float)$row['totalPrice']
    ];
}

// Logging function
function addLog($level, $message, $details = []) {
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'level' => $level,
        'message' => $message,
        'details' => $details
    ];
    
    // Log directory - admin folder if called from admin, root otherwise
    $logDir = strpos($_SERVER['SCRIPT_FILENAME'], '/admin/') !== false ? __DIR__ . '/../admin/' : __DIR__ . '/../';
    $logFile = $logDir . 'logs.json';
    
    // Get existing logs
    $logs = [];
    if (file_exists($logFile)) {
        $logsJson = file_get_contents($logFile);
        $logs = json_decode($logsJson, true) ?: [];
    }
    
    // Add new log
    array_unshift($logs, $logEntry);
    
    // Keep only the most recent 1000 logs
    if (count($logs) > 1000) {
        $logs = array_slice($logs, 0, 1000);
    }
    
    // Save logs
    file_put_contents($logFile, json_encode($logs, JSON_PRETTY_PRINT));
    
    // Also log to error_log for server logs
    error_log("[{$logEntry['timestamp']}] [{$level}] {$message}");
}

// Function to send order status email notification
function sendOrderStatusEmail($type, $orderId, $customerEmail) {
    global $conn;
    
    try {
        // Get order info
        $orderStmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
        $orderStmt->bind_param("s", $orderId);
        $orderStmt->execute();
        $orderResult = $orderStmt->get_result();
        
        if ($orderResult->num_rows === 0) {
            addLog('error', "Order not found for email notification", ['orderId' => $orderId]);
            return false;
        }
        
        $order = $orderResult->fetch_assoc();
        
        // Get customer info
        $customerStmt = $conn->prepare("SELECT firstName, lastName FROM customers WHERE id = ?");
        $customerStmt->bind_param("i", $order['customerId']);
        $customerStmt->execute();
        $customerResult = $customerStmt->get_result();
        $customer = $customerResult->fetch_assoc();
        
        // Set up email data based on type
        $subject = "";
        $message = "";
        
        switch ($type) {
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
                addLog('error', "Invalid email type", ['type' => $type, 'orderId' => $orderId]);
                return false;
        }
        
        // Set up email headers
        $headers = 'From: LCC Naročilo razreza <info@lcc-razrez.si>' . "\r\n";
        $headers .= 'Reply-To: info@lcc-razrez.si' . "\r\n";
        $headers .= 'MIME-Version: 1.0' . "\r\n";
        $headers .= 'Content-type: text/plain; charset=UTF-8' . "\r\n";
        
        // Log the email information
        error_log("Attempting to send status email: Type={$type}, OrderID={$orderId}, To={$customerEmail}");
        error_log("Subject: {$subject}");
        error_log("Message: {$message}");
        
        // Send the email
        $mailSent = mail($customerEmail, $subject, $message, $headers);
        
        if ($mailSent) {
            addLog('info', "Status email sent successfully", [
                'type' => $type,
                'orderId' => $orderId,
                'recipient' => $customerEmail
            ]);
            return true;
        } else {
            $error = error_get_last();
            addLog('error', "Failed to send status email", [
                'type' => $type,
                'orderId' => $orderId,
                'recipient' => $customerEmail,
                'error' => $error ? $error['message'] : 'Unknown error'
            ]);
            return false;
        }
    } catch (Exception $e) {
        addLog('error', "Exception while sending status email", [
            'type' => $type,
            'orderId' => $orderId,
            'error' => $e->getMessage()
        ]);
        return false;
    }
}

// Handle email sending
function sendOrderEmail($type, $order, $customerEmail) {
    // Get customer info
    $conn = getConnection();
    $customerStmt = $conn->prepare("SELECT firstName, lastName FROM customers WHERE id = ?");
    $customerStmt->bind_param("i", $order['customerId']);
    $customerStmt->execute();
    $result = $customerStmt->get_result();
    $customer = $result->fetch_assoc();
    
    // In a real app, you would send an actual email here
    // For now, just log it
    addLog(
        'info',
        "Email would be sent for order #{$order['id']}",
        [
            'type' => $type,
            'customerEmail' => $customerEmail,
            'customerName' => $customer['firstName'] . ' ' . $customer['lastName'],
            'orderTotal' => $order['totalCostWithVat']
        ]
    );
    
    return ['success' => true, 'message' => 'Email logged successfully'];
}

// Session handling
function requireLogin() {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        // If AJAX request
        if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') {
            sendError('Unauthorized', 401);
        }
        // If regular request
        header('Location: /login.php');
        exit;
    }
    return $_SESSION['user_id'];
}

function isLoggedIn() {
    session_start();
    return isset($_SESSION['user_id']);
}
?>
