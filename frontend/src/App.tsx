import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, Category, Coupon, Offer, SiteSettings, User } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCollection } from './components/FeaturedCollection';
import { CategoryShowcase } from './components/CategoryShowcase';
import { OffersBanner } from './components/OffersBanner';

import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AuthModal } from './components/AuthModal';

import { Footer } from './components/Footer';
import { ArtisanStory } from './components/ArtisanStory';
import { ShopPage } from './pages/ShopPage';
import { AccountPage } from './pages/AccountPage';
import { OffersPage } from './pages/OffersPage';
import { AboutPage } from './pages/AboutPage';

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
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path === '/admin' || hash === '#admin' || search.includes('tab=admin') || search.includes('page=admin')) {
        return 'admin';
      }
      if (path === '/account' || hash === '#account') return 'account';
      if (path === '/offers' || hash === '#offers') return 'offers';
      if (path === '/about' || hash === '#about' || search.includes('tab=about') || search.includes('page=about')) return 'about';
      if (path === '/men' || hash === '#men') return 'men';
      if (path === '/women' || hash === '#women') return 'women';
    }
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

      if (prodRes?.success) setProducts(prodRes.data);
      if (catRes?.success) setCategories(catRes.data);
      if (coupRes?.success) setCoupons(coupRes.data);
      if (offRes?.success) setOffers(offRes.data);
      if (setRes?.success) setSettings(setRes.data);

      const token = localStorage.getItem('brivoo_token');
      if (token) {
        try {
          const ordRes = await api.getOrders();
          if (ordRes?.success) setOrders(ordRes.data);
        } catch (e) {
          console.warn('Orders fetch error:', e);
        }

        const savedUser = localStorage.getItem('brivoo_user');
        const user = savedUser ? JSON.parse(savedUser) : null;
        if (user?.role === 'admin') {
          try {
            const anaRes = await api.getAnalytics();
            if (anaRes?.success) setAnalytics(anaRes.data);
          } catch (e) {
            console.warn('Analytics fetch error:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error connecting to BRIVOO backend:', err);
    }
  };

  useEffect(() => {
    fetchAllData();

    const handleAuthCleared = () => {
      setCurrentUser(null);
      setAuthToken(null);
      setOrders([]);
      setAnalytics(null);
      setIsAdmin(false);
    };
    window.addEventListener('brivoo_auth_cleared', handleAuthCleared);

    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path === '/admin' || hash === '#admin' || search.includes('tab=admin') || search.includes('page=admin')) {
        setActiveTab('admin');
      } else if (path === '/account' || hash === '#account') {
        setActiveTab('account');
      } else if (path === '/offers' || hash === '#offers') {
        setActiveTab('offers');
      } else if (path === '/' || hash === '' || hash === '#') {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('brivoo_auth_cleared', handleAuthCleared);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Synchronize browser URL bar with activeTab
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeTab === 'admin') {
      if (window.location.pathname !== '/admin' && window.location.hash !== '#admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else if (activeTab === 'home') {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [activeTab]);

  // Scroll to top whenever activeTab changes so the user is never stuck at the footer
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);

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
    // Refresh user-specific data (orders, analytics)
    fetchAllData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('brivoo_user');
    localStorage.removeItem('brivoo_token');
    setOrders([]);
    setAnalytics(null);
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

  // Cart Actions
  const handleAddToCart = (product: Product, color: string, size: string, quantity: number = 1) => {
    const existingIndex = cartItems.findIndex(
      item => item.product.id === product.id && item.selectedColor === color && item.selectedSize === size
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity
      };
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
  };

  const handleBuyNow = (product: Product, color: string, size: string, quantity: number = 1) => {
    const existingIndex = cartItems.findIndex(
      item => item.product.id === product.id && item.selectedColor === color && item.selectedSize === size
    );

    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = [...cartItems];
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: updatedCart[existingIndex].quantity + quantity
      };
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${color}-${size}-${Date.now()}`,
        product,
        selectedColor: color,
        selectedSize: size,
        quantity
      };
      updatedCart = [...cartItems, newItem];
    }
    setCartItems(updatedCart);
    setSelectedProduct(null);
    setIsCartOpen(false);
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

  // Wishlist Action
  const handleToggleWishlist = (product: Product) => {
    if (wishlistIds.includes(product.id)) {
      setWishlistIds(wishlistIds.filter(id => id !== product.id));
    } else {
      setWishlistIds([...wishlistIds, product.id]);
    }
  };

  // Checkout & Order Placement
  const handleProceedToCheckout = (discount: number, code: string) => {
    setAppliedDiscount(discount);
    setAppliedCouponCode(code);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
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

        {adminTab === 'pricing' && (
          <AdminSettings
            settings={settings!}
            onRefresh={fetchAllData}
            initialTab="pricing"
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
              }}
            />
            <OffersBanner
              offers={offers}
              onViewAllOffers={() => setActiveTab('offers')}
              onShopCategory={(cat) => {
                setSelectedCategoryFilter('All');
                setActiveTab('shop-all');
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
              }}
            />
            <ArtisanStory
              onLearnMore={() => {
                setActiveTab('about');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              onShopAll={() => {
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
                setSelectedCategoryFilter(category);
                setActiveTab('shop-all');
              } else if (category === 'Men') {
                setActiveTab('men');
              } else if (category === 'Women') {
                setActiveTab('women');
              } else {
                setSelectedCategoryFilter('All');
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
            onShopMen={() => {
              setActiveTab('men');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            onShopWomen={() => {
              setActiveTab('women');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            onShopAll={() => {
              setActiveTab('shop-all');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
            initialCategory={selectedCategoryFilter}
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
        onAboutClick={() => {
          setActiveTab('about');
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }}
        onAdminClick={() => setActiveTab('admin')}
      />

      {/* Global Authentication Modal (Customer Login / Signup / Google Auth / Forgot Password) */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          promptMessage={authPromptMessage}
        />
      )}

      {/* Global Product Detail Modal */}
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
        />
      )}

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onProceedToCheckout={handleProceedToCheckout}
          freeShippingThreshold={settings?.freeShippingThreshold || 1999}
          settings={settings || undefined}
        />
      )}

      {/* Multi-step Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          appliedDiscount={appliedDiscount}
          couponCode={appliedCouponCode}
          onOrderSuccess={handleOrderSuccess}
          settings={settings || undefined}
        />
      )}

      {/* Order Confirmation Receipt Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrackOrder={(id) => {
            setTrackOrderId(id);
            setActiveTab('account');
          }}
        />
      )}


    </div>
  );
}
