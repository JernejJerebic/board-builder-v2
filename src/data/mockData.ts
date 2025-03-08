
import { Customer, Order, Color, Product } from '@/types';
import { fetchCustomers, fetchOrders, fetchColors } from '@/services/api';

// These arrays will be populated from the API when needed
export let mockCustomers: Customer[] = [];
export let mockOrders: Order[] = [];
export let mockColors: Color[] = [];

// Initialize mock data from API
export const initMockData = async () => {
  try {
    mockCustomers = await fetchCustomers();
    mockOrders = await fetchOrders();
    mockColors = await fetchColors();
    console.log('Mock data initialized from API');
  } catch (error) {
    console.error('Failed to initialize mock data from API:', error);
    
    // Fallback to empty arrays if API fails
    mockCustomers = [];
    mockOrders = [];
    mockColors = [];
  }
};

// Preload the data when this module is imported
initMockData();

// Helper functions for backwards compatibility
export const getColorById = (id: string): Color | undefined => {
  return mockColors.find(color => color.id === id);
};

export const getCustomerById = (id: string): Customer | undefined => {
  return mockCustomers.find(customer => customer.id === id);
};

export const getOrderById = (id: string): Order | undefined => {
  return mockOrders.find(order => order.id === id);
};
