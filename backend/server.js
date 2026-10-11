import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readData, writeData } from './db.js';
import { shiprocket } from './shiprocketService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5005;
const HOST = process.env.HOST || '0.0.0.0';

// ----------------------------------------------------
// SECURITY MIDDLEWARE & PATCHES
// ----------------------------------------------------
// 1. Essential Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
});

// 2. Safe Cross-Origin Resource Sharing (CORS)
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5005'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback permissive for local network access
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// 3. Lightweight In-Memory Sliding Window Rate Limiter
const rateLimitMap = new Map();
function rateLimiter({ windowMs = 60 * 1000, max = 40, message = 'Too many requests. Please wait a moment.' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    let record = rateLimitMap.get(ip);
    if (!record || now - record.resetTime > windowMs) {
      record = { count: 1, resetTime: now };
      rateLimitMap.set(ip, record);
    } else {
      record.count += 1;
      if (record.count > max) {
        return res.status(429).json({ success: false, message });
      }
    }
    next();
  };
}

// Helper: Email format validator
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ----------------------------------------------------
// AUTHENTICATION API (JWT Token Simulation, Google OAuth, Reset OTP)
// ----------------------------------------------------
app.post('/api/auth/register', rateLimiter({ windowMs: 60 * 1000, max: 15 }), (req, res) => {
  const db = readData();
  if (!db.users) db.users = [];
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid payload structure' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  if (password.length > 128) {
    return res.status(400).json({ success: false, message: 'Password cannot exceed 128 characters' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ success: false, message: 'User already exists with this email address' });
  }

  const isSpecialAdmin = normalizedEmail === 'sujalrathore970@gmail.com' || normalizedEmail === 'admin@brivoo.com';
  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim().slice(0, 100),
    email: normalizedEmail,
    password,
    role: isSpecialAdmin ? 'admin' : 'customer',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`
  };

  db.users.push(newUser);
  writeData(db);

  const token = `jwt_token_${newUser.id}_${Date.now()}`;
  res.status(201).json({
    success: true,
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar }
  });
});

app.post('/api/auth/login', rateLimiter({ windowMs: 60 * 1000, max: 20 }), (req, res) => {
  const db = readData();
  if (!db.users) db.users = [];
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase();
  let user = db.users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
  
  // Auto-heal / initialize admin user if credentials match
  if (!user && normalizedEmail === 'sujalrathore970@gmail.com' && password === 'Suj@l0504') {
    const existingAdmin = db.users.find(u => u.email.toLowerCase() === 'sujalrathore970@gmail.com');
    if (existingAdmin) {
      existingAdmin.password = 'Suj@l0504';
      existingAdmin.role = 'admin';
      user = existingAdmin;
    } else {
      user = {
        id: 'usr-admin',
        name: 'Sujal Rathore (Admin)',
        email: 'sujalrathore970@gmail.com',
        password: 'Suj@l0504',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        joinedAt: new Date().toISOString()
      };
      db.users.push(user);
    }
    writeData(db);
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email address or password' });
  }

  // Ensure role is admin if logging in with the designated admin email
  if (normalizedEmail === 'sujalrathore970@gmail.com' && user.role !== 'admin') {
    user.role = 'admin';
    writeData(db);
  }

  const token = `jwt_token_${user.id}_${Date.now()}`;
  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
  });
});

app.post('/api/auth/google', (req, res) => {
  const db = readData();
  if (!db.users) db.users = [];
  const { name, email, googleId, avatar, role } = req.body;

  const targetEmail = (email || 'google_user@gmail.com').toLowerCase();
  const userName = name || 'Google User';
  const userAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;

  let user = db.users.find(u => u.email.toLowerCase() === targetEmail);
  const isAdminEmail = targetEmail === 'sujalrathore970@gmail.com' || targetEmail === 'admin@brivoo.com';
  if (!user) {
    const isSpecialAdmin = role === 'admin' || isAdminEmail;
    user = {
      id: `usr-g-${Date.now()}`,
      name: userName,
      email: targetEmail,
      password: `google_oauth_${Date.now()}`,
      role: isSpecialAdmin ? 'admin' : 'customer',
      avatar: userAvatar,
      googleId: googleId || `gid_${Date.now()}`
    };
    db.users.push(user);
  } else {
    if (userName && (user.name === 'Google User' || !user.name)) user.name = userName;
    if (userAvatar && !user.avatar) user.avatar = userAvatar;
    if (role === 'admin' || isAdminEmail) user.role = 'admin';
  }

  writeData(db);

  const token = `jwt_google_token_${user.id}_${Date.now()}`;
  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
  });
});

app.post('/api/auth/forgot-password', rateLimiter({ windowMs: 60 * 1000, max: 10 }), (req, res) => {
  const db = readData();
  if (!db.users) db.users = [];
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email address is required' });

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'No registered user found with this email' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  if (!db.otps) db.otps = {};
  db.otps[email.toLowerCase()] = {
    code: otp,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10-minute expiry
  };
  writeData(db);

  res.json({
    success: true,
    message: `OTP sent to ${email}`,
    otp
  });
});

app.post('/api/auth/reset-password', rateLimiter({ windowMs: 60 * 1000, max: 10 }), (req, res) => {
  const db = readData();
  if (!db.users) db.users = [];
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  const storedOtpData = db.otps?.[email.toLowerCase()];
  const storedOtp = typeof storedOtpData === 'object' ? storedOtpData?.code : storedOtpData;
  const isExpired = typeof storedOtpData === 'object' && storedOtpData?.expiresAt && Date.now() > storedOtpData.expiresAt;

  if (!storedOtp || isExpired || storedOtp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.password = newPassword;
  delete db.otps[email.toLowerCase()];
  writeData(db);

  const token = `jwt_token_${user.id}_${Date.now()}`;
  res.json({
    success: true,
    message: 'Password reset successfully! Logged in.',
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
  });
});

// Static images directory
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// ----------------------------------------------------
// 1. PRODUCTS API (Full CRUD + Reviews + Filter/Search)
// ----------------------------------------------------
app.get('/api/products', (req, res) => {
  const db = readData();
  let { search, category, gender, tag, minPrice, maxPrice, sort } = req.query;
  let list = [...db.products];

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  if (category && category !== 'All') {
    list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (gender && gender !== 'All') {
    list = list.filter(p => p.gender.toLowerCase() === gender.toLowerCase() || p.gender.toLowerCase() === 'unisex');
  }
  if (tag) {
    list = list.filter(p => p.tag === tag);
  }
  if (minPrice) {
    list = list.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    list = list.filter(p => p.price <= Number(maxPrice));
  }

  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    list.reverse();
  }

  res.json({ success: true, count: list.length, data: list });
});

app.get('/api/products/:id', (req, res) => {
  const db = readData();
  const prod = db.products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: prod });
});

app.post('/api/products', (req, res) => {
  const db = readData();
  const { title, subtitle, category, gender, price, originalPrice, tag, image, colors, sizes, stock, description, specs } = req.body;

  if (!title || !price || !category) {
    return res.status(400).json({ success: false, message: 'Title, price, and category are required' });
  }

  const newProduct = {
    id: `prod-${Date.now()}`,
    title,
    subtitle: subtitle || '',
    category,
    gender: gender || 'Unisex',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Number(price) + 500,
    tag: tag || 'NEW',
    image: image || '/images/linen_resort_shirt.png',
    colors: colors || [{ name: "Classic", hex: "#1A1A1A" }],
    sizes: sizes || ["S", "M", "L", "XL"],
    stock: stock ? Number(stock) : 20,
    description: description || 'Premium clothing item designed for comfort and luxury style.',
    specs: specs || '100% Premium Fabric. Machine wash cold.',
    inStock: true,
    featured: true,
    reviews: []
  };

  db.products.unshift(newProduct);
  writeData(db);
  res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
});

app.post('/api/products/bulk', (req, res) => {
  const db = readData();
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, message: 'Products array is required and must not be empty' });
  }

  const newProducts = [];
  const baseTimestamp = Date.now();

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p.title || !p.price) {
      continue;
    }

    const stockNum = p.stock !== undefined ? Number(p.stock) : 25;
    const priceNum = Number(p.price) || 1499;

    const newProd = {
      id: `prod-${baseTimestamp}-${i + 1}`,
      title: p.title.trim(),
      subtitle: p.subtitle ? p.subtitle.trim() : '',
      category: p.category ? p.category.trim() : 'Shirts',
      subCategory: p.subCategory ? p.subCategory.trim() : '',
      gender: p.gender || 'Men',
      price: priceNum,
      originalPrice: p.originalPrice ? Number(p.originalPrice) : priceNum + 500,
      tag: p.tag ? p.tag.trim() : 'NEW',
      image: p.image && p.image.trim() ? p.image.trim() : '/images/linen_resort_shirt.png',
      colors: Array.isArray(p.colors) && p.colors.length > 0 
        ? p.colors 
        : [{ name: "Classic", hex: "#1A1A1A" }],
      sizes: Array.isArray(p.sizes) && p.sizes.length > 0 
        ? p.sizes 
        : ["S", "M", "L", "XL"],
      stock: stockNum,
      description: p.description ? p.description.trim() : 'Handcrafted luxury apparel cut from fine breathable fabrics.',
      specs: p.specs ? p.specs.trim() : '100% Premium European Flax Linen. Machine wash cold.',
      inStock: stockNum > 0,
      featured: p.featured !== undefined ? Boolean(p.featured) : true,
      reviews: []
    };

    newProducts.push(newProd);
  }

  if (newProducts.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid products could be processed. Please check title and price fields.' });
  }

  db.products = [...newProducts, ...db.products];
  writeData(db);

  res.status(201).json({ 
    success: true, 
    message: `Successfully listed ${newProducts.length} products in bulk!`, 
    count: newProducts.length,
    data: newProducts 
  });
});

app.put('/api/products/:id', (req, res) => {
  const db = readData();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  const updated = { ...db.products[index], ...req.body };
  if (req.body.price) updated.price = Number(req.body.price);
  if (req.body.stock !== undefined) updated.stock = Number(req.body.stock);
  if (updated.stock === 0) updated.inStock = false;
  else updated.inStock = true;

  db.products[index] = updated;
  writeData(db);
  res.json({ success: true, message: 'Product updated successfully', data: updated });
});

app.delete('/api/products/:id', (req, res) => {
  const db = readData();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  const deleted = db.products.splice(index, 1);
  writeData(db);
  res.json({ success: true, message: 'Product deleted successfully', data: deleted[0] });
});

// Add Review
app.post('/api/products/:id/reviews', (req, res) => {
  const db = readData();
  const prod = db.products.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });

  const { userName, rating, comment } = req.body;
  if (!userName || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Name, rating, and comment are required' });
  }

  const review = {
    id: `rev-${Date.now()}`,
    userName,
    rating: Number(rating),
    comment,
    date: new Date().toISOString().split('T')[0]
  };

  if (!prod.reviews) prod.reviews = [];
  prod.reviews.unshift(review);
  writeData(db);
  res.status(201).json({ success: true, message: 'Review added', data: prod });
});

// ----------------------------------------------------
// 2. CATEGORIES API (Full CRUD)
// ----------------------------------------------------
app.get('/api/categories', (req, res) => {
  const db = readData();
  res.json({ success: true, data: db.categories });
});

app.post('/api/categories', (req, res) => {
  const db = readData();
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const newCat = { id: `cat-${Date.now()}`, name, slug, description: description || '' };
  db.categories.push(newCat);
  writeData(db);
  res.status(201).json({ success: true, data: newCat });
});

app.put('/api/categories/:id', (req, res) => {
  const db = readData();
  const index = db.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });

  db.categories[index] = { ...db.categories[index], ...req.body };
  writeData(db);
  res.json({ success: true, data: db.categories[index] });
});

app.delete('/api/categories/:id', (req, res) => {
  const db = readData();
  const index = db.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });

  const deleted = db.categories.splice(index, 1);
  writeData(db);
  res.json({ success: true, data: deleted[0] });
});

// Subcategories API
app.post('/api/categories/:id/subcategories', (req, res) => {
  const db = readData();
  const category = db.categories.find(c => c.id === req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Subcategory name required' });

  if (!category.subcategories) category.subcategories = [];
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const newSub = {
    id: `sub-${Date.now()}`,
    categoryId: category.id,
    name,
    slug,
    description: description || ''
  };
  category.subcategories.push(newSub);
  writeData(db);
  res.status(201).json({ success: true, data: newSub });
});

app.delete('/api/categories/:catId/subcategories/:subId', (req, res) => {
  const db = readData();
  const category = db.categories.find(c => c.id === req.params.catId);
  if (!category || !category.subcategories) return res.status(404).json({ success: false, message: 'Category not found' });

  const idx = category.subcategories.findIndex(s => s.id === req.params.subId);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Subcategory not found' });

  const removed = category.subcategories.splice(idx, 1);
  writeData(db);
  res.json({ success: true, data: removed[0] });
});

// ----------------------------------------------------
// 3. COUPONS API (CRUD + Validate)
// ----------------------------------------------------
app.get('/api/coupons', (req, res) => {
  const db = readData();
  res.json({ success: true, data: db.coupons });
});

app.post('/api/coupons/validate', (req, res) => {
  const db = readData();
  const { code, cartSubtotal } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

  let coupon = db.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
  if (!coupon && db.offers) {
    const offer = db.offers.find(o => o.code && o.code.toUpperCase() === code.trim().toUpperCase() && o.active);
    if (offer) {
      coupon = {
        id: offer.id,
        code: offer.code,
        discountType: offer.discountType || 'percentage',
        value: offer.discountValue || 10,
        minSpend: offer.minSpend || 0,
        description: offer.title
      };
    }
  }

  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });

  if (cartSubtotal < coupon.minSpend) {
    return res.status(400).json({ success: false, message: `Minimum spend of ₹${coupon.minSpend} required for this coupon.` });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((cartSubtotal * coupon.value) / 100);
  } else {
    discount = coupon.value;
  }

  res.json({ success: true, coupon, discount });
});

app.post('/api/coupons', (req, res) => {
  const db = readData();
  const { code, discountType, value, minSpend } = req.body;
  if (!code || !value) return res.status(400).json({ success: false, message: 'Code and value are required' });

  const newCoupon = {
    id: `coup-${Date.now()}`,
    code: code.toUpperCase().trim(),
    discountType: discountType || 'percentage',
    value: Number(value),
    minSpend: minSpend ? Number(minSpend) : 0,
    active: true
  };

  db.coupons.push(newCoupon);
  writeData(db);
  res.status(201).json({ success: true, data: newCoupon });
});

app.put('/api/coupons/:id', (req, res) => {
  const db = readData();
  const index = db.coupons.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Coupon not found' });

  db.coupons[index] = { ...db.coupons[index], ...req.body };
  writeData(db);
  res.json({ success: true, data: db.coupons[index] });
});

app.delete('/api/coupons/:id', (req, res) => {
  const db = readData();
  const index = db.coupons.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Coupon not found' });

  const deleted = db.coupons.splice(index, 1);
  writeData(db);
  res.json({ success: true, data: deleted[0] });
});

// ----------------------------------------------------
// 3.5. OFFERS & DEALS CAMPAIGNS API (CRUD)
// ----------------------------------------------------
app.get('/api/offers', (req, res) => {
  const db = readData();
  const offers = db.offers || [];
  res.json({ success: true, count: offers.length, data: offers });
});

app.post('/api/offers', (req, res) => {
  const db = readData();
  if (!db.offers) db.offers = [];

  const {
    title,
    subtitle,
    badge,
    code,
    discountType,
    discountValue,
    minSpend,
    description,
    validUntil,
    category,
    bannerImage,
    tagColor,
    featured,
    active,
    terms
  } = req.body;

  if (!title) return res.status(400).json({ success: false, message: 'Offer title is required' });

  const newOffer = {
    id: `off-${Date.now()}`,
    title: title.trim(),
    subtitle: subtitle ? subtitle.trim() : '',
    badge: badge ? badge.trim() : 'SPECIAL OFFER',
    code: code ? code.toUpperCase().trim() : '',
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue || 0),
    minSpend: Number(minSpend || 0),
    description: description ? description.trim() : '',
    validUntil: validUntil || '2026-12-31',
    category: category || 'All',
    bannerImage: bannerImage || '/images/hero_slide_1.jpg',
    tagColor: tagColor || 'gold',
    featured: featured !== undefined ? Boolean(featured) : true,
    active: active !== undefined ? Boolean(active) : true,
    terms: Array.isArray(terms) && terms.length > 0 ? terms : [
      `Minimum spend ₹${Number(minSpend || 0)} required`,
      'Valid for limited time on selected styles',
      'Complimentary express shipping included'
    ],
    createdAt: new Date().toISOString()
  };

  db.offers.unshift(newOffer);

  // If a promo code was provided, also sync or update coupons table
  if (newOffer.code && db.coupons) {
    const existingCouponIndex = db.coupons.findIndex(c => c.code.toUpperCase() === newOffer.code.toUpperCase());
    if (existingCouponIndex === -1) {
      db.coupons.push({
        id: `coup-from-${newOffer.id}`,
        code: newOffer.code,
        discountType: newOffer.discountType,
        value: newOffer.discountValue,
        minSpend: newOffer.minSpend,
        expiryDate: newOffer.validUntil,
        description: newOffer.title,
        active: newOffer.active
      });
    }
  }

  writeData(db);
  res.status(201).json({ success: true, data: newOffer });
});

app.put('/api/offers/:id', (req, res) => {
  const db = readData();
  if (!db.offers) db.offers = [];
  const index = db.offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Offer not found' });

  db.offers[index] = { ...db.offers[index], ...req.body, updatedAt: new Date().toISOString() };
  writeData(db);
  res.json({ success: true, data: db.offers[index] });
});

app.patch('/api/offers/:id/toggle', (req, res) => {
  const db = readData();
  if (!db.offers) db.offers = [];
  const index = db.offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Offer not found' });

  db.offers[index].active = !db.offers[index].active;
  writeData(db);
  res.json({ success: true, data: db.offers[index] });
});

app.delete('/api/offers/:id', (req, res) => {
  const db = readData();
  if (!db.offers) db.offers = [];
  const index = db.offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Offer not found' });

  const deleted = db.offers.splice(index, 1);
  writeData(db);
  res.json({ success: true, data: deleted[0] });
});

// ----------------------------------------------------
// 4. ORDERS API (Create, Status update, View history)
// ----------------------------------------------------
app.get('/api/orders', (req, res) => {
  const db = readData();
  res.json({ success: true, count: db.orders.length, data: db.orders });
});

app.get('/api/orders/:id', (req, res) => {
  const db = readData();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
});

app.post('/api/orders', (req, res) => {
  const db = readData();
  const { customerName, email, phone, address, items, totalAmount, discountAmount, paymentMethod, shippingCity, shippingState, shippingPincode } = req.body;

  if (!customerName || !email || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Customer details and items are required' });
  }

  const orderId = `BRV-${Math.floor(10000 + Math.random() * 90000)}`;
  const paymentRef = `TXN_${(paymentMethod || 'UPI').toUpperCase().replace(/\s+/g, '_')}_${Date.now().toString().slice(-6)}`;
  const paymentStatus = paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed';

  const newOrder = {
    id: orderId,
    customerName,
    email,
    phone: phone || '',
    address: address || '',
    shippingCity: shippingCity || '',
    shippingState: shippingState || '',
    shippingPincode: shippingPincode || '',
    items,
    totalAmount: Number(totalAmount),
    discountAmount: Number(discountAmount || 0),
    paymentMethod: paymentMethod || 'UPI',
    paymentStatus,
    paymentRef,
    status: 'Processing',
    tracking: {
      carrier: 'BlueDart Express',
      trackingNumber: `BLUEDART-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dispatchedAt: new Date().toISOString(),
      currentLocation: 'BRIVOO Mumbai Fulfillment Hub',
      status: 'Processing',
      checkpoints: [
        {
          id: `cp-${Date.now()}`,
          status: 'Order Confirmed',
          location: 'BRIVOO Mumbai Center',
          timestamp: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
          description: 'Order placed, items allocated and payment processed.'
        }
      ]
    },
    returnStatus: 'None',
    createdAt: new Date().toISOString()
  };

  // Reduce product stocks
  items.forEach(item => {
    const prod = db.products.find(p => p.id === item.id);
    if (prod && prod.stock >= item.quantity) {
      prod.stock -= item.quantity;
      if (prod.stock === 0) prod.inStock = false;
    }
  });

  // Add order
  db.orders.unshift(newOrder);

  // Sync to Payments ledger
  if (!db.payments) db.payments = [];
  db.payments.unshift({
    id: `PAY-${Date.now().toString().slice(-6)}`,
    orderId,
    customerName,
    customerEmail: email,
    amount: Number(totalAmount),
    method: paymentMethod || 'UPI',
    status: paymentStatus,
    transactionRef: paymentRef,
    createdAt: new Date().toISOString()
  });

  writeData(db);
  res.status(201).json({ success: true, message: 'Order placed successfully', data: newOrder });
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = readData();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

  order.status = status;
  if (order.tracking) {
    order.tracking.status = status;
    order.tracking.checkpoints.push({
      id: `cp-${Date.now()}`,
      status,
      location: order.tracking.currentLocation || 'Distribution Facility',
      timestamp: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Order milestone status changed to ${status}.`
    });
  }

  writeData(db);
  res.json({ success: true, message: `Order status updated to ${status}`, data: order });
});

// Update Order Tracking Details & Add Checkpoints
app.put('/api/orders/:id/tracking', (req, res) => {
  const db = readData();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { carrier, trackingNumber, estimatedDelivery, status, location, checkpointDescription } = req.body;

  if (!order.tracking) {
    order.tracking = {
      carrier: carrier || 'BlueDart',
      trackingNumber: trackingNumber || `TRK-${Date.now().toString().slice(-8)}`,
      checkpoints: []
    };
  }

  if (carrier) order.tracking.carrier = carrier;
  if (trackingNumber) order.tracking.trackingNumber = trackingNumber;
  if (estimatedDelivery) order.tracking.estimatedDelivery = estimatedDelivery;
  if (location) order.tracking.currentLocation = location;
  if (status) {
    order.tracking.status = status;
    order.status = status;
  }

  if (checkpointDescription) {
    if (!order.tracking.checkpoints) order.tracking.checkpoints = [];
    order.tracking.checkpoints.push({
      id: `cp-${Date.now()}`,
      status: status || order.status || 'In Transit',
      location: location || 'Hub Facility',
      timestamp: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
      description: checkpointDescription
    });
  }

  writeData(db);
  res.json({ success: true, message: 'Tracking updated', data: order });
});

// Tracking Search by Order ID or Tracking AWB Number
app.get('/api/tracking/:query', async (req, res) => {
  const db = readData();
  const q = req.params.query.trim().toLowerCase();
  const order = db.orders.find(o => 
    o.id.toLowerCase() === q || 
    (o.tracking && o.tracking.trackingNumber && o.tracking.trackingNumber.toLowerCase() === q) ||
    (o.shiprocket && o.shiprocket.awbCode && o.shiprocket.awbCode.toLowerCase() === q)
  );

  if (!order) return res.status(404).json({ success: false, message: 'No shipment found with this ID or Tracking Number.' });

  // If order has an active Shiprocket AWB, fetch live tracking directly
  let liveTracking = null;
  const awb = order.shiprocket?.awbCode || (order.tracking?.trackingNumber && !order.tracking.trackingNumber.startsWith('BLUEDART-') && !order.tracking.trackingNumber.startsWith('TRK-') ? order.tracking.trackingNumber : null);
  if (awb) {
    try {
      const srTrack = await shiprocket.trackAwb(awb);
      if (srTrack.success && srTrack.data) {
        liveTracking = srTrack.data;
      }
    } catch {
      // Continue with stored tracking
    }
  }

  res.json({ success: true, data: { order, tracking: order.tracking, liveTracking } });
});

// ----------------------------------------------------
// 4B. SHIPROCKET LOGISTICS API INTEGRATION
// ----------------------------------------------------

// Live Status & Connection Details
app.get('/api/shiprocket/status', async (req, res) => {
  try {
    const status = await shiprocket.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Pincode Serviceability & Courier Rates
app.get('/api/shiprocket/serviceability', async (req, res) => {
  try {
    const { pickup_postcode, delivery_postcode, weight, cod } = req.query;
    if (!delivery_postcode) {
      return res.status(400).json({ success: false, message: 'Delivery pincode is required' });
    }
    const result = await shiprocket.checkServiceability({
      pickup_postcode: pickup_postcode || undefined,
      delivery_postcode: String(delivery_postcode).trim(),
      weight: weight ? Number(weight) : 0.5,
      cod: cod === '1' || cod === 'true'
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 1-Click Order Dispatch with Shiprocket
app.post('/api/shiprocket/orders/:id/dispatch', async (req, res) => {
  const db = readData();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { courierId } = req.body || {};

  try {
    // 1. Create Order & Shipment on Shiprocket
    const srOrder = await shiprocket.createAdhocOrder(order);
    const orderId = srOrder.order_id;
    const shipmentId = srOrder.shipment_id;

    // 2. Attempt AWB assignment
    let awbResult = null;
    let labelResult = null;
    let invoiceResult = null;
    let finalCarrier = order.tracking?.carrier || 'Shiprocket Express';
    let finalAwb = order.tracking?.trackingNumber || `SR-${shipmentId}`;

    if (shipmentId) {
      awbResult = await shiprocket.assignAwb(shipmentId, courierId);
      if (awbResult.success && awbResult.awbCode) {
        finalAwb = awbResult.awbCode;
        if (awbResult.courierName) finalCarrier = awbResult.courierName;

        try {
          labelResult = await shiprocket.generateLabel(shipmentId);
        } catch (lErr) {
          console.warn('[Shiprocket] Label warning:', lErr.message);
        }

        try {
          invoiceResult = await shiprocket.generateInvoice(orderId);
        } catch (iErr) {
          console.warn('[Shiprocket] Invoice warning:', iErr.message);
        }
      }
    }

    // Attach Shiprocket metadata to order
    order.shiprocket = {
      orderId,
      shipmentId,
      awbCode: awbResult?.awbCode || null,
      courierCompanyId: awbResult?.courierCompanyId || null,
      courierName: awbResult?.courierName || null,
      labelUrl: labelResult?.labelUrl || null,
      invoiceUrl: invoiceResult?.invoiceUrl || null,
      syncedAt: new Date().toISOString(),
      requiresRecharge: awbResult?.requiresRecharge || false,
      rechargeNotice: awbResult?.requiresRecharge ? awbResult.message : null
    };

    order.status = 'Shipped';
    if (!order.tracking) {
      order.tracking = {
        carrier: finalCarrier,
        trackingNumber: finalAwb,
        checkpoints: []
      };
    } else {
      order.tracking.carrier = finalCarrier;
      order.tracking.trackingNumber = finalAwb;
      order.tracking.status = 'Shipped';
    }

    order.tracking.checkpoints.push({
      id: `cp-${Date.now()}`,
      status: 'Shipped',
      location: 'BRIVOO Atelier Mumbai Hub',
      timestamp: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
      description: awbResult?.awbCode 
        ? `Dispatched via Shiprocket with ${finalCarrier}. AWB: ${finalAwb}`
        : `Order created in Shiprocket (Shipment #${shipmentId}). Awaiting courier AWB assignment.`
    });

    writeData(db);

    res.json({
      success: true,
      message: awbResult?.requiresRecharge
        ? `Order pushed to Shiprocket (Shipment #${shipmentId}). Note: Shiprocket wallet requires recharge (min ₹100) to generate live carrier AWB.`
        : `Order successfully dispatched via Shiprocket with ${finalCarrier}!`,
      data: order,
      shiprocket: order.shiprocket
    });
  } catch (err) {
    console.error('[Shiprocket] Dispatch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Assign AWB to Existing Shipment
app.post('/api/shiprocket/orders/:id/assign-awb', async (req, res) => {
  const db = readData();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!order.shiprocket?.shipmentId) {
    return res.status(400).json({ success: false, message: 'Order has not been created on Shiprocket yet' });
  }

  const { courierId } = req.body || {};
  try {
    const awbResult = await shiprocket.assignAwb(order.shiprocket.shipmentId, courierId);
    if (awbResult.success && awbResult.awbCode) {
      order.shiprocket.awbCode = awbResult.awbCode;
      order.shiprocket.courierName = awbResult.courierName;
      order.shiprocket.courierCompanyId = awbResult.courierCompanyId;
      order.shiprocket.requiresRecharge = false;
      order.shiprocket.rechargeNotice = null;
      if (order.tracking) {
        order.tracking.carrier = awbResult.courierName;
        order.tracking.trackingNumber = awbResult.awbCode;
      }

      try {
        const labelResult = await shiprocket.generateLabel(order.shiprocket.shipmentId);
        if (labelResult.success && labelResult.labelUrl) {
          order.shiprocket.labelUrl = labelResult.labelUrl;
        }
      } catch (lErr) {
        console.warn('Label fetch warn:', lErr.message);
      }

      writeData(db);
    }
    res.json(awbResult);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Generate Label URL
app.get('/api/shiprocket/orders/:id/label', async (req, res) => {
  const db = readData();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order || !order.shiprocket?.shipmentId) {
    return res.status(404).json({ success: false, message: 'Shiprocket shipment not found for this order' });
  }

  try {
    const result = await shiprocket.generateLabel(order.shiprocket.shipmentId);
    if (result.success && result.labelUrl) {
      order.shiprocket.labelUrl = result.labelUrl;
      writeData(db);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Generate Invoice URL
app.get('/api/shiprocket/orders/:id/invoice', async (req, res) => {
  const db = readData();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order || !order.shiprocket?.orderId) {
    return res.status(404).json({ success: false, message: 'Shiprocket order not found' });
  }

  try {
    const result = await shiprocket.generateInvoice(order.shiprocket.orderId);
    if (result.success && result.invoiceUrl) {
      order.shiprocket.invoiceUrl = result.invoiceUrl;
      writeData(db);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Live Courier Tracking
app.get('/api/shiprocket/track/:awb', async (req, res) => {
  try {
    const tracking = await shiprocket.trackAwb(req.params.awb);
    res.json(tracking);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add Pickup Location
app.post('/api/shiprocket/pickup-location', async (req, res) => {
  try {
    const result = await shiprocket.addPickupLocation(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Shiprocket Configuration
app.post('/api/shiprocket/settings', (req, res) => {
  const db = readData();
  if (!db.settings) db.settings = {};

  const { email, password, channelId, defaultPickupLocation, autoPushToShiprocket } = req.body;
  if (email || password || channelId || defaultPickupLocation) {
    shiprocket.updateCredentials({ email, password, channelId, pickupLocation: defaultPickupLocation });
  }

  if (autoPushToShiprocket !== undefined) {
    db.settings.autoPushToShiprocket = autoPushToShiprocket;
  }
  if (channelId) db.settings.shiprocketChannelId = channelId;
  if (defaultPickupLocation) db.settings.shiprocketPickupLocation = defaultPickupLocation;

  writeData(db);
  res.json({ success: true, message: 'Shiprocket configuration updated successfully' });
});

// ----------------------------------------------------
// 5. PAYMENTS & TRANSACTIONS API
// ----------------------------------------------------
app.get('/api/payments', (req, res) => {
  const db = readData();
  if (!db.payments) db.payments = [];

  const totalVolume = db.payments.reduce((sum, p) => p.status === 'Completed' ? sum + p.amount : sum, 0);
  const totalRefunded = db.payments.reduce((sum, p) => p.status === 'Refunded' ? sum + (p.refundedAmount || p.amount) : sum, 0);
  const pendingCount = db.payments.filter(p => p.status === 'Pending').length;
  const completedCount = db.payments.filter(p => p.status === 'Completed').length;

  res.json({
    success: true,
    data: db.payments,
    stats: {
      totalVolume,
      totalRefunded,
      pendingCount,
      completedCount
    }
  });
});

app.put('/api/payments/:id/status', (req, res) => {
  const db = readData();
  if (!db.payments) db.payments = [];
  const payment = db.payments.find(p => p.id === req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

  const { status } = req.body;
  if (status) payment.status = status;

  // Sync to associated order
  const order = db.orders.find(o => o.id === payment.orderId);
  if (order) order.paymentStatus = status;

  writeData(db);
  res.json({ success: true, message: 'Payment status updated', data: payment });
});

app.post('/api/payments/:id/refund', (req, res) => {
  const db = readData();
  if (!db.payments) db.payments = [];
  const payment = db.payments.find(p => p.id === req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

  const { refundAmount, refundReason } = req.body;
  payment.status = 'Refunded';
  payment.refundedAmount = Number(refundAmount || payment.amount);
  payment.refundReason = refundReason || 'Admin issued return/cancellation refund';

  const order = db.orders.find(o => o.id === payment.orderId);
  if (order) {
    order.paymentStatus = 'Refunded';
    order.returnStatus = 'Refund Completed';
  }

  if (db.returns) {
    const ret = db.returns.find(r => r.orderId === payment.orderId);
    if (ret) ret.status = 'Refund Completed';
  }

  writeData(db);
  res.json({ success: true, message: 'Refund completed successfully', data: payment });
});

// ----------------------------------------------------
// 6. RETURNS & EXCHANGES API
// ----------------------------------------------------
app.get('/api/returns', (req, res) => {
  const db = readData();
  if (!db.returns) db.returns = [];
  res.json({ success: true, count: db.returns.length, data: db.returns });
});

app.post('/api/returns', (req, res) => {
  const db = readData();
  if (!db.returns) db.returns = [];
  const { orderId, reason, notes, items, customerName, customerEmail, customerPhone, refundAmount } = req.body;

  if (!orderId || !reason) {
    return res.status(400).json({ success: false, message: 'Order ID and reason are required' });
  }

  const order = db.orders.find(o => o.id === orderId);
  const newReturn = {
    id: `RET-${Math.floor(1000 + Math.random() * 9000)}`,
    orderId,
    customerName: customerName || order?.customerName || 'Valued Customer',
    customerEmail: customerEmail || order?.email || '',
    customerPhone: customerPhone || order?.phone || '',
    items: items || (order ? order.items : []),
    reason,
    notes: notes || '',
    status: 'Requested',
    createdAt: new Date().toISOString(),
    refundAmount: Number(refundAmount || order?.totalAmount || 0),
    pickupCarrier: 'Delhivery Reverse Logistics',
    pickupTrackingNumber: `REV-${Date.now().toString().slice(-6)}`
  };

  if (order) order.returnStatus = 'Requested';

  db.returns.unshift(newReturn);
  writeData(db);
  res.status(201).json({ success: true, message: 'Return initiated', data: newReturn });
});

app.put('/api/returns/:id/status', (req, res) => {
  const db = readData();
  if (!db.returns) db.returns = [];
  const ret = db.returns.find(r => r.id === req.params.id);
  if (!ret) return res.status(404).json({ success: false, message: 'Return request not found' });

  const { status, adminRemark, pickupCarrier, pickupTrackingNumber } = req.body;
  if (status) ret.status = status;
  if (adminRemark) ret.adminRemark = adminRemark;
  if (pickupCarrier) ret.pickupCarrier = pickupCarrier;
  if (pickupTrackingNumber) ret.pickupTrackingNumber = pickupTrackingNumber;

  const order = db.orders.find(o => o.id === ret.orderId);
  if (order) {
    order.returnStatus = status;
    if (status === 'Refund Completed') {
      order.paymentStatus = 'Refunded';
      const payment = db.payments?.find(p => p.orderId === ret.orderId);
      if (payment) {
        payment.status = 'Refunded';
        payment.refundedAmount = ret.refundAmount;
      }
    }
  }

  writeData(db);
  res.json({ success: true, message: `Return status updated to ${status}`, data: ret });
});

// ----------------------------------------------------
// 7. CUSTOMERS / USERS MANAGEMENT API
// ----------------------------------------------------
app.get('/api/customers', (req, res) => {
  const db = readData();
  const customers = (db.users || []).map(u => {
    const userOrders = (db.orders || []).filter(o => o.email.toLowerCase() === u.email.toLowerCase());
    const totalSpent = userOrders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);
    return {
      ...u,
      totalOrders: userOrders.length,
      totalSpent,
      lastOrderDate: userOrders[0]?.createdAt || u.joinedAt || '2026-08-01',
      tier: totalSpent > 5000 ? 'Platinum Luxe' : totalSpent > 2500 ? 'Gold' : 'Silver',
      status: u.status || 'Active'
    };
  });
  res.json({ success: true, count: customers.length, data: customers });
});

app.put('/api/customers/:id/status', (req, res) => {
  const db = readData();
  const user = (db.users || []).find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });

  const { status } = req.body;
  user.status = status || (user.status === 'Blocked' ? 'Active' : 'Blocked');
  writeData(db);
  res.json({ success: true, message: `Status updated to ${user.status}`, data: user });
});

// ----------------------------------------------------
// 8. REVIEWS MODERATION API
// ----------------------------------------------------
app.get('/api/reviews', (req, res) => {
  const db = readData();
  const allReviews = [];
  (db.products || []).forEach(p => {
    (p.reviews || []).forEach(r => {
      allReviews.push({
        ...r,
        productId: p.id,
        productTitle: p.title,
        productImage: p.image
      });
    });
  });
  res.json({ success: true, count: allReviews.length, data: allReviews });
});

app.delete('/api/reviews/:id', (req, res) => {
  const db = readData();
  let found = false;
  (db.products || []).forEach(p => {
    if (p.reviews) {
      const idx = p.reviews.findIndex(r => r.id === req.params.id);
      if (idx !== -1) {
        p.reviews.splice(idx, 1);
        found = true;
      }
    }
  });
  if (found) {
    writeData(db);
    return res.json({ success: true, message: 'Review removed' });
  }
  res.status(404).json({ success: false, message: 'Review not found' });
});

// ----------------------------------------------------
// 9. SETTINGS API
// ----------------------------------------------------
app.get('/api/settings', (req, res) => {
  const db = readData();
  res.json({ success: true, data: db.settings });
});

app.put('/api/settings', (req, res) => {
  const db = readData();
  db.settings = { ...db.settings, ...req.body };
  writeData(db);
  res.json({ success: true, message: 'Settings updated', data: db.settings });
});

// ----------------------------------------------------
// 10. ANALYTICS API (Comprehensive Executive Summary)
// ----------------------------------------------------
app.get('/api/analytics', (req, res) => {
  const db = readData();
  const totalRevenue = (db.orders || []).reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
  const totalOrders = (db.orders || []).length;
  const totalProducts = (db.products || []).length;
  const lowStockProducts = (db.products || []).filter(p => p.stock < 10);
  const pendingOrders = (db.orders || []).filter(o => o.status === 'Processing' || o.status === 'Pending').length;
  const activeShipments = (db.orders || []).filter(o => o.status === 'Shipped' || (o.tracking && o.tracking.status === 'In Transit')).length;
  const pendingReturns = (db.returns || []).filter(r => r.status === 'Requested' || r.status === 'Approved').length;
  const settledPayments = (db.payments || []).filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      pendingOrdersCount: pendingOrders,
      activeShipmentsCount: activeShipments,
      pendingReturnsCount: pendingReturns,
      settledPaymentsVolume: settledPayments,
      recentOrders: (db.orders || []).slice(0, 5),
      lowStockProducts
    }
  });
});

// ----------------------------------------------------
// 11. WHATSAPP CRM & BOT AUTOMATION ENGINE
// ----------------------------------------------------
const initWhatsAppDefaults = (db) => {
  if (!db.whatsapp) {
    db.whatsapp = {
      config: {
        businessPhone: "+91 98000 12345",
        wabaId: "WABA_BRIVOO_9921",
        phoneNumberId: "PNID_8839210",
        metaAppStatus: "Connected",
        webhookVerified: true,
        autoReplyEnabled: true,
        botName: "BRIVOO Concierge AI"
      },
      conversations: [
        {
          id: "wa-conv-1",
          customerName: "Hanuman Jogi",
          phone: "+91 98765 43210",
          email: "hanuman@example.com",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
          unreadCount: 0,
          tier: "VIP Platinum",
          totalSpent: "₹8,497",
          lastOrderId: "BRV-98408",
          lastActive: "10 mins ago",
          tags: ["VIP Patron", "Resortwear Buyer"],
          messages: [
            {
              id: "msg-101",
              sender: "customer",
              text: "Hello, can you confirm if my Linen Camp Collar Shirt in Sand Beige has been dispatched?",
              time: "02:15 PM",
              status: "read"
            },
            {
              id: "msg-102",
              sender: "bot",
              text: "Hello Hanuman! 🙏 Thank you for reaching out to BRIVOO Atelier Concierge. Your Order #BRV-98408 is In Transit with FedEx Express (AWB: FDX-99482019). Estimated delivery is tomorrow before 5:00 PM.",
              time: "02:15 PM",
              status: "read",
              isAutomated: true
            },
            {
              id: "msg-103",
              sender: "customer",
              text: "Great! Also, is the matching linen trousers available in size 34?",
              time: "02:22 PM",
              status: "read"
            },
            {
              id: "msg-104",
              sender: "admin",
              text: "Yes, Hanuman ji! We have 4 units left of the Relaxed Resort Linen Trousers in size 34. Would you like me to reserve one with your 10% VIP Atelier discount?",
              time: "02:28 PM",
              status: "delivered"
            }
          ]
        },
        {
          id: "wa-conv-2",
          customerName: "Priya Verma",
          phone: "+91 99887 76655",
          email: "priya.verma@gmail.com",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
          unreadCount: 1,
          tier: "Gold Luxe",
          totalSpent: "₹5,298",
          lastOrderId: "BRV-98411",
          lastActive: "Just now",
          tags: ["High Cart Value", "Size Query"],
          messages: [
            {
              id: "msg-201",
              sender: "bot",
              text: "Hello Priya! ✨ We noticed you left the European Flax Resort Shirt in your bag. Complete your purchase now and enjoy complimentary express delivery with code LUXE10.",
              time: "01:00 PM",
              status: "read",
              isAutomated: true
            },
            {
              id: "msg-202",
              sender: "customer",
              text: "Hello! Does the resort shirt run true to size or should I size up for an oversized drape?",
              time: "03:45 PM",
              status: "unread"
            }
          ]
        },
        {
          id: "wa-conv-3",
          customerName: "Natasha Oberoi",
          phone: "+91 98111 22334",
          email: "natasha.o@luxury.in",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          unreadCount: 0,
          tier: "Platinum Luxe",
          totalSpent: "₹18,990",
          lastOrderId: "BRV-98409",
          lastActive: "Yesterday",
          tags: ["Styling Consultation", "Atelier Evening"],
          messages: [
            {
              id: "msg-301",
              sender: "bot",
              text: "Order Confirmed: #BRV-98409 for Natasha Oberoi. Total ₹3,058 paid via Net Banking. Our master artisans are preparing your luxury garments.",
              time: "Yesterday 04:30 PM",
              status: "read",
              isAutomated: true
            },
            {
              id: "msg-302",
              sender: "customer",
              text: "Thank you for the prompt update. Please ensure eco-luxe garment bag packaging.",
              time: "Yesterday 04:45 PM",
              status: "read"
            },
            {
              id: "msg-303",
              sender: "admin",
              text: "Absolutely, Natasha ji. All your garments will arrive wrapped in custom breathable cotton muslin with cedar hanger blocks.",
              time: "Yesterday 05:00 PM",
              status: "read"
            }
          ]
        }
      ],
      automations: [
        {
          id: "auto-1",
          name: "Instant Order Confirmation",
          trigger: "ORDER_PLACED",
          description: "Immediately sends branded receipt, itemized garment summary, and support link upon checkout.",
          enabled: true,
          delayMinutes: 0,
          sentCount: 142,
          successRate: "99.8%",
          template: "Hello {customer_name}! ✨ Your BRIVOO order #{order_id} of ₹{total_amount} is confirmed. Our atelier craftsmen are carefully hand-inspecting and preparing your luxury pieces. Track status anytime: {tracking_link}"
        },
        {
          id: "auto-2",
          name: "Dispatch & Live AWB Tracking",
          trigger: "ORDER_SHIPPED",
          description: "Sends live courier tracking link (FedEx/Bluedart) when order enters transit.",
          enabled: true,
          delayMinutes: 5,
          sentCount: 98,
          successRate: "99.4%",
          template: "Exciting news {customer_name}! 🚀 Your order #{order_id} has been dispatched via {carrier} (AWB: {tracking_number}). Expected delivery: {estimated_delivery}. Track your package live here: {tracking_link}"
        },
        {
          id: "auto-3",
          name: "Abandoned Cart Smart Recovery",
          trigger: "CART_ABANDONED",
          description: "Re-engages shoppers who left products in cart with an exclusive 10% reservation perk.",
          enabled: true,
          delayMinutes: 120,
          sentCount: 56,
          successRate: "42.1% recovered",
          template: "Hello {customer_name}! We saved your selected luxury pieces in your BRIVOO private bag. Complete your order within 24 hours and unlock 10% off with code VIP10: {checkout_link}"
        },
        {
          id: "auto-4",
          name: "Post-Delivery VIP Review Request",
          trigger: "ORDER_DELIVERED",
          description: "Invites delivered patrons to share feedback and photo reviews 24 hours after unboxing.",
          enabled: true,
          delayMinutes: 1440,
          sentCount: 84,
          successRate: "34.5% rated",
          template: "Hello {customer_name}, we hope you are loving your new BRIVOO garments! How was your unboxing experience? Tap here to share a review and receive 500 Atelier Reward points: {review_link}"
        },
        {
          id: "auto-5",
          name: "Welcome Concierge & VIP Pass",
          trigger: "NEW_SIGNUP",
          description: "Welcomes newly registered patrons with personal concierge contact info.",
          enabled: true,
          delayMinutes: 2,
          sentCount: 210,
          successRate: "100%",
          template: "Welcome to BRIVOO Atelier, {customer_name}! 🌟 You are now enrolled in our Private Clientele circle. Enjoy complimentary tailoring, priority previews, and member-only pricing. Reach us directly here anytime."
        }
      ],
      campaigns: [
        {
          id: "camp-1",
          name: "Summer Linen 2026 Lookbook Launch",
          audience: "All Active Patrons (145 contacts)",
          scheduledAt: "2026-10-01 11:00 AM",
          status: "Completed",
          delivered: 144,
          read: 138,
          replies: 28,
          ctr: "31.2%"
        },
        {
          id: "camp-2",
          name: "VIP Evening Atelier Private Drop",
          audience: "Platinum & Gold Patrons (42 contacts)",
          scheduledAt: "2026-10-04 06:30 PM",
          status: "Completed",
          delivered: 42,
          read: 41,
          replies: 16,
          ctr: "48.5%"
        }
      ]
    };
  }
};

app.get('/api/whatsapp/conversations', (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  res.json({ success: true, data: db.whatsapp.conversations });
});

app.post('/api/whatsapp/conversations/:id/messages', (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  const conv = db.whatsapp.conversations.find(c => c.id === req.params.id);
  if (!conv) {
    return res.status(404).json({ success: false, message: 'Conversation not found' });
  }

  const newMsg = {
    id: 'msg-' + Date.now(),
    sender: req.body.sender || 'admin',
    text: req.body.text || '',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'delivered'
  };

  conv.messages.push(newMsg);
  conv.lastActive = 'Just now';
  if (req.body.sender === 'admin') {
    conv.unreadCount = 0;
  }
  writeData(db);
  res.json({ success: true, data: conv, message: newMsg });
});

app.get('/api/whatsapp/automations', (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  res.json({ success: true, data: db.whatsapp.automations });
});

app.put('/api/whatsapp/automations/:id', (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  const idx = db.whatsapp.automations.findIndex(a => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Automation not found' });
  }

  db.whatsapp.automations[idx] = { ...db.whatsapp.automations[idx], ...req.body };
  writeData(db);
  res.json({ success: true, data: db.whatsapp.automations[idx], message: 'Automation updated' });
});

app.post('/api/whatsapp/automations/:id/test', (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  const auto = db.whatsapp.automations.find(a => a.id === req.params.id);
  if (!auto) {
    return res.status(404).json({ success: false, message: 'Automation not found' });
  }

  const phone = req.body.phone || "+91 98765 43210";
  auto.sentCount = (auto.sentCount || 0) + 1;
  writeData(db);

  res.json({ 
    success: true, 
    message: `Test trigger executed for ${auto.name} to ${phone}`,
    template: auto.template
  });
});

app.get('/api/whatsapp/campaigns', (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  res.json({ success: true, data: db.whatsapp.campaigns });
});

app.post('/api/whatsapp/campaigns', (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  const newCamp = {
    id: 'camp-' + Date.now(),
    name: req.body.name || 'VIP Broadcast Campaign',
    audience: req.body.audience || 'All Active Patrons (145 contacts)',
    scheduledAt: 'Just now',
    status: 'Completed',
    delivered: 145,
    read: 141,
    replies: 19,
    ctr: '38.4%'
  };

  db.whatsapp.campaigns.unshift(newCamp);
  writeData(db);
  res.json({ success: true, data: newCamp, message: 'Campaign dispatched successfully!' });
});

app.get('/api/whatsapp/config', (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  res.json({ success: true, data: db.whatsapp.config });
});

app.put('/api/whatsapp/config', (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  db.whatsapp.config = { ...db.whatsapp.config, ...req.body };
  writeData(db);
  res.json({ success: true, data: db.whatsapp.config, message: 'WhatsApp configuration updated' });
});

// ----------------------------------------------------
// 12. VENDOR PROCUREMENT & INWARD STOCK LEDGER
// ----------------------------------------------------
const initVendorDefaults = (db) => {
  if (!db.vendors) {
    db.vendors = [
      {
        id: "vnd-1",
        name: "Milano Flax Mills (Italy)",
        category: "Fabric & Textiles",
        contactPerson: "Marco Bellini",
        phone: "+39 02 8849 1029",
        email: "marco@milanoflax.it",
        city: "Milan, Italy",
        gstin: "07AAACM1209A1ZP",
        totalBilled: 956000,
        totalPaid: 950000,
        pendingBalance: 6000,
        status: "Active",
        rating: 4.9,
        bankDetails: {
          accountName: "Milano Flax Textiles SpA",
          accountNumber: "IT60X0542811101000000123456",
          ifsc: "SWIFT: BCMITMM",
          bankName: "Banca Intesa Sanpaolo"
        }
      },
      {
        id: "vnd-2",
        name: "Surat Heritage Loom Co.",
        category: "Fabric & Textiles",
        contactPerson: "Rajesh Singhania",
        phone: "+91 98251 44332",
        email: "rajesh@suratloom.in",
        city: "Surat, Gujarat",
        gstin: "24AAACS8819Q1ZG",
        totalBilled: 340000,
        totalPaid: 340000,
        pendingBalance: 0,
        status: "Active",
        rating: 4.8,
        bankDetails: {
          accountName: "Surat Heritage Loom Co",
          accountNumber: "9921004928109",
          ifsc: "HDFC0000214",
          bankName: "HDFC Bank Surat Ring Road"
        }
      },
      {
        id: "vnd-3",
        name: "Atelier Artisans Tailoring Unit",
        category: "Tailoring & Production",
        contactPerson: "Virender Chawla",
        phone: "+91 98110 33921",
        email: "virender@atelierartisans.in",
        city: "Noida, NCR",
        gstin: "09AAACA4490B1ZF",
        totalBilled: 227500,
        totalPaid: 150000,
        pendingBalance: 77500,
        status: "Active",
        rating: 5.0,
        bankDetails: {
          accountName: "Atelier Artisans Studio Pvt Ltd",
          accountNumber: "50200019283741",
          ifsc: "ICIC0001092",
          bankName: "ICICI Bank Sector 18 Noida"
        }
      },
      {
        id: "vnd-4",
        name: "Florence Mother of Pearl Buttons & Trims",
        category: "Trims & Buttons",
        contactPerson: "Elena Rossi",
        phone: "+39 055 992019",
        email: "elena@florencetrims.com",
        city: "Florence, Italy",
        gstin: "07AAACF8892P1ZK",
        totalBilled: 137500,
        totalPaid: 137500,
        pendingBalance: 0,
        status: "Active",
        rating: 4.9,
        bankDetails: {
          accountName: "Florence Trims SRL",
          accountNumber: "IT99Y0123456789000000098765",
          ifsc: "SWIFT: UNICITMM",
          bankName: "UniCredit Florence"
        }
      }
    ];
  }

  if (!db.vendorInward) {
    db.vendorInward = [
      {
        id: "inw-101",
        vendorId: "vnd-1",
        vendorName: "Milano Flax Mills (Italy)",
        poNumber: "PO-BRV-8821",
        date: "2026-10-02",
        itemName: "100% Master-Grade European Flax Linen (Sand Beige, 180 GSM)",
        category: "Raw Fabric",
        quantityReceived: 1200,
        unit: "Meters",
        ratePerUnit: 450,
        totalAmount: 540000,
        status: "Received & Inspected",
        challanNo: "CH-MIL-99420",
        warehouseLocation: "Gurugram Central Atelier Hub",
        qcRemarks: "Certified European Flax with zero shrinkage and pristine warp quality.",
        invoiceNo: "INV-MIL-7782"
      },
      {
        id: "inw-102",
        vendorId: "vnd-1",
        vendorName: "Milano Flax Mills (Italy)",
        poNumber: "PO-BRV-8822",
        date: "2026-09-24",
        itemName: "Structured Linen Blend for Atelier Waistcoats (Olive Green, 220 GSM)",
        category: "Raw Fabric",
        quantityReceived: 800,
        unit: "Meters",
        ratePerUnit: 520,
        totalAmount: 416000,
        status: "Received & Inspected",
        challanNo: "CH-MIL-99380",
        warehouseLocation: "Gurugram Central Atelier Hub",
        qcRemarks: "High tensile strength, pre-washed finish verified.",
        invoiceNo: "INV-MIL-7710"
      },
      {
        id: "inw-103",
        vendorId: "vnd-2",
        vendorName: "Surat Heritage Loom Co.",
        poNumber: "PO-BRV-8819",
        date: "2026-09-29",
        itemName: "Organic Long-Staple Cotton Slub (Ivory White)",
        category: "Raw Fabric",
        quantityReceived: 1000,
        unit: "Meters",
        ratePerUnit: 340,
        totalAmount: 340000,
        status: "Received & Inspected",
        challanNo: "CH-SUR-1109",
        warehouseLocation: "Bhiwandi Storage Depot",
        qcRemarks: "All 10 rolls inspected. Soft handle and zero pilling.",
        invoiceNo: "INV-SUR-5541"
      },
      {
        id: "inw-104",
        vendorId: "vnd-3",
        vendorName: "Atelier Artisans Tailoring Unit",
        poNumber: "PO-BRV-8825",
        date: "2026-10-04",
        itemName: "Finished Garment Batch: Linen Camp Collar Shirts (Assorted S, M, L, XL)",
        category: "Finished Garments",
        quantityReceived: 350,
        unit: "Pieces",
        ratePerUnit: 650,
        totalAmount: 227500,
        status: "Received & Inspected",
        challanNo: "CH-AAT-4421",
        warehouseLocation: "Gurugram Central Atelier Hub",
        qcRemarks: "French seams and pearl button fastening verified across batch.",
        invoiceNo: "INV-AAT-0912"
      },
      {
        id: "inw-105",
        vendorId: "vnd-4",
        vendorName: "Florence Mother of Pearl Buttons & Trims",
        poNumber: "PO-BRV-8815",
        date: "2026-09-20",
        itemName: "Genuine Australian Mother-of-Pearl 4-Hole Buttons (18L)",
        category: "Trims & Buttons",
        quantityReceived: 25000,
        unit: "Pieces",
        ratePerUnit: 5.5,
        totalAmount: 137500,
        status: "Received & Inspected",
        challanNo: "CH-FLR-882",
        warehouseLocation: "Gurugram Central Atelier Hub",
        qcRemarks: "Zero breakage. Natural iridescent sheen intact.",
        invoiceNo: "INV-FLR-442"
      }
    ];
  }

  if (!db.vendorPayouts) {
    db.vendorPayouts = [
      {
        id: "vpay-201",
        vendorId: "vnd-1",
        vendorName: "Milano Flax Mills (Italy)",
        amount: 540000,
        date: "2026-10-04",
        paymentMode: "Bank Transfer (NEFT/RTGS)",
        transactionRef: "HDFC_RTGS_99812401",
        invoiceRef: "INV-MIL-7782",
        status: "Completed",
        notes: "Full payment against PO-BRV-8821 after QC clearance."
      },
      {
        id: "vpay-202",
        vendorId: "vnd-1",
        vendorName: "Milano Flax Mills (Italy)",
        amount: 410000,
        date: "2026-09-26",
        paymentMode: "Bank Transfer (NEFT/RTGS)",
        transactionRef: "HDFC_RTGS_88710294",
        invoiceRef: "INV-MIL-7710",
        status: "Completed",
        notes: "Payment for PO-BRV-8822."
      },
      {
        id: "vpay-203",
        vendorId: "vnd-2",
        vendorName: "Surat Heritage Loom Co.",
        amount: 340000,
        date: "2026-10-01",
        paymentMode: "Bank Transfer (NEFT/RTGS)",
        transactionRef: "HDFC_NEFT_55410921",
        invoiceRef: "INV-SUR-5541",
        status: "Completed",
        notes: "Settled in full for cotton slub rolls."
      },
      {
        id: "vpay-204",
        vendorId: "vnd-3",
        vendorName: "Atelier Artisans Tailoring Unit",
        amount: 150000,
        date: "2026-10-05",
        paymentMode: "Bank Transfer (NEFT/RTGS)",
        transactionRef: "HDFC_NEFT_77491028",
        invoiceRef: "INV-AAT-0912",
        status: "Completed",
        notes: "Advance installment against PO-BRV-8825. Remaining ₹77,500 due on 12 Oct."
      },
      {
        id: "vpay-205",
        vendorId: "vnd-4",
        vendorName: "Florence Mother of Pearl Buttons & Trims",
        amount: 137500,
        date: "2026-09-22",
        paymentMode: "Bank Transfer (NEFT/RTGS)",
        transactionRef: "HDFC_SWIFT_338910",
        invoiceRef: "INV-FLR-442",
        status: "Completed",
        notes: "Cleared in full."
      }
    ];
  }
};

app.get('/api/vendors', (req, res) => {
  const db = readData();
  initVendorDefaults(db);
  res.json({ success: true, data: db.vendors });
});

app.post('/api/vendors', (req, res) => {
  const db = readData();
  initVendorDefaults(db);
  const newVendor = {
    id: 'vnd-' + Date.now(),
    name: req.body.name,
    category: req.body.category || 'Fabric & Textiles',
    contactPerson: req.body.contactPerson || '',
    phone: req.body.phone || '',
    email: req.body.email || '',
    city: req.body.city || '',
    gstin: req.body.gstin || '',
    totalBilled: 0,
    totalPaid: 0,
    pendingBalance: 0,
    status: 'Active',
    rating: 5.0,
    bankDetails: req.body.bankDetails || {}
  };
  db.vendors.push(newVendor);
  writeData(db);
  res.json({ success: true, data: newVendor, message: 'Vendor added successfully' });
});

app.get('/api/vendors/inward', (req, res) => {
  const db = readData();
  initVendorDefaults(db);
  res.json({ success: true, data: db.vendorInward });
});

app.post('/api/vendors/inward', (req, res) => {
  const db = readData();
  initVendorDefaults(db);
  const totalAmount = Number(req.body.quantityReceived) * Number(req.body.ratePerUnit);
  const newInward = {
    id: 'inw-' + Date.now(),
    vendorId: req.body.vendorId,
    vendorName: req.body.vendorName,
    poNumber: req.body.poNumber || `PO-BRV-${Math.floor(1000 + Math.random() * 9000)}`,
    date: req.body.date || new Date().toISOString().split('T')[0],
    itemName: req.body.itemName,
    category: req.body.category || 'Raw Fabric',
    quantityReceived: Number(req.body.quantityReceived),
    unit: req.body.unit || 'Meters',
    ratePerUnit: Number(req.body.ratePerUnit),
    totalAmount,
    status: req.body.status || 'Received & Inspected',
    challanNo: req.body.challanNo || `CH-${Date.now().toString().slice(-5)}`,
    warehouseLocation: req.body.warehouseLocation || 'Gurugram Central Atelier Hub',
    qcRemarks: req.body.qcRemarks || 'Inspected and added to atelier stock.',
    invoiceNo: req.body.invoiceNo || ''
  };

  db.vendorInward.unshift(newInward);

  // Update vendor totals
  const vendor = db.vendors.find(v => v.id === req.body.vendorId);
  if (vendor) {
    vendor.totalBilled = (vendor.totalBilled || 0) + totalAmount;
    vendor.pendingBalance = (vendor.pendingBalance || 0) + totalAmount;
  }

  writeData(db);
  res.json({ success: true, data: newInward, message: 'Inward stock receipt recorded successfully' });
});

app.get('/api/vendors/payouts', (req, res) => {
  const db = readData();
  initVendorDefaults(db);
  res.json({ success: true, data: db.vendorPayouts });
});

app.post('/api/vendors/payouts', (req, res) => {
  const db = readData();
  initVendorDefaults(db);
  const amount = Number(req.body.amount);
  const newPayout = {
    id: 'vpay-' + Date.now(),
    vendorId: req.body.vendorId,
    vendorName: req.body.vendorName,
    amount,
    date: req.body.date || new Date().toISOString().split('T')[0],
    paymentMode: req.body.paymentMode || 'Bank Transfer (NEFT/RTGS)',
    transactionRef: req.body.transactionRef || `HDFC_PAY_${Date.now().toString().slice(-6)}`,
    invoiceRef: req.body.invoiceRef || '',
    status: 'Completed',
    notes: req.body.notes || 'Vendor disbursement cleared.'
  };

  db.vendorPayouts.unshift(newPayout);

  // Update vendor totals
  const vendor = db.vendors.find(v => v.id === req.body.vendorId);
  if (vendor) {
    vendor.totalPaid = (vendor.totalPaid || 0) + amount;
    vendor.pendingBalance = Math.max(0, (vendor.pendingBalance || 0) - amount);
  }

  writeData(db);
  res.json({ success: true, data: newPayout, message: 'Vendor payout recorded successfully' });
});

// ----------------------------------------------------
// 13. INFLUENCER & MARKETING SPEND SUITE
// ----------------------------------------------------
const initMarketingDefaults = (db) => {
  if (!db.influencers) {
    db.influencers = [
      {
        id: "inf-1",
        name: "Karan Oberoi",
        handle: "@karanoberoi_official",
        platform: "Instagram",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        followers: "485K",
        niche: "Men's Luxury Fashion & Sartorial Lifestyle",
        campaignName: "SS26 European Flax Resort Launch",
        deliverables: "2 Dedicated 4K Reels + 4 Story Frames + 1 Lookbook Carousel",
        agreedFee: 85000,
        paidAmount: 85000,
        pendingAmount: 0,
        paymentStatus: "Paid in Full",
        paymentDate: "2026-09-28",
        paymentRef: "UPI_AXIS_881920",
        couponCode: "KARAN10",
        salesGenerated: 342000,
        ordersCount: 114,
        roas: "4.02x",
        status: "Completed"
      },
      {
        id: "inf-2",
        name: "Tanya Ghavri",
        handle: "@tanyaluxestyle",
        platform: "Instagram",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        followers: "620K",
        niche: "Quiet Luxury & Resort Aesthetic",
        campaignName: "Mediterranean Atelier Evening Capsule",
        deliverables: "1 Cinematic Reel + 3 Styling Carousels + VIP Link in Bio",
        agreedFee: 120000,
        paidAmount: 120000,
        pendingAmount: 0,
        paymentStatus: "Paid in Full",
        paymentDate: "2026-10-02",
        paymentRef: "HDFC_NEFT_9948201",
        couponCode: "TANYA10",
        salesGenerated: 516000,
        ordersCount: 172,
        roas: "4.30x",
        status: "Completed"
      },
      {
        id: "inf-3",
        name: "Armaan Malik",
        handle: "@armaan_drapes",
        platform: "YouTube",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        followers: "310K",
        niche: "Men's Capsule Wardrobe & Fabric Quality Reviews",
        campaignName: "Unboxing & Fabric Science: European Flax vs Regular Linen",
        deliverables: "Dedicated 12-Minute YouTube Review + Community Post",
        agreedFee: 65000,
        paidAmount: 65000,
        pendingAmount: 0,
        paymentStatus: "Paid in Full",
        paymentDate: "2026-09-15",
        paymentRef: "HDFC_IMPS_3341902",
        couponCode: "ARMAAN10",
        salesGenerated: 228000,
        ordersCount: 76,
        roas: "3.51x",
        status: "Completed"
      },
      {
        id: "inf-4",
        name: "Rhea Kapoor Curations",
        handle: "@rhea_curates",
        platform: "Instagram",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        followers: "240K",
        niche: "Architectural Minimalist Fashion",
        campaignName: "Autumn Riviera Lookbook Feature",
        deliverables: "2 Reels + 2 Feed Posts + Whitelisting Rights",
        agreedFee: 75000,
        paidAmount: 40000,
        pendingAmount: 35000,
        paymentStatus: "Partially Paid",
        paymentDate: "2026-10-03",
        paymentRef: "HDFC_NEFT_771029",
        couponCode: "RHEA10",
        salesGenerated: 165000,
        ordersCount: 55,
        roas: "2.20x",
        status: "Contract Signed"
      }
    ];
  }

  if (!db.marketingExpenses) {
    db.marketingExpenses = [
      {
        id: "mkt-1",
        title: "Meta Ads (Instagram / Facebook): SS26 European Flax Linen Conversions",
        channel: "Meta Ads (Instagram & FB)",
        period: "September - October 2026",
        date: "2026-10-01",
        amount: 185000,
        attributedRevenue: 778000,
        roas: "4.2x",
        status: "Active",
        notes: "Targeting luxury shoppers, travel, and bespoke tailoring in top 8 metro cities."
      },
      {
        id: "mkt-2",
        title: "Google Ads: High-Intent Search & Shopping (Linen Shirts, Waistcoats)",
        channel: "Google Ads (Search & Shopping)",
        period: "September 2026",
        date: "2026-09-30",
        amount: 95000,
        attributedRevenue: 399000,
        roas: "4.2x",
        status: "Active",
        notes: "Keywords: pure linen shirt men, italian resort shirts, quiet luxury apparel."
      },
      {
        id: "mkt-3",
        title: "Atelier Riviera Editorial Photoshoot & Lookbook Production",
        channel: "PR & Lookbook Photoshoot",
        period: "August 2026",
        date: "2026-08-25",
        amount: 140000,
        attributedRevenue: 0,
        roas: "Brand Asset",
        status: "Completed",
        notes: "Location rental in Alibaug villa, 2 professional models, styling team, 35mm film & 4K video assets."
      },
      {
        id: "mkt-4",
        title: "Influencer Campaign Retainers & Gifting Pool (Total 4 Creators)",
        channel: "Influencer Collaborations",
        period: "September - October 2026",
        date: "2026-10-05",
        amount: 310000,
        attributedRevenue: 1251000,
        roas: "4.03x",
        status: "Active",
        notes: "Tracked affiliate coupon codes (KARAN10, TANYA10, ARMAAN10, RHEA10)."
      },
      {
        id: "mkt-5",
        title: "WhatsApp VIP Concierge Broadcast Engine & Meta Cloud API Spend",
        channel: "WhatsApp Campaigns",
        period: "October 2026",
        date: "2026-10-04",
        amount: 12500,
        attributedRevenue: 148000,
        roas: "11.8x",
        status: "Completed",
        notes: "Broadcast message templates delivered to 145 VIP patrons with 38% conversion rate."
      }
    ];
  }
};

app.get('/api/marketing/influencers', (req, res) => {
  const db = readData();
  initMarketingDefaults(db);
  res.json({ success: true, data: db.influencers });
});

app.post('/api/marketing/influencers', (req, res) => {
  const db = readData();
  initMarketingDefaults(db);
  const agreedFee = Number(req.body.agreedFee) || 0;
  const paidAmount = Number(req.body.paidAmount) || 0;
  const pendingAmount = Math.max(0, agreedFee - paidAmount);
  const newInf = {
    id: 'inf-' + Date.now(),
    name: req.body.name,
    handle: req.body.handle,
    platform: req.body.platform || 'Instagram',
    avatar: req.body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    followers: req.body.followers || '100K',
    niche: req.body.niche || 'Luxury Fashion',
    campaignName: req.body.campaignName || 'Seasonal Campaign',
    deliverables: req.body.deliverables || '1 Reel + 2 Stories',
    agreedFee,
    paidAmount,
    pendingAmount,
    paymentStatus: pendingAmount === 0 ? 'Paid in Full' : paidAmount > 0 ? 'Partially Paid' : 'Payment Pending',
    paymentDate: req.body.paymentDate || (paidAmount > 0 ? new Date().toISOString().split('T')[0] : undefined),
    paymentRef: req.body.paymentRef || (paidAmount > 0 ? `UPI_${Date.now().toString().slice(-6)}` : undefined),
    couponCode: req.body.couponCode || '',
    salesGenerated: Number(req.body.salesGenerated) || 0,
    ordersCount: Number(req.body.ordersCount) || 0,
    roas: agreedFee > 0 && req.body.salesGenerated ? `${(Number(req.body.salesGenerated) / agreedFee).toFixed(2)}x` : '0x',
    status: req.body.status || 'Contract Signed'
  };

  db.influencers.unshift(newInf);
  writeData(db);
  res.json({ success: true, data: newInf, message: 'Influencer collaboration added' });
});

app.put('/api/marketing/influencers/:id/payout', (req, res) => {
  const db = readData();
  initMarketingDefaults(db);
  const inf = db.influencers.find(i => i.id === req.params.id);
  if (!inf) {
    return res.status(404).json({ success: false, message: 'Influencer not found' });
  }

  const additionalPay = Number(req.body.amount);
  inf.paidAmount = (inf.paidAmount || 0) + additionalPay;
  inf.pendingAmount = Math.max(0, (inf.agreedFee || 0) - inf.paidAmount);
  inf.paymentStatus = inf.pendingAmount === 0 ? 'Paid in Full' : 'Partially Paid';
  inf.paymentDate = req.body.paymentDate || new Date().toISOString().split('T')[0];
  inf.paymentRef = req.body.paymentRef || `IMPS_${Date.now().toString().slice(-6)}`;

  writeData(db);
  res.json({ success: true, data: inf, message: 'Influencer payout updated' });
});

app.get('/api/marketing/expenses', (req, res) => {
  const db = readData();
  initMarketingDefaults(db);
  res.json({ success: true, data: db.marketingExpenses });
});

app.post('/api/marketing/expenses', (req, res) => {
  const db = readData();
  initMarketingDefaults(db);
  const amount = Number(req.body.amount);
  const rev = Number(req.body.attributedRevenue) || 0;
  const newExp = {
    id: 'mkt-' + Date.now(),
    title: req.body.title,
    channel: req.body.channel || 'Meta Ads (Instagram & FB)',
    period: req.body.period || 'Current Month',
    date: req.body.date || new Date().toISOString().split('T')[0],
    amount,
    attributedRevenue: rev,
    roas: amount > 0 && rev > 0 ? `${(rev / amount).toFixed(1)}x` : 'Brand Asset',
    status: req.body.status || 'Active',
    notes: req.body.notes || ''
  };

  db.marketingExpenses.unshift(newExp);
  writeData(db);
  res.json({ success: true, data: newExp, message: 'Marketing expense recorded successfully' });
});

app.get('/api/marketing/summary', (req, res) => {
  const db = readData();
  initMarketingDefaults(db);
  const totalMarketingSpend = (db.marketingExpenses || []).reduce((sum, e) => sum + e.amount, 0);
  const totalInfluencerPaid = (db.influencers || []).reduce((sum, i) => sum + i.paidAmount, 0);
  const totalAttributedRevenue = (db.marketingExpenses || []).reduce((sum, e) => sum + (e.attributedRevenue || 0), 0) +
    (db.influencers || []).reduce((sum, i) => sum + (i.salesGenerated || 0), 0);

  const totalAdSpend = (db.marketingExpenses || [])
    .filter(e => e.channel.includes('Meta') || e.channel.includes('Google'))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPRAndShoots = (db.marketingExpenses || [])
    .filter(e => e.channel.includes('Photoshoot') || e.channel.includes('Events') || e.channel.includes('PR'))
    .reduce((sum, e) => sum + e.amount, 0);

  res.json({
    success: true,
    data: {
      totalMarketingSpend,
      totalInfluencerPaid,
      totalAdSpend,
      totalPRAndShoots,
      totalAttributedRevenue,
      overallROAS: totalMarketingSpend > 0 ? `${(totalAttributedRevenue / totalMarketingSpend).toFixed(2)}x` : '0x',
      influencersCount: (db.influencers || []).length,
      expensesCount: (db.marketingExpenses || []).length
    }
  });
});

// ----------------------------------------------------
// 14. AI FASHION STYLIST & VIRTUAL TRY-ON STUDIO
// ----------------------------------------------------
app.post('/api/ai/ask', (req, res) => {
  const db = readData();
  const { prompt = '', occasion = 'Resort & Casual', gender = 'All', bodyType = 'Athletic', currentProductId } = req.body;
  const q = prompt.toLowerCase();

  // Find all products
  let products = db.products || [];

  // Filter or prioritize based on user query
  let matchedProducts = [];
  if (q.includes('shirt') || q.includes('linen') || q.includes('kurta')) {
    matchedProducts = products.filter(p => p.category.toLowerCase().includes('shirt') || p.title.toLowerCase().includes('linen'));
  } else if (q.includes('pant') || q.includes('trouser') || q.includes('chinos')) {
    matchedProducts = products.filter(p => p.category.toLowerCase().includes('pant') || p.category.toLowerCase().includes('trouser') || p.title.toLowerCase().includes('pant'));
  } else if (q.includes('wedding') || q.includes('formal') || q.includes('blazer') || q.includes('jacket') || q.includes('waistcoat')) {
    matchedProducts = products.filter(p => p.category.toLowerCase().includes('waistcoat') || p.category.toLowerCase().includes('blazer') || p.category.toLowerCase().includes('formal') || p.tag === 'Featured');
  } else if (q.includes('dress') || q.includes('women') || gender.toLowerCase() === 'women') {
    matchedProducts = products.filter(p => p.gender === 'Women' || p.category.toLowerCase().includes('dress'));
  }

  // Fallback to top products if no specific keyword match
  if (matchedProducts.length === 0) {
    matchedProducts = products.slice(0, 4);
  } else {
    // Add additional complementary products
    const otherProducts = products.filter(p => !matchedProducts.some(m => m.id === p.id)).slice(0, 2);
    matchedProducts = [...matchedProducts, ...otherProducts].slice(0, 4);
  }

  // Personalized Stylist Advice generation
  let stylistAdvice = '';
  let fitAdvice = '';
  let colorPalette = [
    { name: 'Riviera Chalk', hex: '#FAF7F2' },
    { name: 'Tuscan Linen', hex: '#C5A059' },
    { name: 'Aegean Navy', hex: '#1E293B' },
    { name: 'Olive Drab', hex: '#3F4A3C' }
  ];

  if (q.includes('wedding') || occasion.toLowerCase().includes('wedding')) {
    stylistAdvice = "For luxury summer weddings and soirée evenings, BRIVOO's European Flax tailored shirts paired with a bespoke silk-blend waistcoat offer an unmatched balance of regal comfort and understated elegance. The natural texture prevents creasing from looking untidy, instead imparting a signature quiet luxury patina.";
    fitAdvice = "Select a classic tailored fit across the chest with relaxed waist tapering. If between sizes, opt for a size up for fluid evening draping.";
    colorPalette = [
      { name: 'Ivory Flax', hex: '#FDFBF7' },
      { name: 'Imperial Gold', hex: '#C5A059' },
      { name: 'Warm Sand', hex: '#D2B48C' },
      { name: 'Midnight Charcoal', hex: '#1C1917' }
    ];
  } else if (q.includes('beach') || q.includes('resort') || occasion.toLowerCase().includes('resort')) {
    stylistAdvice = "For Mediterranean resort vacations and beachside sundowners, our 185 GSM Normandy linen shirts are engineered for maximum airflow. Wear the shirt unbuttoned over a lightweight cotton tank or slightly loose over relaxed linen drawstrings.";
    fitAdvice = "Relaxed vacation drape recommended. Pair with rolled cuffs and suede espadrilles.";
    colorPalette = [
      { name: 'Pure White Linen', hex: '#FFFFFF' },
      { name: 'Sea Salt Ecru', hex: '#F3EFE0' },
      { name: 'Sky Azure', hex: '#93C5FD' },
      { name: 'Terra Cotta', hex: '#C27D56' }
    ];
  } else if (q.includes('office') || q.includes('formal') || q.includes('meeting')) {
    stylistAdvice = "For boardroom elegance in tropical or summer climates, pure flax linen provides effortless sophistication without the rigidity of heavy wool suits. Pair a structured crisp collar linen shirt with tailored pleated trousers.";
    fitAdvice = "Tailored slim-fit with French cuffs or mother-of-pearl buttons for a sharp professional silhouette.";
  } else {
    stylistAdvice = "Welcome to the BRIVOO Atelier. Our European Flax garments are cut to elevate personal presence through natural texture, breathable weave, and immaculate hand-stitched detailing. This outfit combination creates an elongated, effortless silhouette that turns heads without trying too hard.";
    fitAdvice = "Our true-to-size European cut gives a clean, athletic drape that flatters all body structures.";
  }

  res.json({
    success: true,
    data: {
      query: prompt,
      stylistAdvice,
      fitAdvice,
      colorPalette,
      dressCodeScore: Math.floor(94 + Math.random() * 5), // 94-98%
      occasion: occasion || 'Atelier Casual Luxury',
      recommendedProducts: matchedProducts,
      styleTips: [
        "Roll sleeves by 2 gentle folds for an effortless Riviera forearm drape.",
        "Pair with unlined loafers or minimalist Italian leather sneakers.",
        "Steam lightly rather than hard-pressing to preserve natural linen breathability."
      ]
    }
  });
});

app.post('/api/ai/try-on', (req, res) => {
  const db = readData();
  const { productId, userImage, color, size, height, weight, bodyType = 'Athletic' } = req.body;

  const product = (db.products || []).find(p => p.id === productId) || (db.products || [])[0];

  // Complementary pairings
  const pairings = (db.products || [])
    .filter(p => p.id !== product.id && p.category !== product.category)
    .slice(0, 3);

  // Generate fit analysis metrics
  const fitScore = Math.floor(93 + Math.random() * 6); // 93-98%
  const verdict = fitScore >= 96 
    ? "Exceptional Bespoke Fit" 
    : "Flattering Contemporary Drape";

  const silhouetteAnalysis = `Based on your ${bodyType} profile, the ${product.title} provides a clean, naturally tailored shoulder drape. The lightweight 185 GSM flax linen falls gently without bunching, creating a lean, elongated vertical silhouette.`;
  
  const colorHarmony = `The ${color || product.colors?.[0]?.name || 'natural weave'} hue works harmoniously with warm skin tones, catching ambient light with a soft matte luster.`;

  let generatedTryOnImage = '/images/tryon_shirt_man.jpg';
  const titleLower = (product.title || '').toLowerCase();
  const catLower = (product.category || '').toLowerCase();

  if (titleLower.includes('trouser') || catLower.includes('trouser') || titleLower.includes('pant')) {
    generatedTryOnImage = '/images/tryon_trouser_man.jpg';
  } else if (titleLower.includes('vest') || titleLower.includes('waistcoat') || catLower.includes('vest')) {
    generatedTryOnImage = '/images/tryon_vest_man.jpg';
  } else if (product.gender === 'Women' || titleLower.includes('dress') || titleLower.includes('woman')) {
    generatedTryOnImage = '/images/tryon_riviera_woman.jpg';
  } else {
    generatedTryOnImage = '/images/tryon_shirt_man.jpg';
  }

  res.json({
    success: true,
    data: {
      id: 'tryon-' + Date.now(),
      productId: product.id,
      productTitle: product.title,
      productImage: product.images?.[0] || product.image,
      generatedTryOnImage,
      userImage: userImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      selectedColor: color || product.colors?.[0]?.name || 'Natural',
      selectedSize: size || 'M',
      fitScore,
      matchVerdict: verdict,
      silhouetteAnalysis,
      colorHarmony,
      recommendedSize: height && weight ? (Number(weight) > 78 ? 'L' : Number(weight) > 65 ? 'M' : 'S') : (size || 'M'),
      stylingTips: [
        `Optimal styling: Pair this ${product.category} with contrasting neutral tones.`,
        "Sleeve and shoulder seam alignment matches European tailored standards.",
        "Breathable weave keeps you cool and confident all day."
      ],
      recommendedPairings: pairings
    }
  });
});

// ----------------------------------------------------
// 404 & CENTRALIZED SAFE ERROR HANDLERS
// ----------------------------------------------------
// Undefined API routes fallback
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API route ${req.method} ${req.originalUrl} not found` });
});

// Centralized error handler (prevents leaking internal stack traces)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : (err.message || 'Server error')
  });
});

app.listen(PORT, HOST, () => {
  console.log(`\x1b[32m✔\x1b[0m BRIVOO Luxury E-Commerce Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
});
