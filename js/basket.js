
/**
 * Basket functionality
 */

// Initialize the basket
window.Basket = (function() {
    // Basket items
    let items = JSON.parse(localStorage.getItem('basket') || '[]');
    
    // Basket container element
    const basketContainer = document.getElementById('basketContainer');
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        renderBasket();
        setupCheckoutHandlers();
    });
    
    /**
     * Add item to basket
     * 
     * @param {Object} item - Product to add
     */
    function addItem(item) {
        items.push(item);
        saveBasket();
        renderBasket();
    }
    
    /**
     * Remove item from basket
     * 
     * @param {string} basketId - Basket ID of item to remove
     */
    function removeItem(basketId) {
        items = items.filter(item => item.basketId !== basketId);
        saveBasket();
        renderBasket();
    }
    
    /**
     * Save basket to localStorage
     */
    function saveBasket() {
        localStorage.setItem('basket', JSON.stringify(items));
    }
    
    /**
     * Calculate basket total
     * 
     * @returns {Object} Object with withoutVat and withVat properties
     */
    function calculateTotal() {
        return items.reduce((total, item) => {
            return {
                withoutVat: total.withoutVat + item.pricePerUnit * item.quantity / (1 + CONFIG.vatPercentage / 100),
                withVat: total.withVat + item.totalPrice
            };
        }, { withoutVat: 0, withVat: 0 });
    }
    
    /**
     * Clear the basket
     */
    function clearBasket() {
        items = [];
        saveBasket();
        renderBasket();
    }
    
    /**
     * Render the basket
     */
    function renderBasket() {
        if (items.length === 0) {
            basketContainer.innerHTML = `
                <div class="basket-header">
                    <h2 class="basket-title">Košarica</h2>
                </div>
                <p class="basket-empty">Vaša košarica je prazna</p>
            `;
            return;
        }
        
        const total = calculateTotal();
        
        let basketHTML = `
            <div class="basket-header">
                <h2 class="basket-title">Košarica</h2>
            </div>
            
            <div class="basket-items">
        `;
        
        items.forEach(item => {
            let bordersList = '';
            const borders = Object.entries(item.borders)
                .filter(([_, value]) => value)
                .map(([key]) => {
                    switch (key) {
                        case 'top': return 'zgornji';
                        case 'right': return 'desni';
                        case 'bottom': return 'spodnji';
                        case 'left': return 'levi';
                        default: return key;
                    }
                });
            
            if (borders.length > 0) {
                bordersList = `, Robovi: ${borders.join(', ')}`;
            }
            
            basketHTML += `
                <div class="basket-item" data-basket-id="${item.basketId}">
                    <div class="basket-item-info">
                        <div class="basket-item-color">
                            <div class="color-preview" style="background-color: ${item.color?.htmlColor || '#d2b48c'}"></div>
                            <h3 class="color-title">${item.color?.title}</h3>
                        </div>
                        <p class="basket-item-dimensions">
                            ${item.length} x ${item.width} x ${item.thickness}mm
                            ${bordersList}
                            ${item.drilling ? ', Z vrtanjem' : ''}
                        </p>
                        <p class="basket-item-quantity">Količina: ${item.quantity}</p>
                    </div>
                    
                    <div class="basket-item-actions">
                        <span class="basket-item-price">${item.totalPrice.toFixed(2)}€</span>
                        <button class="remove-item-button" data-basket-id="${item.basketId}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });
        
        basketHTML += `
            </div>
            
            <div class="basket-summary">
                <div class="basket-subtotal">
                    <span>Vmesna vsota (brez DDV):</span>
                    <span>${total.withoutVat.toFixed(2)}€</span>
                </div>
                <div class="basket-total">
                    <span>Skupaj (z DDV):</span>
                    <span>${total.withVat.toFixed(2)}€</span>
                </div>
                
                <button id="checkoutButton" class="primary-button">Nadaljuj na blagajno</button>
            </div>
        `;
        
        basketContainer.innerHTML = basketHTML;
        
        // Add event listeners for remove buttons
        const removeButtons = basketContainer.querySelectorAll('.remove-item-button');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const basketId = e.currentTarget.dataset.basketId;
                removeItem(basketId);
            });
        });
        
        // Add event listener for checkout button
        const checkoutButton = document.getElementById('checkoutButton');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                const checkoutModal = document.getElementById('checkoutModal');
                checkoutModal.classList.add('show');
            });
        }
    }
    
    /**
     * Setup checkout form handlers
     */
    function setupCheckoutHandlers() {
        const checkoutModal = document.getElementById('checkoutModal');
        const checkoutForm = document.getElementById('checkoutForm');
        const cancelCheckoutButton = document.getElementById('cancelCheckoutButton');
        
        // Close checkout modal
        checkoutModal.querySelector('.close-button').addEventListener('click', () => {
            checkoutModal.classList.remove('show');
        });
        
        // Close checkout modal when clicking outside
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.classList.remove('show');
            }
        });
        
        // Cancel checkout
        cancelCheckoutButton.addEventListener('click', () => {
            checkoutModal.classList.remove('show');
        });
        
        // Handle checkout form submission
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                companyName: document.getElementById('companyName').value,
                vatId: document.getElementById('vatId').value,
                street: document.getElementById('street').value,
                city: document.getElementById('city').value,
                zipCode: document.getElementById('zipCode').value,
                deliveryMethod: document.querySelector('input[name="deliveryMethod"]:checked').value,
                paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
                notes: document.getElementById('orderNotes').value
            };
            
            // Create customer
            const customer = new Customer(formData);
            
            // Create order
            const order = new Order({
                customerId: customer.id,
                customer: customer,
                products: [...items],
                shippingMethod: formData.deliveryMethod,
                paymentMethod: formData.paymentMethod,
                notes: formData.notes
            });
            
            // Submit order
            submitOrder(order);
        });
    }
    
    /**
     * Submit the order
     * 
     * @param {Object} order - Order data
     */
    function submitOrder(order) {
        DataService.createOrder(order)
            .then(createdOrder => {
                // Send confirmation email
                sendEmail({
                    name: `${order.customer.firstName} ${order.customer.lastName}`,
                    email: order.customer.email,
                    orderId: createdOrder.id,
                    orderDetails: items.map(item => 
                        `${item.quantity}x ${item.color?.title} ${item.length}x${item.width}x${item.thickness}mm`
                    ).join(', '),
                    totalPrice: calculateTotal().withVat.toFixed(2) + '€'
                })
                .then(() => {
                    // Show success message
                    showToast('Naročilo uspešno oddano!', 'success');
                    
                    // Close modal and clear basket
                    document.getElementById('checkoutModal').classList.remove('show');
                    clearBasket();
                })
                .catch(error => {
                    console.error('Error sending email:', error);
                    showToast('Naročilo oddano, vendar email potrditve ni bil poslan.', 'error');
                    
                    // Close modal and clear basket
                    document.getElementById('checkoutModal').classList.remove('show');
                    clearBasket();
                });
            })
            .catch(error => {
                console.error('Error creating order:', error);
                showToast('Napaka pri oddaji naročila. Poskusite znova.', 'error');
            });
    }
    
    // Public API
    return {
        addItem,
        removeItem,
        calculateTotal,
        clearBasket,
        getItems: () => [...items]
    };
})();
