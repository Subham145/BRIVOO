import { Product, CartItem, Order } from '../types';

const API_BASE = '/api';

// Helper to get or create anonymous persistent Visitor ID
export function getVisitorId(): string {
  if (typeof window === 'undefined') return 'server';
  let vid = localStorage.getItem('brivoo_visitor_id');
  if (!vid) {
    vid = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('brivoo_visitor_id', vid);
  }
  return vid;
}

// Helper to get or create Session ID with 30-min inactivity timeout
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  const now = Date.now();
  const sessionTimeoutMs = 30 * 60 * 1000;
  let sid = sessionStorage.getItem('brivoo_session_id');
  const lastActiveStr = sessionStorage.getItem('brivoo_session_last_active');
  const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;

  if (!sid || !lastActive || (now - lastActive > sessionTimeoutMs)) {
    sid = `sid_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    sessionStorage.setItem('brivoo_session_id', sid);
  }
  sessionStorage.setItem('brivoo_session_last_active', String(now));
  return sid;
}

// Persistent cart ID for recovery tracking
export function getCartId(): string {
  if (typeof window === 'undefined') return 'cart_server';
  let cartId = localStorage.getItem('brivoo_cart_id');
  if (!cartId) {
    cartId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem('brivoo_cart_id', cartId);
  }
  return cartId;
}

// Determine device category
function getDeviceType(): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

// Determine browser
function getBrowser(): string {
  if (typeof window === 'undefined') return 'Chrome';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Browser';
}

// Core dispatcher to backend
async function sendEvent(eventName: string, payload: Record<string, any> = {}) {
  try {
    const body = {
      eventName,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      page: typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '/',
      referrer: typeof document !== 'undefined' ? (document.referrer || 'Direct') : 'Direct',
      device: getDeviceType(),
      browser: getBrowser(),
      ...payload
    };

    // Use sendBeacon if available for low-latency background transport
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      const sent = navigator.sendBeacon(`${API_BASE}/analytics/events`, blob);
      if (sent) return;
    }

    await fetch(`${API_BASE}/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true
    });
  } catch {
    // Non-blocking telemetry
  }
}

// Exported high-level tracking functions
export const analyticsTracker = {
  // Page View
  trackPageView(pageName: string) {
    void sendEvent('page_view', { page: pageName });
  },

  // Product View
  trackProductView(product: Product) {
    void sendEvent('product_view', {
      productId: product.id,
      metadata: {
        title: product.title,
        category: product.category,
        price: product.price
      }
    });
  },

  // Add to Cart
  trackAddToCart(product: Product, quantity: number, color: string, size: string, allCartItems: CartItem[]) {
    const cartId = getCartId();
    const cartValue = allCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const items = allCartItems.map(item => ({
      id: item.product.id,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      image: item.product.image
    }));

    void sendEvent('add_to_cart', {
      cartId,
      productId: product.id,
      cartValue,
      items,
      metadata: {
        productTitle: product.title,
        quantity,
        color,
        size,
        price: product.price
      }
    });

    // Synchronize cart state for abandoned cart recovery
    this.syncCart(allCartItems);
  },

  // Remove from Cart
  trackRemoveFromCart(cartItemId: string, remainingItems: CartItem[]) {
    const cartId = getCartId();
    const cartValue = remainingItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    void sendEvent('remove_from_cart', {
      cartId,
      cartValue,
      metadata: { removedItemId: cartItemId }
    });
    this.syncCart(remainingItems);
  },

  // Begin Checkout
  trackBeginCheckout(checkoutId: string, items: CartItem[], totalAmount: number, customerInfo?: { name?: string; email?: string; phone?: string }) {
    const cartId = getCartId();
    void sendEvent('begin_checkout', {
      checkoutId,
      cartId,
      checkoutValue: totalAmount,
      customerName: customerInfo?.name,
      customerEmail: customerInfo?.email,
      customerPhone: customerInfo?.phone,
      items: items.map(i => ({
        id: i.product.id,
        title: i.product.title,
        price: i.product.price,
        quantity: i.quantity,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
        image: i.product.image
      }))
    });
  },

  // Successful Purchase
  trackPurchase(order: Order, checkoutId?: string) {
    const cartId = getCartId();
    void sendEvent('purchase', {
      orderId: order.id,
      cartId,
      checkoutId,
      metadata: {
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        itemsCount: order.items.length
      }
    });

    // Reset cart ID after purchase so future carts are fresh
    if (typeof window !== 'undefined') {
      localStorage.removeItem('brivoo_cart_id');
    }
  },

  // Search
  trackSearch(query: string, resultsCount: number) {
    void sendEvent('search', {
      metadata: { query, resultsCount }
    });
  },

  // Coupon applied
  trackCoupon(code: string, success: boolean, discountAmount: number = 0) {
    void sendEvent('coupon', {
      metadata: { code, success, discountAmount }
    });
  },

  // Cart State Sync for Abandoned Carts Engine
  syncCart(items: CartItem[], customerInfo?: { name?: string; email?: string; phone?: string }) {
    if (typeof window === 'undefined') return;
    const cartId = getCartId();
    const totalAmount = items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
    const cartItemsData = items.map(i => ({
      id: i.product.id,
      title: i.product.title,
      price: i.product.price,
      quantity: i.quantity,
      selectedSize: i.selectedSize,
      selectedColor: i.selectedColor,
      image: i.product.image
    }));

    try {
      fetch(`${API_BASE}/cart/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          visitorId: getVisitorId(),
          items: cartItemsData,
          totalAmount,
          customerName: customerInfo?.name,
          customerEmail: customerInfo?.email,
          customerPhone: customerInfo?.phone
        })
      }).catch(() => {});
    } catch {}
  }
};
