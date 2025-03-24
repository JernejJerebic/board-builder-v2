
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';

// Require admin login
session_start();
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    header('Location: /admin/login.php');
    exit;
}

// Handle form submission for adding/editing color
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $conn = getConnection();
    
    if ($_POST['action'] === 'add' || $_POST['action'] === 'edit') {
        $title = $_POST['title'] ?? '';
        $htmlColor = $_POST['htmlColor'] ?? '#d2b48c';
        $thickness = $_POST['thickness'] ?? 18;
        $priceWithoutVat = $_POST['priceWithoutVat'] ?? 0;
        $priceWithVat = $_POST['priceWithVat'] ?? 0;
        $active = isset($_POST['active']) ? 1 : 0;
        $imageUrl = $_POST['imageUrl'] ?? '';
        
        if ($_POST['action'] === 'add') {
            // Add new color
            $stmt = $conn->prepare("INSERT INTO colors (title, htmlColor, thickness, priceWithoutVat, priceWithVat, active, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssiddis", $title, $htmlColor, $thickness, $priceWithoutVat, $priceWithVat, $active, $imageUrl);
            
            if ($stmt->execute()) {
                $_SESSION['success_message'] = 'Barva uspešno dodana';
            } else {
                $_SESSION['error_message'] = 'Napaka pri dodajanju barve: ' . $stmt->error;
            }
        } else {
            // Edit existing color
            $id = $_POST['id'] ?? 0;
            
            $stmt = $conn->prepare("UPDATE colors SET title = ?, htmlColor = ?, thickness = ?, priceWithoutVat = ?, priceWithVat = ?, active = ?, imageUrl = ? WHERE id = ?");
            $stmt->bind_param("ssiddisi", $title, $htmlColor, $thickness, $priceWithoutVat, $priceWithVat, $active, $imageUrl, $id);
            
            if ($stmt->execute()) {
                $_SESSION['success_message'] = 'Barva uspešno posodobljena';
            } else {
                $_SESSION['error_message'] = 'Napaka pri posodabljanju barve: ' . $stmt->error;
            }
        }
    } elseif ($_POST['action'] === 'delete') {
        // Delete color
        $id = $_POST['id'] ?? 0;
        
        // Check if color is used in any products
        $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM products WHERE colorId = ?");
        $checkStmt->bind_param("i", $id);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        $row = $result->fetch_assoc();
        
        if ($row['count'] > 0) {
            $_SESSION['error_message'] = 'Barve ni mogoče izbrisati, ker je uporabljena v izdelkih';
        } else {
            $stmt = $conn->prepare("DELETE FROM colors WHERE id = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                $_SESSION['success_message'] = 'Barva uspešno izbrisana';
            } else {
                $_SESSION['error_message'] = 'Napaka pri brisanju barve: ' . $stmt->error;
            }
        }
    } elseif ($_POST['action'] === 'toggle_status') {
        // Toggle active status
        $id = $_POST['id'] ?? 0;
        $active = $_POST['active'] === '1' ? 0 : 1;
        
        $stmt = $conn->prepare("UPDATE colors SET active = ? WHERE id = ?");
        $stmt->bind_param("ii", $active, $id);
        
        if ($stmt->execute()) {
            $_SESSION['success_message'] = 'Status barve uspešno posodobljen';
        } else {
            $_SESSION['error_message'] = 'Napaka pri posodabljanju statusa barve: ' . $stmt->error;
        }
    }
    
    $conn->close();
    
    // Redirect to refresh the page
    header('Location: /admin/colors.php');
    exit;
}

// Get colors from database
$conn = getConnection();
$colorQuery = "SELECT * FROM colors ORDER BY title";
$colorResult = $conn->query($colorQuery);
$colors = [];

while ($color = $colorResult->fetch_assoc()) {
    $colors[] = $color;
}

$conn->close();

include_once '../includes/header.php';
?>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold mb-2">Barve in materiali</h1>
            <p class="text-gray-500">Upravljanje barv in materialov</p>
        </div>
        
        <button type="button" class="btn btn-primary" onclick="showAddColorForm()">Dodaj barvo</button>
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
                        <th>Naziv</th>
                        <th>Barva</th>
                        <th>Debelina</th>
                        <th>Cena (brez DDV)</th>
                        <th>Cena (z DDV)</th>
                        <th>Status</th>
                        <th>Dejanja</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (count($colors) > 0): ?>
                        <?php foreach ($colors as $color): ?>
                            <tr class="<?php echo $color['active'] ? '' : 'opacity-60'; ?>">
                                <td><?php echo $color['id']; ?></td>
                                <td><?php echo htmlspecialchars($color['title']); ?></td>
                                <td>
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 rounded border-2 border-gray-300" style="background-color: <?php echo $color['htmlColor']; ?>;"></div>
                                        <div class="ml-2"><?php echo $color['htmlColor']; ?></div>
                                    </div>
                                </td>
                                <td><?php echo $color['thickness']; ?> mm</td>
                                <td>€<?php echo number_format($color['priceWithoutVat'], 2); ?></td>
                                <td>€<?php echo number_format($color['priceWithVat'], 2); ?></td>
                                <td>
                                    <span class="status-badge <?php echo $color['active'] ? 'status-active' : 'status-inactive'; ?>">
                                        <?php echo $color['active'] ? 'Aktivna' : 'Neaktivna'; ?>
                                    </span>
                                </td>
                                <td>
                                    <div class="flex space-x-2">
                                        <button type="button" class="btn btn-sm btn-outline" onclick="showEditColorForm(<?php echo htmlspecialchars(json_encode($color)); ?>)">Uredi</button>
                                        
                                        <form method="POST" action="" class="inline">
                                            <input type="hidden" name="action" value="toggle_status">
                                            <input type="hidden" name="id" value="<?php echo $color['id']; ?>">
                                            <input type="hidden" name="active" value="<?php echo $color['active']; ?>">
                                            <button type="submit" class="btn btn-sm btn-outline">
                                                <?php echo $color['active'] ? 'Deaktiviraj' : 'Aktiviraj'; ?>
                                            </button>
                                        </form>
                                        
                                        <button type="button" class="btn btn-sm btn-outline btn-danger" onclick="confirmDeleteColor(<?php echo $color['id']; ?>, '<?php echo htmlspecialchars($color['title']); ?>')">Izbriši</button>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="8" class="text-center py-4">Ni najdenih barv</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Add/Edit Color Modal -->
<div id="colorModal" class="modal hidden">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="modalTitle" class="text-xl font-bold">Dodaj barvo</h2>
            <button type="button" class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <form id="colorForm" method="POST" action="">
                <input type="hidden" id="action" name="action" value="add">
                <input type="hidden" id="colorId" name="id" value="">
                
                <div class="space-y-4">
                    <div class="form-group">
                        <label for="title" class="form-label">Naziv</label>
                        <input type="text" id="title" name="title" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="htmlColor" class="form-label">HTML barva</label>
                        <div class="flex items-center">
                            <input type="color" id="colorPicker" class="w-10 h-10 mr-2">
                            <input type="text" id="htmlColor" name="htmlColor" class="form-input" value="#d2b48c" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="thickness" class="form-label">Debelina (mm)</label>
                        <input type="number" id="thickness" name="thickness" class="form-input" value="18" min="1" required>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="priceWithoutVat" class="form-label">Cena brez DDV (€)</label>
                            <input type="number" id="priceWithoutVat" name="priceWithoutVat" class="form-input" value="0" min="0" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="priceWithVat" class="form-label">Cena z DDV (€)</label>
                            <input type="number" id="priceWithVat" name="priceWithVat" class="form-input" value="0" min="0" step="0.01" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="imageUrl" class="form-label">URL slike (neobvezno)</label>
                        <input type="text" id="imageUrl" name="imageUrl" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <div class="flex items-center">
                            <input type="checkbox" id="active" name="active" class="mr-2" checked>
                            <label for="active" class="form-label m-0">Aktivna</label>
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
            <h2 class="text-xl font-bold">Izbriši barvo</h2>
            <button type="button" class="modal-close" onclick="closeDeleteModal()">&times;</button>
        </div>
        <div class="modal-body">
            <p id="deleteConfirmMessage">Ali ste prepričani, da želite izbrisati to barvo?</p>
            
            <form id="deleteForm" method="POST" action="">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" id="deleteColorId" name="id" value="">
                
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

.status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.status-active {
    background-color: #d1fae5;
    color: #065f46;
}

.status-inactive {
    background-color: #fee2e2;
    color: #b91c1c;
}
</style>

<script>
function showAddColorForm() {
    document.getElementById('modalTitle').textContent = 'Dodaj barvo';
    document.getElementById('action').value = 'add';
    document.getElementById('colorForm').reset();
    document.getElementById('colorModal').classList.remove('hidden');
    
    // Set default values
    document.getElementById('htmlColor').value = '#d2b48c';
    document.getElementById('colorPicker').value = '#d2b48c';
    document.getElementById('thickness').value = '18';
    document.getElementById('active').checked = true;
}

function showEditColorForm(color) {
    document.getElementById('modalTitle').textContent = 'Uredi barvo';
    document.getElementById('action').value = 'edit';
    document.getElementById('colorId').value = color.id;
    document.getElementById('title').value = color.title;
    document.getElementById('htmlColor').value = color.htmlColor || '#d2b48c';
    document.getElementById('colorPicker').value = color.htmlColor || '#d2b48c';
    document.getElementById('thickness').value = color.thickness;
    document.getElementById('priceWithoutVat').value = color.priceWithoutVat;
    document.getElementById('priceWithVat').value = color.priceWithVat;
    document.getElementById('imageUrl').value = color.imageUrl || '';
    document.getElementById('active').checked = color.active == 1;
    document.getElementById('colorModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('colorModal').classList.add('hidden');
}

function confirmDeleteColor(id, name) {
    document.getElementById('deleteConfirmMessage').textContent = `Ali ste prepričani, da želite izbrisati barvo "${name}"?`;
    document.getElementById('deleteColorId').value = id;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.add('hidden');
}

// Sync color picker with text input
document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('colorPicker');
    const htmlColorInput = document.getElementById('htmlColor');
    
    colorPicker.addEventListener('input', function() {
        htmlColorInput.value = this.value;
    });
    
    htmlColorInput.addEventListener('input', function() {
        colorPicker.value = this.value;
    });
    
    // Calculate price with VAT when price without VAT changes
    const priceWithoutVatInput = document.getElementById('priceWithoutVat');
    const priceWithVatInput = document.getElementById('priceWithVat');
    
    priceWithoutVatInput.addEventListener('input', function() {
        const priceWithoutVat = parseFloat(this.value) || 0;
        const priceWithVat = priceWithoutVat * 1.22;
        priceWithVatInput.value = priceWithVat.toFixed(2);
    });
    
    priceWithVatInput.addEventListener('input', function() {
        const priceWithVat = parseFloat(this.value) || 0;
        const priceWithoutVat = priceWithVat / 1.22;
        priceWithoutVatInput.value = priceWithoutVat.toFixed(2);
    });
});
</script>

<?php include_once '../includes/footer.php'; ?>
