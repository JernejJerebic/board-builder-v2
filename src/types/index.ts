
export interface Color {
  id: string;
  name: string;
  htmlColor: string;
  active: boolean;
  imageUrl?: string;
  darkShadow?: string; // Added for dark mode board visualization
  
  // Properties used in the application but missing from the type
  title: string;
  thickness: number;
  priceWithoutVat: number;
  priceWithVat: number;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  vatId?: string;
  email?: string | null;
  phone?: string | null;
  street: string;
  city: string;
  zipCode: string;
  lastPurchase?: string;
  totalPurchases: number;
}

export interface Product {
  id: string;
  colorId: string;
  length: number;
  width: number;
  thickness: number;
  surfaceArea: number;
  borders: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  drilling: boolean;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  color?: Color; // Add color property as it's used in the code
}

export interface Order {
  id: string;
  customerId: string;
  orderDate: string;
  products: Product[];
  status: 'new' | 'processing' | 'completed' | 'cancelled' | 'placed' | 'in_progress'; // Add additional status values used in the code
  totalCostWithoutVat: number;
  totalCostWithVat: number;
  shippingMethod: 'pickup' | 'delivery';
  notes?: string;
  paymentMethod?: 'card' | 'bank_transfer' | 'cash' | 'payment_on_delivery' | 'pickup_at_shop'; // Add payment methods used in the code
  paymentStatus?: 'pending' | 'paid' | 'failed';
  transactionId?: string; // Add transaction ID as it's used in ThankYouPage.tsx
}

export interface BasketItem extends Omit<Product, 'id'> {
  id?: string;
  basketId: string; // Add basketId property as it's used in BasketContext and Basket components
  color?: Color; // Add color property as it's used in Basket component
}
