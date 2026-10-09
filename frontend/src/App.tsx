import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, Category, Coupon, Offer, SiteSettings, User } from './types';
import { api } from './services/api';
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
import { AIStylistModal } from './components/AIStylistModal';
import { Footer } from './components/Footer';
import { ShopPage } from './pages/ShopPage';
import { AccountPage } from './pages/AccountPage';
import { OffersPage } from './pages/OffersPage';

// Admin Pages & Auth
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminTracking } from './pages/admin/AdminTracking';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminOffers } from './pages/admin/AdminOffers';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminReturns } from './pages/admin/AdminReturns';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminWhatsAppCRM } from './pages/admin/AdminWhatsAppCRM';
import { AdminVendors } from './pages/admin/AdminVendors';
import { AdminMarketing } from './pages/admin/AdminMarketing';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';

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
  const [activeTab, setActiveTab] = useState<string>('home');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // AI Stylist & Virtual Try-On Modal States
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiModalProduct, setAiModalProduct] = useState<Product | null>(null);
  const [aiModalMode, setAiModalMode] = useState<'ask' | 'tryon'>('ask');

  // Add Product Quick Launch from Admin Dashboard
  const [openAddProductModal, setOpenAddProductModal] = useState<boolean>(false);

  // Load all initial store data from backend
  const fetchAllData = async () => {
    try {
      const [prodRes, catRes, coupRes, offRes, ordRes, setRes, anaRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getCoupons(),
        api.getOffers(),
        api.getOrders(),
        api.getSettings(),
        api.getAnalytics()
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (coupRes.success) setCoupons(coupRes.data);
      if (offRes && offRes.success) setOffers(offRes.data);
      if (ordRes.success) setOrders(ordRes.data);
      if (setRes.success) setSettings(setRes.data);
      if (anaRes.success) setAnalytics(anaRes.data);
    } catch (err) {
      console.error('Error connecting to BRIVOO backend:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('brivoo_user', JSON.stringify(user));
    localStorage.setItem('brivoo_token', token);
    setIsAuthModalOpen(false);

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
      setIsCartOpen(true);
      if (selectedProduct) setSelectedProduct(null);
    }, "Sign in to add items to your shopping cart!");
  };

  const handleBuyNow = (product: Product, color: string, size: string, quantity: number = 1) => {
    requireAuthForAction(() => {
      handleAddToCart(product, color, size, quantity);
      setIsCartOpen(false);
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
      setIsCheckoutOpen(true);
    }, "Sign in to proceed to secure checkout!");
  };

  const handleOrderSuccess = (newOrder: Order) => {
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
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
          <AdminLogin
            onAdminLoginSuccess={handleLoginSuccess}
            onCancel={() => {
              setIsAdmin(false);
              setActiveTab('home');
            }}
          />
        </div>
      );
    }

    return (
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
                setActiveTab('shop-all');
              }}
            />
            <OffersBanner
              offers={offers}
              onViewAllOffers={() => setActiveTab('offers')}
              onShopCategory={(cat) => setActiveTab('shop-all')}
            />
            <FeaturedCollection
              products={products}
              onQuickAdd={handleAddToCart}
              onOpenModal={setSelectedProduct}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              onViewAll={() => setActiveTab('shop-all')}
            />
            <ArtisanStory />
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

      {/* Floating AI Stylist & Virtual Try-On Quick Concierge Pill */}
      {!isAdmin && (
        <aside aria-label="Floating AI Stylist" className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-30">
          <button
            onClick={() => {
              setAiModalMode('ask');
              setAiModalProduct(selectedProduct || products[0] || null);
              setIsAIModalOpen(true);
            }}
            className="group relative flex items-center space-x-2.5 bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.35)] border border-[#C5A059]/40 hover:border-[#C5A059] transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <div className="relative">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] group-hover:bg-stone-900 absolute -top-0.5 -right-0.5 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-[#C5A059] group-hover:bg-stone-900 absolute -top-0.5 -right-0.5" />
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#C5A059] to-[#E6DFC5] text-stone-950 flex items-center justify-center font-bold shadow-2xs">
                ✨
              </div>
            </div>
            <div className="text-left">
              <div className="text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5">
                <span>Ask AI & Try-On</span>
                <span className="text-[9px] bg-[#C5A059] group-hover:bg-stone-900 text-stone-950 group-hover:text-white px-1.5 py-0.2 rounded font-mono font-bold">
                  LIVE
                </span>
              </div>
              <div className="text-[9px] text-stone-400 group-hover:text-stone-800 hidden sm:block font-medium">
                Styling advice & photo fit
              </div>
            </div>
          </button>
        </aside>
      )}

    </div>
  );
}
