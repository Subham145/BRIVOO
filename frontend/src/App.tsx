import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, Order, Category, Coupon, Offer, SiteSettings, User } from './types';
import { api } from './services/api';
import { initializeMetaPixel, trackMetaEvent, trackMetaPageView, trackMetaPurchase } from './services/metaPixel';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCollection } from './components/FeaturedCollection';
import { CategoryShowcase } from './components/CategoryShowcase';
import { OccasionShowcase } from './components/OccasionShowcase';
import { WhyChooseUs } from './components/WhyChooseUs';
import { NewsletterSection } from './components/NewsletterSection';
import { OffersBanner } from './components/OffersBanner';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';

// Lazy-loaded modals for optimal initial load
const CheckoutModal = React.lazy(() => import('./components/CheckoutModal').then(m => ({ default: m.CheckoutModal })));
const OrderConfirmationModal = React.lazy(() => import('./components/OrderConfirmationModal').then(m => ({ default: m.OrderConfirmationModal })));
const AuthModal = React.lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const AIStylistModal = React.lazy(() => import('./components/AIStylistModal').then(m => ({ default: m.AIStylistModal })));

// Lazy-loaded secondary pages for route-based code-splitting
const ShopPage = React.lazy(() => import('./pages/ShopPage').then(m => ({ default: m.ShopPage })));
const WomenCollectionPage = React.lazy(() => import('./pages/WomenCollectionPage').then(m => ({ default: m.WomenCollectionPage })));
const CartPage = React.lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const SearchResultsPage = React.lazy(() => import('./pages/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));
const AccountPage = React.lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const OffersPage = React.lazy(() => import('./pages/OffersPage').then(m => ({ default: m.OffersPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = React.lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
const ShippingPolicyPage = React.lazy(() => import('./pages/ShippingPolicyPage').then(m => ({ default: m.ShippingPolicyPage })));
const ReturnPolicyPage = React.lazy(() => import('./pages/ReturnPolicyPage').then(m => ({ default: m.ReturnPolicyPage })));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = React.lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));

const PageFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 px-4 bg-[#FBF6F0]">
    <div className="w-8 h-8 border-2 border-[#781C35] border-t-transparent rounded-full animate-spin mb-3" />
    <span className="font-serif text-xs tracking-widest text-[#781C35] uppercase font-semibold">Loading...</span>
  </div>
);

// Admin Pages & Auth (lazy-loaded)
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminTracking = React.lazy(() => import('./pages/admin/AdminTracking').then(m => ({ default: m.AdminTracking })));
const AdminCategories = React.lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminCoupons = React.lazy(() => import('./pages/admin/AdminCoupons').then(m => ({ default: m.AdminCoupons })));
const AdminOffers = React.lazy(() => import('./pages/admin/AdminOffers').then(m => ({ default: m.AdminOffers })));
const AdminPayments = React.lazy(() => import('./pages/admin/AdminPayments').then(m => ({ default: m.AdminPayments })));
const AdminReturns = React.lazy(() => import('./pages/admin/AdminReturns').then(m => ({ default: m.AdminReturns })));
const AdminCustomers = React.lazy(() => import('./pages/admin/AdminCustomers').then(m => ({ default: m.AdminCustomers })));
const AdminReviews = React.lazy(() => import('./pages/admin/AdminReviews').then(m => ({ default: m.AdminReviews })));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminWhatsAppCRM = React.lazy(() => import('./pages/admin/AdminWhatsAppCRM').then(m => ({ default: m.AdminWhatsAppCRM })));
const AdminVendors = React.lazy(() => import('./pages/admin/AdminVendors').then(m => ({ default: m.AdminVendors })));
const AdminMarketing = React.lazy(() => import('./pages/admin/AdminMarketing').then(m => ({ default: m.AdminMarketing })));
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));

export function App() {
  // Store Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('brivoo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('brivoo_token'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string>('');

  // App UI Navigation States
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('brivoo_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u && u.role === 'admin';
      }
    } catch {}
    return false;
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (path === '/admin' || hash === '#admin' || search.includes('tab=admin')) return 'admin';
      if (path === '/account' || hash === '#account') return 'account';
      if (path === '/tracking' || hash === '#tracking') return 'tracking';
      if (path === '/wishlist' || hash === '#wishlist') return 'wishlist';
      if (path === '/cart' || hash === '#cart') return 'cart';
      if (path === '/offers' || hash === '#offers') return 'offers';
      if (path === '/about' || hash === '#about') return 'about';
      if (path === '/contact' || hash === '#contact') return 'contact';
      if (path === '/faq' || hash === '#faq') return 'faq';
      if (path === '/shipping-policy' || hash === '#shipping-policy') return 'shipping-policy';
      if (path === '/return-policy' || hash === '#return-policy') return 'return-policy';
      if (path === '/privacy-policy' || hash === '#privacy-policy') return 'privacy-policy';
      if (path === '/terms' || hash === '#terms') return 'terms';
      if (path === '/women' || hash === '#women') return 'women';
      if (path === '/men' || hash === '#men') return 'men';
      if (path === '/collections' || hash === '#collections') return 'collections';
      if (path === '/new-arrivals' || hash === '#new-arrivals') return 'new-arrivals';
      if (path === '/search' || hash === '#search') return 'search';
      if (path === '/shop' || hash === '#shop') return 'shop-all';
    }

    try {
      const saved = localStorage.getItem('brivoo_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.role === 'admin') return 'admin';
      }
    } catch {}
    return 'home';
  });

  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Cart & Wishlist States
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('brivoo_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('brivoo_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync cart & wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('brivoo_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('brivoo_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Modals visibility
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [trackOrderId, setTrackOrderId] = useState<string>('');
  const [metaConsent, setMetaConsent] = useState<'accepted' | 'rejected' | null>(() => {
    const saved = localStorage.getItem('brivoo_meta_pixel_consent');
    return saved === 'accepted' || saved === 'rejected' ? saved : null;
  });
  const lastViewedProductRef = useRef<string | null>(null);

  // AI Stylist Modal States
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiModalProduct, setAiModalProduct] = useState<Product | null>(null);
  const [aiModalMode, setAiModalMode] = useState<'ask' | 'tryon'>('ask');

  // Add Product Quick Launch from Admin Dashboard
  const [openAddProductModal, setOpenAddProductModal] = useState<boolean>(false);

  // Refresh all store data (called on admin mutation or user action)
  const fetchAllData = async () => {
    try {
      const [prodRes, catRes, coupRes, offRes, setRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getCoupons(),
        api.getOffers(),
        api.getSettings()
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (coupRes.success) setCoupons(coupRes.data);
      if (offRes && offRes.success) setOffers(offRes.data);
      if (setRes.success) setSettings(setRes.data);

      if (currentUser) {
        const ordRes = await api.getOrders();
        if (ordRes.success) setOrders(ordRes.data);
      } else {
        setOrders([]);
      }

      if (isAdmin) {
        const anaRes = await api.getAnalytics();
        if (anaRes.success) setAnalytics(anaRes.data);
      }
    } catch (err) {
      console.error('Error connecting to BRIVOO backend:', err);
    }
  };

  // 1. Initial public store catalog load (runs once on mount)
  useEffect(() => {
    let isMounted = true;
    const loadInitialCatalog = async () => {
      try {
        const [prodRes, catRes, coupRes, offRes, setRes] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getCoupons(),
          api.getOffers(),
          api.getSettings()
        ]);
        if (!isMounted) return;
        if (prodRes.success) setProducts(prodRes.data);
        if (catRes.success) setCategories(catRes.data);
        if (coupRes.success) setCoupons(coupRes.data);
        if (offRes && offRes.success) setOffers(offRes.data);
        if (setRes.success) setSettings(setRes.data);
      } catch (err) {
        console.error('Error loading initial catalog:', err);
      }
    };
    loadInitialCatalog();
    return () => { isMounted = false; };
  }, []);

  // 2. Auth-dependent data (orders, analytics) - runs when auth changes
  useEffect(() => {
    let isMounted = true;
    const loadUserData = async () => {
      if (currentUser) {
        try {
          const ordRes = await api.getOrders();
          if (isMounted && ordRes.success) setOrders(ordRes.data);
        } catch (err) {
          console.error('Error fetching orders:', err);
        }
      } else {
        if (isMounted) setOrders([]);
      }

      if (isAdmin) {
        try {
          const anaRes = await api.getAnalytics();
          if (isMounted && anaRes.success) setAnalytics(anaRes.data);
        } catch (err) {
          console.error('Error fetching analytics:', err);
        }
      }
    };
    loadUserData();
    return () => { isMounted = false; };
  }, [currentUser, isAdmin]);

  useEffect(() => {
    const handleAuthCleared = () => {
      setCurrentUser(null);
      setAuthToken(null);
      setOrders([]);
      setAnalytics(null);
      setIsAdmin(false);
    };

    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (path === '/admin' || hash === '#admin' || search.includes('tab=admin')) setActiveTab('admin');
      else if (path === '/account' || hash === '#account') setActiveTab('account');
      else if (path === '/tracking' || hash === '#tracking') setActiveTab('tracking');
      else if (path === '/wishlist' || hash === '#wishlist') setActiveTab('wishlist');
      else if (path === '/cart' || hash === '#cart') setActiveTab('cart');
      else if (path === '/offers' || hash === '#offers') setActiveTab('offers');
      else if (path === '/about' || hash === '#about') setActiveTab('about');
      else if (path === '/contact' || hash === '#contact') setActiveTab('contact');
      else if (path === '/faq' || hash === '#faq') setActiveTab('faq');
      else if (path === '/shipping-policy' || hash === '#shipping-policy') setActiveTab('shipping-policy');
      else if (path === '/return-policy' || hash === '#return-policy') setActiveTab('return-policy');
      else if (path === '/privacy-policy' || hash === '#privacy-policy') setActiveTab('privacy-policy');
      else if (path === '/terms' || hash === '#terms') setActiveTab('terms');
      else if (path === '/women' || hash === '#women') setActiveTab('women');
      else if (path === '/men' || hash === '#men') setActiveTab('men');
      else if (path === '/collections' || hash === '#collections') setActiveTab('collections');
      else if (path === '/new-arrivals' || hash === '#new-arrivals') setActiveTab('new-arrivals');
      else if (path === '/search' || hash === '#search') setActiveTab('search');
      else if (path === '/shop' || hash === '#shop') setActiveTab('shop-all');
      else if (path === '/' || hash === '') setActiveTab('home');
    };

    window.addEventListener('brivoo_auth_cleared', handleAuthCleared);
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('brivoo_auth_cleared', handleAuthCleared);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    const routes: Record<string, string> = {
      home: '/',
      women: '/women',
      men: '/men',
      'shop-all': '/shop',
      collections: '/collections',
      'new-arrivals': '/new-arrivals',
      offers: '/offers',
      about: '/about',
      contact: '/contact',
      faq: '/faq',
      'shipping-policy': '/shipping-policy',
      'return-policy': '/return-policy',
      'privacy-policy': '/privacy-policy',
      terms: '/terms',
      account: '/account',
      tracking: '/tracking',
      wishlist: '/wishlist',
      cart: '/cart',
      search: '/search',
      admin: '/admin'
    };

    const target = routes[activeTab];
    if (target && window.location.pathname !== target) {
      window.history.pushState(null, '', target);
    }
  }, [activeTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);

  useEffect(() => {
    if (metaConsent === 'accepted') initializeMetaPixel();
  }, [metaConsent]);

  useEffect(() => {
    if (metaConsent === 'accepted' && !isAdmin) trackMetaPageView(activeTab);
  }, [activeTab, metaConsent, isAdmin]);

  useEffect(() => {
    if (!selectedProduct) {
      lastViewedProductRef.current = null;
      return;
    }
    if (metaConsent !== 'accepted' || lastViewedProductRef.current === selectedProduct.id) return;

    lastViewedProductRef.current = selectedProduct.id;
    trackMetaEvent('ViewContent', {
      content_ids: [selectedProduct.id],
      content_name: selectedProduct.title,
      content_type: 'product',
      value: Number(selectedProduct.price),
      currency: 'INR'
    });
  }, [selectedProduct, metaConsent]);

  // Auth Handlers
  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('brivoo_user', JSON.stringify(user));
    localStorage.setItem('brivoo_token', token);
    setIsAuthModalOpen(false);
    setOrders([]);

    if (user.role === 'admin') {
      setIsAdmin(true);
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('brivoo_user');
    localStorage.removeItem('brivoo_token');
    setIsAdmin(false);
    setOrders([]);
    setAnalytics(null);
    setActiveTab('home');
  };

  // Cart Actions (Smooth, Guest-Friendly)
  const handleAddToCart = (product: Product, color: string, size: string, quantity: number = 1) => {
    const existingIndex = cartItems.findIndex(
      item => item.product.id === product.id && item.selectedColor === color && item.selectedSize === size
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${color}-${size}-${Date.now()}`,
        product,
        selectedColor: color,
        selectedSize: size,
        quantity
      };
      setCartItems([...cartItems, newItem]);
    }
    trackMetaEvent('AddToCart', {
      content_ids: [product.id],
      contents: [{ id: product.id, quantity }],
      content_name: product.title,
      content_type: 'product',
      value: Number(product.price) * quantity,
      currency: 'INR'
    });
    setIsCartOpen(true);
    if (selectedProduct) setSelectedProduct(null);
  };

  const handleBuyNow = (product: Product, color: string, size: string, quantity: number = 1) => {
    handleAddToCart(product, color, size, quantity);
    setIsCartOpen(false);
    trackMetaEvent('InitiateCheckout', {
      content_ids: [product.id],
      contents: [{ id: product.id, quantity }],
      content_type: 'product',
      value: Number(product.price) * quantity,
      currency: 'INR'
    });
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems(cartItems.filter(item => item.id !== cartItemId));
    } else {
      setCartItems(cartItems.map(item => item.id === cartItemId ? { ...item, quantity: newQty } : item));
    }
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== cartItemId));
  };

  // Wishlist Action (Guest & User Synced)
  const handleToggleWishlist = (product: Product) => {
    let next: string[];
    if (wishlistIds.includes(product.id)) {
      next = wishlistIds.filter(id => id !== product.id);
    } else {
      next = [...wishlistIds, product.id];
    }
    setWishlistIds(next);
  };

  // Checkout & Order Placement
  const handleProceedToCheckout = (discount: number, code: string) => {
    setAppliedDiscount(discount);
    setAppliedCouponCode(code);
    setIsCartOpen(false);
    trackMetaEvent('InitiateCheckout', {
      content_ids: cartItems.map(item => item.product.id),
      contents: cartItems.map(item => ({ id: item.product.id, quantity: item.quantity })),
      content_type: 'product',
      value: Math.max(0, cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0) - discount),
      currency: 'INR'
    });
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    trackMetaPurchase(newOrder);
    setIsCheckoutOpen(false);
    setCartItems([]);
    setConfirmedOrder(newOrder);
    fetchAllData();
  };

  const totalCartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  // DEDICATED FULL-SCREEN LUXURY ADMIN SUITE
  if (activeTab === 'admin') {
    if (!currentUser || currentUser.role !== 'admin') {
      return (
        <React.Suspense fallback={<div className="min-h-screen bg-[#FBF6F0] flex items-center justify-center text-stone-600">Loading Admin...</div>}>
          <div className="min-h-screen bg-[#FBF6F0] flex items-center justify-center p-4">
            <AdminLogin
              onAdminLoginSuccess={handleLoginSuccess}
              onCancel={() => {
                setIsAdmin(false);
                setActiveTab('home');
              }}
            />
          </div>
        </React.Suspense>
      );
    }

    return (
      <React.Suspense fallback={<div className="min-h-screen bg-[#FBF6F0] flex items-center justify-center text-stone-600">Loading Admin...</div>}>
        <AdminLayout
          currentUser={currentUser}
          activeTab={adminTab}
          onSelectTab={setAdminTab}
          onExitToStore={() => {
            setIsAdmin(false);
            setActiveTab('home');
          }}
          onLogout={handleLogout}
          orders={orders}
          products={products}
          analytics={analytics}
          onAddNewProduct={() => {
            setAdminTab('products');
            setOpenAddProductModal(true);
          }}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboard
              analytics={analytics}
              orders={orders}
              products={products}
              onNavigateTab={setAdminTab}
              onAddNewProduct={() => {
                setAdminTab('products');
                setOpenAddProductModal(true);
              }}
            />
          )}

          {adminTab === 'orders' && (
            <AdminOrders
              orders={orders}
              onRefresh={fetchAllData}
              onNavigateToTracking={() => setAdminTab('tracking')}
            />
          )}

          {adminTab === 'tracking' && (
            <AdminTracking
              orders={orders}
              onRefresh={fetchAllData}
            />
          )}

          {adminTab === 'categories' && (
            <AdminCategories
              categories={categories}
              onRefresh={fetchAllData}
            />
          )}

          {adminTab === 'coupons' && (
            <AdminCoupons
              coupons={coupons}
              onRefresh={fetchAllData}
            />
          )}

          {adminTab === 'offers' && (
            <AdminOffers
              offers={offers}
              onRefresh={fetchAllData}
            />
          )}

          {adminTab === 'payments' && (
            <AdminPayments
              orders={orders}
              onRefresh={fetchAllData}
              onNavigateToPricing={() => setAdminTab('pricing')}
            />
          )}

          {adminTab === 'returns' && (
            <AdminReturns
              orders={orders}
              onRefresh={fetchAllData}
            />
          )}

          {adminTab === 'products' && (
            <AdminProducts
              products={products}
              categories={categories}
              onRefresh={fetchAllData}
              openAddModalInitially={openAddProductModal}
            />
          )}

          {adminTab === 'vendors' && (
            <AdminVendors />
          )}

          {adminTab === 'marketing' && (
            <AdminMarketing />
          )}

          {adminTab === 'customers' && (
            <AdminCustomers
              orders={orders}
              onRefresh={fetchAllData}
            />
          )}

          {adminTab === 'reviews' && (
            <AdminReviews />
          )}

          {adminTab === 'whatsapp' && (
            <AdminWhatsAppCRM
              orders={orders}
              onRefreshOrders={fetchAllData}
            />
          )}

          {(adminTab === 'settings' || adminTab === 'pricing') && (
            <AdminSettings
              settings={settings!}
              onRefresh={fetchAllData}
              initialTab={adminTab === 'pricing' ? 'pricing' : undefined}
            />
          )}
        </AdminLayout>
      </React.Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6F0] text-[#211A18] flex flex-col justify-between font-sans">
      
      {/* 1. Global Header Navigation matching Reference Image */}
      <Header
        settings={settings!}
        currentUser={currentUser}
        onOpenAuthModal={() => {
          setAuthPromptMessage("Sign In to Your BRIVOO Account");
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        cartCount={totalCartItemsCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setActiveTab('wishlist')}
        onOpenAccount={() => {
          if (currentUser) setActiveTab('account');
          else {
            setAuthPromptMessage("Sign in to view your orders and profile!");
            setIsAuthModalOpen(true);
          }
        }}
        onOpenAdmin={() => {
          if (isAdmin) {
            setIsAdmin(false);
            setActiveTab('home');
          } else {
            setActiveTab('admin');
          }
        }}
        isAdmin={isAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        products={products}
        categories={categories}
        onSelectCategory={(catName) => {
          setSelectedCategoryFilter(catName);
          setActiveTab('shop-all');
        }}
        onOpenProductDetail={setSelectedProduct}
      />

      {/* 2. Main Body Router Views */}
      <main className="flex-grow">
        <React.Suspense fallback={<PageFallback />}>
        {/* PAGE 1: HOMEPAGE matching Reference Image */}
        {activeTab === 'home' && !isAdmin && (
          <>
            <Hero
              settings={settings!}
              onShopCollection={() => {
                setActiveTab('women');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              onExploreNewArrivals={() => {
                setActiveTab('new-arrivals');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />

            <CategoryShowcase
              categories={categories}
              onSelectCategory={(catName) => {
                setSelectedCategoryFilter(catName);
                setActiveTab('shop-all');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />

            <OccasionShowcase
              onSelectOccasion={(occCategory) => {
                setSelectedCategoryFilter(occCategory);
                setActiveTab('shop-all');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />

            <FeaturedCollection
              title="Best Sellers"
              subtitle="Our most beloved ethnic wear pieces, praised for fabric quality and flattering fits"
              tag="Customer Favorites"
              products={products}
              onQuickAdd={handleAddToCart}
              onOpenModal={setSelectedProduct}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              onViewAll={() => {
                setSelectedCategoryFilter('All');
                setActiveTab('shop-all');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />

            <OffersBanner
              offers={offers}
              onViewAllOffers={() => setActiveTab('offers')}
              onShopCategory={() => {
                setSelectedCategoryFilter('All');
                setActiveTab('shop-all');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />

            <FeaturedCollection
              title="New Arrivals"
              subtitle="Fresh seasonal drops, graceful festive cuts, and breezy casual kurtis"
              tag="Just Launched"
              products={[...products].reverse()}
              onQuickAdd={handleAddToCart}
              onOpenModal={setSelectedProduct}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              onViewAll={() => {
                setSelectedCategoryFilter('All');
                setActiveTab('new-arrivals');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />

            <WhyChooseUs />

            <NewsletterSection />
          </>
        )}

        {/* PAGE 2: WOMEN'S COLLECTION LANDING PAGE matching Reference Image */}
        {activeTab === 'women' && !isAdmin && (
          <WomenCollectionPage
            products={products}
            onSelectCategory={(catName) => {
              setSelectedCategoryFilter(catName);
              setActiveTab('shop-all');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            onQuickAdd={handleAddToCart}
            onOpenModal={setSelectedProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        {/* PAGE 3: SHOP / PRODUCT LISTING matching Reference Image */}
        {(activeTab === 'shop-all' || activeTab === 'men' || activeTab === 'collections' || activeTab === 'new-arrivals') && !isAdmin && (
          <ShopPage
            products={products}
            categories={categories}
            onQuickAdd={handleAddToCart}
            onOpenModal={setSelectedProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            initialGender={activeTab === 'men' ? 'Men' : 'Women'}
            initialCategory={activeTab === 'new-arrivals' ? 'All' : selectedCategoryFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onNavigateHome={() => setActiveTab('home')}
            onNavigateWomen={() => setActiveTab('women')}
          />
        )}

        {/* PAGE 5: DEDICATED CART PAGE matching Reference Image */}
        {activeTab === 'cart' && !isAdmin && (
          <CartPage
            items={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onProceedToCheckout={handleProceedToCheckout}
            onContinueShopping={() => setActiveTab('shop-all')}
            settings={settings || undefined}
          />
        )}

        {/* PAGE 8, 9, 10, 11: MY ACCOUNT, ORDERS, TRACKING, WISHLIST matching Reference Image */}
        {(activeTab === 'account' || activeTab === 'tracking' || activeTab === 'wishlist') && !isAdmin && (
          <AccountPage
            currentUser={currentUser}
            orders={orders}
            wishlistProducts={wishlistProducts}
            onQuickAdd={handleAddToCart}
            onOpenModal={setSelectedProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            initialTrackOrderId={trackOrderId}
            initialTab={activeTab === 'tracking' ? 'track' : activeTab === 'wishlist' ? 'wishlist' : 'orders'}
            onLogout={handleLogout}
            onContinueShopping={() => setActiveTab('shop-all')}
          />
        )}

        {/* PAGE 12: ABOUT US matching Reference Image */}
        {activeTab === 'about' && !isAdmin && (
          <AboutPage
            onShopMen={() => setActiveTab('men')}
            onShopWomen={() => setActiveTab('women')}
            onShopAll={() => setActiveTab('shop-all')}
          />
        )}

        {/* PAGE 13: CONTACT US matching Reference Image */}
        {activeTab === 'contact' && !isAdmin && (
          <ContactPage />
        )}

        {/* PAGE 14: FAQ matching Reference Image */}
        {activeTab === 'faq' && !isAdmin && (
          <FAQPage />
        )}

        {/* PAGE 15: SHIPPING POLICY matching Reference Image */}
        {activeTab === 'shipping-policy' && !isAdmin && (
          <ShippingPolicyPage />
        )}

        {/* PAGE 16: RETURN & EXCHANGE POLICY matching Reference Image */}
        {activeTab === 'return-policy' && !isAdmin && (
          <ReturnPolicyPage />
        )}

        {/* PAGE 17: PRIVACY POLICY */}
        {activeTab === 'privacy-policy' && !isAdmin && (
          <PrivacyPolicyPage />
        )}

        {/* PAGE 18: TERMS & CONDITIONS */}
        {activeTab === 'terms' && !isAdmin && (
          <TermsPage />
        )}

        {/* PAGE 19: SEARCH RESULTS */}
        {activeTab === 'search' && !isAdmin && (
          <SearchResultsPage
            products={products}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onQuickAdd={handleAddToCart}
            onOpenModal={setSelectedProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
          />
        )}

        {/* PAGE 20: OFFERS & SALE PAGE */}
        {activeTab === 'offers' && !isAdmin && (
          <OffersPage
            offers={offers}
            onShopCategory={(category) => {
              setSelectedCategoryFilter(category || 'All');
              setActiveTab('shop-all');
            }}
            onApplyCouponToCart={(code) => {
              setAppliedCouponCode(code);
            }}
          />
        )}
        </React.Suspense>
      </main>

      {/* 3. Global Footer matching Reference Image */}
      <Footer
        onCategoryClick={(cat) => {
          setSelectedCategoryFilter(cat);
          setActiveTab('shop-all');
        }}
        onTrackOrderClick={() => setActiveTab('tracking')}
        onAboutClick={() => setActiveTab('about')}
        onNavigateTab={setActiveTab}
      />

      {/* Global Authentication Modal */}
      {isAuthModalOpen && (
        <React.Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            promptMessage={authPromptMessage}
          />
        </React.Suspense>
      )}

      {/* PAGE 4: Global Product Detail Modal / View matching Reference Image */}
      {selectedProduct && (
        <ProductModal
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlistIds.includes(selectedProduct.id)}
          onReviewSubmitted={fetchAllData}
          onOpenAITryOn={(prod) => {
            setAiModalProduct(prod);
            setAiModalMode('tryon');
            setIsAIModalOpen(true);
          }}
        />
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
        freeShippingThreshold={settings?.freeShippingThreshold || 999}
        settings={settings || undefined}
        onViewCartPage={() => setActiveTab('cart')}
      />

      {/* PAGE 6: Multi-step Checkout Modal matching Reference Image */}
      {isCheckoutOpen && (
        <React.Suspense fallback={null}>
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            items={cartItems}
            appliedDiscount={appliedDiscount}
            couponCode={appliedCouponCode}
            settings={settings}
            metaConsent={metaConsent === 'accepted'}
            onOrderSuccess={handleOrderSuccess}
          />
        </React.Suspense>
      )}

      {/* PAGE 7: Order Confirmation Receipt Modal matching Reference Image */}
      {confirmedOrder && (
        <React.Suspense fallback={null}>
          <OrderConfirmationModal
            order={confirmedOrder}
            onClose={() => setConfirmedOrder(null)}
            onTrackOrder={(id) => {
              setTrackOrderId(id);
              setActiveTab('tracking');
            }}
          />
        </React.Suspense>
      )}

      {/* Global AI Fashion Stylist & Try-On Modal */}
      {isAIModalOpen && (
        <React.Suspense fallback={<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 text-white">Loading AI Stylist...</div>}>
          <AIStylistModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
            products={products}
            initialProduct={aiModalProduct}
            initialMode={aiModalMode}
            onAddToCart={handleAddToCart}
            onOpenProductDetail={(prod) => {
              setSelectedProduct(prod);
              setIsAIModalOpen(false);
            }}
          />
        </React.Suspense>
      )}

      {/* Meta Pixel & Cookie Consent Banner */}
      {metaConsent === null && (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-2xl rounded-2xl border border-[#E9DED5] bg-white p-4 shadow-2xl"
        >
          <p className="mb-3 text-xs text-[#746963]">
            We use Meta Pixel to understand site activity and improve our customer services. You can accept or decline this optional analytics tracking.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl border border-[#E9DED5] px-4 py-2 text-xs font-semibold text-[#746963] hover:bg-stone-50"
              onClick={() => {
                localStorage.setItem('brivoo_meta_pixel_consent', 'rejected');
                setMetaConsent('rejected');
              }}
            >
              Decline
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#781C35] hover:bg-[#541326] px-4 py-2 text-xs font-bold text-white transition-colors"
              onClick={() => {
                localStorage.setItem('brivoo_meta_pixel_consent', 'accepted');
                setMetaConsent('accepted');
              }}
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
