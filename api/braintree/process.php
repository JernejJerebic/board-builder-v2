
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';
require_once '../../vendor/autoload.php';

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle OPTIONS method for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get request data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate request data
if (!isset($data['paymentMethodNonce']) || !isset($data['amount']) || !isset($data['orderId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// This endpoint processes a payment with Braintree
try {
    // Initialize Braintree Gateway with production credentials
    $gateway = new Braintree\Gateway([
        'environment' => 'production', // Use production environment
        'merchantId' => 'pszgyg5dgnw997bx',
        'publicKey' => 'df6b3f98fhfj57mh',
        'privateKey' => 'faedbfa95f2bf78f2ba4c1cc444dc63b'
    ]);
    
    // Process the payment
    $result = $gateway->transaction()->sale([
        'amount' => $data['amount'],
        'paymentMethodNonce' => $data['paymentMethodNonce'],
        'options' => [
            'submitForSettlement' => true
        ]
    ]);
    
    if ($result->success) {
        // Transaction successful
        $transactionId = $result->transaction->id;
        
        // Log the payment processing
        error_log('Processed payment through Braintree for order ' . $data['orderId']);
        
        // Send success response
        echo json_encode([
            'success' => true,
            'transactionId' => $transactionId
        ]);
    } else {
        // Transaction failed
        error_log('Braintree transaction failed: ' . $result->message);
        
        http_response_code(400);
        echo json_encode(['error' => 'Transaction failed: ' . $result->message]);
    }
    
} catch (Exception $e) {
    // Log error
    error_log('Error processing payment through Braintree: ' . $e->getMessage());
    
    // Send error response
    http_response_code(500);
    echo json_encode(['error' => 'Failed to process payment: ' . $e->getMessage()]);
}
?>
