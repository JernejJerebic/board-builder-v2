
/**
 * Data models and services for LCC Naročilo razreza
 */

// Data Service
const DataService = (function() {
    // Use mock data if configured
    const useMockData = CONFIG.useMockData;
    
    // API URLs
    const API_URL = CONFIG.apiUrl;
    const COLORS_API = `${API_URL}/colors`;
    const CUSTOMERS_API = `${API_URL}/customers`;
    const ORDERS_API = `${API_URL}/orders`;
    
    /**
     * Mock colors data
     */
    const mockColors = [
        {
            id: '1',
            title: 'Bela',
            htmlColor: '#FFFFFF',
            thickness: 18,
            priceWithoutVat: 25.0,
            priceWithVat: 30.5,
            active: true
        },
        {
            id: '2',
            title: 'Hrast',
            htmlColor: '#D2B48C',
            thickness: 18,
            priceWithoutVat: 30.0,
            priceWithVat: 36.6,
            active: true
        },
        {
            id: '3',
            title: 'Moka',
            htmlColor: '#6F4E37',
            thickness: 18,
            priceWithoutVat: 28.0,
            priceWithVat: 34.16,
            active: true
        },
        {
            id: '4',
            title: 'Črna',
            htmlColor: '#000000',
            thickness: 18,
            priceWithoutVat: 25.0,
            priceWithVat: 30.5,
            active: true
        },
        {
            id: '5',
            title: 'Rdeča',
            htmlColor: '#FF0000',
            thickness: 12,
            priceWithoutVat: 27.0,
            priceWithVat: 32.94,
            active: true
        }
    ];
    
    /**
     * Mock customers data
     */
    const mockCustomers = [
        {
            id: '1',
            firstName: 'Janez',
            lastName: 'Novak',
            companyName: 'Novak d.o.o.',
            vatId: 'SI12345678',
            email: 'janez.novak@example.com',
            phone: '031 123 456',
            street: 'Slovenska cesta 1',
            city: 'Ljubljana',
            zipCode: '1000',
            lastPurchase: '2023-05-15',
            totalPurchases: 3
        },
        {
            id: '2',
            firstName: 'Maja',
            lastName: 'Kovač',
            companyName: '',
            vatId: '',
            email: 'maja.kovac@example.com',
            phone: '041 234 567',
            street: 'Mariborska ulica 42',
            city: 'Maribor',
            zipCode: '2000',
            lastPurchase: '2023-06-20',
            totalPurchases: 1
        }
    ];
    
    /**
     * Mock orders data
     */
    const mockOrders = [
        {
            id: '1',
            customerId: '1',
            orderDate: '2023-05-15',
            totalCostWithoutVat: 100.0,
            totalCostWithVat: 122.0,
            shippingMethod: 'pickup',
            paymentMethod: 'cash',
            status: 'completed',
            products: [
                {
                    id: '1',
                    orderId: '1',
                    colorId: '1',
                    length: 800,
                    width: 600,
                    thickness: 18,
                    surfaceArea: 0.48,
                    borders: {
                        top: true,
                        right: true,
                        bottom: true,
                        left: true
                    },
                    drilling: true,
                    quantity: 2,
                    pricePerUnit: 50.0,
                    totalPrice: 100.0
                }
            ]
        },
        {
            id: '2',
            customerId: '2',
            orderDate: '2023-06-20',
            totalCostWithoutVat: 75.0,
            totalCostWithVat: 91.5,
            shippingMethod: 'delivery',
            paymentMethod: 'bank_transfer',
            status: 'in_progress',
            products: [
                {
                    id: '2',
                    orderId: '2',
                    colorId: '2',
                    length: 1000,
                    width: 500,
                    thickness: 18,
                    surfaceArea: 0.5,
                    borders: {
                        top: false,
                        right: true,
                        bottom: false,
                        left: true
                    },
                    drilling: false,
                    quantity: 1,
                    pricePerUnit: 75.0,
                    totalPrice: 75.0
                }
            ]
        }
    ];
    
    /**
     * Get colors
     * 
     * @returns {Promise} Promise resolving to colors array
     */
    function getColors() {
        if (useMockData) {
            return Promise.resolve(mockColors);
        }
        
        return fetch(COLORS_API)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            });
    }
    
    /**
     * Get customers
     * 
     * @returns {Promise} Promise resolving to customers array
     */
    function getCustomers() {
        if (useMockData) {
            return Promise.resolve(mockCustomers);
        }
        
        return fetch(CUSTOMERS_API)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            });
    }
    
    /**
     * Get orders
     * 
     * @returns {Promise} Promise resolving to orders array
     */
    function getOrders() {
        if (useMockData) {
            return Promise.resolve(mockOrders);
        }
        
        return fetch(ORDERS_API)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            });
    }
    
    /**
     * Create order
     * 
     * @param {Object} order - Order data
     * @returns {Promise} Promise resolving to created order
     */
    function createOrder(order) {
        if (useMockData) {
            const newOrder = {
                ...order,
                id: generateId(),
                orderDate: new Date().toISOString().split('T')[0]
            };
            mockOrders.push(newOrder);
            return Promise.resolve(newOrder);
        }
        
        return fetch(ORDERS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        });
    }
    
    /**
     * Update order status
     * 
     * @param {string} orderId - Order ID
     * @param {string} status - New status
     * @returns {Promise} Promise resolving to updated order
     */
    function updateOrderStatus(orderId, status) {
        if (useMockData) {
            const orderIndex = mockOrders.findIndex(order => order.id === orderId);
            if (orderIndex === -1) {
                return Promise.reject(new Error('Order not found'));
            }
            
            mockOrders[orderIndex].status = status;
            return Promise.resolve(mockOrders[orderIndex]);
        }
        
        return fetch(`${ORDERS_API}/status.php?id=${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        });
    }
    
    // Public API
    return {
        getColors,
        getCustomers,
        getOrders,
        createOrder,
        updateOrderStatus
    };
})();

/**
 * Product class
 */
class Product {
    constructor(data) {
        this.basketId = generateId(); // Unique ID for basket
        this.colorId = data.colorId;
        this.color = data.color;
        this.length = data.length || 0;
        this.width = data.width || 0;
        this.thickness = data.thickness || 0;
        this.surfaceArea = (this.length * this.width) / 1000000; // Convert to m²
        this.borders = data.borders || {
            top: false,
            right: false,
            bottom: false,
            left: false
        };
        this.drilling = data.drilling || false;
        this.quantity = data.quantity || 1;
        
        // Calculate prices
        this.calculatePrices();
    }
    
    /**
     * Calculate product prices
     */
    calculatePrices() {
        if (!this.color) {
            this.pricePerUnit = 0;
            this.totalPrice = 0;
            return;
        }
        
        // Base price based on material and surface area
        let price = this.color.priceWithVat * this.surfaceArea;
        
        // Add cost for borders - 2€ per border
        const borderCount = Object.values(this.borders).filter(Boolean).length;
        const borderCost = borderCount * ((this.length + this.width) / 1000) * 2;
        
        // Add cost for drilling - 5€ per drilling
        const drillingCost = this.drilling ? 5 : 0;
        
        // Calculate total price for one unit
        this.pricePerUnit = parseFloat((price + borderCost + drillingCost).toFixed(2));
        
        // Calculate total price for the quantity
        this.totalPrice = parseFloat((this.pricePerUnit * this.quantity).toFixed(2));
    }
}

/**
 * Customer class
 */
class Customer {
    constructor(data) {
        this.id = data.id || generateId();
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.companyName = data.companyName || '';
        this.vatId = data.vatId || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.street = data.street || '';
        this.city = data.city || '';
        this.zipCode = data.zipCode || '';
        this.lastPurchase = data.lastPurchase || null;
        this.totalPurchases = data.totalPurchases || 0;
    }
}

/**
 * Order class
 */
class Order {
    constructor(data) {
        this.id = data.id || generateId();
        this.customerId = data.customerId;
        this.customer = data.customer;
        this.orderDate = data.orderDate || new Date().toISOString().split('T')[0];
        this.products = data.products || [];
        this.shippingMethod = data.shippingMethod || 'pickup';
        this.paymentMethod = data.paymentMethod || 'cash';
        this.status = data.status || 'placed';
        this.notes = data.notes || '';
        
        // Calculate totals
        this.calculateTotals();
    }
    
    /**
     * Calculate order totals
     */
    calculateTotals() {
        const totals = this.products.reduce((total, product) => {
            const productTotal = product.totalPrice;
            const productTotalWithoutVat = productTotal / (1 + (CONFIG.vatPercentage / 100));
            
            return {
                withoutVat: total.withoutVat + productTotalWithoutVat,
                withVat: total.withVat + productTotal
            };
        }, { withoutVat: 0, withVat: 0 });
        
        this.totalCostWithoutVat = parseFloat(totals.withoutVat.toFixed(2));
        this.totalCostWithVat = parseFloat(totals.withVat.toFixed(2));
    }
}
