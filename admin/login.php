
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body class="bg-secondary-color">
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
            <div class="text-center mb-8">
                <a href="/">
                    <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" class="mx-auto h-20">
                </a>
                <h1 class="text-2xl font-bold mt-6 text-primary">Admin prijava</h1>
                <p class="text-gray-500 mt-2">Vnesite svoje podatke za dostop do administracije</p>
            </div>
            
            <?php if ($error): ?>
                <div class="bg-red-100 border border-red-400 text-error px-4 py-3 rounded mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <?php echo $error; ?>
                </div>
            <?php endif; ?>
            
            <form method="POST" action="" class="space-y-6">
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
            
            <div class="mt-6 text-center">
                <a href="/" class="text-primary flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Nazaj na stran za naročilo
                </a>
            </div>
        </div>
    </div>
</body>
</html>
