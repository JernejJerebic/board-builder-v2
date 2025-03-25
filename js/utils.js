
/**
 * Utility functions for LCC Naročilo razreza
 */

/**
 * Format price with VAT
 * 
 * @param {number} price - Price without VAT
 * @returns {Object} Object with withoutVat and withVat properties
 */
function formatPrice(price) {
    const withoutVat = parseFloat(price);
    const withVat = withoutVat * (1 + CONFIG.vatPercentage / 100);
    
    return {
        withoutVat,
        withVat
    };
}

/**
 * Generate a unique ID
 * 
 * @returns {string} A unique ID
 */
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Show a toast notification
 * 
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error)
 */
function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = 'toast';
    
    if (type) {
        toast.classList.add(type);
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Send an email using EmailJS
 * 
 * @param {Object} data - Email data
 * @returns {Promise} Promise that resolves when email is sent
 */
function sendEmail(data) {
    const templateParams = {
        to_name: data.name,
        to_email: data.email,
        order_id: data.orderId,
        order_details: data.orderDetails,
        total_price: data.totalPrice
    };
    
    // Using EmailJS if available, otherwise mock implementation
    if (typeof emailjs !== 'undefined') {
        return emailjs.send(
            CONFIG.emailJs.serviceId,
            CONFIG.emailJs.templateId,
            templateParams,
            CONFIG.emailJs.userId
        );
    } else {
        console.log('EmailJS not available, would send email with:', templateParams);
        return Promise.resolve({ status: 200 });
    }
}

/**
 * Format date to locale string
 * 
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('sl-SI', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Simple deep clone of an object
 * 
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Fetch API wrapper with error handling
 * 
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} Promise that resolves to the response data
 */
async function fetchApi(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

/**
 * Validate an email address
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidEmail(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return re.test(email);
}

/**
 * Get browser language
 * 
 * @returns {string} Browser language
 */
function getBrowserLanguage() {
    return navigator.language || navigator.userLanguage || 'en-US';
}
