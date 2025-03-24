
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';

session_start();

// Check if already logged in
if (isset($_SESSION['admin']) && $_SESSION['admin'] === true) {
    header('Location: /admin/orders.php');
    exit;
}

$error = '';

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // In a real app, you would hash the password and check against a database
    // For now, using simple hardcoded credentials
    if ($username === 'admin' && $password === 'admin123') {
        $_SESSION['admin'] = true;
        $_SESSION['user_id'] = 1;
        
        // Log the successful login
        addLog('info', 'Admin login successful', ['username' => $username]);
        
        header('Location: /admin/orders.php');
        exit;
    } else {
        $error = 'Napačno uporabniško ime ali geslo';
        
        // Log the failed login attempt
        addLog('warning', 'Failed admin login attempt', ['username' => $username]);
    }
}
?>

<!DOCTYPE html>
<html lang="sl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin prijava - LCC Naročilo razreza</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
            <div class="text-center mb-8">
                <a href="/">
                    <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" class="mx-auto h-16">
                </a>
                <h1 class="text-2xl font-bold mt-4">Admin prijava</h1>
            </div>
            
            <?php if ($error): ?>
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <?php echo $error; ?>
                </div>
            <?php endif; ?>
            
            <form method="POST" action="" class="space-y-4">
                <div class="form-group">
                    <label for="username" class="form-label">Uporabniško ime</label>
                    <input type="text" id="username" name="username" class="form-input" required>
                </div>
                
                <div class="form-group">
                    <label for="password" class="form-label">Geslo</label>
                    <input type="password" id="password" name="password" class="form-input" required>
                </div>
                
                <button type="submit" class="btn btn-primary w-full">Prijava</button>
            </form>
            
            <div class="mt-4 text-center">
                <a href="/" class="text-primary">&larr; Nazaj na stran za naročilo</a>
            </div>
        </div>
    </div>
</body>
</html>
