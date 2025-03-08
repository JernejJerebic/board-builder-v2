import { Customer, Order, Color, Product } from '@/types';
import { mockCustomers, mockOrders, mockColors } from '@/data/mockData';

// Customer API
export const fetchCustomers = async (): Promise<Customer[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockCustomers]), 500);
  });
};

export const createCustomer = async (customer: Partial<Omit<Customer, 'id' | 'lastPurchase' | 'totalPurchases'>>): Promise<Customer> => {
  // Simulate API call
  return new Promise((resolve) => {
    const newCustomer: Customer = {
      ...customer as any, // Cast to any to bypass the type check
      id: `${mockCustomers.length + 1}`,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      street: customer.street || '',
      city: customer.city || '',
      zipCode: customer.zipCode || '',
      totalPurchases: 0
    };
    
    mockCustomers.push(newCustomer);
    setTimeout(() => resolve(newCustomer), 500);
  });
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    const customerIndex = mockCustomers.findIndex(customer => customer.id === id);
    if (customerIndex === -1) {
      reject(new Error('Stranka ni najdena'));
      return;
    }
    
    mockCustomers[customerIndex] = {
      ...mockCustomers[customerIndex],
      ...customerData,
    };
    
    setTimeout(() => resolve(mockCustomers[customerIndex]), 500);
  });
};

// Order API
export const fetchOrders = async (): Promise<Order[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockOrders]), 500);
  });
};

export const createOrder = async (order: Omit<Order, 'id' | 'orderDate'>): Promise<Order> => {
  // Simulate API call
  return new Promise((resolve) => {
    const newOrder: Order = {
      ...order,
      id: `${mockOrders.length + 1}`,
      orderDate: new Date().toISOString().split('T')[0]
    };
    
    mockOrders.push(newOrder);
    setTimeout(() => resolve(newOrder), 500);
  });
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    const orderIndex = mockOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      reject(new Error('Naročilo ni najdeno'));
      return;
    }
    
    mockOrders[orderIndex].status = status;
    setTimeout(() => resolve(mockOrders[orderIndex]), 500);
  });
};

// Color API
export const fetchColors = async (): Promise<Color[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockColors]), 500);
  });
};

export const createColor = async (color: Partial<Omit<Color, 'id' | 'active'>>): Promise<Color> => {
  // Simulate API call
  return new Promise((resolve) => {
    const newColor: Color = {
      ...color as any, // Cast to any to bypass the type check
      id: `${mockColors.length + 1}`,
      title: color.title || '',
      thickness: color.thickness || 18,
      priceWithoutVat: color.priceWithoutVat || 0,
      priceWithVat: color.priceWithVat || 0,
      active: true
    };
    
    mockColors.push(newColor);
    setTimeout(() => resolve(newColor), 500);
  });
};

export const updateColor = async (id: string, colorData: Partial<Color>): Promise<Color> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    const colorIndex = mockColors.findIndex(color => color.id === id);
    if (colorIndex === -1) {
      reject(new Error('Barva ni najdena'));
      return;
    }
    
    mockColors[colorIndex] = {
      ...mockColors[colorIndex],
      ...colorData,
    };
    
    setTimeout(() => resolve(mockColors[colorIndex]), 500);
  });
};

export const updateColorStatus = async (id: string, active: boolean): Promise<Color> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    const colorIndex = mockColors.findIndex(color => color.id === id);
    if (colorIndex === -1) {
      reject(new Error('Barva ni najdena'));
      return;
    }
    
    mockColors[colorIndex].active = active;
    setTimeout(() => resolve(mockColors[colorIndex]), 500);
  });
};

// Email service mock
export const sendOrderEmail = async (
  type: 'new' | 'progress' | 'completed',
  order: Order,
  customerEmail: string
): Promise<{ success: boolean }> => {
  // This would actually send emails in a real implementation
  console.log(`Email poslan na ${customerEmail} - Naročilo ${order.id} - Tip: ${type}`);
  return { success: true };
};
