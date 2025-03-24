
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

// Advanced logging
$logId = uniqid('email_');
error_log("[Email {$logId}] REQUEST: Attempting to send email to {$to}");
error_log("[Email {$logId}] DETAILS: Subject: '{$subject}', HTML: " . ($isHtml ? 'Yes' : 'No'));
error_log("[Email {$logId}] CONFIG: PHP version: " . phpversion());
error_log("[Email {$logId}] CONFIG: mail.add_x_header: " . (ini_get('mail.add_x_header') ? 'On' : 'Off'));
error_log("[Email {$logId}] CONFIG: SMTP: " . (ini_get('SMTP') ?: 'Not set'));
error_log("[Email {$logId}] CONFIG: smtp_port: " . (ini_get('smtp_port') ?: 'Not set'));
error_log("[Email {$logId}] CONFIG: sendmail_path: " . (ini_get('sendmail_path') ?: 'Not set'));

// Set headers
$headers = 'From: LCC Naročilo razreza <info@lcc.si>' . "\r\n";
$headers .= 'Reply-To: info@lcc.si' . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion() . "\r\n";
$headers .= 'X-Request-ID: ' . $logId . "\r\n";

// Set proper headers for HTML emails
if ($isHtml) {
    $headers .= 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-Type: text/html; charset=UTF-8' . "\r\n";
}

error_log("[Email {$logId}] HEADERS: " . str_replace("\r\n", "|", $headers));

// Log message preview (limited to prevent huge logs)
$messagePreview = substr($message, 0, 200) . (strlen($message) > 200 ? '...' : '');
error_log("[Email {$logId}] MESSAGE PREVIEW: " . str_replace("\r\n", " ", $messagePreview));

// Try to send email using PHP's mail() function
$success = mail($to, $subject, $message, $headers);

if ($success) {
    // Log success
    error_log("[Email {$logId}] SUCCESS: Email successfully sent to {$to}");
    
    // Try to check if there's any error in the mail queue
    $lastError = error_get_last();
    if ($lastError) {
        error_log("[Email {$logId}] WARNING: Last error detected even though mail() returned true: " . json_encode($lastError));
    }
    
    sendResponse([
        'success' => true,
        'message' => "Email sent successfully to {$to}",
        'logId' => $logId
    ]);
} else {
    // Log failure details
    $lastError = error_get_last();
    $errorDetails = $lastError ? json_encode($lastError) : 'No details available';
    error_log("[Email {$logId}] ERROR: Failed to send email to {$to}");
    error_log("[Email {$logId}] ERROR DETAILS: {$errorDetails}");
    
    // Send detailed error response
    sendError("Failed to send email: " . ($lastError ? $lastError['message'] : 'Unknown error'), 500);
}
?>
