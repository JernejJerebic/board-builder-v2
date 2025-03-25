
export interface Color {
  id: string;
  title: string;
  htmlColor: string;
  imageUrl: string | null;
  priceWithVat: number;
  thickness: number;
  active: boolean;
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
  customImage?: File | null;
}

export interface BasketItem extends Product {
  colorTitle?: string;
  colorHtml?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zipCode: string;
  lastPurchase?: string;
  totalPurchases?: number;
}

export interface Order {
  id: string;
  customerId: string;
  products: Product[];
  orderDate: string;
  status: 'placed' | 'in_progress' | 'completed';
  totalCostWithoutVat: number;
  totalCostWithVat: number;
  paymentMethod: string;
  shippingMethod: string;
}
