
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';

// Require admin login
session_start();
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    header('Location: /admin/login.php');
    exit;
}

// Handle form submission for adding/editing customer
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $conn = getConnection();
    
    if ($_POST['action'] === 'add' || $_POST['action'] === 'edit') {
        $firstName = $_POST['firstName'] ?? '';
        $lastName = $_POST['lastName'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $companyName = $_POST['companyName'] ?? '';
        $vatId = $_POST['vatId'] ?? '';
        $street = $_POST['street'] ?? '';
        $city = $_POST['city'] ?? '';
        $zipCode = $_POST['zipCode'] ?? '';
        
        if ($_POST['action'] === 'add') {
            // Add new customer
            $stmt = $conn->prepare("INSERT INTO customers (firstName, lastName, email, phone, companyName, vatId, street, city, zipCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssssssss", $firstName, $lastName, $email, $phone, $companyName, $vatId, $street, $city, $zipCode);
            
            if ($stmt->execute()) {
                $_SESSION['success_message'] = 'Stranka uspešno dodana';
            } else {
                $_SESSION['error_message'] = 'Napaka pri dodajanju stranke: ' . $stmt->error;
            }
        } else {
            // Edit existing customer
            $id = $_POST['id'] ?? 0;
            
            $stmt = $conn->prepare("UPDATE customers SET firstName = ?, lastName = ?, email = ?, phone = ?, companyName = ?, vatId = ?, street = ?, city = ?, zipCode = ? WHERE id = ?");
            $stmt->bind_param("sssssssssi", $firstName, $lastName, $email, $phone, $companyName, $vatId, $street, $city, $zipCode, $id);
            
            if ($stmt->execute()) {
                $_SESSION['success_message'] = 'Stranka uspešno posodobljena';
            } else {
                $_SESSION['error_message'] = 'Napaka pri posodabljanju stranke: ' . $stmt->error;
            }
        }
    } elseif ($_POST['action'] === 'delete') {
        // Delete customer
        $id = $_POST['id'] ?? 0;
        
        // Check if customer has orders
        $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM orders WHERE customerId = ?");
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        $row = $result->fetch_assoc();
        
        if ($row['count'] > 0) {
            $_SESSION['error_message'] = 'Stranke ni mogoče izbrisati, ker ima naročila';
        } else {
            $stmt = $conn->prepare("DELETE FROM customers WHERE id = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                $_SESSION['success_message'] = 'Stranka uspešno izbrisana';
            } else {
                $_SESSION['error_message'] = 'Napaka pri brisanju stranke: ' . $stmt->error;
            }
        }
    }
    
    $conn->close();
    
    // Redirect to refresh the page
    header('Location: /admin/customers.php');
    exit;
}

// Get customers from database
$conn = getConnection();
$customerQuery = "SELECT * FROM customers ORDER BY lastName, firstName";
$customerResult = $conn->query($customerQuery);
$customers = [];

while ($customer = $customerResult->fetch_assoc()) {
    $customers[] = $customer;
}

$conn->close();

include_once '../includes/header.php';
?>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold mb-2">Stranke</h1>
            <p class="text-gray-500">Upravljanje podatkov o strankah</p>
        </div>
        
        <button type="button" class="btn btn-primary" onclick="showAddCustomerForm()">Dodaj stranko</button>
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
    
    <div class="bg-white rounded-lg shadow-sm border">
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ime in priimek</th>
                        <th>Kontakt</th>
                        <th>Podjetje</th>
                        <th>Naslov</th>
                        <th>Zadnji nakup</th>
                        <th>Skupni nakupi</th>
                        <th>Dejanja</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (count($customers) > 0): ?>
                        <?php foreach ($customers as $customer): ?>
                            <tr>
                                <td><?php echo $customer['id']; ?></td>
                                <td><?php echo htmlspecialchars($customer['firstName'] . ' ' . $customer['lastName']); ?></td>
                                <td>
                                    <div><?php echo htmlspecialchars($customer['email'] ?: '-'); ?></div>
                                    <div><?php echo htmlspecialchars($customer['phone'] ?: '-'); ?></div>
                                </td>
                                <td>
                                    <div><?php echo htmlspecialchars($customer['companyName'] ?: '-'); ?></div>
                                    <div><?php echo htmlspecialchars($customer['vatId'] ?: '-'); ?></div>
                                </td>
                                <td>
                                    <div><?php echo htmlspecialchars($customer['street']); ?></div>
                                    <div><?php echo htmlspecialchars($customer['zipCode'] . ' ' . $customer['city']); ?></div>
                                </td>
                                <td><?php echo $customer['lastPurchase'] ? date('d.m.Y', strtotime($customer['lastPurchase'])) : '-'; ?></td>
                                <td>€<?php echo number_format($customer['totalPurchases'], 2); ?></td>
                                <td>
                                    <div class="flex space-x-2">
                                        <button type="button" class="btn btn-sm btn-outline" onclick="showEditCustomerForm(<?php echo htmlspecialchars(json_encode($customer)); ?>)">Uredi</button>
                                        <button type="button" class="btn btn-sm btn-outline btn-danger" onclick="confirmDeleteCustomer(<?php echo $customer['id']; ?>, '<?php echo htmlspecialchars($customer['firstName'] . ' ' . $customer['lastName']); ?>')">Izbriši</button>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="8" class="text-center py-4">Ni najdenih strank</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Add/Edit Customer Modal -->
<div id="customerModal" class="modal hidden">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="modalTitle" class="text-xl font-bold">Dodaj stranko</h2>
            <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="customerForm" method="POST" action="">
                <input type="hidden" id="action" name="action" value="add">
                <input type="hidden" id="customerId" name="id" value="">
                
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="firstName" class="form-label">Ime</label>
                            <input type="text" id="firstName" name="firstName" class="form-input" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="lastName" class="form-label">Priimek</label>
                            <input type="text" id="lastName" name="lastName" class="form-input" required>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="email" class="form-label">E-poštni naslov</label>
                            <input type="email" id="email" name="email" class="form-input">
                        </div>
                        
                        <div class="form-group">
                            <label for="phone" class="form-label">Telefonska številka</label>
                            <input type="tel" id="phone" name="phone" class="form-input">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="companyName" class="form-label">Ime podjetja (neobvezno)</label>
                            <input type="text" id="companyName" name="companyName" class="form-input">
                        </div>
                        
                        <div class="form-group">
                            <label for="vatId" class="form-label">ID za DDV (neobvezno)</label>
                            <input type="text" id="vatId" name="vatId" class="form-input">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="street" class="form-label">Naslov</label>
                        <input type="text" id="street" name="street" class="form-input" required>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="city" class="form-label">Mesto</label>
                            <input type="text" id="city" name="city" class="form-input" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="zipCode" class="form-label">Poštna številka</label>
                            <input type="text" id="zipCode" name="zipCode" class="form-input" required>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4 flex justify-end">
                    <button type="button" class="btn btn-outline mr-2" onclick="closeModal()">Prekliči</button>
                    <button type="submit" class="btn btn-primary">Shrani</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div id="deleteModal" class="modal hidden">
    <div class="modal-content">
        <div class="modal-header">
            <h2 class="text-xl font-bold">Izbriši stranko</h2>
            <button type="button" class="modal-close" onclick="closeDeleteModal()">&times;</button>
        </div>
        <div class="modal-body">
            <p id="deleteConfirmMessage">Ali ste prepričani, da želite izbrisati to stranko?</p>
            
            <form id="deleteForm" method="POST" action="">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" id="deleteCustomerId" name="id" value="">
                
                <div class="mt-4 flex justify-end">
                    <button type="button" class="btn btn-outline mr-2" onclick="closeDeleteModal()">Prekliči</button>
                    <button type="submit" class="btn btn-danger">Izbriši</button>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-body {
    padding: 1rem;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

.hidden {
    display: none;
}

.btn-danger {
    background-color: #ef4444;
    color: white;
    border: none;
}

.btn-danger:hover {
    background-color: #dc2626;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
}
</style>

<script>
function showAddCustomerForm() {
    document.getElementById('modalTitle').textContent = 'Dodaj stranko';
    document.getElementById('action').value = 'add';
    document.getElementById('customerForm').reset();
    document.getElementById('customerModal').classList.remove('hidden');
}

function showEditCustomerForm(customer) {
    document.getElementById('modalTitle').textContent = 'Uredi stranko';
    document.getElementById('action').value = 'edit';
    document.getElementById('customerId').value = customer.id;
    document.getElementById('firstName').value = customer.firstName;
    document.getElementById('lastName').value = customer.lastName;
    document.getElementById('email').value = customer.email || '';
    document.getElementById('phone').value = customer.phone || '';
    document.getElementById('companyName').value = customer.companyName || '';
    document.getElementById('vatId').value = customer.vatId || '';
    document.getElementById('street').value = customer.street;
    document.getElementById('city').value = customer.city;
    document.getElementById('zipCode').value = customer.zipCode;
    document.getElementById('customerModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('customerModal').classList.add('hidden');
}

function confirmDeleteCustomer(id, name) {
    document.getElementById('deleteConfirmMessage').textContent = `Ali ste prepričani, da želite izbrisati stranko "${name}"?`;
    document.getElementById('deleteCustomerId').value = id;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}
</script>

<?php include_once '../includes/footer.php'; ?>
