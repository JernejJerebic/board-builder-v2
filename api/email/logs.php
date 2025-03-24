
<?php
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Process only GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError("Method not supported", 405);
}

// Get the server's error log path
$possibleLogPaths = [
    ini_get('error_log'),
    '/var/log/apache2/error.log',
    '/var/log/httpd/error.log',
    '/var/log/nginx/error.log',
    __DIR__ . '/../../error_log',
    __DIR__ . '/../error_log',
    __DIR__ . '/error_log'
];

$logContents = [];
$foundLogs = false;

foreach ($possibleLogPaths as $logPath) {
    if ($logPath && file_exists($logPath) && is_readable($logPath)) {
        // Get the last 100 lines of the log file
        $command = "tail -n 100 " . escapeshellarg($logPath);
        $output = [];
        exec($command, $output);
        
        if (!empty($output)) {
            $logContents[$logPath] = $output;
            $foundLogs = true;
        }
    }
}

// Filter for email-related log entries
$emailLogs = [];

if ($foundLogs) {
    foreach ($logContents as $path => $lines) {
        foreach ($lines as $line) {
            if (strpos($line, 'Email') !== false || strpos($line, 'email') !== false || strpos($line, 'mail(') !== false) {
                $emailLogs[] = [
                    'source' => $path,
                    'content' => $line
                ];
            }
        }
    }
}

// Include PHP mail configuration
$mailConfig = [
    'function_exists' => function_exists('mail'),
    'php_version' => phpversion(),
    'mail.add_x_header' => ini_get('mail.add_x_header'),
    'mail.force_extra_parameters' => ini_get('mail.force_extra_parameters'),
    'SMTP' => ini_get('SMTP'),
    'smtp_port' => ini_get('smtp_port'),
    'sendmail_path' => ini_get('sendmail_path'),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
];

// Return the results
sendResponse([
    'found_logs' => $foundLogs,
    'email_logs' => $emailLogs,
    'mail_configuration' => $mailConfig,
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
