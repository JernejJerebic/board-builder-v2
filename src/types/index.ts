export interface Color {
  id: number;
  title: string;
  htmlColor: string;
  imageUrl: string | null;
  priceWithVat: number;
  thickness: number;
}

export interface Product {
  id: string;
  colorId: number;
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
