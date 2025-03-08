
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];
$conn = getConnection();

switch ($method) {
    case 'GET':
        // Get all customers
        $stmt = $conn->prepare("SELECT * FROM customers");
        $stmt->execute();
        $result = $stmt->get_result();
        
        $customers = [];
        while ($row = $result->fetch_assoc()) {
            $customers[] = formatCustomer($row);
        }
        
        sendResponse($customers);
        break;
        
    case 'POST':
        // Create a new customer
        $data = getRequestData();
        
        if (!isset($data['firstName']) || !isset($data['lastName'])) {
            sendError("First name and last name are required");
        }
        
        $stmt = $conn->prepare("INSERT INTO customers (firstName, lastName, companyName, vatId, email, phone, street, city, zipCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param("sssssssss", 
            $data['firstName'], 
            $data['lastName'], 
            $data['companyName'] ?? null, 
            $data['vatId'] ?? null, 
            $data['email'] ?? null, 
            $data['phone'] ?? null, 
            $data['street'] ?? '', 
            $data['city'] ?? '', 
            $data['zipCode'] ?? ''
        );
        
        if ($stmt->execute()) {
            $id = $conn->insert_id;
            
            // Fetch the new customer
            $getStmt = $conn->prepare("SELECT * FROM customers WHERE id = ?");
            $getStmt->bind_param("i", $id);
            $getStmt->execute();
            $result = $getStmt->get_result();
            $customer = $result->fetch_assoc();
            
            sendResponse(formatCustomer($customer), 201);
        } else {
            sendError("Failed to create customer: " . $stmt->error);
        }
        break;
        
    default:
        sendError("Method not supported", 405);
}

$conn->close();
?>
