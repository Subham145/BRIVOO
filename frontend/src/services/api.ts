import { Product, Category, Coupon, Offer, Order, SiteSettings, User, Vendor, VendorInwardRecord, VendorPayoutRecord, InfluencerCollab, MarketingExpense, MarketingSummary, AIStylistRecommendation, AITryOnResult, ShiprocketStatus, ShiprocketServiceabilityResponse } from '../types';

const API_BASE = '/api';

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('brivoo_token') : null;
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
    if (typeof window !== 'undefined') {
      const currentToken = localStorage.getItem('brivoo_token');
      if (currentToken) {
        localStorage.removeItem('brivoo_token');
        localStorage.removeItem('brivoo_user');
        window.dispatchEvent(new Event('brivoo_auth_cleared'));
      }
    }
  }
  return res;
}

export const api = {
  // Auth API
  async login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    const res = await authFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async register(name: string, email: string, password: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    const res = await authFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return res.json();
  },

  async googleLogin(idTokenOrCredential?: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    const res = await authFetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      body: JSON.stringify({ 
        idToken: idTokenOrCredential,
        credential: idTokenOrCredential
      })
    });
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    const res = await authFetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
    const res = await authFetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword })
    });
    return res.json();
  },

  // Razorpay Gateway
  async createRazorpayOrder(items: any[], couponCode?: string): Promise<{ success: boolean; orderId?: string; amount?: number; currency?: string; keyId?: string; calculatedTotal?: number; message?: string }> {
    const res = await authFetch(`${API_BASE}/payments/razorpay/order`, {
      method: 'POST',
      body: JSON.stringify({ items, couponCode })
    });
    return res.json();
  },

  async verifyRazorpayPayment(payload: any): Promise<{ success: boolean; data?: Order; message?: string }> {
    const res = await authFetch(`${API_BASE}/payments/razorpay/verify`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Products
  async getProducts(params?: Record<string, string>): Promise<{ success: boolean; data: Product[] }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await authFetch(`${API_BASE}/products${query}`);
    return res.json();
  },

  async getProduct(id: string): Promise<{ success: boolean; data: Product }> {
    const res = await authFetch(`${API_BASE}/products/${id}`);
    return res.json();
  },

  async createProduct(product: Partial<Product>): Promise<{ success: boolean; data: Product; message?: string }> {
    const res = await authFetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  },

  async bulkCreateProducts(products: Partial<Product>[]): Promise<{ success: boolean; count: number; data: Product[]; message?: string }> {
    const res = await authFetch(`${API_BASE}/products/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    });
    return res.json();
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    const res = await authFetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean; data: Product }> {
    const res = await authFetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async addReview(id: string, review: { userName: string; rating: number; comment: string }): Promise<{ success: boolean; data: Product }> {
    const res = await authFetch(`${API_BASE}/products/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    return res.json();
  },

  // Categories & Subcategories
  async getCategories(): Promise<{ success: boolean; data: Category[] }> {
    const res = await authFetch(`${API_BASE}/categories`);
    return res.json();
  },

  async createCategory(cat: { name: string; description?: string }): Promise<{ success: boolean; data: Category }> {
    const res = await authFetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat)
    });
    return res.json();
  },

  async deleteCategory(id: string): Promise<{ success: boolean; data: Category }> {
    const res = await authFetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async createSubcategory(categoryId: string, sub: { name: string; description?: string }): Promise<{ success: boolean; data: any }> {
    const res = await authFetch(`${API_BASE}/categories/${categoryId}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    });
    return res.json();
  },

  async deleteSubcategory(categoryId: string, subId: string): Promise<{ success: boolean; data: any }> {
    const res = await authFetch(`${API_BASE}/categories/${categoryId}/subcategories/${subId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Coupons
  async getCoupons(): Promise<{ success: boolean; data: Coupon[] }> {
    const res = await authFetch(`${API_BASE}/coupons`);
    return res.json();
  },

  async validateCoupon(code: string, cartSubtotal: number): Promise<{ success: boolean; coupon?: Coupon; discount?: number; message?: string }> {
    const res = await authFetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartSubtotal })
    });
    return res.json();
  },

  async createCoupon(coupon: Partial<Coupon>): Promise<{ success: boolean; data: Coupon }> {
    const res = await authFetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon)
    });
    return res.json();
  },

  async deleteCoupon(id: string): Promise<{ success: boolean; data: Coupon }> {
    const res = await authFetch(`${API_BASE}/coupons/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Offers & Deals Campaigns
  async getOffers(): Promise<{ success: boolean; data: Offer[] }> {
    const res = await authFetch(`${API_BASE}/offers`);
    return res.json();
  },

  async createOffer(offer: Partial<Offer>): Promise<{ success: boolean; data: Offer }> {
    const res = await authFetch(`${API_BASE}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer)
    });
    return res.json();
  },

  async updateOffer(id: string, offer: Partial<Offer>): Promise<{ success: boolean; data: Offer }> {
    const res = await authFetch(`${API_BASE}/offers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer)
    });
    return res.json();
  },

  async toggleOffer(id: string): Promise<{ success: boolean; data: Offer }> {
    const res = await authFetch(`${API_BASE}/offers/${id}/toggle`, {
      method: 'PATCH'
    });
    return res.json();
  },

  async deleteOffer(id: string): Promise<{ success: boolean; data: Offer }> {
    const res = await authFetch(`${API_BASE}/offers/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Orders & Tracking
  async getOrders(): Promise<{ success: boolean; data: Order[] }> {
    const res = await authFetch(`${API_BASE}/orders`);
    return res.json();
  },

  async createOrder(order: any): Promise<{ success: boolean; data: Order; message?: string }> {
    const res = await authFetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return res.json();
  },

  async updateOrderStatus(id: string, status: string): Promise<{ success: boolean; data: Order }> {
    const res = await authFetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async updateOrderTracking(id: string, trackingData: { carrier?: string; trackingNumber?: string; estimatedDelivery?: string; status?: string; location?: string; checkpointDescription?: string }): Promise<{ success: boolean; data: Order; message?: string }> {
    const res = await authFetch(`${API_BASE}/orders/${id}/tracking`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackingData)
    });
    return res.json();
  },

  async getTracking(query: string): Promise<{ success: boolean; data?: { order: Order; tracking: any; liveTracking?: any }; message?: string }> {
    const res = await authFetch(`${API_BASE}/tracking/${encodeURIComponent(query)}`);
    return res.json();
  },

  // Shiprocket Logistics API
  async getShiprocketStatus(): Promise<ShiprocketStatus> {
    const res = await authFetch(`${API_BASE}/shiprocket/status`);
    return res.json();
  },

  async getShiprocketServiceability(deliveryPincode: string, weight: number = 0.5, cod: boolean = false, pickupPincode?: string): Promise<ShiprocketServiceabilityResponse> {
    const query = new URLSearchParams({
      delivery_postcode: deliveryPincode,
      weight: String(weight),
      cod: cod ? '1' : '0'
    });
    if (pickupPincode) query.append('pickup_postcode', pickupPincode);
    const res = await authFetch(`${API_BASE}/shiprocket/serviceability?${query.toString()}`);
    return res.json();
  },

  async dispatchWithShiprocket(orderId: string, courierId?: number): Promise<{ success: boolean; message: string; data?: Order; shiprocket?: any }> {
    const res = await authFetch(`${API_BASE}/shiprocket/orders/${orderId}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courierId })
    });
    return res.json();
  },

  async assignShiprocketAwb(orderId: string, courierId?: number): Promise<{ success: boolean; message?: string; awbCode?: string; courierName?: string; requiresRecharge?: boolean }> {
    const res = await authFetch(`${API_BASE}/shiprocket/orders/${orderId}/assign-awb`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courierId })
    });
    return res.json();
  },

  async getShiprocketLabel(orderId: string): Promise<{ success: boolean; labelUrl?: string; message?: string }> {
    const res = await authFetch(`${API_BASE}/shiprocket/orders/${orderId}/label`);
    return res.json();
  },

  async getShiprocketInvoice(orderId: string): Promise<{ success: boolean; invoiceUrl?: string; message?: string }> {
    const res = await authFetch(`${API_BASE}/shiprocket/orders/${orderId}/invoice`);
    return res.json();
  },

  async trackShiprocketAwb(awb: string): Promise<{ success: boolean; data?: any; message?: string }> {
    const res = await authFetch(`${API_BASE}/shiprocket/track/${encodeURIComponent(awb)}`);
    return res.json();
  },

  async updateShiprocketSettings(settings: { email?: string; password?: string; channelId?: string; defaultPickupLocation?: string; autoPushToShiprocket?: boolean }): Promise<{ success: boolean; message: string }> {
    const res = await authFetch(`${API_BASE}/shiprocket/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  async addShiprocketPickupLocation(locationData: any): Promise<{ success: boolean; message?: string; address?: any }> {
    const res = await authFetch(`${API_BASE}/shiprocket/pickup-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationData)
    });
    return res.json();
  },

  // Payments & Financials
  async getPayments(): Promise<{ success: boolean; data: any[]; stats?: any }> {
    const res = await authFetch(`${API_BASE}/payments`);
    return res.json();
  },

  async updatePaymentStatus(id: string, status: string): Promise<{ success: boolean; data: any }> {
    const res = await authFetch(`${API_BASE}/payments/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async refundPayment(id: string, refundAmount?: number, refundReason?: string): Promise<{ success: boolean; message?: string; data: any }> {
    const res = await authFetch(`${API_BASE}/payments/${id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refundAmount, refundReason })
    });
    return res.json();
  },

  // Returns & Exchanges
  async getReturns(): Promise<{ success: boolean; data: any[] }> {
    const res = await authFetch(`${API_BASE}/returns`);
    return res.json();
  },

  async createReturn(returnData: any): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await authFetch(`${API_BASE}/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnData)
    });
    return res.json();
  },

  async updateReturnStatus(id: string, statusData: { status: string; adminRemark?: string; pickupCarrier?: string; pickupTrackingNumber?: string }): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await authFetch(`${API_BASE}/returns/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    });
    return res.json();
  },

  // Customers & Users
  async getCustomers(): Promise<{ success: boolean; data: User[] }> {
    const res = await authFetch(`${API_BASE}/customers`);
    return res.json();
  },

  async updateCustomerStatus(id: string, status?: string): Promise<{ success: boolean; data: User }> {
    const res = await authFetch(`${API_BASE}/customers/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Reviews Moderation
  async getAllReviews(): Promise<{ success: boolean; data: any[] }> {
    const res = await authFetch(`${API_BASE}/reviews`);
    return res.json();
  },

  async deleteReview(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await authFetch(`${API_BASE}/reviews/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Settings & Analytics
  async getSettings(): Promise<{ success: boolean; data: SiteSettings }> {
    const res = await authFetch(`${API_BASE}/settings`);
    return res.json();
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; data: SiteSettings }> {
    const res = await authFetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  async getAnalytics(): Promise<{ success: boolean; data: any }> {
    const res = await authFetch(`${API_BASE}/analytics`);
    return res.json();
  },

  // WhatsApp CRM & Bot Automations
  async getWhatsAppConversations(): Promise<{ success: boolean; data: any[] }> {
    const res = await authFetch(`${API_BASE}/whatsapp/conversations`);
    return res.json();
  },

  async sendWhatsAppMessage(conversationId: string, text: string, sender: string = 'admin'): Promise<{ success: boolean; data: any; message: any }> {
    const res = await authFetch(`${API_BASE}/whatsapp/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sender })
    });
    return res.json();
  },

  async getWhatsAppAutomations(): Promise<{ success: boolean; data: any[] }> {
    const res = await authFetch(`${API_BASE}/whatsapp/automations`);
    return res.json();
  },

  async updateWhatsAppAutomation(id: string, update: any): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await authFetch(`${API_BASE}/whatsapp/automations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    return res.json();
  },

  async testWhatsAppAutomation(id: string, phone?: string): Promise<{ success: boolean; message: string; template: string }> {
    const res = await authFetch(`${API_BASE}/whatsapp/automations/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return res.json();
  },

  async getWhatsAppCampaigns(): Promise<{ success: boolean; data: any[] }> {
    const res = await authFetch(`${API_BASE}/whatsapp/campaigns`);
    return res.json();
  },

  async sendWhatsAppCampaign(campaignData: { name: string; audience: string; template?: string }): Promise<{ success: boolean; data: any; message: string }> {
    const res = await authFetch(`${API_BASE}/whatsapp/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    });
    return res.json();
  },

  async getWhatsAppConfig(): Promise<{ success: boolean; data: any }> {
    const res = await authFetch(`${API_BASE}/whatsapp/config`);
    return res.json();
  },

  async updateWhatsAppConfig(config: any): Promise<{ success: boolean; data: any; message?: string }> {
    const res = await authFetch(`${API_BASE}/whatsapp/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },

  // ----------------------------------------------------
  // Vendor Procurement & Inward Stock Ledger
  // ----------------------------------------------------
  async getVendors(): Promise<{ success: boolean; data: Vendor[] }> {
    const res = await authFetch(`${API_BASE}/vendors`);
    return res.json();
  },

  async createVendor(vendor: Partial<Vendor>): Promise<{ success: boolean; data: Vendor; message: string }> {
    const res = await authFetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor)
    });
    return res.json();
  },

  async getVendorInward(): Promise<{ success: boolean; data: VendorInwardRecord[] }> {
    const res = await authFetch(`${API_BASE}/vendors/inward`);
    return res.json();
  },

  async createVendorInward(record: Partial<VendorInwardRecord>): Promise<{ success: boolean; data: VendorInwardRecord; message: string }> {
    const res = await authFetch(`${API_BASE}/vendors/inward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    return res.json();
  },

  async getVendorPayouts(): Promise<{ success: boolean; data: VendorPayoutRecord[] }> {
    const res = await authFetch(`${API_BASE}/vendors/payouts`);
    return res.json();
  },

  async createVendorPayout(payout: Partial<VendorPayoutRecord>): Promise<{ success: boolean; data: VendorPayoutRecord; message: string }> {
    const res = await authFetch(`${API_BASE}/vendors/payouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payout)
    });
    return res.json();
  },

  // ----------------------------------------------------
  // Influencer Collabs & Marketing Spend
  // ----------------------------------------------------
  async getInfluencers(): Promise<{ success: boolean; data: InfluencerCollab[] }> {
    const res = await authFetch(`${API_BASE}/marketing/influencers`);
    return res.json();
  },

  async createInfluencer(influencer: Partial<InfluencerCollab>): Promise<{ success: boolean; data: InfluencerCollab; message: string }> {
    const res = await authFetch(`${API_BASE}/marketing/influencers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(influencer)
    });
    return res.json();
  },

  async updateInfluencerPayout(id: string, payoutData: { amount: number; paymentDate?: string; paymentRef?: string }): Promise<{ success: boolean; data: InfluencerCollab; message: string }> {
    const res = await authFetch(`${API_BASE}/marketing/influencers/${id}/payout`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payoutData)
    });
    return res.json();
  },

  async getMarketingExpenses(): Promise<{ success: boolean; data: MarketingExpense[] }> {
    const res = await authFetch(`${API_BASE}/marketing/expenses`);
    return res.json();
  },

  async createMarketingExpense(expense: Partial<MarketingExpense>): Promise<{ success: boolean; data: MarketingExpense; message: string }> {
    const res = await authFetch(`${API_BASE}/marketing/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    return res.json();
  },

  async getMarketingSummary(): Promise<{ success: boolean; data: any }> {
    const res = await authFetch(`${API_BASE}/marketing/summary`);
    return res.json();
  },

  // ----------------------------------------------------
  // AI Fashion Stylist & Virtual Try-On Studio
  // ----------------------------------------------------
  async askAI(params: {
    prompt: string;
    occasion?: string;
    gender?: string;
    bodyType?: string;
    currentProductId?: string;
  }): Promise<{ success: boolean; data: AIStylistRecommendation }> {
    const res = await authFetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async tryOnAI(params: {
    productId: string;
    userImage?: string;
    color?: string;
    size?: string;
    height?: string;
    weight?: string;
    bodyType?: string;
  }): Promise<{ success: boolean; data: AITryOnResult }> {
    const res = await authFetch(`${API_BASE}/ai/try-on`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  }
};
