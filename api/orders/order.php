
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];
$conn = getConnection();

// Get order ID from URL
$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    sendError("Order ID is required", 400);
}

switch ($method) {
    case 'GET':
        // Get order by ID with products
        $orderStmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
        $orderStmt->bind_param("i", $id);
        $orderStmt->execute();
        $orderResult = $orderStmt->get_result();
        
        if ($orderResult->num_rows === 0) {
            sendError("Order not found", 404);
        }
        
        $order = $orderResult->fetch_assoc();
        
        // Get products for this order
        $productStmt = $conn->prepare("SELECT * FROM products WHERE orderId = ?");
        $productStmt->bind_param("i", $id);
        $productStmt->execute();
        $productResult = $productStmt->get_result();
        
        $products = [];
        while ($product = $productResult->fetch_assoc()) {
            $products[] = formatProduct($product);
        }
        
        sendResponse(formatOrder($order, $products));
        break;
        
    case 'PUT':
        // Update order
        $data = getRequestData();
        
        // Start transaction
        $conn->begin_transaction();
        
        try {
            // Update order fields
            $updateFields = [];
            $bindTypes = "";
            $bindValues = [];
            
            if (isset($data['customerId'])) {
                $updateFields[] = "customerId = ?";
                $bindTypes .= "i";
                $bindValues[] = $data['customerId'];
            }
            
            if (isset($data['shippingMethod'])) {
                $updateFields[] = "shippingMethod = ?";
                $bindTypes .= "s";
                $bindValues[] = $data['shippingMethod'];
            }
            
            if (isset($data['paymentMethod'])) {
                $updateFields[] = "paymentMethod = ?";
                $bindTypes .= "s";
                $bindValues[] = $data['paymentMethod'];
            }
            
            if (isset($data['status'])) {
                $updateFields[] = "status = ?";
                $bindTypes .= "s";
                $bindValues[] = $data['status'];
            }
            
            if (isset($data['totalCostWithoutVat'])) {
                $updateFields[] = "totalCostWithoutVat = ?";
                $bindTypes .= "d";
                $bindValues[] = $data['totalCostWithoutVat'];
            }
            
            if (isset($data['totalCostWithVat'])) {
                $updateFields[] = "totalCostWithVat = ?";
                $bindTypes .= "d";
                $bindValues[] = $data['totalCostWithVat'];
            }
            
            if (!empty($updateFields)) {
                $sql = "UPDATE orders SET " . implode(", ", $updateFields) . " WHERE id = ?";
                $bindTypes .= "i";
                $bindValues[] = $id;
                
                $orderStmt = $conn->prepare($sql);
                
                // Dynamically bind parameters
                $params = array_merge([$bindTypes], $bindValues);
                $orderStmt->bind_param(...$params);
                $orderStmt->execute();
            }
            
            // Update products if included
            if (isset($data['products']) && is_array($data['products'])) {
                // Remove existing products
                $deleteStmt = $conn->prepare("DELETE FROM products WHERE orderId = ?");
                $deleteStmt->bind_param("i", $id);
                $deleteStmt->execute();
                
                // Add new products
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
                        $id,
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
            }
            
            // Commit transaction
            $conn->commit();
            
            // Get the updated order with products
            $getOrderStmt = $conn->prepare("SELECT * FROM orders WHERE id = ?");
            $getOrderStmt->bind_param("i", $id);
            $getOrderStmt->execute();
            $orderResult = $getOrderStmt->get_result();
            $order = $orderResult->fetch_assoc();
            
            $getProductsStmt = $conn->prepare("SELECT * FROM products WHERE orderId = ?");
            $getProductsStmt->bind_param("i", $id);
            $getProductsStmt->execute();
            $productsResult = $getProductsStmt->get_result();
            
            $products = [];
            while ($product = $productsResult->fetch_assoc()) {
                $products[] = formatProduct($product);
            }
            
            sendResponse(formatOrder($order, $products));
            
        } catch (Exception $e) {
            // Rollback on error
            $conn->rollback();
            sendError("Failed to update order: " . $e->getMessage());
        }
        break;
        
    case 'DELETE':
        // Delete order (and its products via foreign key constraint)
        $stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            sendResponse(["success" => true, "message" => "Order deleted"]);
        } else {
            sendError("Failed to delete order: " . $stmt->error);
        }
        break;
        
    default:
        sendError("Method not supported", 405);
}

$conn->close();
?>
