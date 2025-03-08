
<?php
require_once '../config/database.php';
require_once '../utils/utils.php';

// Enable CORS
enableCORS();

$method = $_SERVER['REQUEST_METHOD'];
$conn = getConnection();

// Get customer ID from URL
$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    sendError("Customer ID is required", 400);
}

switch ($method) {
    case 'GET':
        // Get customer by ID
        $stmt = $conn->prepare("SELECT * FROM customers WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $customer = $result->fetch_assoc();
            sendResponse(formatCustomer($customer));
        } else {
            sendError("Customer not found", 404);
        }
        break;
        
    case 'PUT':
        // Update customer
        $data = getRequestData();
        
        // Build update query dynamically based on provided fields
        $updateFields = [];
        $bindTypes = "";
        $bindValues = [];
        
        if (isset($data['firstName'])) {
            $updateFields[] = "firstName = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['firstName'];
        }
        
        if (isset($data['lastName'])) {
            $updateFields[] = "lastName = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['lastName'];
        }
        
        if (isset($data['companyName'])) {
            $updateFields[] = "companyName = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['companyName'];
        }
        
        if (isset($data['vatId'])) {
            $updateFields[] = "vatId = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['vatId'];
        }
        
        if (isset($data['email'])) {
            $updateFields[] = "email = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['email'];
        }
        
        if (isset($data['phone'])) {
            $updateFields[] = "phone = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['phone'];
        }
        
        if (isset($data['street'])) {
            $updateFields[] = "street = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['street'];
        }
        
        if (isset($data['city'])) {
            $updateFields[] = "city = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['city'];
        }
        
        if (isset($data['zipCode'])) {
            $updateFields[] = "zipCode = ?";
            $bindTypes .= "s";
            $bindValues[] = $data['zipCode'];
        }
        
        if (empty($updateFields)) {
            sendError("No fields to update");
        }
        
        $sql = "UPDATE customers SET " . implode(", ", $updateFields) . " WHERE id = ?";
        $bindTypes .= "i";
        $bindValues[] = $id;
        
        $stmt = $conn->prepare($sql);
        
        // Dynamically bind parameters
        $params = array_merge([$bindTypes], $bindValues);
        $stmt->bind_param(...$params);
        
        if ($stmt->execute()) {
            // Fetch the updated customer
            $getStmt = $conn->prepare("SELECT * FROM customers WHERE id = ?");
            $getStmt->bind_param("i", $id);
            $getStmt->execute();
            $result = $getStmt->get_result();
            $customer = $result->fetch_assoc();
            
            sendResponse(formatCustomer($customer));
        } else {
            sendError("Failed to update customer: " . $stmt->error);
        }
        break;
        
    case 'DELETE':
        // Delete customer
        $stmt = $conn->prepare("DELETE FROM customers WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            sendResponse(["success" => true, "message" => "Customer deleted"]);
        } else {
            sendError("Failed to delete customer: " . $stmt->error);
        }
        break;
        
    default:
        sendError("Method not supported", 405);
}

$conn->close();
?>
