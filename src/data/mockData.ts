
import { Customer, Order, Color } from '@/types';
import { fetchCustomers, fetchOrders, fetchColors } from '@/services/api';
import { getCustomerById, getColorById, getOrderById } from '@/services/localStorage';

// These arrays will be populated from localStorage
export let mockCustomers: Customer[] = [];
export let mockOrders: Order[] = [];
export let mockColors: Color[] = [];

// Initialize mock data from API (which now uses localStorage)
export const initMockData = async () => {
  try {
    mockCustomers = await fetchCustomers();
    mockOrders = await fetchOrders();
    mockColors = await fetchColors();
    console.log('Mock data initialized from localStorage');
  } catch (error) {
    console.error('Failed to initialize mock data:', error);
    
    // Fallback to empty arrays if initialization fails
    mockCustomers = [];
    mockOrders = [];
    mockColors = [];
  }
};

// Preload the data when this module is imported
initMockData();

// Helper functions for backwards compatibility - now just pass through to localStorage
export { getColorById, getCustomerById, getOrderById };
