import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { readData, writeData } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ----------------------------------------------------
// AUTHENTICATION API (JWT Token Simulation, Google OAuth, Reset OTP)
// ----------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  const db = readData();
  if (!db.users) db.users = [];
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ success: false, message: 'User already exists with this email address' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password,
    role: 'customer',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
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

app.post('/api/auth/login', (req, res) => {
  const db = readData();
  if (!db.users) db.users = [];
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email address or password' });
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
  const { name, email, googleId } = req.body;

  let user = db.users.find(u => u.email.toLowerCase() === (email || 'google_user@gmail.com').toLowerCase());
  if (!user) {
    user = {
      id: `usr-g-${Date.now()}`,
      name: name || 'Google User',
      email: (email || 'google_user@gmail.com').toLowerCase(),
      password: `google_oauth_${Date.now()}`,
      role: 'customer',
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    };
    db.users.push(user);
    writeData(db);
  }

  const token = `jwt_google_token_${user.id}_${Date.now()}`;
  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
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
  db.otps[email.toLowerCase()] = otp;
  writeData(db);

  res.json({
    success: true,
    message: `OTP sent to ${email}`,
    otp
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const db = readData();
  if (!db.users) db.users = [];
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
  }

  const storedOtp = db.otps?.[email.toLowerCase()];
  if (!storedOtp || storedOtp !== otp.trim()) {
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

  const coupon = db.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
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
  const { customerName, email, phone, address, items, totalAmount, discountAmount, paymentMethod } = req.body;

  if (!customerName || !email || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Customer details and items are required' });
  }

  const orderId = `BRV-${Math.floor(10000 + Math.random() * 90000)}`;
  const newOrder = {
    id: orderId,
    customerName,
    email,
    phone: phone || '',
    address: address || '',
    items,
    totalAmount: Number(totalAmount),
    discountAmount: Number(discountAmount || 0),
    paymentMethod: paymentMethod || 'UPI',
    status: 'Processing',
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

  db.orders.unshift(newOrder);
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
  writeData(db);
  res.json({ success: true, message: `Order status updated to ${status}`, data: order });
});

// ----------------------------------------------------
// 5. SETTINGS API
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
// 6. ANALYTICS API (For Admin Dashboard)
// ----------------------------------------------------
app.get('/api/analytics', (req, res) => {
  const db = readData();
  const totalRevenue = db.orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
  const totalOrders = db.orders.length;
  const totalProducts = db.products.length;
  const lowStockProducts = db.products.filter(p => p.stock < 10);
  const pendingOrders = db.orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length;

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      pendingOrdersCount: pendingOrders,
      recentOrders: db.orders.slice(0, 5),
      lowStockProducts
    }
  });
});

app.listen(PORT, () => {
  console.log(`BRIVOO Luxury E-Commerce Server running on http://localhost:${PORT}`);
});
