
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';

// Require admin login
session_start();
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    header('Location: /admin/login.php');
    exit;
}

// Get orders from database
$conn = getConnection();
$orderQuery = "
    SELECT o.*, c.firstName, c.lastName, c.email 
    FROM orders o 
    JOIN customers c ON o.customerId = c.id 
    ORDER BY o.orderDate DESC
";
$orderResult = $conn->query($orderQuery);
$orders = [];

while ($order = $orderResult->fetch_assoc()) {
    // Get products for this order
    $productQuery = "SELECT * FROM products WHERE orderId = '{$order['id']}'";
    $productResult = $conn->query($productQuery);
    $products = [];
    
    while ($product = $productResult->fetch_assoc()) {
        // Get color info
        $colorQuery = "SELECT title, htmlColor FROM colors WHERE id = {$product['colorId']}";
        $colorResult = $conn->query($colorQuery);
        $color = $colorResult->fetch_assoc();
        
        $products[] = [
            'id' => $product['id'],
            'colorId' => $product['colorId'],
            'colorTitle' => $color['title'],
            'colorHtml' => $color['htmlColor'],
            'length' => $product['length'],
            'width' => $product['width'],
            'thickness' => $product['thickness'],
            'surfaceArea' => $product['surfaceArea'],
            'borderTop' => (bool)$product['borderTop'],
            'borderRight' => (bool)$product['borderRight'],
            'borderBottom' => (bool)$product['borderBottom'],
            'borderLeft' => (bool)$product['borderLeft'],
            'drilling' => (bool)$product['drilling'],
            'quantity' => $product['quantity'],
            'pricePerUnit' => $product['pricePerUnit'],
            'totalPrice' => $product['totalPrice']
        ];
    }
    
    $order['products'] = $products;
    $order['customerName'] = $order['firstName'] . ' ' . $order['lastName'];
    $orders[] = $order;
}

$conn->close();

include_once '../includes/header.php';
?>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold mb-2">Naročila</h1>
            <p class="text-gray-500">Upravljanje naročil strank</p>
        </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm border">
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID naročila</th>
                        <th>Datum</th>
                        <th>Stranka</th>
                        <th>Izdelki</th>
                        <th>Znesek</th>
                        <th>Status</th>
                        <th>Dejanja</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (count($orders) > 0): ?>
                        <?php foreach ($orders as $order): ?>
                            <tr>
                                <td><?php echo $order['id']; ?></td>
                                <td><?php echo date('d.m.Y', strtotime($order['orderDate'])); ?></td>
                                <td>
                                    <div><?php echo htmlspecialchars($order['customerName']); ?></div>
                                    <div class="text-sm text-gray-500"><?php echo htmlspecialchars($order['email']); ?></div>
                                </td>
                                <td><?php echo count($order['products']); ?> izdelkov</td>
                                <td>€<?php echo number_format($order['totalCostWithVat'], 2); ?></td>
                                <td>
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
                                </td>
                                <td>
                                    <div class="flex space-x-2">
                                        <a href="/admin/order-detail.php?id=<?php echo $order['id']; ?>" class="btn btn-sm btn-outline">Podrobnosti</a>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="7" class="text-center py-4">Ni najdenih naročil</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

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
.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
}
</style>

<?php include_once '../includes/footer.php'; ?>
