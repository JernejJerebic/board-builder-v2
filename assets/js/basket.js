
document.addEventListener('DOMContentLoaded', function() {
    // Get the basket container
    const basketContainer = document.getElementById('basket');
    
    // Initialize basket state
    let basketItems = JSON.parse(localStorage.getItem('basket') || '[]');
    let shippingMethod = 'pickup';
    let paymentMethod = 'bank_transfer';
    
    // Render initial basket
    renderBasket();
    
    // Function to render the basket
    function renderBasket() {
        // Calculate totals
        const totals = calculateTotals();
        
        const basketHTML = `
            <div class="card mt-8">
                <div class="card-header">
                    <h2 class="text-xl font-bold">Košarica</h2>
                </div>
                <div class="card-body p-0">
                    ${basketItems.length > 0 ? renderBasketItems() : '<div class="p-4 text-center">Vaša košarica je prazna</div>'}
                </div>
                ${basketItems.length > 0 ? `
                    <div class="card-footer">
                        <div class="flex justify-between items-center mb-4">
                            <span class="font-bold">Skupaj:</span>
                            <span class="font-bold">€${totals.total.toFixed(2)}</span>
                        </div>
                        
                        <button id="proceed-to-checkout" class="btn btn-primary w-full">Nadaljuj na blagajno</button>
                    </div>
                ` : ''}
            </div>
            
            ${basketItems.length > 0 ? `
                <div id="checkout-form" class="card mt-4 hidden">
                    <div class="card-header">
                        <h2 class="text-xl font-bold">Zaključek naročila</h2>
                    </div>
                    <div class="card-body">
                        <form id="order-form" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label for="firstName" class="form-label">Ime</label>
                                    <input type="text" id="firstName" name="firstName" class="form-input" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="lastName" class="form-label">Priimek</label>
                                    <input type="text" id="lastName" name="lastName" class="form-input" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="email" class="form-label">E-poštni naslov</label>
                                <input type="email" id="email" name="email" class="form-input" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="phone" class="form-label">Telefonska številka</label>
                                <input type="tel" id="phone" name="phone" class="form-input">
                            </div>
                            
                            <div class="form-group">
                                <label for="companyName" class="form-label">Ime podjetja (neobvezno)</label>
                                <input type="text" id="companyName" name="companyName" class="form-input">
                            </div>
                            
                            <div class="form-group">
                                <label for="vatId" class="form-label">ID za DDV (neobvezno)</label>
                                <input type="text" id="vatId" name="vatId" class="form-input">
                            </div>
                            
                            <div class="form-group">
                                <label for="street" class="form-label">Naslov</label>
                                <input type="text" id="street" name="street" class="form-input" required>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label for="city" class="form-label">Mesto</label>
                                    <input type="text" id="city" name="city" class="form-input" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="zipCode" class="form-label">Poštna številka</label>
                                    <input type="text" id="zipCode" name="zipCode" class="form-input" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Način dostave</label>
                                <div class="space-y-2">
                                    <div class="flex items-center">
                                        <input type="radio" id="shipping-pickup" name="shippingMethod" value="pickup" class="mr-2" ${shippingMethod === 'pickup' ? 'checked' : ''}>
                                        <label for="shipping-pickup">Prevzem v trgovini</label>
                                    </div>
                                    <div class="flex items-center">
                                        <input type="radio" id="shipping-delivery" name="shippingMethod" value="delivery" class="mr-2" ${shippingMethod === 'delivery' ? 'checked' : ''}>
                                        <label for="shipping-delivery">Dostava na dom</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Način plačila</label>
                                <div class="space-y-2">
                                    <div class="flex items-center">
                                        <input type="radio" id="payment-transfer" name="paymentMethod" value="bank_transfer" class="mr-2" ${paymentMethod === 'bank_transfer' ? 'checked' : ''}>
                                        <label for="payment-transfer">Bančno nakazilo</label>
                                    </div>
                                    <div class="flex items-center">
                                        <input type="radio" id="payment-card" name="paymentMethod" value="credit_card" class="mr-2" ${paymentMethod === 'credit_card' ? 'checked' : ''}>
                                        <label for="payment-card">Kreditna kartica</label>
                                    </div>
                                    <div class="flex items-center">
                                        <input type="radio" id="payment-pickup" name="paymentMethod" value="pickup_at_shop" class="mr-2" ${paymentMethod === 'pickup_at_shop' ? 'checked' : ''}>
                                        <label for="payment-pickup">Plačilo ob prevzemu v trgovini</label>
                                    </div>
                                    <div class="flex items-center">
                                        <input type="radio" id="payment-delivery" name="paymentMethod" value="payment_on_delivery" class="mr-2" ${paymentMethod === 'payment_on_delivery' ? 'checked' : ''}>
                                        <label for="payment-delivery">Plačilo ob dostavi</label>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-full">Oddaj naročilo</button>
                        </form>
                    </div>
                </div>
            ` : ''}
        `;
        
        basketContainer.innerHTML = basketHTML;
        
        // Add event listeners
        if (basketItems.length > 0) {
            // Remove item buttons
            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', function() {
                    const itemId = this.getAttribute('data-id');
                    removeBasketItem(itemId);
                });
            });
            
            // Proceed to checkout button
            document.getElementById('proceed-to-checkout').addEventListener('click', function() {
                const checkoutForm = document.getElementById('checkout-form');
                checkoutForm.classList.toggle('hidden');
                this.classList.toggle('hidden');
                
                // Try to pre-fill form with customer data from localStorage
                prefillCustomerData();
            });
            
            // Shipping method radios
            document.querySelectorAll('input[name="shippingMethod"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    shippingMethod = this.value;
                });
            });
            
            // Payment method radios
            document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    paymentMethod = this.value;
                });
            });
            
            // Order form submission
            document.getElementById('order-form').addEventListener('submit', handleOrderSubmission);
        }
    }
    
    // Function to render basket items
    function renderBasketItems() {
        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Proizvod</th>
                            <th>Dimenzije</th>
                            <th>Količina</th>
                            <th>Cena</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${basketItems.map(item => `
                            <tr>
                                <td>
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 rounded mr-2" style="background-color: ${item.colorHtml};"></div>
                                        <div>
                                            <div>${item.colorTitle}</div>
                                            <div class="text-sm text-gray-500">${item.thickness}mm</div>
                                        </div>
                                    </div>
                                </td>
                                <td>${item.length} x ${item.width} mm</td>
                                <td>${item.quantity}</td>
                                <td>€${item.totalPrice.toFixed(2)}</td>
                                <td>
                                    <button class="remove-item" data-id="${item.id}">×</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Function to calculate totals
    function calculateTotals() {
        const subtotal = basketItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const vat = subtotal * 0.22; // 22% VAT
        const total = subtotal;
        
        return {
            subtotal,
            vat,
            total
        };
    }
    
    // Function to remove item from basket
    function removeBasketItem(itemId) {
        basketItems = basketItems.filter(item => item.id !== itemId);
        localStorage.setItem('basket', JSON.stringify(basketItems));
        renderBasket();
    }
    
    // Function to prefill customer data
    function prefillCustomerData() {
        const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
        
        if (Object.keys(customerData).length > 0) {
            // Prefill form fields
            Object.keys(customerData).forEach(key => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = customerData[key];
                }
            });
        }
        
        // Check if email was provided, try to load customer data from API
        const emailInput = document.getElementById('email');
        
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email) {
                fetch(`/api/customers/email.php?email=${encodeURIComponent(email)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data) {
                            // Prefill form with customer data from API
                            document.getElementById('firstName').value = data.firstName;
                            document.getElementById('lastName').value = data.lastName;
                            document.getElementById('companyName').value = data.companyName || '';
                            document.getElementById('vatId').value = data.vatId || '';
                            document.getElementById('phone').value = data.phone || '';
                            document.getElementById('street').value = data.street;
                            document.getElementById('city').value = data.city;
                            document.getElementById('zipCode').value = data.zipCode;
                            
                            showToast('Podatki stranke so bili naloženi', 'success');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching customer data:', error);
                    });
            }
        });
    }
    
    // Function to handle order submission
    function handleOrderSubmission(event) {
        event.preventDefault();
        
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Naročilo se pošilja...';
        submitButton.disabled = true;
        
        // Get form data
        const formData = new FormData(event.target);
        const customerData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            companyName: formData.get('companyName'),
            vatId: formData.get('vatId'),
            street: formData.get('street'),
            city: formData.get('city'),
            zipCode: formData.get('zipCode')
        };
        
        // Save customer data to localStorage for future use
        localStorage.setItem('customerData', JSON.stringify(customerData));
        
        // Calculate totals
        const totals = calculateTotals();
        
        // Prepare order data
        const orderData = {
            customer: customerData,
            products: basketItems.map(item => ({
                colorId: item.colorId,
                length: item.length,
                width: item.width,
                thickness: item.thickness,
                surfaceArea: item.surfaceArea,
                borders: item.borders,
                drilling: item.drilling,
                quantity: item.quantity,
                pricePerUnit: item.pricePerUnit,
                totalPrice: item.totalPrice
            })),
            totalCostWithoutVat: totals.subtotal - totals.vat,
            totalCostWithVat: totals.total,
            shippingMethod: formData.get('shippingMethod'),
            paymentMethod: formData.get('paymentMethod'),
            status: 'placed'
        };
        
        // Send order to API
        fetch('/api/orders/create.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server responded with an error');
            }
            return response.json();
        })
        .then(data => {
            // Clear basket
            basketItems = [];
            localStorage.setItem('basket', JSON.stringify(basketItems));
            
            // Show success message
            showToast('Naročilo je bilo uspešno oddano', 'success');
            
            // Redirect to order confirmation page
            window.location.href = `/order-confirmation.php?id=${data.orderId}`;
        })
        .catch(error => {
            console.error('Error placing order:', error);
            showToast('Napaka pri oddaji naročila', 'error');
            
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    }
    
    // Global function to add item to basket
    window.addToBasket = function(product) {
        basketItems.push(product);
        localStorage.setItem('basket', JSON.stringify(basketItems));
        renderBasket();
    };
});
