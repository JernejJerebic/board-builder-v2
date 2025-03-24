
<?php
require_once 'config/database.php';
require_once 'includes/utils.php';
include_once 'includes/header.php';

$orderId = $_GET['id'] ?? null;
?>

<div class="max-w-lg mx-auto my-12">
    <div class="card">
        <div class="card-header text-center bg-primary">
            <h1 class="text-2xl font-bold text-white">Naročilo potrjeno</h1>
        </div>
        <div class="card-body text-center space-y-6">
            <div class="flex justify-center">
                <div class="bg-success-color text-white rounded-full p-4 inline-flex">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            </div>
            
            <div class="space-y-2">
                <h2 class="text-xl font-semibold text-primary">Hvala za vaše naročilo!</h2>
                
                <?php if ($orderId): ?>
                    <p class="text-base">
                        Vaša številka naročila: 
                        <span class="font-semibold bg-secondary-color px-2 py-1 rounded"><?php echo htmlspecialchars($orderId); ?></span>
                    </p>
                <?php endif; ?>
            </div>
            
            <div class="text-left bg-secondary-color p-4 rounded-lg">
                <p class="text-base">
                    Potrditev naročila smo vam poslali po e-pošti. 
                </p>
                <p class="mt-2">
                    Pregledali bomo vaše naročilo in vas kontaktirali v najkrajšem možnem času.
                </p>
            </div>
            
            <div class="space-y-2">
                <a href="/" class="btn btn-primary">Nazaj na domačo stran</a>
                
                <p class="text-sm text-gray-500">
                    Za morebitna vprašanja nas kontaktirajte na 
                    <a href="mailto:info@lcc-razrez.si" class="text-primary font-medium">info@lcc-razrez.si</a>
                </p>
            </div>
        </div>
    </div>
</div>

<?php include_once 'includes/footer.php'; ?>
