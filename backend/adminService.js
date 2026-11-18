import { readData, writeData } from './db.js';

// ----------------------------------------------------
// 1. ROLE-BASED ACCESS CONTROL (RBAC) DEFINITION
// ----------------------------------------------------
export const ROLE_PERMISSIONS = {
  'Super Admin': ['all'],
  'Store Manager': ['dashboard', 'orders', 'products', 'inventory', 'customers', 'analytics', 'reviews', 'discounts', 'abandoned_carts', 'abandoned_checkouts', 'vendors', 'whatsapp'],
  'Order Manager': ['dashboard', 'orders', 'tracking', 'returns', 'customers_view', 'abandoned_checkouts'],
  'Product Manager': ['dashboard', 'products', 'inventory', 'categories', 'reviews'],
  'Marketing Manager': ['dashboard', 'discounts', 'offers', 'marketing', 'analytics', 'abandoned_carts', 'whatsapp'],
  'Support Staff': ['dashboard', 'orders_view', 'customers_view', 'tracking', 'reviews', 'whatsapp']
};

export function hasPermission(userRole, staffRole, permission) {
  if (userRole === 'admin' && (!staffRole || staffRole === 'Super Admin')) return true;
  const role = staffRole || (userRole === 'admin' ? 'Super Admin' : 'Support Staff');
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('all')) return true;
  return perms.includes(permission);
}

export function checkPermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Administrator access required' });
    }
    const db = readData();
    const staff = (db.staffUsers || []).find(s => 
      s.userId === req.user.id || (s.email && s.email.toLowerCase() === req.user.email?.toLowerCase())
    );
    const staffRole = staff?.role || 'Super Admin';
    if (!hasPermission(req.user.role, staffRole, permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Role '${staffRole}' does not possess permission '${permission}'`
      });
    }
    req.staffRole = staffRole;
    req.staffUser = staff;
    next();
  };
}

// ----------------------------------------------------
// 2. AUDIT LOGGING HELPER
// ----------------------------------------------------
export function logAudit(req, action, entityType, entityId, metadata = {}) {
  try {
    const db = readData();
    const log = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      adminId: req.user?.id || 'system',
      adminName: req.user?.name || req.staffUser?.name || 'Administrator',
      adminRole: req.staffRole || req.user?.role || 'admin',
      action,
      entityType,
      entityId: String(entityId || ''),
      timestamp: new Date().toISOString(),
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      metadata
    };
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift(log);
    if (db.auditLogs.length > 5000) db.auditLogs = db.auditLogs.slice(0, 5000);
    writeData(db);
    return log;
  } catch (err) {
    console.error('Failed to write audit log:', err);
    return null;
  }
}

// ----------------------------------------------------
// 3. DATE RANGE CALCULATION UTILITY
// ----------------------------------------------------
export function getDateRange(period = '30d', customStart, customEnd) {
  const now = new Date();
  let start = new Date();
  let end = new Date(now);

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case '7d':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'custom':
      if (customStart) start = new Date(customStart);
      if (customEnd) end = new Date(customEnd);
      break;
    default:
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
  }
  return { start, end };
}

// ----------------------------------------------------
// 4. FIRST-PARTY EVENT INGESTION & VISITOR TELEMETRY
// ----------------------------------------------------
export function ingestAnalyticsEvent(eventData, req) {
  const db = readData();
  const now = new Date();
  const nowIso = now.toISOString();

  const visitorId = eventData.visitorId || `vid-${Math.random().toString(36).substring(2, 9)}`;
  const sessionId = eventData.sessionId || `sid-${Math.random().toString(36).substring(2, 9)}`;
  const eventName = eventData.eventName || 'page_view';
  const page = eventData.page || eventData.currentPage || '/';
  const referrer = eventData.referrer || eventData.source || 'Direct';
  const device = eventData.device || (req.headers['user-agent']?.includes('Mobile') ? 'Mobile' : 'Desktop');
  const browser = eventData.browser || 'Chrome';

  // 1. Maintain VisitorSessions
  if (!db.visitorSessions) db.visitorSessions = [];
  let session = db.visitorSessions.find(s => s.sessionId === sessionId);
  if (!session) {
    session = {
      id: `vs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      visitorId,
      sessionId,
      firstSeenAt: nowIso,
      lastSeenAt: nowIso,
      landingPage: page,
      currentPage: page,
      source: referrer,
      device,
      browser,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      status: 'active'
    };
    db.visitorSessions.unshift(session);
  } else {
    session.lastSeenAt = nowIso;
    session.currentPage = page;
    session.status = 'active';
  }

  // Prune sessions older than 30 days
  if (db.visitorSessions.length > 5000) {
    db.visitorSessions = db.visitorSessions.slice(0, 5000);
  }

  // 2. Append Event
  if (!db.analyticsEvents) db.analyticsEvents = [];
  const eventRecord = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventName,
    visitorId,
    sessionId,
    productId: eventData.productId || null,
    cartId: eventData.cartId || null,
    orderId: eventData.orderId || null,
    page,
    timestamp: nowIso,
    metadata: eventData.metadata || {}
  };
  db.analyticsEvents.unshift(eventRecord);
  if (db.analyticsEvents.length > 10000) {
    db.analyticsEvents = db.analyticsEvents.slice(0, 10000);
  }

  // 3. Handle Add to Cart / Cart State
  if (eventName === 'add_to_cart' && eventData.cartId) {
    if (!db.abandonedCarts) db.abandonedCarts = [];
    let cart = db.abandonedCarts.find(c => c.cartId === eventData.cartId);
    if (!cart) {
      cart = {
        id: `ab-cart-${Date.now()}`,
        cartId: eventData.cartId,
        visitorId,
        customerId: eventData.customerId || null,
        customerName: eventData.customerName || null,
        customerEmail: eventData.customerEmail || null,
        customerPhone: eventData.customerPhone || null,
        items: eventData.items || [],
        cartValue: Number(eventData.cartValue || eventData.totalAmount || 0),
        createdAt: nowIso,
        lastActivityAt: nowIso,
        recoveryStatus: 'unrecovered',
        recoveryUrl: `https://brivoo.in/?cartId=${eventData.cartId}`
      };
      db.abandonedCarts.unshift(cart);
    } else {
      cart.items = eventData.items || cart.items;
      cart.cartValue = Number(eventData.cartValue || eventData.totalAmount || cart.cartValue);
      cart.lastActivityAt = nowIso;
    }
  }

  // 4. Handle Begin Checkout / Checkout Session
  if (eventName === 'begin_checkout' && eventData.checkoutId) {
    if (!db.checkoutSessions) db.checkoutSessions = [];
    let checkout = db.checkoutSessions.find(c => c.checkoutId === eventData.checkoutId);
    if (!checkout) {
      checkout = {
        id: `cs-${Date.now()}`,
        checkoutId: eventData.checkoutId,
        cartId: eventData.cartId || null,
        visitorId,
        customerId: eventData.customerId || null,
        customerName: eventData.customerName || null,
        customerEmail: eventData.customerEmail || null,
        customerPhone: eventData.customerPhone || null,
        items: eventData.items || [],
        checkoutValue: Number(eventData.checkoutValue || eventData.totalAmount || 0),
        paymentMethod: eventData.paymentMethod || 'UPI',
        paymentStatus: 'pending',
        orderId: null,
        createdAt: nowIso,
        lastActivityAt: nowIso,
        status: 'started'
      };
      db.checkoutSessions.unshift(checkout);
    } else {
      checkout.lastActivityAt = nowIso;
    }
  }

  // 5. Handle Purchase -> Mark cart & checkout as recovered / completed
  if (eventName === 'purchase' && eventData.orderId) {
    if (db.abandonedCarts && eventData.cartId) {
      const cart = db.abandonedCarts.find(c => c.cartId === eventData.cartId);
      if (cart) {
        cart.recoveryStatus = 'recovered';
        cart.orderId = eventData.orderId;
        cart.recoveredAt = nowIso;
      }
    }
    if (db.checkoutSessions && eventData.checkoutId) {
      const checkout = db.checkoutSessions.find(c => c.checkoutId === eventData.checkoutId);
      if (checkout) {
        checkout.status = 'completed';
        checkout.paymentStatus = 'completed';
        checkout.orderId = eventData.orderId;
      }
    }
  }

  writeData(db);
  return { session, event: eventRecord };
}

// ----------------------------------------------------
// 5. SHOPIFY-STYLE DASHBOARD CALCULATIONS (REAL DB DATA)
// ----------------------------------------------------
export function calculateDashboardMetrics(period = '30d', customStart, customEnd) {
  const db = readData();
  const { start, end } = getDateRange(period, customStart, customEnd);
  const now = new Date();
  const activeWindowMs = 15 * 60 * 1000; // 15 mins active threshold

  const orders = db.orders || [];
  const events = db.analyticsEvents || [];
  const sessions = db.visitorSessions || [];
  const carts = db.abandonedCarts || [];
  const checkouts = db.checkoutSessions || [];
  const returns = db.returns || [];
  const products = db.products || [];
  const users = db.users || [];

  // Filter within date range
  const rangeOrders = orders.filter(o => {
    const d = new Date(o.createdAt || o.date);
    return d >= start && d <= end;
  });

  const rangeEvents = events.filter(e => {
    const d = new Date(e.timestamp);
    return d >= start && d <= end;
  });

  const rangeSessions = sessions.filter(s => {
    const d = new Date(s.firstSeenAt);
    return d >= start && d <= end;
  });

  const rangeCarts = carts.filter(c => {
    const d = new Date(c.createdAt || c.lastActivityAt);
    return d >= start && d <= end;
  });

  const rangeCheckouts = checkouts.filter(c => {
    const d = new Date(c.createdAt || c.lastActivityAt);
    return d >= start && d <= end;
  });

  const rangeReturns = returns.filter(r => {
    const d = new Date(r.createdAt || r.date);
    return d >= start && d <= end;
  });

  // Gross Sales (excluding Cancelled)
  const validOrders = rangeOrders.filter(o => o.status !== 'Cancelled');
  const totalSales = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalDiscounts = validOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
  const totalRefunds = rangeReturns.filter(r => r.status === 'Approved' || r.status === 'Refunded')
    .reduce((sum, r) => sum + (r.amount || r.refundAmount || 0), 0);
  const netSales = Math.max(0, totalSales - totalRefunds);
  const totalOrdersCount = validOrders.length;
  const aov = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;

  // Customers
  const totalCustomers = users.filter(u => u.role !== 'admin').length;
  const newCustomers = users.filter(u => {
    if (u.role === 'admin') return false;
    const d = new Date(u.joinedAt || u.createdAt || 0);
    return d >= start && d <= end;
  }).length;

  // Visitors & Traffic
  const websiteVisitors = rangeSessions.length;
  const uniqueVisitorIds = new Set(rangeSessions.map(s => s.visitorId));
  const uniqueVisitors = uniqueVisitorIds.size;

  // Live active visitors (right now within 15 min window)
  const activeCutoff = new Date(now.getTime() - activeWindowMs);
  const liveActiveVisitors = sessions.filter(s => new Date(s.lastSeenAt) >= activeCutoff).length;

  // Conversion Funnel
  const productViewEvents = rangeEvents.filter(e => e.eventName === 'product_view');
  const addToCartEvents = rangeEvents.filter(e => e.eventName === 'add_to_cart');
  const beginCheckoutEvents = rangeEvents.filter(e => e.eventName === 'begin_checkout');
  const purchaseEvents = rangeEvents.filter(e => e.eventName === 'purchase');

  const funnelVisitors = Math.max(websiteVisitors, uniqueVisitors, 1);
  const funnelProductViews = productViewEvents.length;
  const funnelAddToCart = addToCartEvents.length;
  const funnelCheckout = Math.max(beginCheckoutEvents.length, rangeCheckouts.length);
  const funnelPurchases = totalOrdersCount;

  // Conversion Rates
  const conversionRate = websiteVisitors > 0 ? Number(((totalOrdersCount / websiteVisitors) * 100).toFixed(2)) : 0;
  const addToCartRate = websiteVisitors > 0 ? Number(((funnelAddToCart / websiteVisitors) * 100).toFixed(2)) : 0;
  const checkoutConversionRate = funnelCheckout > 0 ? Number(((totalOrdersCount / funnelCheckout) * 100).toFixed(2)) : 0;

  // Abandoned Carts & Checkouts
  const abandonedCartsCount = rangeCarts.filter(c => c.recoveryStatus === 'unrecovered').length;
  const abandonedCartsValue = rangeCarts.filter(c => c.recoveryStatus === 'unrecovered')
    .reduce((sum, c) => sum + (c.cartValue || 0), 0);
  const abandonedCheckoutsCount = rangeCheckouts.filter(c => c.status !== 'completed').length;

  // Pending & Statuses
  const pendingOrdersCount = orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length;

  // Sales Trend timeseries
  const salesTrend = [];
  const daysDiff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  const isHourly = period === 'today' || period === 'yesterday';

  if (isHourly) {
    for (let h = 0; h < 24; h += 2) {
      const label = `${String(h).padStart(2, '0')}:00`;
      const hStart = new Date(start);
      hStart.setHours(h, 0, 0, 0);
      const hEnd = new Date(start);
      hEnd.setHours(h + 2, 0, 0, 0);

      const hOrders = validOrders.filter(o => {
        const d = new Date(o.createdAt || o.date);
        return d >= hStart && d < hEnd;
      });
      const hSales = hOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      salesTrend.push({ label, sales: hSales, orders: hOrders.length });
    }
  } else {
    const stepDays = daysDiff > 35 ? 3 : 1;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + stepDays)) {
      const curStart = new Date(d);
      curStart.setHours(0, 0, 0, 0);
      const curEnd = new Date(d);
      curEnd.setDate(curEnd.getDate() + (stepDays - 1));
      curEnd.setHours(23, 59, 59, 999);

      const dOrders = validOrders.filter(o => {
        const od = new Date(o.createdAt || o.date);
        return od >= curStart && od <= curEnd;
      });
      const dSales = dOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const label = curStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      salesTrend.push({ label, sales: dSales, orders: dOrders.length });
    }
  }

  // Top Selling Products
  const productSalesMap = {};
  validOrders.forEach(o => {
    (o.items || []).forEach(it => {
      if (!productSalesMap[it.id]) {
        productSalesMap[it.id] = { id: it.id, title: it.title, unitsSold: 0, revenue: 0, image: it.image };
      }
      productSalesMap[it.id].unitsSold += (it.quantity || 1);
      productSalesMap[it.id].revenue += ((it.price || 0) * (it.quantity || 1));
    });
  });
  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  // Traffic Sources
  const sourceCount = {};
  rangeSessions.forEach(s => {
    const src = s.source || 'Direct';
    let category = 'Direct';
    if (src.toLowerCase().includes('google')) category = 'Google Search';
    else if (src.toLowerCase().includes('instagram') || src.toLowerCase().includes('facebook') || src.toLowerCase().includes('meta')) category = 'Instagram / Meta';
    else if (src.toLowerCase().includes('whatsapp')) category = 'WhatsApp';
    else if (src.toLowerCase().includes('http')) category = 'Referral';
    sourceCount[category] = (sourceCount[category] || 0) + 1;
  });
  const trafficSources = Object.entries(sourceCount).map(([name, count]) => ({
    name,
    count,
    percentage: websiteVisitors > 0 ? Math.round((count / websiteVisitors) * 100) : 0
  }));

  // Device Breakdown
  const deviceCount = { Desktop: 0, Mobile: 0, Tablet: 0 };
  rangeSessions.forEach(s => {
    const d = s.device || 'Mobile';
    if (deviceCount[d] !== undefined) deviceCount[d]++;
    else deviceCount.Mobile++;
  });
  const deviceBreakdown = Object.entries(deviceCount).map(([name, count]) => ({
    name,
    count,
    percentage: websiteVisitors > 0 ? Math.round((count / websiteVisitors) * 100) : 0
  }));

  return {
    period,
    dateRange: { start: start.toISOString(), end: end.toISOString() },
    totalSales,
    netSales,
    totalOrders: totalOrdersCount,
    aov,
    totalCustomers,
    newCustomers,
    websiteVisitors,
    uniqueVisitors,
    liveActiveVisitors,
    conversionRate,
    addToCartRate,
    checkoutConversionRate,
    abandonedCartsCount,
    abandonedCartsValue,
    abandonedCheckoutsCount,
    refundsCount: rangeReturns.length,
    refundsAmount: totalRefunds,
    pendingOrdersCount,
    lowStockCount: products.filter(p => p.stock < 10).length,
    salesTrend,
    topSellingProducts,
    trafficSources,
    deviceBreakdown,
    conversionFunnel: {
      visitors: funnelVisitors,
      productViews: funnelProductViews,
      addToCarts: funnelAddToCart,
      checkoutsStarted: funnelCheckout,
      purchases: funnelPurchases
    }
  };
}
