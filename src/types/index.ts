
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  vatId?: string;
  email?: string;
  phone?: string;
  street: string;
  city: string;
  zipCode: string;
  lastPurchase?: string;
  totalPurchases: number;
}

export interface Order {
  id: string;
  customerId: string;
  orderDate: string;
  products: Product[];
  totalCostWithoutVat: number;
  totalCostWithVat: number;
  shippingMethod: 'pickup' | 'delivery';
  paymentMethod: 'credit_card' | 'payment_on_delivery' | 'pickup_at_shop' | 'bank_transfer';
  status: 'placed' | 'in_progress' | 'completed';
  transactionId?: string;
}

export interface Color {
  id: string;
  title: string;
  htmlColor?: string;
  imageUrl?: string;
  thickness: number;
  priceWithoutVat: number;
  priceWithVat: number;
  active: boolean;
}

export interface Product {
  id: string;
  colorId: string;
  color?: Color;
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

export interface BasketItem extends Product {
  basketId: string;
}
