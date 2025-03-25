
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';
require_once '../../vendor/autoload.php';

// Enable CORS
enableCORS();

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

// This endpoint generates a client token for Braintree
try {
    // Initialize Braintree Gateway with production credentials
    $gateway = new Braintree\Gateway([
        'environment' => 'production',
        'merchantId' => 'pszgyg5dgnw997bx',
        'publicKey' => 'df6b3f98fhfj57mh',
        'privateKey' => 'faedbfa95f2bf78f2ba4c1cc444dc63b'
    ]);
    
    // Generate a client token
    $clientToken = $gateway->clientToken()->generate();
    
    // Log the token generation
    addLog('info', 'Generated Braintree client token', [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR']
    ]);
    
    // Send the response
    sendResponse(['clientToken' => $clientToken]);
    
} catch (Exception $e) {
    // Log error
    addLog('error', 'Error generating Braintree client token', [
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
    // Send error response
    sendError('Failed to generate client token: ' . $e->getMessage(), 500);
}
?>
