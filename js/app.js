
/**
 * Main application script
 */

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('LCC Naročilo razreza initializing...');
    
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Check if we're on an admin page
    const adminPages = [
        '/customers.html',
        '/orders.html',
        '/colors.html',
        '/logs.html'
    ];
    
    const currentPath = window.location.pathname;
    const isAdminPage = adminPages.some(page => currentPath.endsWith(page));
    
    console.log('Current path:', currentPath, 'Is admin page:', isAdminPage);
    
    // Redirect non-admin users from admin pages
    if (isAdminPage && localStorage.getItem('isAdmin') !== 'true') {
        console.log('Non-admin user attempting to access admin page, redirecting...');
        window.location.href = '/';
        return;
    }
    
    // Initialize EmailJS if needed
    if (typeof emailjs !== 'undefined') {
        console.log('Initializing EmailJS with ID:', CONFIG.emailJs.userId);
        emailjs.init(CONFIG.emailJs.userId);
    }
    
    // Add event listener for admin logout button if present
    const adminLogoutButton = document.getElementById('adminLogoutButton');
    if (adminLogoutButton) {
        adminLogoutButton.addEventListener('click', () => {
            localStorage.removeItem('isAdmin');
            window.location.href = '/';
        });
    }
    
    console.log('LCC Naročilo razreza initialized successfully');
});
