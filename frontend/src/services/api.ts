import { Product, Category, Coupon, Order, SiteSettings, User } from '../types';

const API_BASE = 'http://localhost:5005/api';

export const api = {
  // Auth API
  async login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async register(name: string, email: string, password: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return res.json();
  },

  async googleLogin(name?: string, email?: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || 'Google User', email: email || 'google_user@gmail.com' })
    });
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message?: string; otp?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword })
    });
    return res.json();
  },

  // Products
  async getProducts(params?: Record<string, string>): Promise<{ success: boolean; data: Product[] }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${API_BASE}/products${query}`);
    return res.json();
  },

  async getProduct(id: string): Promise<{ success: boolean; data: Product }> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return res.json();
  },

  async createProduct(product: Partial<Product>): Promise<{ success: boolean; data: Product; message?: string }> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean; data: Product }> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async addReview(id: string, review: { userName: string; rating: number; comment: string }): Promise<{ success: boolean; data: Product }> {
    const res = await fetch(`${API_BASE}/products/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    return res.json();
  },

  // Categories
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },

  async createCategory(cat: { name: string; description?: string }): Promise<{ success: boolean; data: Category }> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    return res.json();
  },

  async deleteCategory(id: string): Promise<{ success: boolean; data: Category }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Coupons
  async getCoupons(): Promise<{ success: boolean; data: Coupon[] }> {
    const res = await fetch(`${API_BASE}/coupons`);
    return res.json();
  },

  async validateCoupon(code: string, cartSubtotal: number): Promise<{ success: boolean; coupon?: Coupon; discount?: number; message?: string }> {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartSubtotal })
    });
    return res.json();
  },

  async createCoupon(coupon: Partial<Coupon>): Promise<{ success: boolean; data: Coupon }> {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon)
    });
    return res.json();
  },

  async deleteCoupon(id: string): Promise<{ success: boolean; data: Coupon }> {
    const res = await fetch(`${API_BASE}/coupons/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Orders
  async getOrders(): Promise<{ success: boolean; data: Order[] }> {
    const res = await fetch(`${API_BASE}/orders`);
    return res.json();
  },

  async createOrder(order: any): Promise<{ success: boolean; data: Order; message?: string }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return res.json();
  },

  async updateOrderStatus(id: string, status: string): Promise<{ success: boolean; data: Order }> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Settings & Analytics
  async getSettings(): Promise<{ success: boolean; data: SiteSettings }> {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; data: SiteSettings }> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  async getAnalytics(): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  }
};
