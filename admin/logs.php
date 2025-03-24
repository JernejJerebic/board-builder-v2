
<?php
require_once '../config/database.php';
require_once '../includes/utils.php';

// Require admin login
session_start();
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    header('Location: /admin/login.php');
    exit;
}

// Handle log clear action
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'clear_logs') {
    // Clear logs file
    if (file_exists('logs.json')) {
        file_put_contents('logs.json', '[]');
        $_SESSION['success_message'] = 'Dnevniki so bili uspešno izbrisani';
    }
    
    // Redirect to refresh the page
    header('Location: /admin/logs.php');
    exit;
}

// Get logs from file
$logs = [];
if (file_exists('logs.json')) {
    $logsJson = file_get_contents('logs.json');
    $logs = json_decode($logsJson, true) ?: [];
}

// Filter logs by level and search term if provided
$filter = $_GET['filter'] ?? 'all';
$search = $_GET['search'] ?? '';

if ($filter !== 'all' || $search !== '') {
    $filteredLogs = [];
    
    foreach ($logs as $log) {
        $include = true;
        
        // Apply level filter
        if ($filter !== 'all' && $log['level'] !== $filter) {
            $include = false;
        }
        
        // Apply search filter
        if ($search !== '' && strpos(strtolower(json_encode($log)), strtolower($search)) === false) {
            $include = false;
        }
        
        if ($include) {
            $filteredLogs[] = $log;
        }
    }
    
    $logs = $filteredLogs;
}

include_once '../includes/header.php';
?>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold mb-2">Dnevniki aplikacije</h1>
            <p class="text-gray-500">Pregled in analiza dnevnikov aplikacije. Skupno vnosov: <?php echo count($logs); ?></p>
        </div>
        
        <div class="flex space-x-2">
            <button type="button" class="btn btn-outline" onclick="refreshLogs()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 4v6h-6"></path>
                    <path d="M1 20v-6h6"></path>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Osveži
            </button>
            
            <button type="button" class="btn btn-outline" onclick="downloadLogs()">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Prenesi
            </button>
            
            <form method="POST" action="" onsubmit="return confirmClearLogs()">
                <input type="hidden" name="action" value="clear_logs">
                <button type="submit" class="btn btn-danger">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Izbriši dnevnike
                </button>
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
    
    <form method="GET" action="" class="flex gap-4 mt-4">
        <div class="flex-1">
            <input type="text" name="search" value="<?php echo htmlspecialchars($search); ?>" placeholder="Iskanje dnevnikov..." class="form-input">
        </div>
        <div class="w-40">
            <select name="filter" class="form-select">
                <option value="all" <?php echo $filter === 'all' ? 'selected' : ''; ?>>Vsi nivoji</option>
                <option value="info" <?php echo $filter === 'info' ? 'selected' : ''; ?>>Info</option>
                <option value="warning" <?php echo $filter === 'warning' ? 'selected' : ''; ?>>Opozorilo</option>
                <option value="error" <?php echo $filter === 'error' ? 'selected' : ''; ?>>Napaka</option>
            </select>
        </div>
        <button type="submit" class="btn btn-primary">Filtriraj</button>
    </form>
    
    <div class="bg-white rounded-lg shadow-sm border">
        <div class="bg-muted px-4 py-2 font-medium flex items-center">
            <div class="w-48">Časovna oznaka</div>
            <div class="w-24">Nivo</div>
            <div class="flex-1">Sporočilo</div>
        </div>
        <div class="max-h-[600px] overflow-auto">
            <?php if (count($logs) > 0): ?>
                <?php foreach ($logs as $log): ?>
                    <div class="px-4 py-3 border-t flex items-start hover:bg-muted/50">
                        <div class="w-48 text-xs text-muted-foreground">
                            <?php echo date('d.m.Y H:i:s', strtotime($log['timestamp'])); ?>
                        </div>
                        <div class="w-24">
                            <span class="text-xs rounded-full px-2 py-1 font-medium 
                                <?php 
                                    switch($log['level']) {
                                        case 'error':
                                            echo 'text-red-500 bg-red-50';
                                            break;
                                        case 'warning':
                                            echo 'text-amber-500 bg-amber-50';
                                            break;
                                        case 'info':
                                            echo 'text-blue-500 bg-blue-50';
                                            break;
                                        default:
                                            echo 'text-gray-500 bg-gray-50';
                                    }
                                ?>">
                                <?php echo htmlspecialchars($log['level']); ?>
                            </span>
                        </div>
                        <div class="flex-1">
                            <div><?php echo htmlspecialchars($log['message']); ?></div>
                            <?php if (isset($log['details']) && !empty($log['details'])): ?>
                                <pre class="mt-1 text-xs bg-muted p-2 rounded whitespace-pre-wrap"><?php echo htmlspecialchars(is_array($log['details']) ? json_encode($log['details'], JSON_PRETTY_PRINT) : $log['details']); ?></pre>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="px-4 py-8 text-center text-muted-foreground">
                    Ni najdenih dnevnikov. <?php echo ($search || $filter !== 'all') ? 'Poskusite prilagoditi filtre.' : ''; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
function refreshLogs() {
    window.location.reload();
}

function downloadLogs() {
    window.location.href = '/admin/download-logs.php';
}

function confirmClearLogs() {
    return confirm('Ali ste prepričani, da želite izbrisati vse dnevnike? To dejanje je nepovratno.');
}
</script>

<style>
.btn-danger {
    background-color: #ef4444;
    color: white;
    border: none;
}

.btn-danger:hover {
    background-color: #dc2626;
}

pre {
    font-family: monospace;
}
</style>

<?php include_once '../includes/footer.php'; ?>
