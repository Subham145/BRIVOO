const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

let lastPageViewKey = '';

export function initializeMetaPixel() {
  if (
    !PIXEL_ID ||
    localStorage.getItem('brivoo_meta_pixel_consent') !== 'accepted'
  ) return;

  if (window.fbq) return;

  const fbq: any = function (...args: any[]) {
    if (fbq.callMethod) {
      fbq.callMethod.apply(fbq, args);
    } else {
      fbq.queue.push(args);
    }
  };

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  fbq('init', PIXEL_ID);
}

export function trackMetaEvent(
  event: string,
  params?: Record<string, any>
) {
  if (
    localStorage.getItem('brivoo_meta_pixel_consent') !== 'accepted' ||
    !window.fbq
  ) return;

  window.fbq('track', event, params || {});
}

export function trackMetaPageView(pageKey: string) {
  if (
    localStorage.getItem('brivoo_meta_pixel_consent') !== 'accepted' ||
    !window.fbq ||
    lastPageViewKey === pageKey
  ) return;

  lastPageViewKey = pageKey;
  trackMetaEvent('PageView');
}

export function trackMetaPurchase(order: any) {
  const isRazorpay =
    order.paymentMethod === 'Razorpay' &&
    order.paymentStatus === 'Completed';

  const isCOD =
    ['Cash on Delivery', 'COD'].includes(order.paymentMethod) &&
    order.status !== 'Cancelled';

  if (
    (!isRazorpay && !isCOD) ||
    !order.id ||
    !order.metaEventId ||
    localStorage.getItem('brivoo_meta_pixel_consent') !== 'accepted' ||
    !window.fbq
  ) return;

  const key = `brivoo_meta_purchase_${order.id}`;

  if (localStorage.getItem(key)) return;

  const items = order.items || [];
  const numItems = items.reduce(
    (sum: number, item: any) => sum + Number(item.quantity || 0),
    0
  );

  window.fbq('track', 'Purchase', {
    content_ids: items.map((item: any) => item.id),
    contents: items.map((item: any) => ({
      id: item.id,
      quantity: Number(item.quantity || 0)
    })),
    content_type: 'product',
    content_name: items.map((item: any) => item.title).filter(Boolean).join(', '),
    num_items: numItems,
    order_id: order.id,
    value: Number(order.totalAmount),
    currency: 'INR'
  }, {
    eventID: order.metaEventId
  });

  localStorage.setItem(key, '1');
}
