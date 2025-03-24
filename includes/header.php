
<?php 
session_start();
$isAdmin = isset($_SESSION['admin']) && $_SESSION['admin'] === true;
?>
<!DOCTYPE html>
<html lang="sl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LCC Naročilo razreza</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <header class="header">
        <div class="container flex justify-between items-center">
            <a href="/">
                <img src="https://www.lcc.si/wp-content/uploads/2020/03/Logo-COREL-Brez-ozadja-2-1024x462-1.png" alt="LCC" class="logo">
            </a>
            <nav class="nav">
                <a href="/" class="nav-link">Naročilo razreza</a>
                <?php if ($isAdmin): ?>
                <a href="/admin/orders.php" class="nav-link">Naročila</a>
                <a href="/admin/customers.php" class="nav-link">Stranke</a>
                <a href="/admin/colors.php" class="nav-link">Barve</a>
                <a href="/admin/logs.php" class="nav-link">Dnevniki</a>
                <a href="/logout.php" class="nav-link">Odjava</a>
                <?php endif; ?>
            </nav>
        </div>
    </header>
    <main class="container">
