export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar?: string;
  phone?: string;
  totalOrders?: number;
  totalSpent?: number;
  tier?: 'Silver' | 'Gold' | 'Platinum Luxe';
  status?: 'Active' | 'Blocked';
  joinedAt?: string;
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
  productId?: string;
  productTitle?: string;
}

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  subCategory?: string;
  gender: string;
  price: number;
  originalPrice: number;
  tag?: string; // NEW, BESTSELLER, SALE, LIMITED
  image: string;
  images?: string[];
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
  maxDiscount?: number;
  usageLimit?: number;
  usageCount?: number;
  expiryDate?: string;
  description?: string;
  active: boolean;
}

export interface Offer {
  id: string;
  title: string;
  subtitle?: string;
  badge: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  description: string;
  validUntil: string;
  category?: string;
  bannerImage?: string;
  tagColor?: string;
  featured: boolean;
  active: boolean;
  terms?: string[];
  createdAt?: string;
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

export interface TrackingCheckpoint {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  estimatedDelivery?: string;
  dispatchedAt?: string;
  currentLocation?: string;
  status?: string;
  checkpoints: TrackingCheckpoint[];
}

export interface ShiprocketMetadata {
  orderId?: number;
  shipmentId?: number;
  awbCode?: string | null;
  courierCompanyId?: number | null;
  courierName?: string | null;
  labelUrl?: string | null;
  invoiceUrl?: string | null;
  syncedAt?: string;
  requiresRecharge?: boolean;
  rechargeNotice?: string | null;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string;
  paymentStatus?: 'Completed' | 'Pending' | 'Refunded' | 'Failed';
  paymentRef?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  tracking?: TrackingInfo;
  shiprocket?: ShiprocketMetadata;
  returnStatus?: 'None' | 'Requested' | 'Approved' | 'Pickup Scheduled' | 'Received & Inspected' | 'Refund Completed' | 'Rejected';
  createdAt: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  itemCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  subcategories?: SubCategory[];
  image?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery' | 'Wallet';
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  transactionRef: string;
  createdAt: string;
  refundedAmount?: number;
  refundReason?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: {
    productId: string;
    productTitle: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    image?: string;
  }[];
  reason: 'Size Mismatch' | 'Defective / Damaged' | 'Wrong Item Received' | 'Quality Not as Expected' | 'Change of Mind';
  notes?: string;
  status: 'Requested' | 'Approved' | 'Pickup Scheduled' | 'Received & Inspected' | 'Refund Completed' | 'Rejected';
  createdAt: string;
  refundAmount: number;
  pickupCarrier?: string;
  pickupTrackingNumber?: string;
  adminRemark?: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  badge: string;
  titleLine1: string;
  titleHighlight: string;
  subtext: string;
  featurePill: string;
  garmentName: string;
  garmentPrice: string;
  garmentTag: string;
  garmentSub: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  active?: boolean;
}

export interface SiteSettings {
  announcement: string;
  freeShippingThreshold: number;
  heroTitle: string;
  heroSubtext: string;
  heroImage: string;
  heroSlides?: HeroSlide[];
  storeEmail?: string;
  storePhone?: string;
  currency?: string;
  enableCod?: boolean;
  returnWindowDays?: number;
  shiprocketEmail?: string;
  shiprocketChannelId?: string;
  shiprocketPickupLocation?: string;
  autoPushToShiprocket?: boolean;
}

export interface ShiprocketCourierOption {
  id: number;
  name: string;
  estimatedDeliveryDays: string;
  rate: number;
  freightCharge: number;
  codAvailable: boolean;
  rating?: number;
  deliveryPerformance?: number;
  cutoffTime?: string;
}

export interface ShiprocketStatus {
  success: boolean;
  connected: boolean;
  email: string;
  companyName?: string;
  walletBalance?: number;
  channelId?: string;
  channelName?: string;
  defaultPickupLocation?: string;
  defaultPickupPincode?: string;
  pickupLocations?: Array<{
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    pin_code: string;
    phone: string;
    isPrimary: boolean;
  }>;
  error?: string;
}

export interface ShiprocketServiceabilityResponse {
  success: boolean;
  pickupPincode: string;
  deliveryPincode: string;
  availableCouriersCount: number;
  couriers: ShiprocketCourierOption[];
}


export interface WhatsAppMessage {
  id: string;
  sender: 'customer' | 'admin' | 'bot';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read' | 'unread';
  isAutomated?: boolean;
}

export interface WhatsAppConversation {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  avatar?: string;
  unreadCount: number;
  tier?: string;
  totalSpent?: string;
  lastOrderId?: string;
  lastActive: string;
  tags?: string[];
  messages: WhatsAppMessage[];
}

export interface WhatsAppAutomation {
  id: string;
  name: string;
  trigger: 'ORDER_PLACED' | 'ORDER_SHIPPED' | 'CART_ABANDONED' | 'ORDER_DELIVERED' | 'NEW_SIGNUP' | string;
  description: string;
  enabled: boolean;
  delayMinutes: number;
  sentCount: number;
  successRate: string;
  template: string;
}

export interface WhatsAppCampaign {
  id: string;
  name: string;
  audience: string;
  scheduledAt: string;
  status: 'Completed' | 'Scheduled' | 'Draft';
  delivered: number;
  read: number;
  replies: number;
  ctr: string;
}

export interface WhatsAppConfig {
  businessPhone: string;
  wabaId: string;
  phoneNumberId: string;
  metaAppStatus: string;
  webhookVerified: boolean;
  autoReplyEnabled: boolean;
  botName: string;
}

// ----------------------------------------------------------------------
// VENDOR PROCUREMENT & INWARD STOCK TYPES
// ----------------------------------------------------------------------
export interface Vendor {
  id: string;
  name: string;
  category: 'Fabric & Textiles' | 'Tailoring & Production' | 'Trims & Buttons' | 'Packaging & Boxes' | string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  gstin?: string;
  totalBilled: number;       // Total value of goods procured
  totalPaid: number;         // Total payment given to vendor
  pendingBalance: number;    // Remaining balance
  status: 'Active' | 'Paused' | 'Archived';
  rating?: number;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
}

export interface VendorInwardRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  poNumber: string;
  date: string;
  itemName: string;
  category: string;
  quantityReceived: number;
  unit: 'Meters' | 'Pieces' | 'Rolls' | 'Kg' | 'Units';
  ratePerUnit: number;
  totalAmount: number;
  status: 'Received & Inspected' | 'Quality Check Pending' | 'Partial Delivery' | 'Returned';
  challanNo?: string;
  warehouseLocation?: string;
  qcRemarks?: string;
  invoiceNo?: string;
}

export interface VendorPayoutRecord {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  date: string;
  paymentMode: 'Bank Transfer (NEFT/RTGS)' | 'UPI' | 'Cheque' | 'Credit Card' | string;
  transactionRef: string;
  invoiceRef?: string;
  status: 'Completed' | 'Processing' | 'Failed';
  notes?: string;
}

// ----------------------------------------------------------------------
// INFLUENCER & MARKETING SPEND TYPES
// ----------------------------------------------------------------------
export interface InfluencerCollab {
  id: string;
  name: string;
  handle: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok' | 'Pinterest' | string;
  avatar?: string;
  followers: string;
  niche: string;
  campaignName: string;
  deliverables: string;
  agreedFee: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'Paid in Full' | 'Partially Paid' | 'Payment Pending';
  paymentDate?: string;
  paymentRef?: string;
  couponCode?: string;
  salesGenerated: number;
  ordersCount: number;
  roas: string;
  status: 'Completed' | 'Content Pending' | 'Contract Signed';
}

export interface MarketingExpense {
  id: string;
  title: string;
  channel: 'Meta Ads (Instagram & FB)' | 'Google Ads (Search & Shopping)' | 'Influencer Collaborations' | 'PR & Lookbook Photoshoot' | 'WhatsApp Campaigns' | 'Brand Events' | string;
  period: string;
  date: string;
  amount: number;
  attributedRevenue?: number;
  roas?: string;
  status: 'Active' | 'Completed' | 'Scheduled';
  notes?: string;
  receiptRef?: string;
}

export interface MarketingSummary {
  totalMarketingSpend: number;
  totalInfluencerPaid: number;
  totalAdSpend: number;
  totalPRAndShoots: number;
  totalAttributedRevenue: number;
  overallROAS: string;
  topChannels: { channel: string; spend: number; revenue: number; roas: string }[];
}

// ----------------------------------------------------------------------
// AI STYLIST & VIRTUAL TRY-ON TYPES
// ----------------------------------------------------------------------
export interface AIStylistRecommendation {
  query: string;
  stylistAdvice: string;
  fitAdvice: string;
  colorPalette: { name: string; hex: string }[];
  dressCodeScore: number;
  occasion: string;
  recommendedProducts: Product[];
  styleTips: string[];
}

export interface AITryOnResult {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  generatedTryOnImage?: string;
  userImage: string;
  selectedColor: string;
  selectedSize: string;
  fitScore: number;
  matchVerdict: string;
  silhouetteAnalysis: string;
  colorHarmony: string;
  recommendedSize: string;
  stylingTips: string[];
  recommendedPairings: Product[];
}

