
<?php
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Process only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Method not supported", 405);
}

// Get request data
$data = getRequestData();

// Validate required fields
if (!isset($data['to_email']) || !isset($data['subject']) || !isset($data['message'])) {
    sendError("Email, subject, and message are required");
}

$to = $data['to_email'];
$subject = $data['subject'];
$message = $data['message'];
$isHtml = isset($data['is_html']) ? $data['is_html'] : true;

// Log the attempt
error_log("Attempting to send email to {$to} with subject '{$subject}'");

// Set headers
$headers = 'From: LCC Naročilo razreza <info@lcc.si>' . "\r\n";
$headers .= 'Reply-To: info@lcc.si' . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion() . "\r\n";

// Set proper headers for HTML emails
if ($isHtml) {
    $headers .= 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-Type: text/html; charset=UTF-8' . "\r\n";
}

// Try to send email using PHP's mail() function
$success = mail($to, $subject, $message, $headers);

if ($success) {
    // Log success
    error_log("Email successfully sent to {$to}");
    
    sendResponse([
        'success' => true,
        'message' => "Email sent successfully to {$to}"
    ]);
} else {
    // Log failure
    $error = error_get_last();
    error_log("Failed to send email to {$to}: " . ($error ? $error['message'] : 'Unknown error'));
    
    sendError("Failed to send email: " . ($error ? $error['message'] : 'Unknown error'));
}
?>
