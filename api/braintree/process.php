
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';
require_once '../../vendor/autoload.php';

// Enable CORS
enableCORS();

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get request data
$data = getRequestData();

// Validate request data
if (!isset($data['paymentMethodNonce']) || !isset($data['amount']) || !isset($data['orderId'])) {
    sendError('Missing required fields', 400);
}

// This endpoint processes a payment with Braintree
try {
    // Initialize Braintree Gateway with production credentials
    $gateway = new Braintree\Gateway([
        'environment' => 'production',
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
        addLog('info', 'Processed payment through Braintree', [
            'orderId' => $data['orderId'],
            'amount' => $data['amount'],
            'transactionId' => $transactionId,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
        // Send success response
        sendResponse([
            'success' => true,
            'transactionId' => $transactionId
        ]);
    } else {
        // Transaction failed
        addLog('error', 'Braintree transaction failed', [
            'orderId' => $data['orderId'],
            'amount' => $data['amount'],
            'message' => $result->message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
        sendError('Transaction failed: ' . $result->message, 400);
    }
    
} catch (Exception $e) {
    // Log error
    addLog('error', 'Error processing payment through Braintree', [
        'error' => $e->getMessage(),
        'orderId' => $data['orderId'] ?? 'unknown',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
    // Send error response
    sendError('Failed to process payment: ' . $e->getMessage(), 500);
}
?>
