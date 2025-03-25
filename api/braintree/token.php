
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
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// This endpoint generates a client token for Braintree
try {
    // Initialize Braintree Gateway with credentials
    $gateway = new Braintree\Gateway([
        'environment' => 'sandbox', // Use sandbox for testing
        'merchantId' => 'pszgyg5dgnw997bx',
        'publicKey' => 'df6b3f98fhfj57mh',
        'privateKey' => 'faedbfa95f2bf78f2ba4c1cc444dc63b'
    ]);
    
    // Generate a client token
    $clientToken = $gateway->clientToken()->generate();
    
    // Log the token generation
    error_log('Generated Braintree client token at ' . date('Y-m-d H:i:s'));
    
    // Send the response
    echo json_encode(['clientToken' => $clientToken]);
    
} catch (Exception $e) {
    // Log error
    error_log('Error generating Braintree client token: ' . $e->getMessage());
    
    // Send error response
    http_response_code(500);
    echo json_encode(['error' => 'Failed to generate client token: ' . $e->getMessage()]);
}
?>
