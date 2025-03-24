
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';

// Require admin login
session_start();
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    header('Location: /admin/login.php');
    exit;
}

// Get logs from file
$logs = [];
if (file_exists('logs.json')) {
    $logsJson = file_get_contents('logs.json');
    $logs = json_decode($logsJson, true) ?: [];
}

// Set headers for file download
header('Content-Type: application/json');
header('Content-Disposition: attachment; filename="logs_' . date('Y-m-d') . '.json"');

// Output logs as JSON
echo json_encode($logs, JSON_PRETTY_PRINT);
exit;
?>
