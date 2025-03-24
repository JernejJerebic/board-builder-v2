
    </main>
    <footer class="container p-4 text-center">
        <p class="text-muted">
            &copy; <?php echo date('Y'); ?> LCC naročilo razreza
            <?php if (!isset($_SESSION['admin'])): ?>
            <span class="admin-login-link" style="display:none">
                <a href="/admin/login.php">Admin</a>
            </span>
            <?php endif; ?>
        </p>
    </footer>
    
    <div class="toast-container" id="toastContainer"></div>
    
    <script>
    // Show/hide admin link with double click
    document.addEventListener('DOMContentLoaded', function() {
        let clickCount = 0;
        let clickTimer = null;
        
        document.querySelector('footer').addEventListener('click', function() {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(function() {
                    clickCount = 0;
                }, 300);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                clickCount = 0;
                document.querySelector('.admin-login-link')?.style.display = 'inline';
            }
        });
    });
    
    // Toast notification system
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    </script>
</body>
</html>
