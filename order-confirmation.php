
<?php
require_once 'config/database.php';
require_once 'includes/utils.php';
include_once 'includes/header.php';

$orderId = $_GET['id'] ?? null;
?>

<div class="max-w-lg mx-auto my-8">
    <div class="card">
        <div class="card-header text-center">
            <h1 class="text-2xl font-bold text-primary">Naročilo potrjeno</h1>
        </div>
        <div class="card-body text-center">
            <div class="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            
            <p class="text-lg mb-2">Hvala za vaše naročilo!</p>
            
            <?php if ($orderId): ?>
                <p class="text-sm text-gray-500 mb-4">Vaša številka naročila: <strong><?php echo htmlspecialchars($orderId); ?></strong></p>
            <?php endif; ?>
            
            <p class="mb-4">
                Potrditev naročila smo vam poslali po e-pošti. Pregledali bomo vaše naročilo in vas kontaktirali v najkrajšem možnem času.
            </p>
            
            <a href="/" class="btn btn-primary">Nazaj na domačo stran</a>
        </div>
    </div>
</div>

<?php include_once 'includes/footer.php'; ?>
