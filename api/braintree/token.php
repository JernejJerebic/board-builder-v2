
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';

// Enable CORS
enableCORS();

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

// This endpoint generates a client token for Braintree
try {
    // In a real implementation, you would include the Braintree PHP SDK
    // and use it to generate a client token
    
    // Example with Braintree SDK:
    /*
    require_once '../vendor/autoload.php';
    
    $gateway = new Braintree\Gateway([
        'environment' => 'sandbox',
        'merchantId' => 'your_merchant_id',
        'publicKey' => 'your_public_key',
        'privateKey' => 'your_private_key'
    ]);
    
    $clientToken = $gateway->clientToken()->generate();
    */
    
    // For demo purposes, we'll just return a fake token
    // IMPORTANT: In production, generate a real token with the Braintree SDK
    $clientToken = 'sandbox_' . bin2hex(random_bytes(10));
    
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
