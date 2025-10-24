export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  barcode?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: Date;
  receiptNumber: string;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile';
