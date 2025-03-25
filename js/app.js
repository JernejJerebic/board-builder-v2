
/**
 * Main application script
 */

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Check if we're on an admin page
    const isAdminPage = [
        '/customers.html',
        '/orders.html',
        '/colors.html',
        '/logs.html'
    ].includes(window.location.pathname);
    
    // Redirect non-admin users from admin pages
    if (isAdminPage && localStorage.getItem('isAdmin') !== 'true') {
        window.location.href = '/';
    }
    
    // Initialize EmailJS if needed
    if (typeof emailjs !== 'undefined') {
        emailjs.init(CONFIG.emailJs.userId);
    }
    
    console.log('LCC Naročilo razreza initialized');
});
