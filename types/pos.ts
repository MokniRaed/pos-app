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

export interface TaxSettings {
  enabled: boolean;
  rate: number;
  name: string;
  taxNumber?: string;
}

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  taxNumber?: string;
  logo?: string;
}

export interface ReceiptSettings {
  showLogo: boolean;
  header: string;
  footer: string;
  showTaxNumber: boolean;
  showWebsite: boolean;
  showBarcode: boolean;
}
