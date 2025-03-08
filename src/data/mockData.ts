
import { Customer, Order, Color, Product } from '@/types';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'Doe Carpentry',
    vatId: 'VAT123456789',
    street: '123 Main St',
    city: 'Woodville',
    zipCode: '12345',
    lastPurchase: '2023-05-15',
    totalPurchases: 1250.50
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    street: '456 Oak Ave',
    city: 'Timbertown',
    zipCode: '54321',
    lastPurchase: '2023-06-20',
    totalPurchases: 750.25
  },
  {
    id: '3',
    firstName: 'Robert',
    lastName: 'Johnson',
    companyName: 'Johnson Furniture',
    vatId: 'VAT987654321',
    street: '789 Pine Rd',
    city: 'Forestville',
    zipCode: '67890',
    lastPurchase: '2023-07-10',
    totalPurchases: 3200.75
  }
];

export const mockColors: Color[] = [
  {
    id: '1',
    title: 'Oak Natural',
    htmlColor: '#d2b48c',
    thickness: 18,
    priceWithoutVat: 45.00,
    priceWithVat: 54.90,
    active: true
  },
  {
    id: '2',
    title: 'Walnut Dark',
    htmlColor: '#614126',
    thickness: 25,
    priceWithoutVat: 65.00,
    priceWithVat: 79.30,
    active: true
  },
  {
    id: '3',
    title: 'Pine Light',
    htmlColor: '#e8d0a9',
    thickness: 18,
    priceWithoutVat: 35.00,
    priceWithVat: 42.70,
    active: true
  },
  {
    id: '4',
    title: 'Mahogany Red',
    htmlColor: '#c04000',
    thickness: 25,
    priceWithoutVat: 75.00,
    priceWithVat: 91.50,
    active: true
  },
  {
    id: '5',
    title: 'Maple White',
    htmlColor: '#f5deb3',
    thickness: 18,
    priceWithoutVat: 50.00,
    priceWithVat: 61.00,
    active: false
  }
];

const mockProducts: Product[] = [
  {
    id: '1',
    colorId: '1',
    length: 1200,
    width: 800,
    thickness: 18,
    surfaceArea: 0.96,
    borders: {
      top: true,
      right: true,
      bottom: true,
      left: true
    },
    drilling: true,
    quantity: 2,
    pricePerUnit: 65.88,
    totalPrice: 131.76
  },
  {
    id: '2',
    colorId: '2',
    length: 1500,
    width: 600,
    thickness: 25,
    surfaceArea: 0.9,
    borders: {
      top: true,
      right: false,
      bottom: true,
      left: false
    },
    drilling: false,
    quantity: 1,
    pricePerUnit: 89.30,
    totalPrice: 89.30
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    customerId: '1',
    orderDate: '2023-05-15',
    products: [mockProducts[0]],
    totalCostWithoutVat: 108.00,
    totalCostWithVat: 131.76,
    shippingMethod: 'delivery',
    paymentMethod: 'credit_card',
    status: 'completed'
  },
  {
    id: '2',
    customerId: '2',
    orderDate: '2023-06-20',
    products: [mockProducts[1]],
    totalCostWithoutVat: 73.20,
    totalCostWithVat: 89.30,
    shippingMethod: 'pickup',
    paymentMethod: 'pickup_at_shop',
    status: 'in_progress'
  },
  {
    id: '3',
    customerId: '3',
    orderDate: '2023-07-10',
    products: [mockProducts[0], mockProducts[1]],
    totalCostWithoutVat: 181.20,
    totalCostWithVat: 221.06,
    shippingMethod: 'delivery',
    paymentMethod: 'bank_transfer',
    status: 'placed'
  }
];

export const getColorById = (id: string): Color | undefined => {
  return mockColors.find(color => color.id === id);
};

export const getCustomerById = (id: string): Customer | undefined => {
  return mockCustomers.find(customer => customer.id === id);
};

export const getOrderById = (id: string): Order | undefined => {
  return mockOrders.find(order => order.id === id);
};
