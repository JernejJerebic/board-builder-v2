
/**
 * Customers admin page
 */

document.addEventListener('DOMContentLoaded', () => {
    const customersContainer = document.getElementById('customersContainer');
    
    // Load customers
    loadCustomers();
    
    /**
     * Load customers from API or mock data
     */
    function loadCustomers() {
        customersContainer.innerHTML = '<div class="admin-table-loading">Nalaganje strank...</div>';
        
        DataService.getCustomers()
            .then(customers => {
                renderCustomersTable(customers);
            })
            .catch(error => {
                console.error('Error loading customers:', error);
                customersContainer.innerHTML = '<div class="admin-table-error">Napaka pri nalaganju strank.</div>';
            });
    }
    
    /**
     * Render customers table
     * 
     * @param {Array} customers - Array of customer objects
     */
    function renderCustomersTable(customers) {
        if (customers.length === 0) {
            customersContainer.innerHTML = '<div class="admin-table-empty">Ni strank.</div>';
            return;
        }
        
        let tableHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Ime</th>
                        <th>Podjetje</th>
                        <th>Email</th>
                        <th>Telefon</th>
                        <th>Naslov</th>
                        <th>Zadnji nakup</th>
                        <th>Št. nakupov</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        customers.forEach(customer => {
            tableHTML += `
                <tr>
                    <td>${customer.firstName} ${customer.lastName}</td>
                    <td>${customer.companyName || '-'}</td>
                    <td>${customer.email || '-'}</td>
                    <td>${customer.phone || '-'}</td>
                    <td>${customer.street}, ${customer.zipCode} ${customer.city}</td>
                    <td>${customer.lastPurchase ? formatDate(customer.lastPurchase) : '-'}</td>
                    <td>${customer.totalPurchases}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        customersContainer.innerHTML = tableHTML;
    }
});
