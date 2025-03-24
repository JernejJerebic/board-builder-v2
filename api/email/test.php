
<?php
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log server information
error_log("Email Test - PHP Version: " . phpversion());
error_log("Email Test - Server: " . $_SERVER['SERVER_SOFTWARE']);
error_log("Email Test - Directory: " . __DIR__);
error_log("Email Test - mail.force_extra_parameters: " . ini_get('mail.force_extra_parameters'));
error_log("Email Test - mail.add_x_header: " . ini_get('mail.add_x_header'));
error_log("Email Test - SMTP: " . ini_get('SMTP'));
error_log("Email Test - smtp_port: " . ini_get('smtp_port'));
error_log("Email Test - sendmail_path: " . ini_get('sendmail_path'));

// Send a test email
$to = 'jerebic.jernej@gmail.com';
$subject = 'LCC Test Email ' . date('Y-m-d H:i:s');
$message = '
<html>
<head>
  <title>Email Test</title>
</head>
<body>
  <h2>This is a test email from LCC app</h2>
  <p>If you received this email, then the mail function is working correctly.</p>
  <p>Server time: ' . date('Y-m-d H:i:s') . '</p>
  <p>PHP version: ' . phpversion() . '</p>
</body>
</html>';
$headers = 'From: LCC Naročilo razreza <info@lcc.si>' . "\r\n";
$headers .= 'Reply-To: info@lcc.si' . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion() . "\r\n";
$headers .= 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-Type: text/html; charset=UTF-8' . "\r\n";
$headers .= 'X-Test-Email: true' . "\r\n";

error_log("Email Test - Attempting to send test email to: {$to}");
error_log("Email Test - Headers: " . str_replace("\r\n", "|", $headers));

// Try to send email
$success = mail($to, $subject, $message, $headers);

// Prepare response
$response = [
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'mail_function_exists' => function_exists('mail'),
    'mail_attempt_success' => $success,
];

// Get last error if any
$lastError = error_get_last();
if ($lastError) {
    $response['last_error'] = $lastError;
    error_log("Email Test - Last error: " . json_encode($lastError));
}

if ($success) {
    error_log("Email Test - Mail function returned success");
    $response['message'] = 'Test email sent successfully to ' . $to;
    sendResponse($response);
} else {
    error_log("Email Test - Mail function returned failure");
    $response['message'] = 'Failed to send test email. Check server logs for details.';
    sendError($response['message'], 500, $response);
}

/**
 * Extended sendError function to include additional data
 */
function sendError($message, $status = 400, $additionalData = []) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode(array_merge(['error' => $message], $additionalData));
    exit;
}
?>
