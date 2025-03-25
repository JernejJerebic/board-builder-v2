
/**
 * Authentication functionality
 */

// Authentication service
const AuthService = (function() {
    /**
     * Check if user is admin
     * 
     * @returns {boolean} True if user is admin
     */
    function isAdmin() {
        return localStorage.getItem('isAdmin') === 'true';
    }
    
    /**
     * Login as admin
     * 
     * @param {string} email - Admin email
     * @param {string} password - Admin password
     * @returns {boolean} True if login successful
     */
    function login(email, password) {
        // Validate credentials against admin list
        const validCredentials = CONFIG.adminCredentials.some(
            admin => admin.email === email && admin.password === password
        );
        
        if (validCredentials) {
            localStorage.setItem('isAdmin', 'true');
            return true;
        }
        
        return false;
    }
    
    /**
     * Logout admin
     */
    function logout() {
        localStorage.removeItem('isAdmin');
    }
    
    // Public API
    return {
        isAdmin,
        login,
        logout
    };
})();

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the login page
    if (window.location.pathname.endsWith('/login.html')) {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                if (AuthService.login(email, password)) {
                    window.location.href = '/orders.html';
                } else {
                    showToast('Napačen email ali geslo', 'error');
                }
            });
        }
    }
    
    // Show/hide admin elements based on authentication
    updateAdminUI();
});

/**
 * Update UI based on admin status
 */
function updateAdminUI() {
    const isAdmin = AuthService.isAdmin();
    
    // Show/hide admin nav items
    const adminNavItems = document.querySelectorAll('.admin-only');
    adminNavItems.forEach(item => {
        item.style.display = isAdmin ? 'block' : 'none';
    });
    
    // Show/hide admin logout button
    const adminLogoutButton = document.getElementById('adminLogoutButton');
    if (adminLogoutButton) {
        adminLogoutButton.style.display = isAdmin ? 'block' : 'none';
    }
}
