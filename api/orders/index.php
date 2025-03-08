
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];
$conn = getConnection();

switch ($method) {
    case 'GET':
        // Get all orders with related products
        $orders = [];
        
        // Query to get all orders
        $orderStmt = $conn->prepare("SELECT * FROM orders ORDER BY orderDate DESC");
        $orderStmt->execute();
        $orderResult = $orderStmt->get_result();
        
        while ($order = $orderResult->fetch_assoc()) {
            $orderId = $order['id'];
            
            // Query to get products for this order
            $productStmt = $conn->prepare("SELECT * FROM products WHERE orderId = ?");
            $productStmt->bind_param("i", $orderId);
            $productStmt->execute();
            $productResult = $productStmt->get_result();
            
            $products = [];
            while ($product = $productResult->fetch_assoc()) {
                $products[] = formatProduct($product);
            }
            
            $orders[] = formatOrder($order, $products);
        }
        
        sendResponse($orders);
        break;
        
    case 'POST':
        // Create a new order with products
        $data = getRequestData();
        
        if (!isset($data['customerId']) || !isset($data['products']) || empty($data['products'])) {
            sendError("Customer ID and at least one product are required");
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        try {
            // Insert order
            $orderStmt = $conn->prepare("
                INSERT INTO orders (
                    customerId, orderDate, totalCostWithoutVat, totalCostWithVat, 
                    shippingMethod, paymentMethod, status
                ) VALUES (?, CURDATE(), ?, ?, ?, ?, ?)
            ");
            
            $orderStmt->bind_param(
                "iddsss", 
                $data['customerId'], 
                $data['totalCostWithoutVat'], 
                $data['totalCostWithVat'], 
                $data['shippingMethod'], 
                $data['paymentMethod'], 
                $data['status']
            );
            
            $orderStmt->execute();
            $orderId = $conn->insert_id;
            
            // Insert products for this order
            foreach ($data['products'] as $product) {
                $productStmt = $conn->prepare("
                    INSERT INTO products (
                        orderId, colorId, length, width, thickness, surfaceArea,
                        borderTop, borderRight, borderBottom, borderLeft,
                        drilling, quantity, pricePerUnit, totalPrice
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                ");
                
                $productStmt->bind_param(
                    "isiiiiiiiiidd",
                    $orderId,
                    $product['colorId'],
                    $product['length'],
                    $product['width'],
                    $product['thickness'],
                    $product['surfaceArea'],
                    $product['borders']['top'] ? 1 : 0,
                    $product['borders']['right'] ? 1 : 0,
                    $product['borders']['bottom'] ? 1 : 0,
                    $product['borders']['left'] ? 1 : 0,
                    $product['drilling'] ? 1 : 0,
                    $product['quantity'],
                    $product['pricePerUnit'],
                    $product['totalPrice']
                );
                
                $productStmt->execute();
            }
            
            // Update customer's last purchase and total purchases
            $updateCustomerStmt = $conn->prepare("
                UPDATE customers 
                SET lastPurchase = CURDATE(), 
                    totalPurchases = totalPurchases + ? 
                WHERE id = ?
            ");
            
            $updateCustomerStmt->bind_param("di", $data['totalCostWithVat'], $data['customerId']);
            $updateCustomerStmt->execute();
            
            // Commit transaction
            $conn->commit();
            
            // Get the newly created order with products
            $getOrderStmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
            $getOrderStmt->bind_param("i", $orderId);
            $getOrderStmt->execute();
            $orderResult = $getOrderStmt->get_result();
            $order = $orderResult->fetch_assoc();
            
            $getProductsStmt = $conn->prepare("SELECT * FROM products WHERE orderId = ?");
            $getProductsStmt->bind_param("i", $orderId);
            $getProductsStmt->execute();
            $productsResult = $getProductsStmt->get_result();
            
            $products = [];
            while ($product = $productsResult->fetch_assoc()) {
                $products[] = formatProduct($product);
            }
            
            sendResponse(formatOrder($order, $products), 201);
            
        } catch (Exception $e) {
            // Rollback on error
            $conn->rollback();
            sendError("Failed to create order: " . $e->getMessage());
        }
        break;
        
    default:
        sendError("Method not supported", 405);
}

$conn->close();
?>
