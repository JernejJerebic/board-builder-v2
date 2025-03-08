
<?php
// Enable CORS
function enableCORS() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    
    // Log CORS headers being set
    $timestamp = date('Y-m-d H:i:s');
    error_log("[{$timestamp}] CORS headers set for request: {$_SERVER['REQUEST_URI']}");
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Send JSON response
function sendResponse($data, $status = 200) {
    $timestamp = date('Y-m-d H:i:s');
    error_log("[{$timestamp}] Sending response with status {$status} for {$_SERVER['REQUEST_URI']}");
    
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Send error response
function sendError($message, $status = 400) {
    $timestamp = date('Y-m-d H:i:s');
    error_log("[{$timestamp}] ERROR: {$message} (Status: {$status}) for {$_SERVER['REQUEST_URI']}");
    
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode(['error' => $message]);
    exit;
}

// Get JSON data from request
function getRequestData() {
    $timestamp = date('Y-m-d H:i:s');
    $json = file_get_contents('php://input');
    error_log("[{$timestamp}] Request data received for {$_SERVER['REQUEST_URI']}: " . substr($json, 0, 100) . (strlen($json) > 100 ? '...' : ''));
    
    return json_decode($json, true);
}

// Convert MySQL row to API format
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
?>
