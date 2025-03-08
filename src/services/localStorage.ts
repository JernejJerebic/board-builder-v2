import { Customer, Order, Color, Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Storage keys
const STORAGE_KEYS = {
  CUSTOMERS: 'woodboard_customers',
  ORDERS: 'woodboard_orders',
  COLORS: 'woodboard_colors',
  LOGS: 'woodboard_logs',
};

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: any;
}

// Initialize storage with default data if empty
export const initializeStorage = () => {
  // Check if storage is already initialized
  if (!localStorage.getItem(STORAGE_KEYS.COLORS)) {
    // Add default colors
    const defaultColors: Color[] = [
      {
        id: uuidv4(),
        title: 'Oak Natural',
        htmlColor: '#d2b48c',
        thickness: 18,
        priceWithoutVat: 45.00,
        priceWithVat: 54.90,
        active: true,
      },
      {
        id: uuidv4(),
        title: 'Walnut Dark',
        htmlColor: '#614126',
        thickness: 25,
        priceWithoutVat: 65.00,
        priceWithVat: 79.30,
        active: true,
      },
      {
        id: uuidv4(),
        title: 'Pine Light',
        htmlColor: '#e8d0a9',
        thickness: 18,
        priceWithoutVat: 35.00,
        priceWithVat: 42.70,
        active: true,
      },
      {
        id: uuidv4(),
        title: 'Mahogany Red',
        htmlColor: '#c04000',
        thickness: 25,
        priceWithoutVat: 75.00,
        priceWithVat: 91.50,
        active: true,
      },
      {
        id: uuidv4(),
        title: 'Maple White',
        htmlColor: '#f5deb3',
        thickness: 18,
        priceWithoutVat: 50.00,
        priceWithVat: 61.00,
        active: false,
      },
    ];
    
    setColors(defaultColors);
    
    // Initialize empty customers and orders
    setCustomers([]);
    setOrders([]);
  }
};

// Logging functions
export const addLog = (level: 'info' | 'warning' | 'error', message: string, details?: any) => {
  const logs = getLogs();
  const newLog: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    details,
  };
  
  logs.unshift(newLog); // Add to beginning
  
  // Keep only the most recent 1000 logs
  const trimmedLogs = logs.slice(0, 1000);
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(trimmedLogs));
  
  // Also log to console for debugging
  console[level](message, details || '');
  
  return newLog;
};

export const getLogs = (): LogEntry[] => {
  const logsJson = localStorage.getItem(STORAGE_KEYS.LOGS);
  return logsJson ? JSON.parse(logsJson) : [];
};

export const clearLogs = () => {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
};

// Customer functions
export const getCustomers = (): Customer[] => {
  const customersJson = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  return customersJson ? JSON.parse(customersJson) : [];
};

export const setCustomers = (customers: Customer[]) => {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const getCustomerById = (id: string): Customer | undefined => {
  const customers = getCustomers();
  return customers.find(customer => customer.id === id);
};

export const getCustomerByEmail = (email: string): Customer | undefined => {
  const customers = getCustomers();
  return customers.find(customer => customer.email === email);
};

export const addCustomer = (customer: Omit<Customer, 'id' | 'lastPurchase' | 'totalPurchases'>): Customer => {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: uuidv4(),
    totalPurchases: 0,
  };
  
  customers.push(newCustomer);
  setCustomers(customers);
  addLog('info', `Customer added: ${newCustomer.firstName} ${newCustomer.lastName}`);
  return newCustomer;
};

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | undefined => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  
  if (index === -1) {
    addLog('error', `Customer not found for update: ${id}`);
    return undefined;
  }
  
  const updatedCustomer = { ...customers[index], ...updates };
  customers[index] = updatedCustomer;
  setCustomers(customers);
  addLog('info', `Customer updated: ${updatedCustomer.firstName} ${updatedCustomer.lastName}`);
  return updatedCustomer;
};

export const deleteCustomer = (id: string): boolean => {
  const customers = getCustomers();
  const initialLength = customers.length;
  
  const filteredCustomers = customers.filter(c => c.id !== id);
  
  if (filteredCustomers.length === initialLength) {
    addLog('error', `Customer not found for deletion: ${id}`);
    return false;
  }
  
  setCustomers(filteredCustomers);
  addLog('info', `Customer deleted: ${id}`);
  return true;
};

// Color functions
export const getColors = (): Color[] => {
  const colorsJson = localStorage.getItem(STORAGE_KEYS.COLORS);
  return colorsJson ? JSON.parse(colorsJson) : [];
};

export const setColors = (colors: Color[]) => {
  localStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(colors));
};

export const getColorById = (id: string): Color | undefined => {
  const colors = getColors();
  return colors.find(color => color.id === id);
};

export const addColor = (color: Omit<Color, 'id'>): Color => {
  const colors = getColors();
  const newColor: Color = {
    ...color,
    id: uuidv4(),
  };
  
  colors.push(newColor);
  setColors(colors);
  addLog('info', `Color added: ${newColor.title}`);
  return newColor;
};

export const updateColor = (id: string, updates: Partial<Color>): Color | undefined => {
  const colors = getColors();
  const index = colors.findIndex(c => c.id === id);
  
  if (index === -1) {
    addLog('error', `Color not found for update: ${id}`);
    return undefined;
  }
  
  const updatedColor = { ...colors[index], ...updates };
  colors[index] = updatedColor;
  setColors(colors);
  addLog('info', `Color updated: ${updatedColor.title}`);
  return updatedColor;
};

export const updateColorStatus = (id: string, active: boolean): Color | undefined => {
  return updateColor(id, { active });
};

export const deleteColor = (id: string): boolean => {
  const colors = getColors();
  const initialLength = colors.length;
  
  const filteredColors = colors.filter(c => c.id !== id);
  
  if (filteredColors.length === initialLength) {
    addLog('error', `Color not found for deletion: ${id}`);
    return false;
  }
  
  setColors(filteredColors);
  addLog('info', `Color deleted: ${id}`);
  return true;
};

// Order functions
export const getOrders = (): Order[] => {
  const ordersJson = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return ordersJson ? JSON.parse(ordersJson) : [];
};

export const setOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const getOrderById = (id: string): Order | undefined => {
  const orders = getOrders();
  return orders.find(order => order.id === id);
};

export const addOrder = (orderData: Omit<Order, 'id' | 'orderDate'>): Order => {
  const orders = getOrders();
  const customers = getCustomers();
  
  const newOrder: Order = {
    ...orderData,
    id: uuidv4(),
    orderDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  };
  
  orders.push(newOrder);
  setOrders(orders);
  
  // Update customer's lastPurchase and totalPurchases
  const customerIndex = customers.findIndex(c => c.id === orderData.customerId);
  if (customerIndex !== -1) {
    customers[customerIndex] = {
      ...customers[customerIndex],
      lastPurchase: newOrder.orderDate,
      totalPurchases: (customers[customerIndex].totalPurchases || 0) + orderData.totalCostWithVat,
    };
    setCustomers(customers);
  }
  
  addLog('info', `Order added: ${newOrder.id} for customer ${orderData.customerId}`);
  return newOrder;
};

export const updateOrder = (id: string, updates: Partial<Order>): Order | undefined => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  
  if (index === -1) {
    addLog('error', `Order not found for update: ${id}`);
    return undefined;
  }
  
  const updatedOrder = { ...orders[index], ...updates };
  orders[index] = updatedOrder;
  setOrders(orders);
  addLog('info', `Order updated: ${updatedOrder.id}`);
  return updatedOrder;
};

export const updateOrderStatus = (id: string, status: Order['status']): Order | undefined => {
  return updateOrder(id, { status });
};

export const deleteOrder = (id: string): boolean => {
  const orders = getOrders();
  const initialLength = orders.length;
  
  const filteredOrders = orders.filter(o => o.id !== id);
  
  if (filteredOrders.length === initialLength) {
    addLog('error', `Order not found for deletion: ${id}`);
    return false;
  }
  
  setOrders(filteredOrders);
  addLog('info', `Order deleted: ${id}`);
  return true;
};

// Email simulation
export const simulateSendEmail = (
  type: 'new' | 'progress' | 'completed',
  order: Order,
  customerEmail: string
): Promise<{ success: boolean; message?: string }> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      addLog('info', `Email simulation: Sent ${type} order email to ${customerEmail} for order ${order.id}`);
      resolve({ success: true, message: `Email sent to ${customerEmail}` });
    }, 500);
  });
};

// Initialize storage on import
initializeStorage();
