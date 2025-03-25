import { Color, Customer, Order, Product, BasketItem, LogEntry } from '@/types';

// Function to simulate delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to add a log entry
export const addLog = (level: 'info' | 'warning' | 'error', message: string, details?: any): void => {
  if (typeof window === 'undefined') return;

  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    details
  };

  const logs = getLogs();
  logs.push(logEntry);
  localStorage.setItem('logs', JSON.stringify(logs));
};

// Function to retrieve logs
export const getLogs = (): LogEntry[] => {
  if (typeof window === 'undefined') return [];

  const logs = localStorage.getItem('logs');
  return logs ? JSON.parse(logs) : [];
};

// Function to clear logs
export const clearLogs = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('logs');
  }
};

// Mock data for colors
export const getMockColors = (): Color[] => {
  return [
    {
      id: '1',
      title: 'Hrast',
      htmlColor: '#d2b48c',
      thickness: 18,
      priceWithVat: 45.99,
      priceWithoutVat: 37.70,
      imageUrl: null,
      active: true
    },
    {
      id: '2',
      title: 'Oreh',
      htmlColor: '#654321',
      thickness: 18,
      priceWithVat: 52.99,
      priceWithoutVat: 43.43,
      imageUrl: null,
      active: true
    },
    {
      id: '3',
      title: 'Bela',
      htmlColor: '#ffffff',
      thickness: 18,
      priceWithVat: 39.99,
      priceWithoutVat: 32.78,
      imageUrl: null,
      active: true
    },
    {
      id: '4',
      title: 'Siva',
      htmlColor: '#808080',
      thickness: 18,
      priceWithVat: 42.99,
      priceWithoutVat: 35.24,
      imageUrl: null,
      active: true
    },
    {
      id: '5',
      title: 'Črna',
      htmlColor: '#000000',
      thickness: 18,
      priceWithVat: 44.99,
      priceWithoutVat: 36.88,
      imageUrl: null,
      active: false
    }
  ];
};

// Mock data for customers
export const getMockCustomers = (): Customer[] => {
  return [
    {
      id: 'cust1',
      firstName: 'Janez',
      lastName: 'Novak',
      email: 'janez.novak@example.com',
      phone: '041234567',
      street: 'Glavna ulica 1',
      city: 'Ljubljana',
      zipCode: '1000',
      companyName: 'ACME d.o.o.',
      vatId: 'SI12345678',
      lastPurchase: '2023-01-15',
      totalPurchases: 12
    },
    {
      id: 'cust2',
      firstName: 'Marija',
      lastName: 'Kovač',
      email: 'marija.kovac@example.com',
      phone: '031765432',
      street: 'Pot na Golovec 5',
      city: 'Maribor',
      zipCode: '2000',
      lastPurchase: '2023-02-20',
      totalPurchases: 5
    },
    {
      id: 'cust3',
      firstName: 'Peter',
      lastName: 'Zupan',
      email: 'peter.zupan@example.com',
      phone: '051112233',
      street: 'Cesta v Rožno dolino 10',
      city: 'Kranj',
      zipCode: '4000',
      companyName: 'XYZ d.o.o.',
      vatId: 'SI98765432',
      lastPurchase: '2023-03-10',
      totalPurchases: 8
    }
  ];
};

// Mock data for orders
export const getMockOrders = (): Order[] => {
  return [
    {
      id: 'order1',
      customerId: 'cust1',
      products: [
        {
          id: 'prod1',
          colorId: '1',
          length: 120,
          width: 60,
          thickness: 18,
          surfaceArea: 0.72,
          borders: { top: true, right: false, bottom: true, left: false },
          drilling: false,
          quantity: 2,
          pricePerUnit: 25.50,
          totalPrice: 51.00
        },
        {
          id: 'prod2',
          colorId: '2',
          length: 150,
          width: 70,
          thickness: 18,
          surfaceArea: 1.05,
          borders: { top: false, right: true, bottom: false, left: true },
          drilling: true,
          quantity: 1,
          pricePerUnit: 32.00,
          totalPrice: 32.00
        }
      ],
      orderDate: '2023-04-05',
      status: 'placed',
      totalCostWithoutVat: 70.00,
      totalCostWithVat: 85.40,
      paymentMethod: 'credit_card',
      shippingMethod: 'delivery'
    },
    {
      id: 'order2',
      customerId: 'cust2',
      products: [
        {
          id: 'prod3',
          colorId: '3',
          length: 100,
          width: 50,
          thickness: 18,
          surfaceArea: 0.50,
          borders: { top: true, right: true, bottom: true, left: true },
          drilling: false,
          quantity: 3,
          pricePerUnit: 18.00,
          totalPrice: 54.00
        }
      ],
      orderDate: '2023-04-10',
      status: 'in_progress',
      totalCostWithoutVat: 44.26,
      totalCostWithVat: 54.00,
      paymentMethod: 'bank_transfer',
      shippingMethod: 'pickup'
    },
    {
      id: 'order3',
      customerId: 'cust3',
      products: [
        {
          id: 'prod4',
          colorId: '4',
          length: 180,
          width: 80,
          thickness: 18,
          surfaceArea: 1.44,
          borders: { top: false, right: false, bottom: false, left: false },
          drilling: true,
          quantity: 1,
          pricePerUnit: 40.00,
          totalPrice: 40.00
        }
      ],
      orderDate: '2023-04-15',
      status: 'completed',
      totalCostWithoutVat: 32.79,
      totalCostWithVat: 40.00,
      paymentMethod: 'payment_on_delivery',
      shippingMethod: 'delivery'
    }
  ];
};

// Function to initialize mock data
export const initMockData = (): void => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('colors')) {
    localStorage.setItem('colors', JSON.stringify(getMockColors()));
  }
  
  if (!localStorage.getItem('customers')) {
    localStorage.setItem('customers', JSON.stringify(getMockCustomers()));
  }
  
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify(getMockOrders()));
  }
  
  if (!localStorage.getItem('logs')) {
    localStorage.setItem('logs', JSON.stringify([]));
  }
};

// Function to get colors from local storage
export const getColors = (): Color[] => {
  if (typeof window === 'undefined') return [];

  const colors = localStorage.getItem('colors');
  return colors ? JSON.parse(colors) : [];
};

// Function to get a color by ID from local storage
export const getColorById = (id: string): Color | undefined => {
  const colors = getColors();
  return colors.find(color => color.id === id);
};

// Add a customer to local storage
export const addCustomer = (customer: Omit<Customer, 'id' | 'lastPurchase' | 'totalPurchases'>>): Customer => {
  const id = 'cust' + Date.now().toString();
  const newCustomer: Customer = {
    ...customer,
    id,
    lastPurchase: undefined,
    totalPurchases: 0
  };
  
  const customers = getCustomers();
  customers.push(newCustomer);
  localStorage.setItem('customers', JSON.stringify(customers));
  
  return newCustomer;
};

// Update a customer in local storage
export const updateCustomer = (id: string, customerData: Partial<Customer>): Customer | null => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  const updatedCustomer: Customer = { ...customers[index], ...customerData };
  customers[index] = updatedCustomer;
  localStorage.setItem('customers', JSON.stringify(customers));
  
  return updatedCustomer;
};

// Find a customer by email
export const getCustomerByEmail = (email: string): Customer | null => {
  const customers = getCustomers();
  const customer = customers.find(c => c.email === email);
  return customer || null;
};

// Update color status
export const updateColorStatus = (id: string, active: boolean): Color | null => {
  const colors = getColors();
  const index = colors.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  const updatedColor: Color = { ...colors[index], active };
  colors[index] = updatedColor;
  localStorage.setItem('colors', JSON.stringify(colors));
  
  return updatedColor;
};

// Add an order to local storage
export const addOrder = (orderData: Omit<Order, 'id' | 'orderDate'>): Order => {
  const id = 'order' + Date.now().toString();
  const newOrder: Order = {
    ...orderData,
    id,
    orderDate: new Date().toISOString()
  };
  
  const orders = getOrders();
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  return newOrder;
};

// Update an order status
export const updateOrderStatus = (id: string, status: Order['status']): Order | null => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  
  if (index === -1) return null;
  
  const updatedOrder: Order = { ...orders[index], status };
  orders[index] = updatedOrder;
  localStorage.setItem('orders', JSON.stringify(orders));
  
  return updatedOrder;
};

// Update an order
export const updateOrder = (id: string, orderData: Partial<Order>): Order | null => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  
  if (index === -1) return null;
  
  const updatedOrder: Order = { ...orders[index], ...orderData };
  orders[index] = updatedOrder;
  localStorage.setItem('orders', JSON.stringify(orders));
  
  return updatedOrder;
};

// Function to save a color to local storage
export const saveColor = (color: Partial<Color>) => {
  if (typeof window === 'undefined') return null;
  
  const colors = getColors();
  let updatedColor: Color;
  
  if (color.id && color.id !== '0') {
    // Update existing color
    const index = colors.findIndex(c => c.id === color.id);
    
    if (index === -1) return null;
    
    updatedColor = {
      ...colors[index],
      ...color,
      priceWithoutVat: color.priceWithoutVat || colors[index].priceWithoutVat
    };
    
    colors[index] = updatedColor;
  } else {
    // Create new color
    updatedColor = {
      id: String(Date.now()),
      title: color.title || 'Unnamed',
      htmlColor: color.htmlColor || '#cccccc',
      thickness: color.thickness || 18,
      priceWithVat: color.priceWithVat || 0,
      priceWithoutVat: color.priceWithoutVat || 0,
      imageUrl: color.imageUrl || null,
      active: color.active !== undefined ? color.active : true
    };
    
    colors.push(updatedColor);
  }
  
  localStorage.setItem('colors', JSON.stringify(colors));
  return updatedColor;
};

// Function to delete a color from local storage
export const deleteColor = (id: string) => {
  if (typeof window === 'undefined') return;

  const colors = getColors();
  const updatedColors = colors.filter(color => color.id !== id);
  localStorage.setItem('colors', JSON.stringify(updatedColors));
};

// Function to get customers from local storage
export const getCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return [];

  const customers = localStorage.getItem('customers');
  return customers ? JSON.parse(customers) : [];
};

// Function to get a customer by ID from local storage
export const getCustomerById = (id: string): Customer | undefined => {
  const customers = getCustomers();
  return customers.find(customer => customer.id === id);
};

// Function to save a customer to local storage
export const saveCustomer = (customer: Customer) => {
  if (typeof window === 'undefined') return;

  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customer.id);

  if (index !== -1) {
    customers[index] = customer;
  } else {
    customers.push(customer);
  }

  localStorage.setItem('customers', JSON.stringify(customers));
};

// Function to delete a customer from local storage
export const deleteCustomer = (id: string) => {
  if (typeof window === 'undefined') return;

  const customers = getCustomers();
  const updatedCustomers = customers.filter(customer => customer.id !== id);
  localStorage.setItem('customers', JSON.stringify(updatedCustomers));
};

// Function to get orders from local storage
export const getOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];

  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
};

// Function to get an order by ID from local storage
export const getOrderById = (id: string): Order | undefined => {
  const orders = getOrders();
  return orders.find(order => order.id === id);
};

// Function to save an order to local storage
export const saveOrder = (order: Order) => {
  if (typeof window === 'undefined') return;

  const orders = getOrders();
  const index = orders.findIndex(o => o.id === order.id);

  if (index !== -1) {
    orders[index] = order;
  } else {
    orders.push(order);
  }

  localStorage.setItem('orders', JSON.stringify(orders));
};

// Function to delete an order from local storage
export const deleteOrder = (id: string) => {
  if (typeof window === 'undefined') return;

  const orders = getOrders();
  const updatedOrders = orders.filter(order => order.id !== id);
  localStorage.setItem('orders', JSON.stringify(updatedOrders));
};
