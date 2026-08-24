import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, Category, Coupon, SiteSettings, User } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCollection } from './components/FeaturedCollection';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { ShopPage } from './pages/ShopPage';
import { AccountPage } from './pages/AccountPage';

// Admin Pages & Auth
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminLogin } from './pages/admin/AdminLogin';

export function App() {
  // Store Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
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

  // Add Product Quick Launch from Admin Dashboard
  const [openAddProductModal, setOpenAddProductModal] = useState<boolean>(false);

  // Load all initial store data from backend
  const fetchAllData = async () => {
    try {
      const [prodRes, catRes, coupRes, ordRes, setRes, anaRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getCoupons(),
        api.getOrders(),
        api.getSettings(),
        api.getAnalytics()
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (coupRes.success) setCoupons(coupRes.data);
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
            <FeaturedCollection
              products={products}
              onQuickAdd={handleAddToCart}
              onOpenModal={setSelectedProduct}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              onViewAll={() => setActiveTab('shop-all')}
            />
          </>
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

        {/* ADMIN CONTROL PANEL ROUTE (Gated with Admin Login) */}
        {activeTab === 'admin' && (
          !currentUser || currentUser.role !== 'admin' ? (
            /* ADMIN LOGIN SCREEN */
            <AdminLogin
              onAdminLoginSuccess={handleLoginSuccess}
              onCancel={() => setActiveTab('home')}
            />
          ) : (
            /* ADMIN CONTROL PANEL */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              
              {/* Admin Header Bar */}
              <div className="bg-[#141414] text-white p-5 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-xl">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C5A059]">
                    ADMINISTRATION PORTAL
                  </span>
                  <h2 className="font-serif-luxury text-2xl font-bold">BRIVOO Command Center</h2>
                  <p className="text-xs text-gray-400">Logged in as: <strong className="text-white">{currentUser.email}</strong></p>
                </div>

                {/* Admin Navigation Tabs */}
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider">
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'products', label: 'Products' },
                    { id: 'orders', label: 'Orders' },
                    { id: 'categories', label: 'Categories' },
                    { id: 'coupons', label: 'Coupons' },
                    { id: 'settings', label: 'Site Settings' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        adminTab === tab.id
                          ? 'bg-[#C5A059] text-white shadow-md'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Tab Content */}
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

              {adminTab === 'products' && (
                <AdminProducts
                  products={products}
                  categories={categories}
                  onRefresh={fetchAllData}
                  openAddModalInitially={openAddProductModal}
                />
              )}

              {adminTab === 'orders' && (
                <AdminOrders
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

              {adminTab === 'settings' && (
                <AdminSettings
                  settings={settings!}
                  onRefresh={fetchAllData}
                />
              )}

            </div>
          )
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

    </div>
  );
}
