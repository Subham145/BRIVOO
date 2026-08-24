export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  gender: string;
  price: number;
  originalPrice: number;
  tag?: string; // NEW, BESTSELLER, SALE
  image: string;
  colors: ProductColor[];
  sizes: string[];
  stock: number;
  description: string;
  specs: string;
  inStock: boolean;
  featured: boolean;
  reviews?: Review[];
}

export interface CartItem {
  id: string;
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  active: boolean;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface SiteSettings {
  announcement: string;
  freeShippingThreshold: number;
  heroTitle: string;
  heroSubtext: string;
  heroImage: string;
}
