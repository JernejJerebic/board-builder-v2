
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';

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
    // In a real implementation, you would include the Braintree PHP SDK
    // and use it to process the payment
    
    // Example with Braintree SDK:
    /*
    require_once '../vendor/autoload.php';
    
    $gateway = new Braintree\Gateway([
        'environment' => 'sandbox',
        'merchantId' => 'your_merchant_id',
        'publicKey' => 'your_public_key',
        'privateKey' => 'your_private_key'
    ]);
    
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
        
        // Update order in database with transaction ID
        $conn = getConnection();
        $stmt = $conn->prepare("UPDATE orders SET transaction_id = ? WHERE id = ?");
        $stmt->bind_param("si", $transactionId, $data['orderId']);
        $stmt->execute();
        
        sendResponse([
            'success' => true,
            'transactionId' => $transactionId
        ]);
    } else {
        // Transaction failed
        sendError('Transaction failed: ' . $result->message, 400);
    }
    */
    
    // For demo purposes, we'll just simulate a successful transaction
    // IMPORTANT: In production, use the Braintree SDK to process the payment
    $transactionId = 'bt-' . time() . '-' . rand(100000, 999999);
    
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
