
<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Output some debug info
echo "Direct setup script started...<br>";

// Include the actual setup file
require_once 'setup/setup.php';
?>
