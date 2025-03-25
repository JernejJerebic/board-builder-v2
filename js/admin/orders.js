
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
        
        Promise.all([
            DataService.getOrders(),
            DataService.getCustomers()
        ])
            .then(([orders, customers]) => {
                // Match customers to orders
                orders.forEach(order => {
                    order.customer = customers.find(c => c.id === order.customerId) || null;
                });
                
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
                        <th>ID Naročila</th>
                        <th>Datum</th>
                        <th>Stranka</th>
                        <th>Izdelki</th>
                        <th>Znesek</th>
                        <th>Dostava</th>
                        <th>Plačilo</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        orders.forEach(order => {
            const customerName = order.customer ? 
                `${order.customer.firstName} ${order.customer.lastName}` : 
                'Neznana stranka';
            
            const productsText = order.products.map(p => 
                `${p.quantity}x ${p.color?.title || 'Neznana barva'} ${p.length}x${p.width}x${p.thickness}mm`
            ).join(', ');
            
            const deliveryMethod = order.shippingMethod === 'pickup' ? 
                'Prevzem' : 'Dostava';
            
            let paymentMethod;
            switch (order.paymentMethod) {
                case 'pickup_at_shop':
                    paymentMethod = 'Ob prevzemu';
                    break;
                case 'payment_on_delivery':
                    paymentMethod = 'Po povzetju';
                    break;
                case 'bank_transfer':
                    paymentMethod = 'Bančno nakazilo';
                    break;
                default:
                    paymentMethod = order.paymentMethod;
            }
            
            let statusText;
            let statusClass;
            switch (order.status) {
                case 'placed':
                    statusText = 'Oddano';
                    statusClass = 'status-placed';
                    break;
                case 'in_progress':
                    statusText = 'V izvajanju';
                    statusClass = 'status-in-progress';
                    break;
                case 'completed':
                    statusText = 'Zaključeno';
                    statusClass = 'status-completed';
                    break;
                default:
                    statusText = order.status;
                    statusClass = '';
            }
            
            tableHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td>${formatDate(order.orderDate)}</td>
                    <td>${customerName}</td>
                    <td>${productsText}</td>
                    <td>${order.totalCostWithVat.toFixed(2)}€</td>
                    <td>${deliveryMethod}</td>
                    <td>${paymentMethod}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        ordersContainer.innerHTML = tableHTML;
    }
});
