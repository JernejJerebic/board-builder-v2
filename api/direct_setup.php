
<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Output some debug info
echo "Direct setup script started...<br>";
echo "Server name: " . $_SERVER['SERVER_NAME'] . "<br>";
echo "Request URI: " . $_SERVER['REQUEST_URI'] . "<br>";

// Include the actual setup file
require_once 'setup/setup.php';
?>
