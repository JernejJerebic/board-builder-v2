import { Customer, Order, Color } from '@/types';
import * as localStorageService from './localStorage';
import { sendOrderEmail } from './emailService';
import axios from 'axios';

// Define API_URL for axios requests
const API_URL = process.env.API_URL || '';

// Customer API
export const fetchCustomers = async (): Promise<Customer[]> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Fetching customers`);
  
  try {
    const customers = localStorageService.getCustomers();
    console.log(`[${timestamp}] Retrieved ${customers.length} customers`);
    return customers;
  } catch (error) {
    console.error(`[${timestamp}] Error fetching customers:`, error);
    throw error;
  }
};

export const createCustomer = async (customer: Partial<Omit<Customer, 'id' | 'lastPurchase' | 'totalPurchases'>>): Promise<Customer> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Creating customer:`, customer);
  
  try {
    const newCustomer = localStorageService.addCustomer(customer as any);
    console.log(`[${timestamp}] Customer created with ID: ${newCustomer.id}`);
    return newCustomer;
  } catch (error) {
    console.error(`[${timestamp}] Error creating customer:`, error);
    throw error;
  }
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Updating customer ${id}:`, customerData);
  
  try {
    const updatedCustomer = localStorageService.updateCustomer(id, customerData);
    if (!updatedCustomer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    console.log(`[${timestamp}] Customer updated: ${updatedCustomer.id}`);
    return updatedCustomer;
  } catch (error) {
    console.error(`[${timestamp}] Error updating customer:`, error);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Deleting customer ${id}`);
  
  try {
    localStorageService.deleteCustomer(id);
    console.log(`[${timestamp}] Customer deleted: ${id}`);
  } catch (error) {
    console.error(`[${timestamp}] Error deleting customer:`, error);
    throw error;
  }
};

export const findCustomerByEmail = async (email: string): Promise<Customer | null> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Finding customer by email: ${email}`);
  
  try {
    const customer = localStorageService.getCustomerByEmail(email);
    console.log(`[${timestamp}] Customer lookup result:`, customer || 'Not found');
    return customer || null;
  } catch (error) {
    console.error(`[${timestamp}] Error finding customer by email:`, error);
    return null;
  }
};

// Color API
export const fetchColors = async (): Promise<Color[]> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Fetching colors`);
  
  try {
    const colors = localStorageService.getColors();
    console.log(`[${timestamp}] Retrieved ${colors.length} colors`);
    return colors;
  } catch (error) {
    console.error(`[${timestamp}] Error fetching colors:`, error);
    throw error;
  }
};

export const createColor = async (data: FormData | Partial<Omit<Color, 'id' | 'active'>>): Promise<Color> => {
  try {
    if (data instanceof FormData) {
      const response = await axios.post(`${API_URL}/colors/index.php`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await axios.post(`${API_URL}/colors/index.php`, data);
      return response.data;
    }
  } catch (error) {
    console.error("Error creating color:", error);
    // Fallback to localStorage for development
    const newColor = {
      ...data as any,
      id: String(Date.now()),
      active: true,
    };
    return localStorageService.saveColor(newColor);
  }
};

export const updateColor = async (id: string, data: FormData | Partial<Color>): Promise<Color> => {
  try {
    if (data instanceof FormData) {
      const response = await axios.post(`${API_URL}/colors/color.php?id=${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      const response = await axios.post(`${API_URL}/colors/color.php?id=${id}`, data);
      return response.data;
    }
  } catch (error) {
    console.error("Error updating color:", error);
    // Fallback to localStorage for development
    return localStorageService.saveColor({ id, ...data as any });
  }
};

export const updateColorStatus = async (id: string, active: boolean): Promise<Color> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Updating color status ${id} to ${active}`);
  
  try {
    const updatedColor = localStorageService.updateColorStatus(id, active);
    if (!updatedColor) {
      throw new Error(`Color with ID ${id} not found`);
    }
    console.log(`[${timestamp}] Color status updated: ${updatedColor.id}`);
    return updatedColor;
  } catch (error) {
    console.error(`[${timestamp}] Error updating color status:`, error);
    throw error;
  }
};

export const deleteColor = async (id: string): Promise<void> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Deleting color ${id}`);
  
  try {
    localStorageService.deleteColor(id);
    console.log(`[${timestamp}] Color deleted: ${id}`);
  } catch (error) {
    console.error(`[${timestamp}] Error deleting color:`, error);
    throw error;
  }
};

// Order API
export const fetchOrders = async (): Promise<Order[]> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Fetching orders`);
  
  try {
    const orders = localStorageService.getOrders();
    console.log(`[${timestamp}] Retrieved ${orders.length} orders`);
    return orders;
  } catch (error) {
    console.error(`[${timestamp}] Error fetching orders:`, error);
    throw error;
  }
};

export const fetchOrderById = async (id: string): Promise<Order | null> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Fetching order by ID: ${id}`);
  
  try {
    const order = localStorageService.getOrderById(id);
    console.log(`[${timestamp}] Order lookup result:`, order || 'Not found');
    return order || null;
  } catch (error) {
    console.error(`[${timestamp}] Error fetching order:`, error);
    return null;
  }
};

export const createOrder = async (order: Omit<Order, 'id' | 'orderDate'>): Promise<Order> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Creating order:`, order);
  
  try {
    const newOrder = localStorageService.addOrder(order);
    console.log(`[${timestamp}] Order created with ID: ${newOrder.id}`);
    return newOrder;
  } catch (error) {
    console.error(`[${timestamp}] Error creating order:`, error);
    throw error;
  }
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Updating order status ${id} to ${status}`);
  
  try {
    const updatedOrder = localStorageService.updateOrderStatus(id, status);
    if (!updatedOrder) {
      throw new Error(`Order with ID ${id} not found`);
    }
    console.log(`[${timestamp}] Order status updated: ${updatedOrder.id}`);
    return updatedOrder;
  } catch (error) {
    console.error(`[${timestamp}] Error updating order status:`, error);
    throw error;
  }
};

export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<Order> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Updating order ${id}`);
  
  try {
    const updatedOrder = localStorageService.updateOrder(id, orderData);
    if (!updatedOrder) {
      throw new Error(`Order with ID ${id} not found`);
    }
    console.log(`[${timestamp}] Order updated: ${updatedOrder.id}`);
    return updatedOrder;
  } catch (error) {
    console.error(`[${timestamp}] Error updating order:`, error);
    throw error;
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Deleting order ${id}`);
  
  try {
    localStorageService.deleteOrder(id);
    console.log(`[${timestamp}] Order deleted: ${id}`);
  } catch (error) {
    console.error(`[${timestamp}] Error deleting order:`, error);
    throw error;
  }
};

// Email service (now using our external service implementation directly)
export { sendOrderEmail };

// Backwards compatibility functions
export const mockCustomers: Customer[] = [];
export const mockColors: Color[] = [];
export const mockOrders: Order[] = [];

export const getColorById = (id: string): Color | undefined => {
  return localStorageService.getColorById(id);
};

export const getCustomerById = (id: string): Customer | undefined => {
  return localStorageService.getCustomerById(id);
};

export const getOrderById = (id: string): Order | undefined => {
  return localStorageService.getOrderById(id);
};
