
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
}

export interface Order {
  id: string;
  customerId: string;
  orderDate: string;
  products: Product[];
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  totalCostWithoutVat: number;
  totalCostWithVat: number;
  shippingMethod: 'pickup' | 'delivery';
  notes?: string;
  paymentMethod?: 'card' | 'bank_transfer' | 'cash';
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

export interface BasketItem extends Omit<Product, 'id'> {
  id?: string;
}
