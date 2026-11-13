import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readData, writeData } from './db.js';
import { shiprocket } from './shiprocketService.js';
import { sendOrderConfirmationEmail } from './emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 'loopback');
const PORT = process.env.PORT || 5005;
const HOST = process.env.HOST || '0.0.0.0';

// ----------------------------------------------------
// SECURITY MIDDLEWARE & HEADERS
// ----------------------------------------------------
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
});

// Safe Cross-Origin Resource Sharing (CORS) with strict origin allowlist
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['https://brivoo.in', 'https://www.brivoo.in'];

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://localhost:5005',
    'http://localhost:5012'
  );
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests without origin header (e.g., mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS error: Origin ${origin} not allowed by policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Lightweight In-Memory Sliding Window Rate Limiter (scoped per route)
function rateLimiter({ windowMs = 60 * 1000, max = 40, message = 'Too many requests. Please wait a moment.' } = {}) {
  const routeLimitMap = new Map();
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    let record = routeLimitMap.get(ip);
    if (!record || now - record.resetTime > windowMs) {
      record = { count: 1, resetTime: now };
      routeLimitMap.set(ip, record);
    } else {
      record.count += 1;
      if (record.count > max) {
        return res.status(429).json({ success: false, message });
      }
    }
    next();
  };
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


// ----------------------------------------------------
// META CONVERSIONS API - PURCHASE EVENTS
// ----------------------------------------------------
const metaCapiInFlight = new Set();
const META_CAPI_LEDGER = path.join(__dirname, 'data', 'meta-capi-events.json');

function metaSha256(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized ? crypto.createHash('sha256').update(normalized).digest('hex') : null;
}

function getMetaEventId(order) {
  return 'purchase_' + crypto
    .createHash('sha256')
    .update(`${order.id}:${order.paymentRef || ''}`)
    .digest('hex')
    .slice(0, 32);
}

function readMetaCapiLedger() {
  try {
    const data = JSON.parse(fs.readFileSync(META_CAPI_LEDGER, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveMetaCapiLedger(eventId) {
  const entries = readMetaCapiLedger().filter(entry => entry?.eventId !== eventId);
  entries.push({ eventId, sentAt: new Date().toISOString() });

  const tempFile = `${META_CAPI_LEDGER}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(entries.slice(-5000), null, 2), { mode: 0o600 });
  fs.renameSync(tempFile, META_CAPI_LEDGER);
}

function getMetaCookie(req, cookieName) {
  const cookies = String(req.headers.cookie || '').split(';');
  const prefix = `${cookieName}=`;
  const entry = cookies.find(cookie => cookie.trim().startsWith(prefix));
  return entry ? decodeURIComponent(entry.trim().slice(prefix.length)) : undefined;
}

async function sendMetaPurchaseEvent(order, req) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken || !order?.id || !order?.paymentRef) return;

  const eventId = getMetaEventId(order);
  if (metaCapiInFlight.has(eventId)) return;

  const sentEvents = readMetaCapiLedger();
  if (sentEvents.some(entry => entry?.eventId === eventId)) return;

  metaCapiInFlight.add(eventId);

  try {
    const items = Array.isArray(order.items) ? order.items : [];
    const fullName = String(order.customerName || '').trim().split(/\s+/);
    const email = String(order.email || '').trim().toLowerCase();

    let phone = String(order.phone || '').replace(/\D/g, '');
    if (phone.length === 10) phone = `91${phone}`;

    const userData = {
      client_ip_address: req.ip || undefined,
      client_user_agent: req.get('user-agent') || undefined,
      em: metaSha256(email) ? [metaSha256(email)] : undefined,
      ph: metaSha256(phone) ? [metaSha256(phone)] : undefined,
      fn: metaSha256(fullName[0]) ? [metaSha256(fullName[0])] : undefined,
      ln: fullName.length > 1 && metaSha256(fullName.slice(1).join(' '))
        ? [metaSha256(fullName.slice(1).join(' '))]
        : undefined,
      fbp: getMetaCookie(req, '_fbp'),
      fbc: getMetaCookie(req, '_fbc')
    };

    for (const key of Object.keys(userData)) {
      if (userData[key] === undefined || userData[key] === '') delete userData[key];
    }

    const referer = req.get('referer');
    let eventSourceUrl = `${process.env.APP_URL || 'https://brivoo.in'}/`;
    try {
      const appOrigin = new URL(process.env.APP_URL || 'https://brivoo.in').origin;
      const candidate = new URL(referer);
      if (candidate.origin === appOrigin) eventSourceUrl = candidate.toString();
    } catch {
      // Keep the configured BRIVOO origin.
    }

    const numItems = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    const event = {
      event_name: 'Purchase',
      event_time: Math.floor(new Date(order.createdAt || Date.now()).getTime() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: eventSourceUrl,
      user_data: userData,
      custom_data: {
        currency: 'INR',
        value: Number(order.totalAmount),
        content_ids: items.map(item => String(item.id)),
        contents: items.map(item => ({
          id: String(item.id),
          quantity: Number(item.quantity || 0)
        })),
        content_type: 'product',
        content_name: items.map(item => item.title).filter(Boolean).join(', '),
        num_items: numItems,
        order_id: String(order.id)
      }
    };

    const version = process.env.META_GRAPH_API_VERSION || 'v26.0';
    const endpoint = new URL(
      `https://graph.facebook.com/${version}/${encodeURIComponent(pixelId)}/events`
    );
    endpoint.searchParams.set('access_token', accessToken);

    const payload = { data: [event] };
    if (process.env.META_TEST_EVENT_CODE) {
      payload.test_event_code = process.env.META_TEST_EVENT_CODE;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000)
    });

    let result;
    try {
      result = await response.json();
    } catch {
      console.error('[Meta CAPI] Invalid response from Meta.');
      return;
    }

    if (!response.ok || Number(result?.events_received) !== 1) {
      console.error(
        `[Meta CAPI] Purchase not confirmed. HTTP ${response.status}, events_received=${Number(result?.events_received) || 0}`
      );
      return;
    }

    saveMetaCapiLedger(eventId);
    console.log('[Meta CAPI] Purchase event accepted by Meta.');
  } catch (error) {
    console.error('[Meta CAPI] Purchase delivery failed:', error?.name || 'RequestError');
  } finally {
    metaCapiInFlight.delete(eventId);
  }
}

// ----------------------------------------------------
// JWT & AUTHENTICATION CONFIGURATION
// ----------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'brivoo_jwt_secret_dev_local_2026_x9k2');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured on the server');
  }
  return jwt.sign(
    {
      id: user.id,
      email: user.email.toLowerCase(),
      role: user.role || 'customer'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' }
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required: missing token' });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ success: false, message: 'Server authentication configuration missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    const db = readData();
    const user = (db.users || []).find(u => u.id === decoded.id || u.email.toLowerCase() === decoded.email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found or deactivated' });
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email.toLowerCase(),
      role: user.role || decoded.role || 'customer',
      avatar: user.avatar
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Authentication token has expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token || !JWT_SECRET) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    const db = readData();
    const user = (db.users || []).find(u => u.id === decoded.id || u.email.toLowerCase() === decoded.email.toLowerCase());
    if (user) {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email.toLowerCase(),
        role: user.role || decoded.role || 'customer',
        avatar: user.avatar
      };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access forbidden: Administrator privileges required' });
  }
  next();
}

// Password verification and non-destructive lazy migration helper
const isBcryptHash = (str) => typeof str === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(str);

async function verifyAndMigratePassword(user, candidatePassword, db) {
  if (!user || !user.password || typeof candidatePassword !== 'string') {
    return false;
  }

  // 1. If already hashed with bcrypt
  if (isBcryptHash(user.password)) {
    return await bcrypt.compare(candidatePassword, user.password);
  }

  // 2. Reject Google-only accounts from password login attempt
  if (user.password.startsWith('google_oauth_')) {
    return false;
  }

  // 3. Legacy plaintext match: migrate lazily to bcrypt
  if (user.password === candidatePassword) {
    try {
      user.password = await bcrypt.hash(candidatePassword, 10);
      writeData(db);
    } catch (err) {
      console.error('Password migration error:', err.message);
    }
    return true;
  }

  return false;
}

// ----------------------------------------------------
// AUTHENTICATION API
// ----------------------------------------------------

// Public Registration (Always Customer, never Admin)
app.post('/api/auth/register', rateLimiter({ windowMs: 60 * 1000, max: 15 }), async (req, res) => {
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

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim().slice(0, 100),
    email: normalizedEmail,
    password: hashedPassword,
    role: 'customer', // Public registration is strictly customer
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
    joinedAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeData(db);

  try {
    const token = signToken(newUser);
    res.status(201).json({
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to issue token: ' + err.message });
  }
});

// Secure Login with lazy password migration
app.post('/api/auth/login', rateLimiter({ windowMs: 60 * 1000, max: 20 }), async (req, res) => {
  const db = readData();
  if (!db.users) db.users = [];
  const { email, password } = req.body;

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email address or password' });
  }

  const isValid = await verifyAndMigratePassword(user, password, db);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid email address or password' });
  }

  try {
    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Authentication failure: ' + err.message });
  }
});

// Google OAuth Server-Side Token Verification
app.post('/api/auth/google', async (req, res) => {
  const { idToken, credential } = req.body;
  const tokenToVerify = idToken || credential;

  if (!tokenToVerify || typeof tokenToVerify !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Google ID token (credential) is required for server-side verification'
    });
  }

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({
      success: false,
      message: 'Google authentication service is not configured on the server (missing GOOGLE_CLIENT_ID)'
    });
  }

  try {
    const googleVerifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenToVerify)}`);
    if (!googleVerifyRes.ok) {
      return res.status(401).json({ success: false, message: 'Invalid or expired Google authentication token' });
    }
    const tokenInfo = await googleVerifyRes.json();

    if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, message: 'Google token client ID mismatch' });
    }

    if (tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true) {
      return res.status(401).json({ success: false, message: 'Google email address is not verified' });
    }

    const verifiedEmail = tokenInfo.email.toLowerCase().trim();
    const verifiedName = tokenInfo.name || verifiedEmail.split('@')[0];
    const verifiedAvatar = tokenInfo.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(verifiedName)}`;
    const googleSub = tokenInfo.sub;

    const db = readData();
    if (!db.users) db.users = [];

    // Admin allowlist verification (controlled server-side only)
    const adminAllowlist = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    let user = db.users.find(u => u.email.toLowerCase() === verifiedEmail);
    if (!user) {
      const isAllowedAdmin = adminAllowlist.includes(verifiedEmail);
      user = {
        id: `usr-g-${Date.now()}`,
        name: verifiedName,
        email: verifiedEmail,
        password: `google_oauth_${Date.now()}`,
        role: isAllowedAdmin ? 'admin' : 'customer',
        avatar: verifiedAvatar,
        googleId: googleSub,
        joinedAt: new Date().toISOString()
      };
      db.users.push(user);
    } else {
      user.googleId = googleSub;
      if (verifiedName && (!user.name || user.name === 'Google User')) user.name = verifiedName;
      if (verifiedAvatar && !user.avatar) user.avatar = verifiedAvatar;
      if (adminAllowlist.includes(verifiedEmail)) user.role = 'admin';
    }

    writeData(db);
    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to verify Google token: ' + err.message });
  }
});

// Secure Password Reset: Initiate OTP
app.post('/api/auth/forgot-password', rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if an email delivery service is configured
  const emailConfigured = Boolean(
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    process.env.RESEND_API_KEY
  );

  if (!emailConfigured) {
    return res.status(503).json({
      success: false,
      message: 'Password reset is currently unavailable: email delivery service is not configured on the server. Please contact support.'
    });
  }

  const db = readData();
  if (!db.users) db.users = [];
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (user) {
    // Generate unpredictable 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

    if (!db.otps) db.otps = {};
    db.otps[normalizedEmail] = {
      hash: otpHash,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    };
    writeData(db);

    // Send email using configured provider
    try {
      if (process.env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'BRIVOO <noreply@brivoo.in>',
            to: normalizedEmail,
            subject: 'BRIVOO Password Reset Verification Code',
            text: `Your BRIVOO verification code is: ${rawOtp}. This code expires in 10 minutes.`
          })
        });
      }
    } catch {
      console.error('[Email Service] Failed to deliver reset email');
    }
  }

  // Consistent generic response to prevent email enumeration, never exposing OTP
  res.json({
    success: true,
    message: 'If the provided email is registered, a password reset code has been sent.'
  });
});

// Secure Password Reset: Verify OTP and update password
app.post('/api/auth/reset-password', rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  if (newPassword.length > 128) {
    return res.status(400).json({ success: false, message: 'New password cannot exceed 128 characters' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const db = readData();
  const storedOtpData = db.otps?.[normalizedEmail];

  if (!storedOtpData) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
  }

  if (Date.now() > (storedOtpData.expiresAt || 0)) {
    delete db.otps[normalizedEmail];
    writeData(db);
    return res.status(400).json({ success: false, message: 'OTP code has expired' });
  }

  storedOtpData.attempts = (storedOtpData.attempts || 0) + 1;
  if (storedOtpData.attempts > 5) {
    delete db.otps[normalizedEmail];
    writeData(db);
    return res.status(400).json({ success: false, message: 'Too many invalid attempts. Please request a new OTP.' });
  }

  const candidateHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
  const validHash = storedOtpData.hash || (storedOtpData.code ? crypto.createHash('sha256').update(String(storedOtpData.code).trim()).digest('hex') : null);

  if (!validHash || candidateHash !== validHash) {
    writeData(db);
    return res.status(400).json({ success: false, message: 'Invalid OTP code' });
  }

  const user = db.users?.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    delete db.otps[normalizedEmail];
    writeData(db);
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  delete db.otps[normalizedEmail];
  writeData(db);

  res.json({
    success: true,
    message: 'Password reset successfully! Please log in with your new password.'
  });
});

// Authenticated current user profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});



// Admin-only product image upload. Accepts JPG, PNG and WebP up to 5 MB.
app.post('/api/products/upload-image', authenticateToken, requireAdmin, (req, res) => {
  const MAX_BYTES = 5 * 1024 * 1024;
  const allowed = {
    'image/jpeg': {
      ext: 'jpg',
      signature: b => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
    },
    'image/png': {
      ext: 'png',
      signature: b => b.length >= 8 && b.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      )
    },
    'image/webp': {
      ext: 'webp',
      signature: b => b.length >= 12 &&
        b.toString('ascii', 0, 4) === 'RIFF' &&
        b.toString('ascii', 8, 12) === 'WEBP'
    }
  };

  try {
    const imageData = req.body?.image;

    if (typeof imageData !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Provide an image as a JPG, PNG or WebP data URL.'
      });
    }

    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(imageData);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'Provide an image as a JPG, PNG or WebP data URL.'
      });
    }

    const fileInfo = allowed[match[1]];
    const encoded = match[2];
    const buffer = Buffer.from(encoded, 'base64');

    if (
      !buffer.length ||
      buffer.length > MAX_BYTES ||
      buffer.toString('base64') !== encoded ||
      !fileInfo.signature(buffer)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image file or image exceeds the 5 MB limit.'
      });
    }

    const imagesDir = path.join(__dirname, 'public', 'images');
    fs.mkdirSync(imagesDir, { recursive: true });

    const filename = `product-${randomUUID()}.${fileInfo.ext}`;
    const destination = path.join(imagesDir, filename);

    fs.writeFileSync(destination, buffer, { flag: 'wx', mode: 0o644 });

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully.',
      data: { url: `/images/${filename}` }
    });
  } catch (error) {
    console.error('[Product Image Upload]', error.message);

    if (error.type === 'entity.too.large') {
      return res.status(413).json({
        success: false,
        message: 'Image upload payload is too large.'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Could not process the image upload.'
    });
  }
});

// Static images directory
app.use('/images', (req, res, next) => {
  if (/^[a-zA-Z0-9_-]+\.webp$/i.test(path.basename(req.path))) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
}, express.static(path.join(__dirname, 'public', 'images')));

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

app.post('/api/products', authenticateToken, requireAdmin, (req, res) => {
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

app.post('/api/products/bulk', authenticateToken, requireAdmin, (req, res) => {
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

app.put('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
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

app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
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

app.post('/api/categories', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });

  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const newCat = { id: `cat-${Date.now()}`, name, slug, description: description || '' };
  db.categories.push(newCat);
  writeData(db);
  res.status(201).json({ success: true, data: newCat });
});

app.put('/api/categories/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  const index = db.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });

  db.categories[index] = { ...db.categories[index], ...req.body };
  writeData(db);
  res.json({ success: true, data: db.categories[index] });
});

app.delete('/api/categories/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  const index = db.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Category not found' });

  const deleted = db.categories.splice(index, 1);
  writeData(db);
  res.json({ success: true, data: deleted[0] });
});

// Subcategories API
app.post('/api/categories/:id/subcategories', authenticateToken, requireAdmin, (req, res) => {
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

app.delete('/api/categories/:catId/subcategories/:subId', authenticateToken, requireAdmin, (req, res) => {
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

app.post('/api/coupons', authenticateToken, requireAdmin, (req, res) => {
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

app.put('/api/coupons/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  const index = db.coupons.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Coupon not found' });

  db.coupons[index] = { ...db.coupons[index], ...req.body };
  writeData(db);
  res.json({ success: true, data: db.coupons[index] });
});

app.delete('/api/coupons/:id', authenticateToken, requireAdmin, (req, res) => {
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

app.post('/api/offers', authenticateToken, requireAdmin, (req, res) => {
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

app.put('/api/offers/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  if (!db.offers) db.offers = [];
  const index = db.offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Offer not found' });

  db.offers[index] = { ...db.offers[index], ...req.body, updatedAt: new Date().toISOString() };
  writeData(db);
  res.json({ success: true, data: db.offers[index] });
});

app.patch('/api/offers/:id/toggle', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  if (!db.offers) db.offers = [];
  const index = db.offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Offer not found' });

  db.offers[index].active = !db.offers[index].active;
  writeData(db);
  res.json({ success: true, data: db.offers[index] });
});

app.delete('/api/offers/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  if (!db.offers) db.offers = [];
  const index = db.offers.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Offer not found' });

  const deleted = db.offers.splice(index, 1);
  writeData(db);
  res.json({ success: true, data: deleted[0] });
});

// ----------------------------------------------------
// 4. ORDERS & PAYMENTS PROCESSING API
// ----------------------------------------------------

// Server-side Cart & Price Calculation Helper

// Resolve live Shiprocket shipping charge using server-verified cart totals.
async function calculateLiveShipping(items, couponCode, db, shippingPincode, isCOD = false) {
  if (!/^\d{6}$/.test(String(shippingPincode || '').trim())) {
    return { error: 'Please enter a valid 6-digit delivery pincode.' };
  }

  const calculation = validateCartAndCalculateTotals(items, couponCode, db, !isCOD);
  if (calculation.error) return calculation;

  const threshold = Math.max(0, Number(db.settings?.freeShippingThreshold ?? 1999));
  const netSubtotal = Math.max(0, calculation.subtotal - calculation.discountAmount);

  if (netSubtotal >= threshold) {
    return { ...calculation, shippingCharge: 0,
      grandTotal: Math.max(0, calculation.subtotal - calculation.discountAmount - calculation.prepaidDiscount + calculation.codFee),
      shippingCourier: 'Free Shipping' };
  }

  try {
    const result = await shiprocket.checkServiceability({
      pickup_postcode: '453331',
      delivery_postcode: String(shippingPincode).trim(),
      weight: 0.5,
      cod: isCOD ? 1 : 0
    });

    const eligible = (result.couriers || [])
      .filter(c => Number(c.rate ?? c.freightCharge) > 0)
      .filter(c => !isCOD || c.codAvailable)
      .sort((a, b) => Number(a.rate ?? a.freightCharge) - Number(b.rate ?? b.freightCharge));

    if (!result.success || eligible.length === 0) {
      return { error: 'Live shipping is unavailable for this pincode and payment method. Please try another pincode or payment method.' };
    }

    const courier = eligible[0];
    const shippingCharge = Math.round(Number(courier.rate ?? courier.freightCharge) * 100) / 100;
    const grandTotal = Math.max(0, calculation.subtotal - calculation.discountAmount - calculation.prepaidDiscount + shippingCharge + calculation.codFee);

    return { ...calculation, shippingCharge, grandTotal, shippingCourier: courier.name };
  } catch (error) {
    console.error('[Shipping Quote] Shiprocket rate lookup failed:', error?.message || error);
    return { error: 'Unable to fetch live shipping rates right now. Please try again shortly.' };
  }
}

function validateCartAndCalculateTotals(items, couponCode, db, isPrepaid = false) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: 'Order must contain at least one product item' };
  }

  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    if (!item.id || item.quantity === undefined || item.quantity === null) {
      return { error: 'Invalid product item in cart' };
    }

    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return { error: `Invalid quantity (${item.quantity}) for product item` };
    }

    const product = (db.products || []).find(p => p.id === item.id);
    if (!product) {
      return { error: `Product "${item.title || item.id}" was not found in catalog` };
    }

    if (!product.inStock || product.stock < qty) {
      return { error: `Insufficient inventory for "${product.title}". In stock: ${product.stock || 0}` };
    }

    const price = Number(product.price);
    if (isNaN(price) || price < 0) {
      return { error: `Invalid price configuration for "${product.title}"` };
    }

    subtotal += price * qty;
    verifiedItems.push({
      id: product.id,
      title: product.title,
      price: price, // Server-calculated trusted price
      quantity: qty,
      selectedSize: item.selectedSize || '',
      selectedColor: item.selectedColor || '',
      image: product.image || item.image || ''
    });
  }

  // Validate Coupon discount on server
  let discountAmount = 0;
  let appliedCoupon = null;
  if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
    const code = couponCode.trim().toUpperCase();
    const coupon = (db.coupons || []).find(c => c.code.toUpperCase() === code && c.active);
    if (coupon) {
      if (subtotal >= (coupon.minSpend || 0)) {
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * coupon.value) / 100);
        } else if (coupon.discountType === 'fixed') {
          discountAmount = Math.min(coupon.value, subtotal);
        }
        appliedCoupon = coupon.code;
      }
    }
  }

  // Shipping threshold check
  const threshold = Number(db.settings?.freeShippingThreshold) || 1999;
  const shippingCharge = (subtotal - discountAmount) >= threshold ? 0 : 150;

  // Authoritative Prepaid Payment Discount (Fixed ₹ or Percentage %)
  const prepaidEnabled = db.settings?.prepaidDiscountEnabled !== false;
  const configuredPrepaidDiscount = Number(db.settings?.prepaidDiscount ?? 50);
  const prepaidDiscountType = db.settings?.prepaidDiscountType || 'fixed';
  let prepaidDiscount = 0;
  if (isPrepaid && prepaidEnabled && subtotal > 0) {
    const netSubtotal = Math.max(0, subtotal - discountAmount);
    if (prepaidDiscountType === 'percentage' || prepaidDiscountType === 'percent') {
      prepaidDiscount = Math.round((netSubtotal * Math.min(100, Math.max(0, configuredPrepaidDiscount))) / 100);
    } else {
      prepaidDiscount = Math.max(0, Math.min(configuredPrepaidDiscount, netSubtotal));
    }
  }

  // Authoritative COD Surcharge / Extra Handling Fee
  const codSurchargeEnabled = db.settings?.codSurchargeEnabled === true;
  const codFee = (!isPrepaid && codSurchargeEnabled) ? Math.max(0, Number(db.settings?.codSurcharge || 0)) : 0;

  // Final Payable Grand Total (Guaranteed non-negative)
  const grandTotal = Math.max(0, subtotal - discountAmount - prepaidDiscount + shippingCharge + codFee);

  return {
    subtotal,
    discountAmount,
    prepaidDiscount,
    shippingCharge,
    codFee,
    grandTotal,
    appliedCoupon,
    verifiedItems
  };
}
// Get Orders: Authenticated customer sees only own orders; admin sees all
app.get('/api/orders', authenticateToken, (req, res) => {
  const db = readData();
  const orders = db.orders || [];

  if (req.user.role === 'admin') {
    return res.json({ success: true, count: orders.length, data: orders });
  }

  const customerOrders = orders.filter(o => o.email && o.email.toLowerCase() === req.user.email.toLowerCase());
  res.json({ success: true, count: customerOrders.length, data: customerOrders });
});

// Get Single Order: Customer can access only their own order; admin can access any
app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const db = readData();
  const order = (db.orders || []).find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (req.user.role !== 'admin' && (!order.email || order.email.toLowerCase() !== req.user.email.toLowerCase())) {
    return res.status(403).json({ success: false, message: 'Access forbidden: you do not own this order' });
  }

  res.json({ success: true, data: order });
});

// Create Order (Cash on Delivery Only)
app.post('/api/shipping/quote', async (req, res) => {
  try {
    const { items, couponCode, shippingPincode, paymentMethod } = req.body || {};
    const db = readData();
    const method = String(paymentMethod || '').toUpperCase();
    const isCOD = method === 'COD' || method.includes('CASH ON DELIVERY');

    const calculation = await calculateLiveShipping(
      items, couponCode, db, shippingPincode, isCOD
    );

    if (calculation.error) {
      return res.status(400).json({
        success: false,
        message: calculation.error
      });
    }

    return res.json({
      success: true,
      shippingCharge: calculation.shippingCharge,
      shippingCourier: calculation.shippingCourier,
      subtotal: calculation.subtotal,
      discountAmount: calculation.discountAmount,
      prepaidDiscount: calculation.prepaidDiscount,
      codFee: calculation.codFee,
      grandTotal: calculation.grandTotal
    });
  } catch (error) {
    console.error('Shipping quote error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to calculate shipping right now. Please try again.'
    });
  }
});

app.post('/api/orders', optionalAuth, async (req, res) => {
  const db = readData();
  const {
    customerName,
    email,
    phone,
    address,
    items,
    couponCode,
    paymentMethod,
    shippingCity,
    shippingState,
    shippingPincode
  } = req.body;

  if (!customerName || !email || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Customer details and items are required' });
  }

  // Normalize payment method
  const normalizedMethod = (paymentMethod || '').trim().toLowerCase();
  const isCOD = normalizedMethod === 'cod' || normalizedMethod === 'cash on delivery';

  if (!isCOD) {
    return res.status(400).json({
      success: false,
      message: 'Direct order placement is permitted only for Cash on Delivery. Online payments must be completed and verified through Razorpay.'
    });
  }

  const calculation = await calculateLiveShipping(
    items, couponCode, db, shippingPincode, true
  );
  if (calculation.error) {
    return res.status(400).json({ success: false, message: calculation.error });
  }

  const orderId = `BRV-${Math.floor(10000 + Math.random() * 90000)}`;
  const paymentRef = `TXN_COD_${Date.now().toString().slice(-6)}`;

  const newOrder = {
    id: orderId,
    customerName: String(customerName).trim().slice(0, 100),
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : '',
    address: address ? String(address).trim() : '',
    shippingCity: shippingCity || '',
    shippingState: shippingState || '',
    shippingPincode: shippingPincode || '',
    items: calculation.verifiedItems,
    subtotal: calculation.subtotal,
    deliveryCharge: calculation.shippingCharge,
    totalAmount: calculation.grandTotal,
    prepaidDiscount: calculation.prepaidDiscount,
    codFee: calculation.codFee,
    discountAmount: calculation.discountAmount,
    couponCode: calculation.appliedCoupon || null,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending', // COD orders remain Pending until settled at doorstep
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
          description: 'Order confirmed with Cash on Delivery.'
        }
      ]
    },
    returnStatus: 'None',
    createdAt: new Date().toISOString()
  };

  // Decrement stock only once for validated items
  calculation.verifiedItems.forEach(item => {
    const prod = db.products.find(p => p.id === item.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      if (prod.stock === 0) prod.inStock = false;
    }
  });

  if (!db.orders) db.orders = [];
  db.orders.unshift(newOrder);

  // Sync to Payments ledger
  if (!db.payments) db.payments = [];
  db.payments.unshift({
    id: `PAY-${Date.now().toString().slice(-6)}`,
    orderId,
    customerName: newOrder.customerName,
    customerEmail: newOrder.email,
    amount: newOrder.totalAmount,
    method: 'Cash on Delivery',
    status: 'Pending',
    transactionRef: paymentRef,
    createdAt: new Date().toISOString()
  });

  const orderSaved = writeData(db);
  const metaConsentAccepted = req.body.metaConsentAccepted === true;
  const responseOrder = metaConsentAccepted
    ? { ...newOrder, metaEventId: getMetaEventId(newOrder) }
    : newOrder;

  if (orderSaved && metaConsentAccepted) {
    void sendMetaPurchaseEvent(newOrder, req);
  }

  // Dispatch confirmation asynchronously; email failures must not fail order placement.
  void sendOrderConfirmationEmail(newOrder, db, writeData).catch(err => {
    console.error('[Order Email] COD confirmation dispatch failed:', err?.message || err);
  });

  res.status(201).json({ success: true, message: 'Order placed successfully', data: responseOrder });
});

// Resend Order Confirmation Email: Administrator Only
app.post('/api/orders/:id/resend-confirmation', authenticateToken, requireAdmin, async (req, res) => {
  const db = readData();
  const order = (db.orders || []).find(o => String(o.id) === String(req.params.id));

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({
      success: false,
      message: 'Order email service is not configured'
    });
  }

  // Explicit admin resend permits sending again, even if an earlier email was sent.
  if (order.emailNotification) {
    order.emailNotification.status = 'retry';
  }

  try {
    writeData(db);

    const result = await sendOrderConfirmationEmail(order, db, writeData);

    if (!result.success) {
      return res.status(502).json({
        success: false,
        message: 'Confirmation email could not be sent',
        emailStatus: order.emailNotification?.status || 'failed'
      });
    }

    return res.json({
      success: true,
      message: result.alreadySent
        ? 'Confirmation email was already sent'
        : 'Confirmation email sent successfully',
      emailStatus: order.emailNotification?.status || 'sent'
    });
  } catch (err) {
    console.error('[Order Email] Admin resend failed:', err?.message || err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process confirmation email resend'
    });
  }
});

// Update Order Status: Administrator Only
app.put('/api/orders/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  const order = (db.orders || []).find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

  order.status = status;
  if (order.tracking) {
    order.tracking.status = status;
    if (!order.tracking.checkpoints) order.tracking.checkpoints = [];
    order.tracking.checkpoints.push({
      id: `cp-${Date.now()}`,
      status,
      location: order.tracking.currentLocation || 'Distribution Facility',
      timestamp: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
      description: `Order status updated to ${status}.`
    });
  }

  writeData(db);
  res.json({ success: true, message: `Order status updated to ${status}`, data: order });
});

// Update Order Tracking Details & Add Checkpoints: Administrator Only
app.put('/api/orders/:id/tracking', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  const order = (db.orders || []).find(o => o.id === req.params.id);
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

// ----------------------------------------------------
// RAZORPAY PAYMENT GATEWAY INTEGRATION
// ----------------------------------------------------

// Razorpay Order Creation: Validates stock and pricing on server
app.post('/api/payments/razorpay/order', optionalAuth, async (req, res) => {
  const { items, couponCode, shippingPincode } = req.body;
  const db = readData();

  const calculation = await calculateLiveShipping(
    items, couponCode, db, shippingPincode, false
  );
  if (calculation.error) {
    return res.status(400).json({ success: false, message: calculation.error });
  }

  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Razorpay payment gateway is not configured on the server (missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET)'
    });
  }

  try {
    const amountInPaise = Math.round(calculation.grandTotal * 100);
    const receipt = `rcpt_${Date.now()}`;
    const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        payment_capture: 1
      })
    });

    if (!rzpResponse.ok) {
      const errData = await rzpResponse.json();
      return res.status(502).json({
        success: false,
        message: 'Razorpay order creation failed: ' + (errData.error?.description || rzpResponse.statusText)
      });
    }

    const orderData = await rzpResponse.json();

    // Persist the server-calculated total and shipping quote for verification.
    if (!Array.isArray(db.paymentOrders)) db.paymentOrders = [];
    db.paymentOrders = db.paymentOrders.filter(
      entry => entry.razorpayOrderId !== orderData.id
    );
    db.paymentOrders.push({
      razorpayOrderId: orderData.id,
      amountPaise: amountInPaise,
      shippingPincode: String(shippingPincode || '').trim(),
      couponCode: String(couponCode || '').trim().toUpperCase(),
      itemsFingerprint: crypto
        .createHash('sha256')
        .update(JSON.stringify(items || []))
        .digest('hex'),
      calculation,
      createdAt: new Date().toISOString(),
      verified: false
    });

    if (!writeData(db)) {
      console.error('[Razorpay] Failed to persist payment order snapshot:', orderData.id);
      return res.status(500).json({
        success: false,
        message: 'Could not securely save payment details. Please try again.'
      });
    }

    res.json({
      success: true,
      keyId: RAZORPAY_KEY_ID,
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      calculatedTotal: calculation.grandTotal
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create Razorpay order: ' + err.message });
  }
});

// Razorpay Payment Verification & Order Placement
app.post('/api/payments/razorpay/verify', optionalAuth, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    customerName,
    email,
    phone,
    address,
    shippingCity,
    shippingState,
    shippingPincode,
    items,
    couponCode
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing required Razorpay verification credentials' });
  }

  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Razorpay credentials are not configured'
    });
  }

  // 1. Verify HMAC SHA-256 signature
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf-8');
  const receivedSignatureBuffer = Buffer.from(
    typeof razorpay_signature === 'string' ? razorpay_signature : '',
    'utf-8'
  );

  const signatureMatches =
    expectedSignatureBuffer.length === receivedSignatureBuffer.length &&
    crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer);

  if (!signatureMatches) {
    return res.status(400).json({ success: false, message: 'Payment verification failed: invalid signature' });
  }

  const db = readData();

  // 2. Idempotency Check: Prevent duplicate order processing and multiple stock deductions
  const existingOrder = (db.orders || []).find(o => o.paymentRef === razorpay_payment_id);
  if (existingOrder) {
    const metaConsentAccepted = req.body.metaConsentAccepted === true;
    const responseOrder = metaConsentAccepted
      ? { ...existingOrder, metaEventId: getMetaEventId(existingOrder) }
      : existingOrder;

    if (metaConsentAccepted) {
      void sendMetaPurchaseEvent(existingOrder, req);
    }

    return res.json({ success: true, message: 'Order already processed', data: responseOrder });
  }

  // 3. Use the original server-side calculation for this Razorpay order.
  // Do not request a new Shiprocket quote during payment verification.
  const paymentOrder = (db.paymentOrders || []).find(
    entry => entry.razorpayOrderId === razorpay_order_id
  );

  if (!paymentOrder || !paymentOrder.calculation) {
    return res.status(400).json({
      success: false,
      message: 'Payment order details were not found. Please restart checkout.'
    });
  }

  const paymentOrderAge = Date.now() - new Date(paymentOrder.createdAt).getTime();
  if (!Number.isFinite(paymentOrderAge) || paymentOrderAge < 0 || paymentOrderAge > 30 * 60 * 1000) {
    return res.status(400).json({
      success: false,
      message: 'Payment order has expired. Please restart checkout.'
    });
  }

  const submittedFingerprint = crypto
    .createHash('sha256')
    .update(JSON.stringify(items || []))
    .digest('hex');

  if (
    submittedFingerprint !== paymentOrder.itemsFingerprint ||
    String(shippingPincode || '').trim() !== paymentOrder.shippingPincode ||
    String(couponCode || '').trim().toUpperCase() !== paymentOrder.couponCode
  ) {
    return res.status(400).json({
      success: false,
      message: 'Checkout details changed. Please restart checkout.'
    });
  }

  if (paymentOrder.verified) {
    return res.status(400).json({
      success: false,
      message: 'This payment order has already been used.'
    });
  }

  const calculation = paymentOrder.calculation;

  // 4. Fetch payment from Razorpay API to verify status and amount
  {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
      const rzpPayRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        headers: { 'Authorization': authHeader }
      });

      if (!rzpPayRes.ok) {
        return res.status(400).json({ success: false, message: 'Failed to verify payment with Razorpay gateway' });
      }

      const paymentData = await rzpPayRes.json();

      if (paymentData.order_id !== razorpay_order_id) {
        return res.status(400).json({ success: false, message: 'Payment record does not match the active order ID' });
      }

      if (paymentData.status !== 'captured') {
        return res.status(400).json({
          success: false,
          message: `Payment has not been captured (${paymentData.status})`
        });
      }

      if (paymentData.currency !== 'INR') {
        return res.status(400).json({ success: false, message: 'Invalid payment currency' });
      }

      const expectedPaise = Number(paymentOrder.amountPaise);
      if (
        !Number.isSafeInteger(expectedPaise) ||
        expectedPaise <= 0 ||
        Math.round(Number(calculation.grandTotal) * 100) !== expectedPaise ||
        Number(paymentData.amount) !== expectedPaise
      ) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount mismatch against the original checkout total'
        });
      }
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Razorpay verification request failed: ' + err.message });
    }
  }

  // 5. Decrement inventory only once upon verified payment
  calculation.verifiedItems.forEach(item => {
    const prod = db.products.find(p => p.id === item.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      if (prod.stock === 0) prod.inStock = false;
    }
  });

  // 6. Record verified paid order
  const orderId = `BRV-${Math.floor(10000 + Math.random() * 90000)}`;
  const newOrder = {
    id: orderId,
    customerName: String(customerName || 'Valued Customer').trim().slice(0, 100),
    email: String(email || '').trim().toLowerCase(),
    phone: phone ? String(phone).trim() : '',
    address: address ? String(address).trim() : '',
    shippingCity: shippingCity || '',
    shippingState: shippingState || '',
    shippingPincode: shippingPincode || '',
    items: calculation.verifiedItems,
    subtotal: calculation.subtotal,
    deliveryCharge: calculation.shippingCharge,
    totalAmount: calculation.grandTotal,
    prepaidDiscount: calculation.prepaidDiscount,
    codFee: calculation.codFee,
    discountAmount: calculation.discountAmount,
    couponCode: calculation.appliedCoupon || null,
    paymentMethod: 'Razorpay',
    paymentStatus: 'Completed',
    paymentRef: razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
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
          status: 'Payment Verified & Order Confirmed',
          location: 'BRIVOO Mumbai Center',
          timestamp: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
          description: `Razorpay payment ${razorpay_payment_id} successfully verified.`
        }
      ]
    },
    returnStatus: 'None',
    createdAt: new Date().toISOString()
  };

  if (!db.orders) db.orders = [];
  db.orders.unshift(newOrder);
  paymentOrder.verified = true;
  paymentOrder.verifiedAt = new Date().toISOString();

  if (!db.payments) db.payments = [];
  db.payments.unshift({
    id: `PAY-${Date.now().toString().slice(-6)}`,
    orderId,
    customerName: newOrder.customerName,
    customerEmail: newOrder.email,
    amount: newOrder.totalAmount,
    method: 'Razorpay',
    status: 'Completed',
    transactionRef: razorpay_payment_id,
    createdAt: new Date().toISOString()
  });

  const orderSaved = writeData(db);
  const metaConsentAccepted = req.body.metaConsentAccepted === true;
  const responseOrder = metaConsentAccepted
    ? { ...newOrder, metaEventId: getMetaEventId(newOrder) }
    : newOrder;

  if (orderSaved && metaConsentAccepted) {
    void sendMetaPurchaseEvent(newOrder, req);
  }

  // Payment is verified and order saved before sending confirmation.
  void sendOrderConfirmationEmail(newOrder, db, writeData).catch(err => {
    console.error('[Order Email] Razorpay confirmation dispatch failed:', err?.message || err);
  });

  res.status(201).json({ success: true, message: 'Payment verified and order placed successfully', data: responseOrder });
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
app.get('/api/shiprocket/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const status = await shiprocket.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Pincode Serviceability & Courier Rates
app.get('/api/shiprocket/serviceability', authenticateToken, async (req, res) => {
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
app.post('/api/shiprocket/orders/:id/dispatch', authenticateToken, requireAdmin, async (req, res) => {
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
app.post('/api/shiprocket/orders/:id/assign-awb', authenticateToken, requireAdmin, async (req, res) => {
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
app.get('/api/shiprocket/orders/:id/label', authenticateToken, requireAdmin, async (req, res) => {
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
app.get('/api/shiprocket/orders/:id/invoice', authenticateToken, requireAdmin, async (req, res) => {
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
app.post('/api/shiprocket/pickup-location', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await shiprocket.addPickupLocation(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Shiprocket Configuration
app.post('/api/shiprocket/settings', authenticateToken, requireAdmin, (req, res) => {
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
app.get('/api/payments', authenticateToken, (req, res) => {
  const db = readData();
  const payments = db.payments || [];

  if (req.user.role === 'admin') {
    const totalVolume = payments.reduce((sum, p) => p.status === 'Completed' ? sum + p.amount : sum, 0);
    const totalRefunded = payments.reduce((sum, p) => p.status === 'Refunded' ? sum + (p.refundedAmount || p.amount) : sum, 0);
    const pendingCount = payments.filter(p => p.status === 'Pending').length;
    const completedCount = payments.filter(p => p.status === 'Completed').length;
    return res.json({
      success: true,
      data: payments,
      stats: { totalVolume, totalRefunded, pendingCount, completedCount }
    });
  }

  const customerPayments = payments.filter(p => p.customerEmail && p.customerEmail.toLowerCase() === req.user.email.toLowerCase());
  res.json({
    success: true,
    data: customerPayments
  });
});

app.put('/api/payments/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['Completed', 'Pending', 'Failed'];

  if (status === 'Refunded') {
    return res.status(409).json({
      success: false,
      message: 'Refunded status can only be set after a verified gateway refund.'
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid payment status.' });
  }

  const db = readData();
  const payment = (db.payments || []).find(p => p.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found' });
  }

  if (payment.status === 'Refunded') {
    return res.status(409).json({ success: false, message: 'A refunded payment cannot be manually changed.' });
  }

  payment.status = status;
  const order = (db.orders || []).find(o => o.id === payment.orderId);
  if (order) order.paymentStatus = status;

  if (!writeData(db)) {
    return res.status(500).json({ success: false, message: 'Failed to save payment status.' });
  }

  return res.json({ success: true, message: 'Payment status updated', data: payment });
});

app.post('/api/payments/:id/refund', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = readData();
    const payment = (db.payments || []).find(p => p.id === req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const order = (db.orders || []).find(o => o.id === payment.orderId);
    const method = String(payment.method || order?.paymentMethod || '').trim().toLowerCase();
    const paymentId = String(payment.transactionRef || order?.paymentRef || '').trim();

    if (method === 'cash on delivery' || method === 'cod') {
      return res.status(409).json({
        success: false,
        message: 'COD refunds must be processed and confirmed through the manual payout workflow. No gateway refund was issued.'
      });
    }

    if (method !== 'razorpay' || !/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
      return res.status(409).json({
        success: false,
        message: 'This record has no verified Razorpay payment ID. Reconcile the original transaction before issuing a refund. No refund was issued.'
      });
    }

    if (payment.status !== 'Completed') {
      return res.status(409).json({
        success: false,
        message: 'Only completed, not-yet-fully-refunded payments can be refunded.'
      });
    }

    const previousRefunds = Array.isArray(payment.refunds) ? payment.refunds : [];
    const unresolvedRefund = previousRefunds.find(r =>
      !['processed'].includes(String(r.status || '').toLowerCase())
    );

    if (unresolvedRefund) {
      return res.status(409).json({
        success: false,
        message: 'A previous refund is pending or requires reconciliation. Check Razorpay before attempting another refund.',
        refundId: unresolvedRefund.id || null
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay refund credentials are not configured on the server.'
      });
    }

    const originalPaise = Math.round(Number(payment.amount) * 100);
    const alreadyRefundedPaise = Math.round(Number(payment.refundedAmount || 0) * 100);
    const requestedAmount = Number(req.body?.refundAmount);
    const requestedPaise = Math.round(requestedAmount * 100);

    if (
      !Number.isFinite(requestedAmount) ||
      !Number.isSafeInteger(requestedPaise) ||
      requestedPaise <= 0 ||
      originalPaise <= 0 ||
      alreadyRefundedPaise < 0 ||
      alreadyRefundedPaise >= originalPaise ||
      requestedPaise > originalPaise - alreadyRefundedPaise
    ) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount must be positive and cannot exceed the remaining refundable balance.'
      });
    }

    const refundReason = String(req.body?.refundReason || 'Admin issued return/cancellation refund')
      .trim()
      .slice(0, 200);

    // Persist a reservation before contacting Razorpay. Since the file write
    // is synchronous, a subsequent request will see this unresolved reservation.
    const refundRequestId = `refund_req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const reservationDb = readData();
    const reservationPayment = (reservationDb.payments || []).find(p => p.id === payment.id);

    if (
      !reservationPayment ||
      reservationPayment.status !== 'Completed' ||
      Math.round(Number(reservationPayment.refundedAmount || 0) * 100) !== alreadyRefundedPaise
    ) {
      return res.status(409).json({
        success: false,
        message: 'Payment changed before refund reservation. Refresh payment details before proceeding.'
      });
    }

    const existingUnresolved = (Array.isArray(reservationPayment.refunds) ? reservationPayment.refunds : [])
      .find(r => String(r.status || '').toLowerCase() !== 'processed');

    if (existingUnresolved) {
      return res.status(409).json({
        success: false,
        message: 'Another refund is pending or requires reconciliation. Do not retry until it is resolved.',
        refundId: existingUnresolved.id || null
      });
    }

    if (!Array.isArray(reservationPayment.refunds)) reservationPayment.refunds = [];
    reservationPayment.refunds.push({
      id: refundRequestId,
      amount: requestedPaise / 100,
      amountPaise: requestedPaise,
      status: 'processing',
      createdAt: new Date().toISOString(),
      reason: refundReason
    });

    reservationPayment.refundStatus = 'processing';

    if (!writeData(reservationDb)) {
      return res.status(500).json({
        success: false,
        message: 'Could not safely reserve the refund request. No gateway request was sent.'
      });
    }

    let gatewayResponse;

    try {
      gatewayResponse = await fetch(
        `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: requestedPaise,
            notes: { reason: refundReason, internal_payment_id: String(payment.id).slice(0, 80) }
          }),
          signal: AbortSignal.timeout(15000)
        }
      );
    } catch (gatewayError) {
      // A timeout/network error does not prove Razorpay rejected the request.
      // Keep the request blocked until an administrator reconciles it.
      const uncertainDb = readData();
      const uncertainPayment = (uncertainDb.payments || []).find(p => p.id === payment.id);
      const uncertainReservation = uncertainPayment &&
        (uncertainPayment.refunds || []).find(r => r.id === refundRequestId);

      if (uncertainReservation) {
        uncertainReservation.status = 'unknown';
        uncertainReservation.updatedAt = new Date().toISOString();
        uncertainReservation.lastError = 'Gateway outcome unknown; dashboard reconciliation required.';
        uncertainPayment.refundStatus = 'unknown';

        if (!writeData(uncertainDb)) {
          console.error('[Refund] Could not persist unknown gateway outcome.', {
            paymentId: payment.id,
            refundRequestId
          });
        }
      }

      console.error('[Refund] Gateway outcome unknown; do not retry blindly.', {
        paymentId: payment.id,
        refundRequestId,
        errorName: gatewayError?.name || 'GatewayRequestError'
      });

      return res.status(502).json({
        success: false,
        message: 'Refund outcome could not be confirmed. The request is blocked pending Razorpay dashboard reconciliation. Do not retry.',
        refundStatus: 'unknown',
        refundRequestId
      });
    }

    let gatewayData;
    try {
      gatewayData = await gatewayResponse.json();
    } catch {
      gatewayData = {};
    }

    if (!gatewayResponse.ok || !gatewayData.id || gatewayData.payment_id !== paymentId) {
      console.error('[Refund] Gateway rejected refund or returned an unexpected response:', {
        httpStatus: gatewayResponse.status,
        errorCode: gatewayData.error?.code || null
      });

      // Preserve an unresolved reservation. Even an error response should be
      // reconciled before a new refund request is allowed.
      const uncertainDb = readData();
      const uncertainPayment = (uncertainDb.payments || []).find(p => p.id === payment.id);
      const uncertainReservation = uncertainPayment &&
        (uncertainPayment.refunds || []).find(r => r.id === refundRequestId);

      if (uncertainReservation) {
        uncertainReservation.status = 'unknown';
        uncertainReservation.updatedAt = new Date().toISOString();
        uncertainReservation.gatewayHttpStatus = gatewayResponse.status;
        uncertainReservation.gatewayRefundId =
          typeof gatewayData.id === 'string' ? gatewayData.id : uncertainReservation.gatewayRefundId;
        uncertainReservation.lastErrorCode =
          typeof gatewayData.error?.code === 'string' ? gatewayData.error.code : null;
        uncertainReservation.lastError =
          'Gateway did not return a validated refund confirmation; reconciliation required.';
        uncertainPayment.refundStatus = 'unknown';

        if (!writeData(uncertainDb)) {
          console.error('[Refund] Could not persist unresolved gateway response.', {
            paymentId: payment.id,
            refundRequestId
          });
        }
      }

      return res.status(502).json({
        success: false,
        message: 'Razorpay did not return a validated refund confirmation. Check the Razorpay dashboard and reconcile before retrying.',
        refundStatus: 'unknown',
        refundRequestId,
        refundId: typeof gatewayData.id === 'string' ? gatewayData.id : undefined
      });
    }

    const actualRefundPaise = Number(gatewayData.amount);
    if (
      !Number.isSafeInteger(actualRefundPaise) ||
      actualRefundPaise !== requestedPaise
    ) {
      console.error('[Refund] Gateway refund amount mismatch. Manual reconciliation required.', {
        refundId: gatewayData.id
      });

      const mismatchDb = readData();
      const mismatchPayment = (mismatchDb.payments || []).find(p => p.id === payment.id);
      const mismatchReservation = mismatchPayment &&
        (mismatchPayment.refunds || []).find(r => r.id === refundRequestId);

      if (mismatchReservation) {
        mismatchReservation.status = 'unknown';
        mismatchReservation.gatewayRefundId = gatewayData.id;
        mismatchReservation.gatewayAmountPaise =
          Number.isSafeInteger(actualRefundPaise) ? actualRefundPaise : null;
        mismatchReservation.updatedAt = new Date().toISOString();
        mismatchReservation.lastError =
          'Gateway refund amount did not match the requested amount; reconciliation required.';
        mismatchPayment.refundStatus = 'unknown';

        if (!writeData(mismatchDb)) {
          console.error('[Refund] Could not persist amount-mismatch reconciliation details.', {
            refundId: gatewayData.id,
            paymentId: payment.id
          });
        }
      }

      return res.status(502).json({
        success: false,
        message: 'Razorpay returned a refund with an unexpected amount. The request is blocked pending dashboard reconciliation. Do not retry.',
        refundStatus: 'unknown',
        refundRequestId,
        refundId: gatewayData.id
      });
    }

    const gatewayRefundStatus = String(gatewayData.status || '').toLowerCase();

    if (gatewayRefundStatus !== 'processed') {
      // Record the gateway response without claiming that money was refunded.
      const pendingDb = readData();
      const pendingPayment = (pendingDb.payments || []).find(p => p.id === payment.id);

      if (!pendingPayment) {
        console.error('[Refund] Gateway accepted refund but payment record is missing.', {
          refundId: gatewayData.id
        });
        return res.status(500).json({
          success: false,
          message: 'Razorpay accepted the refund request but local payment data is missing. Reconcile before retrying.',
          refundId: gatewayData.id
        });
      }

      if (!Array.isArray(pendingPayment.refunds)) pendingPayment.refunds = [];

      const reservation = pendingPayment.refunds.find(r => r.id === refundRequestId);
      if (!reservation) {
        console.error('[Refund] Reservation missing while recording gateway response.', {
          refundRequestId,
          refundId: gatewayData.id
        });
        return res.status(500).json({
          success: false,
          message: 'Gateway response received but refund reservation is missing. Reconcile before retrying.',
          refundId: gatewayData.id
        });
      }

      reservation.gatewayRefundId = gatewayData.id;
      reservation.status = gatewayRefundStatus || 'unknown';
      reservation.updatedAt = new Date().toISOString();
      pendingPayment.refundStatus = gatewayRefundStatus || 'unknown';

      if (!writeData(pendingDb)) {
        console.error('[Refund] Could not persist unresolved gateway refund.', {
          refundId: gatewayData.id
        });
      }

      return res.status(409).json({
        success: false,
        message: gatewayRefundStatus === 'pending'
          ? 'Razorpay refund is pending. Do not retry; verify its status in the Razorpay dashboard.'
          : 'Razorpay has not confirmed a processed refund. Reconcile the refund in the Razorpay dashboard before retrying.',
        refundId: gatewayData.id,
        refundStatus: gatewayRefundStatus || 'unknown'
      });
    }

    // Reload immediately before persistence so unrelated latest records are preserved.
    const latestDb = readData();
    const latestPayment = (latestDb.payments || []).find(p => p.id === payment.id);

    if (
      !latestPayment ||
      latestPayment.status !== 'Completed' ||
      Math.round(Number(latestPayment.refundedAmount || 0) * 100) !== alreadyRefundedPaise
    ) {
      console.error('[Refund] Gateway refund succeeded but local state changed; reconciliation required.', {
        refundId: gatewayData.id,
        paymentId: payment.id
      });

      return res.status(500).json({
        success: false,
        message: 'Gateway refund was accepted but local payment state changed. Do not retry blindly; reconcile using the Razorpay refund ID.'
      });
    }

    const cumulativeRefundPaise = alreadyRefundedPaise + actualRefundPaise;
    latestPayment.refundedAmount = cumulativeRefundPaise / 100;
    latestPayment.refundReason = refundReason;
    latestPayment.refundId = gatewayData.id;
    latestPayment.refundIds = [
      ...(Array.isArray(latestPayment.refundIds) ? latestPayment.refundIds : []),
      gatewayData.id
    ];
    if (!Array.isArray(latestPayment.refunds)) latestPayment.refunds = [];

    const processedReservation = latestPayment.refunds.find(r => r.id === refundRequestId);
    if (!processedReservation) {
      console.error('[Refund] Processed gateway refund has no matching reservation.', {
        refundRequestId,
        refundId: gatewayData.id
      });
      return res.status(500).json({
        success: false,
        message: 'Razorpay processed the refund but its local reservation is missing. Reconcile before retrying.',
        refundId: gatewayData.id
      });
    }

    processedReservation.gatewayRefundId = gatewayData.id;
    processedReservation.status = 'processed';
    processedReservation.updatedAt = new Date().toISOString();
    latestPayment.refundStatus = 'processed';
    latestPayment.lastRefundAt = new Date().toISOString();
    latestPayment.status = cumulativeRefundPaise >= originalPaise ? 'Refunded' : 'Completed';

    if (latestPayment.status === 'Refunded') {
      const latestOrder = (latestDb.orders || []).find(o => o.id === latestPayment.orderId);
      if (latestOrder) {
        latestOrder.paymentStatus = 'Refunded';
      }
      // Do not bulk-complete return requests. Each return must be
      // updated individually after its own eligibility is verified.
    }

    if (!writeData(latestDb)) {
      console.error('[Refund] Gateway refund succeeded but local persistence failed.', {
        refundId: gatewayData.id,
        paymentId: payment.id
      });

      return res.status(500).json({
        success: false,
        message: 'Razorpay accepted the refund but local persistence failed. Check the Razorpay dashboard and reconcile before retrying.',
        refundId: gatewayData.id
      });
    }

    return res.json({
      success: true,
      message: latestPayment.status === 'Refunded'
        ? 'Refund confirmed by Razorpay.'
        : 'Partial refund confirmed by Razorpay.',
      data: latestPayment
    });
  } catch (err) {
    console.error('[Refund] Processing error:', err.message);
    return res.status(502).json({
      success: false,
      message: 'Refund processing could not be confirmed. Check the Razorpay dashboard before retrying.'
    });
  }
});


// ----------------------------------------------------
// Razorpay Refund Reconciliation (read-only gateway check)
// This endpoint NEVER creates a new refund.
// ----------------------------------------------------
app.post(
  '/api/payments/:id/refunds/:refundRequestId/reconcile',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const paymentIdFromRoute = req.params.id;
      const refundRequestId = req.params.refundRequestId;

      const initialDb = readData();
      const initialPayment = (initialDb.payments || []).find(
        p => p.id === paymentIdFromRoute
      );

      if (!initialPayment) {
        return res.status(404).json({
          success: false,
          message: 'Payment record not found.'
        });
      }

      const initialReservation = (
        Array.isArray(initialPayment.refunds) ? initialPayment.refunds : []
      ).find(r => r.id === refundRequestId);

      if (!initialReservation) {
        return res.status(404).json({
          success: false,
          message: 'Refund reservation not found. No gateway request was made.'
        });
      }

      const gatewayRefundId = String(
        initialReservation.gatewayRefundId || ''
      ).trim();

      if (!/^rfnd_[A-Za-z0-9]+$/.test(gatewayRefundId)) {
        return res.status(409).json({
          success: false,
          refundStatus: initialReservation.status || 'unknown',
          message:
            'Razorpay refund ID is not saved for this reservation. Check the Razorpay dashboard and reconcile manually. No new refund was created.'
        });
      }

      const originalPaymentId = String(
        initialPayment.transactionRef || ''
      ).trim();

      if (!/^pay_[A-Za-z0-9]+$/.test(originalPaymentId)) {
        return res.status(409).json({
          success: false,
          message: 'The saved Razorpay payment ID is invalid. Manual reconciliation is required.'
        });
      }

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        return res.status(503).json({
          success: false,
          message: 'Razorpay credentials are not configured on the server.'
        });
      }

      let gatewayResponse;

      try {
        gatewayResponse = await fetch(
          'https://api.razorpay.com/v1/refunds/' +
            encodeURIComponent(gatewayRefundId),
          {
            method: 'GET',
            headers: {
              Authorization:
                'Basic ' +
                Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
              Accept: 'application/json'
            },
            signal: AbortSignal.timeout(15000)
          }
        );
      } catch (error) {
        console.error('[Refund Reconciliation] Gateway GET failed.', {
          paymentId: paymentIdFromRoute,
          refundRequestId,
          errorName: error?.name || 'GatewayRequestError'
        });

        return res.status(502).json({
          success: false,
          refundStatus: 'unknown',
          message: 'Could not verify refund status with Razorpay. The refund remains blocked; retry reconciliation later.'
        });
      }

      let gatewayData;

      try {
        gatewayData = await gatewayResponse.json();
      } catch {
        gatewayData = {};
      }

      if (!gatewayResponse.ok) {
        console.error('[Refund Reconciliation] Gateway rejected GET.', {
          httpStatus: gatewayResponse.status,
          paymentId: paymentIdFromRoute,
          refundRequestId
        });

        return res.status(502).json({
          success: false,
          refundStatus: 'unknown',
          message: 'Razorpay did not return refund details. No local refund accounting was changed.'
        });
      }

      const gatewayAmount = Number(gatewayData.amount);
      const reservedAmount = Number(initialReservation.amountPaise);
      const gatewayStatus = String(gatewayData.status || '').toLowerCase();

      // Do not reconcile a refund belonging to another payment or amount.
      if (
        gatewayData.id !== gatewayRefundId ||
        gatewayData.payment_id !== originalPaymentId ||
        gatewayData.currency !== 'INR' ||
        !Number.isSafeInteger(gatewayAmount) ||
        gatewayAmount <= 0 ||
        !Number.isSafeInteger(reservedAmount) ||
        reservedAmount <= 0 ||
        gatewayAmount !== reservedAmount
      ) {
        console.error('[Refund Reconciliation] Gateway identity/amount mismatch.', {
          paymentId: paymentIdFromRoute,
          refundRequestId,
          gatewayRefundId
        });

        return res.status(409).json({
          success: false,
          refundStatus: 'unknown',
          message: 'Razorpay refund identity, currency, or amount did not match the saved reservation. Manual investigation is required; accounting was not changed.'
        });
      }

      if (!['processed', 'pending', 'created', 'failed', 'rejected'].includes(gatewayStatus)) {
        return res.status(409).json({
          success: false,
          refundStatus: 'unknown',
          message: 'Razorpay returned an unrecognized refund status. Manual reconciliation is required.'
        });
      }

      // A confirmed non-processed state must never add to refundedAmount.
      if (gatewayStatus !== 'processed') {
        const latestDb = readData();
        const latestPayment = (latestDb.payments || []).find(
          p => p.id === paymentIdFromRoute
        );
        const latestReservation = latestPayment &&
          (Array.isArray(latestPayment.refunds) ? latestPayment.refunds : [])
            .find(r => r.id === refundRequestId);

        if (
          !latestPayment ||
          !latestReservation ||
          latestReservation.gatewayRefundId !== gatewayRefundId
        ) {
          return res.status(409).json({
            success: false,
            message: 'Local refund reservation changed during reconciliation. Refresh and investigate.'
          });
        }

        latestReservation.status =
          gatewayStatus === 'created' ? 'pending' : gatewayStatus;
        latestReservation.updatedAt = new Date().toISOString();

        const hasOtherUnresolved = latestPayment.refunds.some(
          r => r.id !== refundRequestId &&
            String(r.status || '').toLowerCase() !== 'processed'
        );

        latestPayment.refundStatus = hasOtherUnresolved
          ? 'unknown'
          : latestReservation.status;

        if (!writeData(latestDb)) {
          return res.status(500).json({
            success: false,
            message: 'Could not save the verified gateway status. Check persisted data before proceeding.'
          });
        }

        return res.status(200).json({
          success: false,
          refundStatus: latestReservation.status,
          message:
            gatewayStatus === 'failed' || gatewayStatus === 'rejected'
              ? 'Razorpay confirms this refund failed. No amount was added to refunded totals. Review the gateway dashboard before any new action.'
              : 'Razorpay has not confirmed a processed refund yet. The refund remains blocked; check again later.'
        });
      }

      // Razorpay confirms processed. Reload before applying any local accounting.
      const latestDb = readData();
      const latestPayment = (latestDb.payments || []).find(
        p => p.id === paymentIdFromRoute
      );

      const latestReservation = latestPayment &&
        (Array.isArray(latestPayment.refunds) ? latestPayment.refunds : [])
          .find(r => r.id === refundRequestId);

      if (
        !latestPayment ||
        !latestReservation ||
        latestReservation.gatewayRefundId !== gatewayRefundId ||
        Number(latestReservation.amountPaise) !== gatewayAmount
      ) {
        return res.status(409).json({
          success: false,
          refundStatus: 'unknown',
          message: 'Local reservation changed during reconciliation. Razorpay confirms the refund, but manual local reconciliation is required.'
        });
      }

      const reservations = Array.isArray(latestPayment.refunds)
        ? latestPayment.refunds
        : [];

      const refundIds = Array.isArray(latestPayment.refundIds)
        ? latestPayment.refundIds
        : [];

      // If this gateway refund was already accounted, never add it twice.
      const alreadyAccounted =
        refundIds.includes(gatewayRefundId) ||
        reservations.some(r =>
          r.id !== refundRequestId &&
          r.gatewayRefundId === gatewayRefundId &&
          String(r.status || '').toLowerCase() === 'processed'
        ) ||
        String(latestReservation.status || '').toLowerCase() === 'processed';

      const currentRefundedPaise = Math.round(
        Number(latestPayment.refundedAmount || 0) * 100
      );
      const originalPaise = Math.round(Number(latestPayment.amount) * 100);

      if (
        !Number.isSafeInteger(currentRefundedPaise) ||
        currentRefundedPaise < 0 ||
        !Number.isSafeInteger(originalPaise) ||
        originalPaise <= 0
      ) {
        return res.status(409).json({
          success: false,
          message: 'Saved payment totals are invalid. Manual accounting reconciliation is required.'
        });
      }

      const cumulativePaise = alreadyAccounted
        ? currentRefundedPaise
        : currentRefundedPaise + gatewayAmount;

      if (cumulativePaise > originalPaise) {
        return res.status(409).json({
          success: false,
          message: 'Confirmed gateway refund would exceed the original payment total. Manual accounting reconciliation is required.'
        });
      }

      if (!alreadyAccounted) {
        latestPayment.refundedAmount = cumulativePaise / 100;
      }

      latestReservation.gatewayRefundId = gatewayRefundId;
      latestReservation.status = 'processed';
      latestReservation.updatedAt = new Date().toISOString();

      latestPayment.refundIds = [...new Set([...refundIds, gatewayRefundId])];
      latestPayment.refundId = gatewayRefundId;
      latestPayment.refundReason =
        latestReservation.reason || latestPayment.refundReason;
      latestPayment.lastRefundAt = new Date().toISOString();

      const hasOtherUnresolved = reservations.some(
        r => r.id !== refundRequestId &&
          String(r.status || '').toLowerCase() !== 'processed'
      );

      latestPayment.refundStatus = hasOtherUnresolved
        ? 'unknown'
        : 'processed';

      latestPayment.status = cumulativePaise >= originalPaise
        ? 'Refunded'
        : 'Completed';

      if (latestPayment.status === 'Refunded') {
        const order = (latestDb.orders || []).find(
          o => o.id === latestPayment.orderId
        );

        if (order) {
          order.paymentStatus = 'Refunded';
        }
        // Leave return statuses unchanged; update a specific return
        // through its own verified status endpoint.
      }

      if (!writeData(latestDb)) {
        console.error('[Refund Reconciliation] Persistence failed after gateway confirmation.', {
          paymentId: paymentIdFromRoute,
          refundRequestId,
          gatewayRefundId
        });

        return res.status(500).json({
          success: false,
          refundStatus: 'processed',
          message: 'Razorpay confirms the refund, but saving local accounting failed. Do not issue another refund; investigate local persistence.'
        });
      }

      return res.status(200).json({
        success: true,
        refundStatus: 'processed',
        alreadyAccounted,
        message: alreadyAccounted
          ? 'Razorpay confirms this refund was already accounted. Totals were not increased again.'
          : 'Razorpay confirms the refund. Local accounting has been reconciled.',
        data: latestPayment
      });
    } catch (error) {
      console.error('[Refund Reconciliation] Unexpected error.', {
        errorName: error?.name || 'Error'
      });

      return res.status(500).json({
        success: false,
        message: 'Reconciliation could not be completed. Check payment and Razorpay records before further action.'
      });
    }
  }
);


// ----------------------------------------------------
// 6. RETURNS & EXCHANGES API
// ----------------------------------------------------
app.get('/api/returns', authenticateToken, (req, res) => {
  const db = readData();
  const returns = db.returns || [];

  if (req.user.role === 'admin') {
    return res.json({ success: true, count: returns.length, data: returns });
  }

  const customerReturns = returns.filter(r => r.customerEmail && r.customerEmail.toLowerCase() === req.user.email.toLowerCase());
  res.json({ success: true, count: customerReturns.length, data: customerReturns });
});

app.post('/api/returns', authenticateToken, (req, res) => {
  const db = readData();
  if (!db.returns) db.returns = [];
  const { orderId, reason, notes, items, refundAmount, customerName, customerEmail, customerPhone } = req.body;

  if (!orderId || !reason) {
    return res.status(400).json({ success: false, message: 'Order ID and reason are required' });
  }

  const order = (db.orders || []).find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (req.user.role !== 'admin' && (!order.email || order.email.toLowerCase() !== req.user.email.toLowerCase())) {
    return res.status(403).json({ success: false, message: 'Access forbidden: you do not own this order' });
  }
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

app.put('/api/returns/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  if (!db.returns) db.returns = [];

  const ret = db.returns.find(r => r.id === req.params.id);
  if (!ret) {
    return res.status(404).json({ success: false, message: 'Return request not found' });
  }

  const { status, adminRemark, pickupCarrier, pickupTrackingNumber } = req.body;
  const order = (db.orders || []).find(o => o.id === ret.orderId);

  if (status === 'Refund Completed') {
    const payment = (db.payments || []).find(p => p.orderId === ret.orderId);
    const amount = Number(payment?.amount);
    const refunded = Number(payment?.refundedAmount);
    const hasGatewayRefundIds = Array.isArray(payment?.refundIds) && payment.refundIds.length > 0;

    if (
      !payment ||
      payment.status !== 'Refunded' ||
      !Number.isFinite(amount) ||
      !Number.isFinite(refunded) ||
      amount <= 0 ||
      refunded < amount ||
      !hasGatewayRefundIds
    ) {
      return res.status(409).json({
        success: false,
        message: 'Return cannot be completed until a full gateway refund is verified.'
      });
    }
  }

  if (status) ret.status = status;
  if (adminRemark !== undefined) ret.adminRemark = adminRemark;
  if (pickupCarrier !== undefined) ret.pickupCarrier = pickupCarrier;
  if (pickupTrackingNumber !== undefined) ret.pickupTrackingNumber = pickupTrackingNumber;

  if (order) order.returnStatus = status;

  if (!writeData(db)) {
    return res.status(500).json({ success: false, message: 'Failed to save return status.' });
  }

  return res.json({ success: true, message: `Return status updated to ${status}`, data: ret });
});

// 7. CUSTOMERS / USERS MANAGEMENT API
// ----------------------------------------------------
app.get('/api/customers', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  const customers = (db.users || []).map(u => {
    const userOrders = (db.orders || []).filter(o => o.email.toLowerCase() === u.email.toLowerCase());
    const totalSpent = userOrders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);
    const { password, ...safeUser } = u;
    return {
      ...safeUser,
      totalOrders: userOrders.length,
      totalSpent,
      lastOrderDate: userOrders[0]?.createdAt || u.joinedAt || '2026-08-01',
      tier: totalSpent > 5000 ? 'Platinum Luxe' : totalSpent > 2500 ? 'Gold' : 'Silver',
      status: u.status || 'Active'
    };
  });
  res.json({ success: true, count: customers.length, data: customers });
});

app.put('/api/customers/:id/status', authenticateToken, requireAdmin, (req, res) => {
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

app.delete('/api/reviews/:id', authenticateToken, requireAdmin, (req, res) => {
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

app.put('/api/settings', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  db.settings = { ...db.settings, ...req.body };
  writeData(db);
  res.json({ success: true, message: 'Settings updated', data: db.settings });
});

// ----------------------------------------------------
// 10. ANALYTICS API (Comprehensive Executive Summary)
// ----------------------------------------------------
app.get('/api/analytics', authenticateToken, requireAdmin, (req, res) => {
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
        businessPhone: "",
        wabaId: "",
        phoneNumberId: "",
        metaAppStatus: "Not Connected",
        webhookVerified: false,
        autoReplyEnabled: false,
        botName: "BRIVOO Concierge AI"
      },
      conversations: [],
      automations: [],
      campaigns: []
    };
  } else {
    if (!db.whatsapp.config) {
      db.whatsapp.config = {
        businessPhone: "",
        wabaId: "",
        phoneNumberId: "",
        metaAppStatus: "Not Connected",
        webhookVerified: false,
        autoReplyEnabled: false,
        botName: "BRIVOO Concierge AI"
      };
    }
    if (!Array.isArray(db.whatsapp.conversations)) db.whatsapp.conversations = [];
    if (!Array.isArray(db.whatsapp.automations)) db.whatsapp.automations = [];
    if (!Array.isArray(db.whatsapp.campaigns)) db.whatsapp.campaigns = [];
  }
};

app.get('/api/whatsapp/conversations', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  res.json({ success: true, data: db.whatsapp.conversations });
});

app.post('/api/whatsapp/conversations/:id/messages', authenticateToken, requireAdmin, (req, res) => {
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

app.get('/api/whatsapp/automations', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  res.json({ success: true, data: db.whatsapp.automations });
});

app.put('/api/whatsapp/automations/:id', authenticateToken, requireAdmin, (req, res) => {
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

app.post('/api/whatsapp/automations/:id/test', authenticateToken, requireAdmin, (req, res) => {
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

app.get('/api/whatsapp/campaigns', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  res.json({ success: true, data: db.whatsapp.campaigns });
});

app.post('/api/whatsapp/campaigns', authenticateToken, requireAdmin, (req, res) => {
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

app.get('/api/whatsapp/config', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  initWhatsAppDefaults(db);
  res.json({ success: true, data: db.whatsapp.config });
});

app.put('/api/whatsapp/config', authenticateToken, requireAdmin, (req, res) => {
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
  if (!Array.isArray(db.vendors)) db.vendors = [];
  if (!Array.isArray(db.vendorInward)) db.vendorInward = [];
  if (!Array.isArray(db.vendorPayouts)) db.vendorPayouts = [];
};

app.get('/api/vendors', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  initVendorDefaults(db);
  res.json({ success: true, data: db.vendors });
});

app.post('/api/vendors', authenticateToken, requireAdmin, (req, res) => {
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

app.get('/api/vendors/inward', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  initVendorDefaults(db);
  res.json({ success: true, data: db.vendorInward });
});

app.post('/api/vendors/inward', authenticateToken, requireAdmin, (req, res) => {
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

app.get('/api/vendors/payouts', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  initVendorDefaults(db);
  res.json({ success: true, data: db.vendorPayouts });
});

app.post('/api/vendors/payouts', authenticateToken, requireAdmin, (req, res) => {
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
  if (!Array.isArray(db.influencers)) db.influencers = [];
  if (!Array.isArray(db.marketingExpenses)) db.marketingExpenses = [];
};

app.get('/api/marketing/influencers', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  initMarketingDefaults(db);
  res.json({ success: true, data: db.influencers });
});

app.post('/api/marketing/influencers', authenticateToken, requireAdmin, (req, res) => {
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

app.put('/api/marketing/influencers/:id/payout', authenticateToken, requireAdmin, (req, res) => {
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

app.get('/api/marketing/expenses', authenticateToken, requireAdmin, (req, res) => {
  const db = readData();
  initMarketingDefaults(db);
  res.json({ success: true, data: db.marketingExpenses });
});

app.post('/api/marketing/expenses', authenticateToken, requireAdmin, (req, res) => {
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

app.get('/api/marketing/summary', authenticateToken, requireAdmin, (req, res) => {
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
