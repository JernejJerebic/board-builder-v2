
/**
 * Utility functions for LCC Naročilo razreza
 */

/**
 * Show a toast notification
 * 
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) {
        console.error('Toast elements not found');
        return;
    }
    
    // Set message
    toastMessage.textContent = message;
    
    // Set type
    toast.className = 'toast';
    toast.classList.add(`toast-${type}`);
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Format date to local string
 * 
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('sl-SI');
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

/**
 * Format price to Euros
 * 
 * @param {number} price - Price
 * @returns {string} Formatted price
 */
function formatPrice(price) {
    return `${parseFloat(price).toFixed(2)}€`;
}

/**
 * Send email using EmailJS
 * 
 * @param {Object} emailData - Email data
 * @returns {Promise} Promise resolving to email result
 */
function sendEmail(emailData) {
    return new Promise((resolve, reject) => {
        if (!CONFIG.emailJs.serviceId || !CONFIG.emailJs.templateId || !CONFIG.emailJs.userId) {
            console.error('EmailJS configuration is incomplete');
            reject(new Error('EmailJS configuration is incomplete'));
            return;
        }
        
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS is not loaded');
            reject(new Error('EmailJS is not loaded'));
            return;
        }
        
        emailjs.send(
            CONFIG.emailJs.serviceId,
            CONFIG.emailJs.templateId,
            emailData,
            CONFIG.emailJs.userId
        )
        .then(response => {
            console.log('Email sent successfully:', response);
            resolve(response);
        })
        .catch(error => {
            console.error('Error sending email:', error);
            reject(error);
        });
    });
}

/**
 * Generate a unique ID
 * 
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
