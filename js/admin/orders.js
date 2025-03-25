
/**
 * Orders admin page
 */

document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('ordersContainer');
    
    // Load orders
    loadOrders();
    
    /**
     * Load orders from API or mock data
     */
    function loadOrders() {
        ordersContainer.innerHTML = '<div class="admin-table-loading">Nalaganje naročil...</div>';
        
        DataService.getOrders()
            .then(orders => {
                renderOrdersTable(orders);
            })
            .catch(error => {
                console.error('Error loading orders:', error);
                ordersContainer.innerHTML = '<div class="admin-table-error">Napaka pri nalaganju naročil.</div>';
            });
    }
    
    /**
     * Render orders table
     * 
     * @param {Array} orders - Array of order objects
     */
    function renderOrdersTable(orders) {
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<div class="admin-table-empty">Ni naročil.</div>';
            return;
        }
        
        let tableHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Stranka</th>
                        <th>Datum</th>
                        <th>Vsota</th>
                        <th>Način dostave</th>
                        <th>Način plačila</th>
                        <th>Status</th>
                        <th>Akcije</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        orders.forEach(order => {
            const statusBadgeClass = getStatusBadgeClass(order.status);
            const statusText = getStatusText(order.status);
            let customer = { firstName: '', lastName: '' };
            
            // Find customer for this order
            DataService.getCustomers().then(customers => {
                const matchedCustomer = customers.find(c => c.id === order.customerId);
                if (matchedCustomer) {
                    customer = matchedCustomer;
                    
                    // Update customer name in the table
                    const customerNameCell = document.querySelector(`[data-customer-id="${order.customerId}"]`);
                    if (customerNameCell) {
                        customerNameCell.textContent = `${customer.firstName} ${customer.lastName}`;
                    }
                }
            });
            
            tableHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td data-customer-id="${order.customerId}">${customer.firstName} ${customer.lastName}</td>
                    <td>${formatDate(order.orderDate)}</td>
                    <td>${formatPrice(order.totalCostWithVat)}</td>
                    <td>${getShippingMethodText(order.shippingMethod)}</td>
                    <td>${getPaymentMethodText(order.paymentMethod)}</td>
                    <td>
                        <span class="status-badge ${statusBadgeClass}">${statusText}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="view-order-button" data-order-id="${order.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                            <button class="update-status-button" data-order-id="${order.id}" data-status="${order.status}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="9 11 12 14 22 4"></polyline>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        ordersContainer.innerHTML = tableHTML;
        
        // Add event listeners for buttons
        setupOrderButtons();
    }
    
    /**
     * Setup event listeners for order buttons
     */
    function setupOrderButtons() {
        // View order buttons
        const viewButtons = document.querySelectorAll('.view-order-button');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const orderId = button.dataset.orderId;
                // Redirect to order detail page
                window.location.href = `order-detail.html?id=${orderId}`;
            });
        });
        
        // Update status buttons
        const updateButtons = document.querySelectorAll('.update-status-button');
        updateButtons.forEach(button => {
            button.addEventListener('click', () => {
                const orderId = button.dataset.orderId;
                const currentStatus = button.dataset.status;
                showStatusUpdateModal(orderId, currentStatus);
            });
        });
    }
    
    /**
     * Show modal for updating order status
     * 
     * @param {string} orderId - Order ID
     * @param {string} currentStatus - Current status
     */
    function showStatusUpdateModal(orderId, currentStatus) {
        // Create modal HTML
        const modalHTML = `
            <div id="statusModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Posodobi status naročila</h2>
                        <button class="close-button">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="statusSelect">Status:</label>
                            <select id="statusSelect" class="form-control">
                                <option value="placed" ${currentStatus === 'placed' ? 'selected' : ''}>Prejeto</option>
                                <option value="in_progress" ${currentStatus === 'in_progress' ? 'selected' : ''}>V obdelavi</option>
                                <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>Zaključeno</option>
                                <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>Preklicano</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="updateStatusButton" class="primary-button">Posodobi</button>
                        <button id="cancelStatusButton" class="secondary-button">Prekliči</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const statusModal = document.getElementById('statusModal');
        const updateStatusButton = document.getElementById('updateStatusButton');
        const cancelStatusButton = document.getElementById('cancelStatusButton');
        const closeButton = statusModal.querySelector('.close-button');
        
        // Show modal
        statusModal.classList.add('show');
        
        // Close modal function
        const closeModal = () => {
            statusModal.classList.remove('show');
            setTimeout(() => {
                statusModal.remove();
            }, 300);
        };
        
        // Event listeners
        closeButton.addEventListener('click', closeModal);
        cancelStatusButton.addEventListener('click', closeModal);
        
        // Close modal when clicking outside
        statusModal.addEventListener('click', (e) => {
            if (e.target === statusModal) {
                closeModal();
            }
        });
        
        // Update status
        updateStatusButton.addEventListener('click', () => {
            const newStatus = document.getElementById('statusSelect').value;
            
            // Call API to update status
            DataService.updateOrderStatus(orderId, newStatus)
                .then(() => {
                    showToast('Status uspešno posodobljen', 'success');
                    closeModal();
                    loadOrders(); // Reload orders
                })
                .catch(error => {
                    console.error('Error updating status:', error);
                    showToast('Napaka pri posodabljanju statusa', 'error');
                });
        });
    }
    
    /**
     * Get status badge class based on status
     * 
     * @param {string} status - Order status
     * @returns {string} CSS class for badge
     */
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'placed':
                return 'status-placed';
            case 'in_progress':
                return 'status-in-progress';
            case 'completed':
                return 'status-completed';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    }
    
    /**
     * Get status text based on status
     * 
     * @param {string} status - Order status
     * @returns {string} Human-readable status
     */
    function getStatusText(status) {
        switch (status) {
            case 'placed':
                return 'Prejeto';
            case 'in_progress':
                return 'V obdelavi';
            case 'completed':
                return 'Zaključeno';
            case 'cancelled':
                return 'Preklicano';
            default:
                return status;
        }
    }
    
    /**
     * Get shipping method text based on method
     * 
     * @param {string} method - Shipping method
     * @returns {string} Human-readable shipping method
     */
    function getShippingMethodText(method) {
        switch (method) {
            case 'pickup':
                return 'Osebni prevzem';
            case 'delivery':
                return 'Dostava';
            default:
                return method;
        }
    }
    
    /**
     * Get payment method text based on method
     * 
     * @param {string} method - Payment method
     * @returns {string} Human-readable payment method
     */
    function getPaymentMethodText(method) {
        switch (method) {
            case 'cash':
                return 'Gotovina';
            case 'card':
                return 'Kartica';
            case 'bank_transfer':
                return 'Nakazilo';
            default:
                return method;
        }
    }
});
