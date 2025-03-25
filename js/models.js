
/**
 * Data models for LCC Naročilo razreza
 */

/**
 * Color data
 */
class Color {
    constructor(data = {}) {
        this.id = data.id || generateId();
        this.title = data.title || '';
        this.htmlColor = data.htmlColor || null;
        this.imageUrl = data.imageUrl || null;
        this.thickness = data.thickness || 18;
        this.priceWithoutVat = data.priceWithoutVat || 0;
        this.priceWithVat = data.priceWithVat || 0;
        this.active = data.active !== undefined ? data.active : true;
    }
}

/**
 * Product/Board data
 */
class Product {
    constructor(data = {}) {
        this.id = data.id || generateId();
        this.colorId = data.colorId || null;
        this.color = data.color || null;
        this.length = data.length || 800;
        this.width = data.width || 600;
        this.thickness = data.thickness || 18;
        this.surfaceArea = this.calculateSurfaceArea();
        this.borders = {
            top: data.borders?.top || false,
            right: data.borders?.right || false,
            bottom: data.borders?.bottom || false,
            left: data.borders?.left || false
        };
        this.drilling = data.drilling || false;
        this.quantity = data.quantity || 1;
        this.pricePerUnit = this.calculatePricePerUnit();
        this.totalPrice = this.calculateTotalPrice();
        this.basketId = data.basketId || generateId();
    }
    
    calculateSurfaceArea() {
        return (this.length * this.width) / 1000000; // Convert to square meters
    }
    
    calculatePricePerUnit() {
        if (!this.color) return 0;
        
        // Base price
        let price = this.surfaceArea * this.color.priceWithVat;
        
        // Add price for borders
        const borderCount = Object.values(this.borders).filter(Boolean).length;
        const borderPrice = 5; // Price per border in EUR
        price += borderCount * borderPrice;
        
        // Add price for drilling
        if (this.drilling) {
            price += 3; // Price for drilling in EUR
        }
        
        return price;
    }
    
    calculateTotalPrice() {
        return this.pricePerUnit * this.quantity;
    }
    
    updateCalculations() {
        this.surfaceArea = this.calculateSurfaceArea();
        this.pricePerUnit = this.calculatePricePerUnit();
        this.totalPrice = this.calculateTotalPrice();
        return this;
    }
}

/**
 * Customer data
 */
class Customer {
    constructor(data = {}) {
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
 * Order data
 */
class Order {
    constructor(data = {}) {
        this.id = data.id || generateId();
        this.customerId = data.customerId || null;
        this.customer = data.customer || null;
        this.orderDate = data.orderDate || new Date().toISOString();
        this.products = data.products || [];
        this.totalCostWithoutVat = this.calculateTotalWithoutVat();
        this.totalCostWithVat = this.calculateTotalWithVat();
        this.shippingMethod = data.shippingMethod || 'pickup';
        this.paymentMethod = data.paymentMethod || 'pickup_at_shop';
        this.status = data.status || 'placed';
        this.transactionId = data.transactionId || null;
        this.notes = data.notes || '';
    }
    
    calculateTotalWithoutVat() {
        return this.products.reduce((total, product) => {
            return total + (product.pricePerUnit / (1 + CONFIG.vatPercentage / 100)) * product.quantity;
        }, 0);
    }
    
    calculateTotalWithVat() {
        return this.products.reduce((total, product) => {
            return total + product.totalPrice;
        }, 0);
    }
    
    updateCalculations() {
        this.totalCostWithoutVat = this.calculateTotalWithoutVat();
        this.totalCostWithVat = this.calculateTotalWithVat();
        return this;
    }
}

/**
 * Mock data for development
 */
const MOCK_DATA = {
    colors: [
        new Color({
            id: '1',
            title: 'Hrast naravni',
            htmlColor: '#d2b48c',
            thickness: 18,
            priceWithoutVat: 45,
            priceWithVat: 54.9,
            active: true
        }),
        new Color({
            id: '2',
            title: 'Bela',
            htmlColor: '#ffffff',
            thickness: 18,
            priceWithoutVat: 35,
            priceWithVat: 42.7,
            active: true
        }),
        new Color({
            id: '3',
            title: 'Črna',
            htmlColor: '#1a1a1a',
            thickness: 18,
            priceWithoutVat: 40,
            priceWithVat: 48.8,
            active: true
        }),
        new Color({
            id: '4',
            title: 'Oreh',
            htmlColor: '#5e3b24',
            thickness: 18,
            priceWithoutVat: 50,
            priceWithVat: 61,
            active: true
        }),
        new Color({
            id: '5',
            title: 'Siva',
            htmlColor: '#808080',
            thickness: 18,
            priceWithoutVat: 38,
            priceWithVat: 46.36,
            active: true
        })
    ],
    
    customers: [
        new Customer({
            id: '1',
            firstName: 'Janez',
            lastName: 'Novak',
            email: 'janez.novak@example.com',
            phone: '031 123 456',
            street: 'Slovenska cesta 1',
            city: 'Ljubljana',
            zipCode: '1000',
            lastPurchase: '2023-10-15',
            totalPurchases: 3
        })
    ],
    
    orders: [
        new Order({
            id: '1',
            customerId: '1',
            orderDate: '2023-10-15',
            products: [
                new Product({
                    colorId: '1',
                    color: MOCK_DATA?.colors?.[0],
                    length: 1200,
                    width: 800,
                    thickness: 18,
                    borders: { top: true, right: true, bottom: true, left: true },
                    drilling: true,
                    quantity: 2
                })
            ],
            shippingMethod: 'pickup',
            paymentMethod: 'pickup_at_shop',
            status: 'completed'
        })
    ]
};

/**
 * Data service for API calls or mock data
 */
const DataService = {
    /**
     * Get colors
     * 
     * @returns {Promise} Promise that resolves to colors array
     */
    getColors: async function() {
        if (CONFIG.useMockData) {
            return Promise.resolve([...MOCK_DATA.colors]);
        }
        
        return fetchApi(`${CONFIG.apiUrl}/colors`);
    },
    
    /**
     * Get customers
     * 
     * @returns {Promise} Promise that resolves to customers array
     */
    getCustomers: async function() {
        if (CONFIG.useMockData) {
            return Promise.resolve([...MOCK_DATA.customers]);
        }
        
        return fetchApi(`${CONFIG.apiUrl}/customers`);
    },
    
    /**
     * Get orders
     * 
     * @returns {Promise} Promise that resolves to orders array
     */
    getOrders: async function() {
        if (CONFIG.useMockData) {
            return Promise.resolve([...MOCK_DATA.orders]);
        }
        
        return fetchApi(`${CONFIG.apiUrl}/orders`);
    },
    
    /**
     * Create a new order
     * 
     * @param {Object} orderData - Order data
     * @returns {Promise} Promise that resolves to the created order
     */
    createOrder: async function(orderData) {
        if (CONFIG.useMockData) {
            const order = new Order({
                ...orderData,
                id: generateId(),
                orderDate: new Date().toISOString(),
                status: 'placed'
            });
            
            MOCK_DATA.orders.push(order);
            return Promise.resolve(order);
        }
        
        return fetchApi(`${CONFIG.apiUrl}/orders`, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }
};
