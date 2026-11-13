import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, Order, Category, Coupon, Offer, SiteSettings, User } from './types';
import { api } from './services/api';
import { initializeMetaPixel, trackMetaEvent, trackMetaPageView, trackMetaPurchase } from './services/metaPixel';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCollection } from './components/FeaturedCollection';
import { CategoryShowcase } from './components/CategoryShowcase';
import { OffersBanner } from './components/OffersBanner';
import { ArtisanStory } from './components/ArtisanStory';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AuthModal } from './components/AuthModal';
const AIStylistModal = React.lazy(() => import('./components/AIStylistModal').then(m => ({ default: m.AIStylistModal })));
import { Footer } from './components/Footer';
import { ShopPage } from './pages/ShopPage';
import { AccountPage } from './pages/AccountPage';
import { OffersPage } from './pages/OffersPage';
import { AboutPage } from './pages/AboutPage';

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
    const saved = localStorage.getItem('brivoo_user');
    return saved ? JSON.parse(saved) : null;
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
    } catch (e) {}
    return false;
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('brivoo_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.role === 'admin') return 'admin';
      }
    } catch (e) {}
    return 'home';
  });
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Cart & Wishlist States
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod-1']);

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

  // AI Stylist & Virtual Try-On Modal States
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiModalProduct, setAiModalProduct] = useState<Product | null>(null);
  const [aiModalMode, setAiModalMode] = useState<'ask' | 'tryon'>('ask');

  // Add Product Quick Launch from Admin Dashboard
  const [openAddProductModal, setOpenAddProductModal] = useState<boolean>(false);

  // Load all initial store data from backend
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

  useEffect(() => {
    fetchAllData();
  }, [currentUser, isAdmin]);

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

  // Customer Shopping Action Gate helper
  const requireAuthForAction = (actionCallback: () => void, customPrompt?: string) => {
    if (!currentUser) {
      setAuthPromptMessage(customPrompt || "Please Sign In or Create an Account to continue shopping!");
      setIsAuthModalOpen(true);
      return;
    }
    actionCallback();
  };

  // Cart Actions (Gated)
  const handleAddToCart = (product: Product, color: string, size: string, quantity: number = 1) => {
    requireAuthForAction(() => {
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
    }, "Sign in to add items to your shopping cart!");
  };

  const handleBuyNow = (product: Product, color: string, size: string, quantity: number = 1) => {
    requireAuthForAction(() => {
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
    }, "Sign in to complete instant checkout!");
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

  // Wishlist Action (Gated)
  const handleToggleWishlist = (product: Product) => {
    requireAuthForAction(() => {
      if (wishlistIds.includes(product.id)) {
        setWishlistIds(wishlistIds.filter(id => id !== product.id));
      } else {
        setWishlistIds([...wishlistIds, product.id]);
      }
    }, "Sign in to save products to your personal wishlist!");
  };

  // Checkout & Order Placement
  const handleProceedToCheckout = (discount: number, code: string) => {
    requireAuthForAction(() => {
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
    }, "Sign in to proceed to secure checkout!");
  };

  const handleOrderSuccess = (newOrder: Order) => {
    trackMetaPurchase(newOrder);
    setIsCheckoutOpen(false);
    setCartItems([]);
    setConfirmedOrder(newOrder);
    fetchAllData();
  };

  const totalCartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  // DEDICATED FULL-SCREEN LUXURY ADMIN SUITE
  if (activeTab === 'admin') {
    if (!currentUser || currentUser.role !== 'admin') {
      return (
        <React.Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-gray-600">Loading Admin...</div>}>
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
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
      <React.Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-gray-600">Loading Admin...</div>}>
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
            onNavigateToPricing={() => setAdminTab('settings')}
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

        {adminTab === 'settings' && (
          <AdminSettings
            settings={settings!}
            onRefresh={fetchAllData}
          />
        )}
      </AdminLayout>
      </React.Suspense>
    );
  }

  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] flex flex-col justify-between font-sans">
      
      {/* Top Header Nav */}
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
        onOpenWishlist={() => requireAuthForAction(() => setActiveTab('account'), "Sign in to view your wishlist!")}
        onOpenAccount={() => requireAuthForAction(() => setActiveTab('account'), "Sign in to view your profile & orders!")}
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
        onOpenAIStylist={(mode) => {
          setAiModalMode(mode || 'ask');
          setAiModalProduct(selectedProduct || products[0] || null);
          setIsAIModalOpen(true);
        }}
      />

      {/* Main Body Router Views */}
      <main className="flex-grow">
        
        {/* CUSTOMER VIEW - HOME */}
        {activeTab === 'home' && !isAdmin && (
          <>
            <Hero
              settings={settings!}
              onShopMen={() => setActiveTab('men')}
              onShopWomen={() => setActiveTab('women')}
            />
            <CategoryShowcase
              categories={categories}
              onSelectCategory={(catName) => {
                setSelectedCategoryFilter(catName);
                setActiveTab('shop-all');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />
            <OffersBanner
              offers={offers}
              onViewAllOffers={() => setActiveTab('offers')}
              onShopCategory={(cat) => {
                setSelectedCategoryFilter('All');
                setActiveTab('shop-all');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />
            <FeaturedCollection
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
            <ArtisanStory
              onLearnMore={() => {
                setActiveTab('about');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              onShopAll={() => {
                setSelectedCategoryFilter('All');
                setActiveTab('shop-all');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
            />
          </>
        )}

        {/* CUSTOMER VIEW - OFFERS & PROMOTIONAL PRIVILEGES */}
        {activeTab === 'offers' && !isAdmin && (
          <OffersPage
            offers={offers}
            onShopCategory={(category) => {
              if (category === 'Shirts' || category === 'Polos' || category === 'Vests' || category === 'Trousers') {
                setActiveTab('shop-all');
              } else if (category === 'Men') {
                setActiveTab('men');
              } else if (category === 'Women') {
                setActiveTab('women');
              } else {
                setActiveTab('shop-all');
              }
            }}
            onApplyCouponToCart={(code) => {
              setAppliedCouponCode(code);
            }}
          />
        )}

        {/* CUSTOMER VIEW - ABOUT US */}
        {activeTab === 'about' && !isAdmin && (
          <AboutPage
            onShopMen={() => setActiveTab('men')}
            onShopWomen={() => setActiveTab('women')}
            onShopAll={() => setActiveTab('shop-all')}
          />
        )}

        {/* CUSTOMER VIEW - CATALOG SHOP / MEN / WOMEN / COLLECTIONS */}
        {(activeTab === 'shop-all' || activeTab === 'men' || activeTab === 'women' || activeTab === 'collections') && !isAdmin && (
          <ShopPage
            products={products}
            categories={categories}
            onQuickAdd={handleAddToCart}
            onOpenModal={setSelectedProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            initialGender={activeTab === 'men' ? 'Men' : activeTab === 'women' ? 'Women' : 'All'}
            initialCategory={selectedCategoryFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* CUSTOMER VIEW - ACCOUNT & ORDERS */}
        {activeTab === 'account' && !isAdmin && (
          <AccountPage
            orders={orders}
            wishlistProducts={wishlistProducts}
            onQuickAdd={handleAddToCart}
            onOpenModal={setSelectedProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            initialTrackOrderId={trackOrderId}
          />
        )}



      </main>

      {/* Footer */}
      <Footer
        onCategoryClick={(cat) => {
          if (cat === 'men') setActiveTab('men');
          else if (cat === 'women') setActiveTab('women');
          else setActiveTab('shop-all');
        }}
        onTrackOrderClick={() => requireAuthForAction(() => setActiveTab('account'), "Sign in to track your orders!")}
        onAboutClick={() => {
          setActiveTab('about');
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
      />

      {/* Global Authentication Modal (Customer Login / Signup / Google Auth / Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        promptMessage={authPromptMessage}
      />

      {/* Global Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onReviewSubmitted={fetchAllData}
        onOpenAITryOn={(prod) => {
          setAiModalProduct(prod);
          setAiModalMode('tryon');
          setIsAIModalOpen(true);
        }}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
        freeShippingThreshold={settings?.freeShippingThreshold || 1999}
      />

      {/* Multi-step Checkout Modal */}
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

      {/* Order Confirmation Receipt Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onTrackOrder={(id) => {
          setTrackOrderId(id);
          setActiveTab('account');
        }}
      />

      {/* Global AI Fashion Stylist & Virtual Try-On Studio Modal */}
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



      {metaConsent === null && (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-4 shadow-2xl"
        >
          <p className="mb-3 text-sm text-gray-700">
            We use Meta Pixel to understand site activity and improve our ads. You can accept or reject this optional tracking.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              onClick={() => {
                localStorage.setItem('brivoo_meta_pixel_consent', 'rejected');
                setMetaConsent('rejected');
              }}
            >
              Reject
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm text-white"
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
