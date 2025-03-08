
import { Customer, Order, Color, Product } from '@/types';

// API Base URL - Updated for cPanel deployment
const API_BASE_URL = '/aplikacija/api';

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Customer API
export const fetchCustomers = async (): Promise<Customer[]> => {
  return apiRequest<Customer[]>('customers');
};

export const createCustomer = async (customer: Partial<Omit<Customer, 'id' | 'lastPurchase' | 'totalPurchases'>>): Promise<Customer> => {
  return apiRequest<Customer>('customers', 'POST', customer);
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
  return apiRequest<Customer>(`customers/${id}`, 'PUT', customerData);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  return apiRequest<void>(`customers/${id}`, 'DELETE');
};

// Find customer by email
export const findCustomerByEmail = async (email: string): Promise<Customer | null> => {
  try {
    return await apiRequest<Customer>(`customers/email/${encodeURIComponent(email)}`);
  } catch (error) {
    return null;
  }
};

// Color API
export const fetchColors = async (): Promise<Color[]> => {
  return apiRequest<Color[]>('colors');
};

export const createColor = async (color: Partial<Omit<Color, 'id' | 'active'>>): Promise<Color> => {
  return apiRequest<Color>('colors', 'POST', color);
};

export const updateColor = async (id: string, colorData: Partial<Color>): Promise<Color> => {
  return apiRequest<Color>(`colors/${id}`, 'PUT', colorData);
};

export const updateColorStatus = async (id: string, active: boolean): Promise<Color> => {
  return apiRequest<Color>(`colors/${id}/status`, 'PUT', { active });
};

export const deleteColor = async (id: string): Promise<void> => {
  return apiRequest<void>(`colors/${id}`, 'DELETE');
};

// Order API
export const fetchOrders = async (): Promise<Order[]> => {
  return apiRequest<Order[]>('orders');
};

export const fetchOrderById = async (id: string): Promise<Order | null> => {
  try {
    return await apiRequest<Order>(`orders/${id}`);
  } catch (error) {
    return null;
  }
};

export const createOrder = async (order: Omit<Order, 'id' | 'orderDate'>): Promise<Order> => {
  return apiRequest<Order>('orders', 'POST', order);
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order> => {
  return apiRequest<Order>(`orders/${id}/status`, 'PUT', { status });
};

export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<Order> => {
  return apiRequest<Order>(`orders/${id}`, 'PUT', orderData);
};

export const deleteOrder = async (id: string): Promise<void> => {
  return apiRequest<void>(`orders/${id}`, 'DELETE');
};

// Email service
export const sendOrderEmail = async (
  type: 'new' | 'progress' | 'completed',
  order: Order,
  customerEmail: string
): Promise<{ success: boolean; message?: string }> => {
  return apiRequest<{ success: boolean; message?: string }>('email/order', 'POST', {
    type,
    orderId: order.id,
    email: customerEmail
  });
};

// Backwards compatibility for the mock data functions
// These functions can be removed once the app is fully migrated to the API
export const mockCustomers: Customer[] = [];
export const mockColors: Color[] = [];
export const mockOrders: Order[] = [];

export const getColorById = (id: string): Color | undefined => {
  return mockColors.find(color => color.id === id);
};

export const getCustomerById = (id: string): Customer | undefined => {
  return mockCustomers.find(customer => customer.id === id);
};

export const getOrderById = (id: string): Order | undefined => {
  return mockOrders.find(order => order.id === id);
};
