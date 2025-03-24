
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';
require_once '../includes/mailer.php';

// Require admin login
session_start();
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    header('Location: /admin/login.php');
    exit;
}

// Get order ID from URL
$orderId = $_GET['id'] ?? null;

if (!$orderId) {
    header('Location: /admin/orders.php');
    exit;
}

// Handle status update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'update_status') {
    $newStatus = $_POST['status'] ?? '';
    
    if ($newStatus && in_array($newStatus, ['placed', 'in_progress', 'completed'])) {
        $conn = getConnection();
        $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->bind_param("ss", $newStatus, $orderId);
        
        if ($stmt->execute()) {
            // Send email notification based on status change
            $customerEmail = $_POST['customerEmail'] ?? '';
            if ($customerEmail) {
                $emailType = '';
                switch($newStatus) {
                    case 'in_progress':
                        $emailType = 'progress';
                        break;
                    case 'completed':
                        $emailType = 'completed';
                        break;
                }
                
                if ($emailType) {
                    // Get order details for email
                    $orderStmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
                    $orderStmt->bind_param("s", $orderId);
                    $orderStmt->execute();
                    $orderResult = $orderStmt->get_result();
                    $order = $orderResult->fetch_assoc();
                    
                    // Get customer details for email
                    $customerStmt = $conn->prepare("SELECT * FROM customers WHERE id = ?");
                    $customerStmt->bind_param("i", $order['customerId']);
                    $customerStmt->execute();
                    $customerResult = $customerStmt->get_result();
                    $customer = $customerResult->fetch_assoc();
                    
                    // Send the status update email
                    $emailResult = sendOrderStatusEmail($emailType, $orderId, $customerEmail, $order, $customer);
                    
                    if ($emailResult['success']) {
                        $_SESSION['success_message'] = 'Status naročila je bil uspešno posodobljen in e-poštno obvestilo poslano';
                    } else {
                        $_SESSION['success_message'] = 'Status naročila je bil uspešno posodobljen, vendar obvestilo po e-pošti ni bilo poslano';
                        $_SESSION['error_message'] = 'Napaka pri pošiljanju e-pošte: ' . $emailResult['message'];
                    }
                } else {
                    $_SESSION['success_message'] = 'Status naročila je bil uspešno posodobljen';
                }
            } else {
                $_SESSION['success_message'] = 'Status naročila je bil uspešno posodobljen';
            }
        } else {
            $_SESSION['error_message'] = 'Napaka pri posodobitvi statusa naročila';
        }
        
        $conn->close();
        
        // Redirect to refresh the page
        header('Location: /admin/order-detail.php?id=' . $orderId);
        exit;
    }
}

// Get order from database
$conn = getConnection();
$orderQuery = "
    SELECT o.*, c.* 
    FROM orders o 
    JOIN customers c ON o.customerId = c.id 
    WHERE o.id = ?
";
$stmt = $conn->prepare($orderQuery);
$stmt->bind_param("s", $orderId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $conn->close();
    header('Location: /admin/orders.php');
    exit;
}

$order = $result->fetch_assoc();

// Get products for this order
$productQuery = "SELECT p.*, c.title as colorTitle, c.htmlColor FROM products p JOIN colors c ON p.colorId = c.id WHERE p.orderId = ?";
$stmt = $conn->prepare($productQuery);
$stmt->bind_param("s", $orderId);
$stmt->execute();
$productResult = $stmt->get_result();
$products = [];

while ($product = $productResult->fetch_assoc()) {
    $products[] = $product;
}

$conn->close();

include_once '../includes/header.php';
?>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <a href="/admin/orders.php" class="text-primary mb-2 inline-block">&larr; Nazaj na naročila</a>
            <h1 class="text-3xl font-bold mb-2">Naročilo #<?php echo htmlspecialchars($order['id']); ?></h1>
            <p class="text-gray-500">Datum: <?php echo date('d.m.Y', strtotime($order['orderDate'])); ?></p>
        </div>
        
        <div>
            <form method="POST" action="" class="flex items-center space-x-2">
                <input type="hidden" name="action" value="update_status">
                <input type="hidden" name="customerEmail" value="<?php echo $order['email']; ?>">
                <select name="status" class="form-select">
                    <option value="placed" <?php echo $order['status'] === 'placed' ? 'selected' : ''; ?>>Oddano</option>
                    <option value="in_progress" <?php echo $order['status'] === 'in_progress' ? 'selected' : ''; ?>>V obdelavi</option>
                    <option value="completed" <?php echo $order['status'] === 'completed' ? 'selected' : ''; ?>>Zaključeno</option>
                </select>
                <button type="submit" class="btn btn-primary">Posodobi status</button>
            </form>
        </div>
    </div>
    
    <?php if (isset($_SESSION['success_message'])): ?>
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <?php 
                echo $_SESSION['success_message'];
                unset($_SESSION['success_message']);
            ?>
        </div>
    <?php endif; ?>
    
    <?php if (isset($_SESSION['error_message'])): ?>
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <?php 
                echo $_SESSION['error_message'];
                unset($_SESSION['error_message']);
            ?>
        </div>
    <?php endif; ?>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Customer Information -->
        <div class="card">
            <div class="card-header">
                <h2 class="text-xl font-bold">Podatki o stranki</h2>
            </div>
            <div class="card-body">
                <div class="mb-4">
                    <h3 class="font-bold">Kontaktni podatki</h3>
                    <p><?php echo htmlspecialchars($order['firstName'] . ' ' . $order['lastName']); ?></p>
                    <p><?php echo htmlspecialchars($order['email']); ?></p>
                    <?php if ($order['phone']): ?>
                        <p>Tel: <?php echo htmlspecialchars($order['phone']); ?></p>
                    <?php endif; ?>
                    <?php if ($order['companyName']): ?>
                        <p>Podjetje: <?php echo htmlspecialchars($order['companyName']); ?></p>
                    <?php endif; ?>
                    <?php if ($order['vatId']): ?>
                        <p>ID za DDV: <?php echo htmlspecialchars($order['vatId']); ?></p>
                    <?php endif; ?>
                </div>
                
                <div>
                    <h3 class="font-bold">Naslov</h3>
                    <p><?php echo htmlspecialchars($order['street']); ?></p>
                    <p><?php echo htmlspecialchars($order['zipCode'] . ' ' . $order['city']); ?></p>
                </div>
            </div>
        </div>
        
        <!-- Order Information -->
        <div class="card">
            <div class="card-header">
                <h2 class="text-xl font-bold">Podatki o naročilu</h2>
            </div>
            <div class="card-body">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h3 class="font-bold">Način plačila</h3>
                        <p>
                            <?php 
                                $paymentMethod = '';
                                switch($order['paymentMethod']) {
                                    case 'bank_transfer':
                                        $paymentMethod = 'Bančno nakazilo';
                                        break;
                                    case 'credit_card':
                                        $paymentMethod = 'Kreditna kartica';
                                        break;
                                    case 'pickup_at_shop':
                                        $paymentMethod = 'Plačilo ob prevzemu v trgovini';
                                        break;
                                    case 'payment_on_delivery':
                                        $paymentMethod = 'Plačilo ob dostavi';
                                        break;
                                    default:
                                        $paymentMethod = 'Neznano';
                                }
                                echo $paymentMethod;
                            ?>
                        </p>
                    </div>
                    
                    <div>
                        <h3 class="font-bold">Način dostave</h3>
                        <p><?php echo $order['shippingMethod'] === 'pickup' ? 'Prevzem v trgovini' : 'Dostava'; ?></p>
                    </div>
                    
                    <div>
                        <h3 class="font-bold">Status naročila</h3>
                        <p>
                            <span class="status-badge status-<?php echo $order['status']; ?>">
                                <?php 
                                    $statusText = '';
                                    switch($order['status']) {
                                        case 'placed':
                                            $statusText = 'Oddano';
                                            break;
                                        case 'in_progress':
                                            $statusText = 'V obdelavi';
                                            break;
                                        case 'completed':
                                            $statusText = 'Zaključeno';
                                            break;
                                        default:
                                            $statusText = 'Neznano';
                                    }
                                    echo $statusText;
                                ?>
                            </span>
                        </p>
                    </div>
                    
                    <div>
                        <h3 class="font-bold">Skupni znesek</h3>
                        <p>€<?php echo number_format($order['totalCostWithVat'], 2); ?></p>
                    </div>
                </div>
                
                <div class="mt-4">
                    <button type="button" class="btn btn-outline" onclick="sendEmail('new')">Pošlji potrdilo na e-pošto</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Order Items -->
    <div class="card">
        <div class="card-header">
            <h2 class="text-xl font-bold">Naročeni izdelki</h2>
        </div>
        <div class="card-body p-0">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Izdelek</th>
                            <th>Dimenzije</th>
                            <th>Dodatki</th>
                            <th>Količina</th>
                            <th>Cena/enoto</th>
                            <th>Skupna cena</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($products as $product): ?>
                            <tr>
                                <td>
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 rounded mr-2" style="background-color: <?php echo $product['htmlColor']; ?>;"></div>
                                        <div>
                                            <div><?php echo htmlspecialchars($product['colorTitle']); ?></div>
                                            <div class="text-sm text-gray-500"><?php echo $product['thickness']; ?>mm</div>
                                        </div>
                                    </div>
                                </td>
                                <td><?php echo $product['length']; ?> x <?php echo $product['width']; ?> mm</td>
                                <td>
                                    <?php
                                        $features = [];
                                        
                                        $borders = [];
                                        if ($product['borderTop']) $borders[] = 'zgornji';
                                        if ($product['borderRight']) $borders[] = 'desni';
                                        if ($product['borderBottom']) $borders[] = 'spodnji';
                                        if ($product['borderLeft']) $borders[] = 'levi';
                                        
                                        if (count($borders) > 0) {
                                            $features[] = 'Robovi: ' . implode(', ', $borders);
                                        }
                                        
                                        if ($product['drilling']) {
                                            $features[] = 'Vrtanje';
                                        }
                                        
                                        echo count($features) > 0 ? implode('<br>', $features) : '-';
                                    ?>
                                </td>
                                <td><?php echo $product['quantity']; ?></td>
                                <td>€<?php echo number_format($product['pricePerUnit'], 2); ?></td>
                                <td>€<?php echo number_format($product['totalPrice'], 2); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-footer text-right">
            <div class="font-bold">Skupaj: €<?php echo number_format($order['totalCostWithVat'], 2); ?></div>
        </div>
    </div>
    
    <!-- Order Actions -->
    <div class="card">
        <div class="card-header">
            <h2 class="text-xl font-bold">Dejanja</h2>
        </div>
        <div class="card-body">
            <div class="space-y-2">
                <div class="flex space-x-2">
                    <button type="button" class="btn btn-outline" onclick="printOrder()">Natisni naročilo</button>
                    <button type="button" class="btn btn-outline" onclick="sendEmail('progress')">Pošlji obvestilo o obdelavi</button>
                    <button type="button" class="btn btn-outline" onclick="sendEmail('completed')">Pošlji obvestilo o zaključku</button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function printOrder() {
    window.print();
}

function sendEmail(type) {
    // Show loading state
    showToast('Pošiljanje e-pošte...', 'info');
    
    fetch('/api/email/order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: type,
            orderId: '<?php echo $orderId; ?>',
            email: '<?php echo $order['email']; ?>'
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Napaka pri pošiljanju e-pošte');
        }
        return response.json();
    })
    .then(data => {
        showToast('E-pošta uspešno poslana', 'success');
    })
    .catch(error => {
        console.error('Error sending email:', error);
        showToast('Napaka pri pošiljanju e-pošte', 'error');
    });
}

// Function to show toast notifications
function showToast(message, type) {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}
</script>

<style>
.status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}
.status-placed {
    background-color: #fef3c7;
    color: #92400e;
}
.status-in_progress {
    background-color: #dbeafe;
    color: #1e40af;
}
.status-completed {
    background-color: #d1fae5;
    color: #065f46;
}
</style>

<?php include_once '../includes/footer.php'; ?>
