
<?php
session_start();

// Clear session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Redirect to home page
header('Location: /');
exit;
?>
