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
    // Create new customer
    const newCustomer: Customer = {
      id: `${mockCustomers.length + 1}`,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      companyName: customer.companyName,
      vatId: customer.vatId,
      email: customer.email,
      phone: customer.phone,
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

export const deleteCustomer = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const customerIndex = mockCustomers.findIndex(customer => customer.id === id);
    if (customerIndex === -1) {
      reject(new Error('Stranka ni najdena'));
      return;
    }
    
    mockCustomers.splice(customerIndex, 1);
    setTimeout(() => resolve(), 500);
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
  // Simulate API call with proper validation and error handling
  return new Promise((resolve, reject) => {
    try {
      // Validate required fields
      if (!order.customerId) {
        reject(new Error('Customer ID is required'));
        return;
      }
      
      if (!order.products || order.products.length === 0) {
        reject(new Error('Order must have at least one product'));
        return;
      }
      
      const newOrder: Order = {
        ...order,
        id: `${Date.now()}`, // More unique ID generation
        orderDate: new Date().toISOString().split('T')[0]
      };
      
      // Insert into mock database
      mockOrders.unshift(newOrder); // Add to beginning of array for better visibility
      
      console.log('Order created successfully:', newOrder);
      setTimeout(() => resolve(newOrder), 500);
    } catch (error) {
      console.error('Error creating order:', error);
      reject(error);
    }
  });
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order> => {
  // Simulate API call with proper validation and error handling
  return new Promise((resolve, reject) => {
    try {
      const orderIndex = mockOrders.findIndex(order => order.id === id);
      if (orderIndex === -1) {
        reject(new Error('Naročilo ni najdeno'));
        return;
      }
      
      // Update order status
      mockOrders[orderIndex].status = status;
      console.log(`Order ${id} status updated to: ${status}`);
      
      setTimeout(() => resolve(mockOrders[orderIndex]), 500);
    } catch (error) {
      console.error('Error updating order status:', error);
      reject(error);
    }
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
      id: `${mockColors.length + 1}`,
      title: color.title || '',
      htmlColor: color.htmlColor || '#d2b48c',
      thickness: color.thickness || 18,
      priceWithoutVat: color.priceWithoutVat || 0,
      priceWithVat: color.priceWithVat || 0,
      imageUrl: color.imageUrl,
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

export const deleteColor = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const colorIndex = mockColors.findIndex(color => color.id === id);
    if (colorIndex === -1) {
      reject(new Error('Barva ni najdena'));
      return;
    }
    
    mockColors.splice(colorIndex, 1);
    setTimeout(() => resolve(), 500);
  });
};

// Email service mock with enhanced logging and return values
export const sendOrderEmail = async (
  type: 'new' | 'progress' | 'completed',
  order: Order,
  customerEmail: string
): Promise<{ success: boolean; message?: string }> => {
  return new Promise((resolve) => {
    try {
      // Enhanced logging for email sending
      console.log('---- SENDING EMAIL ----');
      console.log(`To: ${customerEmail}`);
      console.log(`Subject: Naročilo #${order.id} - ${type === 'new' ? 'Novo naročilo' : type === 'progress' ? 'Naročilo v obdelavi' : 'Naročilo zaključeno'}`);
      
      let emailBody = '';
      
      // Construct appropriate email body based on type
      if (type === 'new') {
        emailBody = `Spoštovani,\n\nZahvaljujemo se vam za vaše naročilo (#${order.id}). V najkrajšem možnem času bomo začeli z obdelavo vašega naročila.\n\nLep pozdrav`;
      } else if (type === 'progress') {
        emailBody = `Spoštovani,\n\nVaše naročilo (#${order.id}) je trenutno v obdelavi. Obvestili vas bomo, ko bo pripravljeno za prevzem ali dostavo.\n\nLep pozdrav`;
      } else if (type === 'completed') {
        emailBody = `Spoštovani,\n\nVaše naročilo (#${order.id}) je zaključeno in pripravljeno ${order.shippingMethod === 'pickup' ? 'za prevzem' : 'za dostavo'}.\n\nLep pozdrav`;
      }
      
      console.log('Email body:');
      console.log(emailBody);
      console.log('---- END EMAIL ----');
      
      // In a real implementation, this would connect to an email service
      setTimeout(() => {
        resolve({ 
          success: true,
          message: `Email successfully sent to ${customerEmail}`
        });
      }, 800);
    } catch (error) {
      console.error('Error sending email:', error);
      resolve({ 
        success: false,
        message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
};
