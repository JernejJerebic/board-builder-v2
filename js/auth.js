
/**
 * Authentication functionality
 */

// Auth state
const Auth = (function() {
    // Admin status
    let isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // Elements
    const adminLoginButton = document.getElementById('adminLoginButton');
    const adminLogoutButton = document.getElementById('adminLogoutButton');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminEmail = document.getElementById('adminEmail');
    const adminPassword = document.getElementById('adminPassword');
    const confirmLoginButton = document.getElementById('confirmLoginButton');
    const cancelLoginButton = document.getElementById('cancelLoginButton');
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        updateUI();
        setupEventListeners();
    });
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Open login modal
        adminLoginButton.addEventListener('click', () => {
            adminLoginModal.classList.add('show');
        });
        
        // Close login modal
        adminLoginModal.querySelector('.close-button').addEventListener('click', () => {
            adminLoginModal.classList.remove('show');
        });
        
        // Close login modal when clicking outside
        adminLoginModal.addEventListener('click', (e) => {
            if (e.target === adminLoginModal) {
                adminLoginModal.classList.remove('show');
            }
        });
        
        // Cancel login
        cancelLoginButton.addEventListener('click', () => {
            adminLoginModal.classList.remove('show');
        });
        
        // Handle login form submission
        confirmLoginButton.addEventListener('click', login);
        
        // Handle Enter key in password field
        adminPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                login();
            }
        });
        
        // Handle logout
        adminLogoutButton.addEventListener('click', logout);
    }
    
    /**
     * Login
     */
    function login() {
        const email = adminEmail.value;
        const password = adminPassword.value;
        
        const isValidCredentials = CONFIG.adminCredentials.some(
            cred => cred.email === email && cred.password === password
        );
        
        if (isValidCredentials) {
            isAdmin = true;
            localStorage.setItem('isAdmin', 'true');
            adminLoginModal.classList.remove('show');
            showToast('Prijava uspešna', 'success');
            updateUI();
        } else {
            showToast('Neveljavni podatki za prijavo.', 'error');
        }
    }
    
    /**
     * Logout
     */
    function logout() {
        isAdmin = false;
        localStorage.removeItem('isAdmin');
        
        // Redirect to homepage if not already there
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = '/';
        }
        
        showToast('Uspešno ste se odjavili.', 'success');
        updateUI();
    }
    
    /**
     * Update UI based on admin status
     */
    function updateUI() {
        if (isAdmin) {
            adminLoginButton.classList.add('hidden');
            adminLogoutButton.classList.remove('hidden');
            
            // Show admin-only elements
            adminOnlyElements.forEach(el => {
                el.classList.remove('hidden');
            });
        } else {
            adminLoginButton.classList.remove('hidden');
            adminLogoutButton.classList.add('hidden');
            
            // Hide admin-only elements
            adminOnlyElements.forEach(el => {
                el.classList.add('hidden');
            });
        }
    }
    
    // Public API
    return {
        isAdmin: () => isAdmin,
        updateUI
    };
})();
