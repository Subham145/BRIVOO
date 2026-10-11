import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'store.json');

const INITIAL_DATA = {
  settings: {
    announcement: "FREE SHIPPING ON ALL ORDERS ABOVE ₹1999",
    freeShippingThreshold: 1999,
    heroTitle: "TIMELESS STYLE.\nPREMIUM YOU.",
    heroSubtext: "Elevated essentials crafted for the modern wardrobe. Minimal. Premium. Effortless.",
    heroImage: "/images/hero.png"
  },
  categories: [
    { id: "cat-1", name: "Shirts", slug: "shirts", description: "Linen & Cotton Essentials" },
    { id: "cat-2", name: "Polos", slug: "polos", description: "Textured & Knit Polos" },
    { id: "cat-3", name: "Vests", slug: "vests", description: "Tailored Waistcoats & Vests" },
    { id: "cat-4", name: "Trousers", slug: "trousers", description: "Relaxed Linen & Cotton Pants" }
  ],
  coupons: [
    { id: "coup-1", code: "LUXE10", discountType: "percentage", value: 10, minSpend: 1000, active: true },
    { id: "coup-2", code: "BRIVOO500", discountType: "fixed", value: 500, minSpend: 2500, active: true }
  ],
  offers: [
    {
      id: "off-1",
      title: "Summer European Flax Linen Sale",
      subtitle: "Bespoke linen shirts, relaxed trousers & waistcoats",
      badge: "FLAT 25% OFF",
      code: "LINEN25",
      discountType: "percentage",
      discountValue: 25,
      minSpend: 1999,
      description: "Unlock 25% off on our signature 100% European Flax Linen collection. Handcrafted seams and mother-of-pearl buttons.",
      validUntil: "2026-11-30",
      category: "All",
      bannerImage: "/images/hero_slide_1.jpg",
      tagColor: "gold",
      featured: true,
      active: true,
      terms: [
        "Valid on orders above ₹1,999",
        "Applicable on all European Flax Linen articles",
        "Includes complimentary door-to-door express delivery",
        "Cannot be combined with other promotional codes"
      ]
    },
    {
      id: "off-2",
      title: "Atelier First Order Privilege",
      subtitle: "Welcome to BRIVOO luxury tailoring",
      badge: "₹500 OFF",
      code: "WELCOME500",
      discountType: "fixed",
      discountValue: 500,
      minSpend: 2499,
      description: "A warm welcome gift for discerning patrons. Receive ₹500 instant deduction on your first bespoke purchase.",
      validUntil: "2026-12-31",
      category: "All",
      bannerImage: "/images/hero_slide_2.jpg",
      tagColor: "dark",
      featured: true,
      active: true,
      terms: [
        "Minimum cart value of ₹2,499 required",
        "Valid for new customers only",
        "Applicable across all shirts, polos & waistcoats"
      ]
    },
    {
      id: "off-3",
      title: "Weekend Luxury Flash Soirée",
      subtitle: "Limited 48-Hour Weekend Window",
      badge: "FLASH DEAL 30%",
      code: "WEEKEND30",
      discountType: "percentage",
      discountValue: 30,
      minSpend: 3499,
      description: "Exclusive weekend privilege for our atelier club members. Save 30% on orders exceeding ₹3,499.",
      validUntil: "2026-10-31",
      category: "Shirts",
      bannerImage: "/images/hero_slide_3.jpg",
      tagColor: "rose",
      featured: true,
      active: true,
      terms: [
        "Valid till Sunday midnight",
        "Minimum cart spend ₹3,499",
        "Includes express priority dispatched within 24 hours"
      ]
    },
    {
      id: "off-4",
      title: "Complimentary Silk Pocket Square",
      subtitle: "Bespoke luxury gift with every Vest or Suit",
      badge: "COMPLIMENTARY GIFT",
      code: "SILKGIFT",
      discountType: "fixed",
      discountValue: 300,
      minSpend: 2999,
      description: "Receive a complimentary hand-rolled mulberry silk pocket square and ₹300 off with any tailored waistcoat.",
      validUntil: "2026-11-15",
      category: "Vests",
      bannerImage: "/images/tailored_vest.png",
      tagColor: "emerald",
      featured: false,
      active: true,
      terms: [
        "Automatic silk pocket square included in packaging",
        "Minimum spend ₹2,999 on tailored items",
        "Non-exchangeable for cash"
      ]
    }
  ],
  users: [
    {
      id: "usr-admin",
      name: "Sujal Rathore (Admin)",
      email: "sujalrathore970@gmail.com",
      password: "Suj@l0504", // Hashed in production
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    },
    {
      id: "usr-customer",
      name: "Hanuman Jogi",
      email: "customer@brivoo.com",
      password: "user123",
      role: "customer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    }
  ],
  otps: {},
  products: [
    {
      id: "prod-1",
      title: "Linen Resort Shirt",
      subtitle: "Ivory",
      category: "Shirts",
      gender: "Men",
      price: 1799,
      originalPrice: 2499,
      tag: "NEW",
      image: "/images/linen_resort_shirt.png",
      colors: [
        { name: "Ivory", hex: "#F5F2EB" },
        { name: "Sage", hex: "#5C6B5A" },
        { name: "Black", hex: "#1C1C1C" }
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 45,
      description: "Elevated short-sleeve resort shirt cut from premium breathable linen. Designed with a classic camp collar and a relaxed silhouette for effortless summer elegance.",
      specs: "100% European Flax Linen. Pre-washed for soft feel. Machine wash cold.",
      inStock: true,
      featured: true,
      reviews: [
        { id: "r1", userName: "Aarav Sharma", rating: 5, comment: "Super soft linen, perfect fit for summer outings!", date: "2026-08-10" },
        { id: "r2", userName: "Kabir Roy", rating: 4, comment: "Great texture and color. Feels very high end.", date: "2026-08-12" }
      ]
    },
    {
      id: "prod-2",
      title: "Oversized Linen Shirt",
      subtitle: "Beige",
      category: "Shirts",
      gender: "Women",
      price: 1899,
      originalPrice: 2699,
      tag: "NEW",
      image: "/images/oversized_shirt.png",
      colors: [
        { name: "Beige", hex: "#E3D5C5" },
        { name: "Cocoa", hex: "#5D4037" },
        { name: "Noir", hex: "#141414" }
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      stock: 30,
      description: "Relaxed oversized button-down shirt featuring dropped shoulders and chest pocket detail. Made from ultra-lightweight organic linen blend.",
      specs: "80% Linen, 20% Organic Cotton. Dry clean or hand wash cold.",
      inStock: true,
      featured: true,
      reviews: [
        { id: "r3", userName: "Priya Verma", rating: 5, comment: "Looks so elegant and chic. Quality is top notch!", date: "2026-08-12" }
      ]
    },
    {
      id: "prod-3",
      title: "Textured Knit Polo",
      subtitle: "Brown",
      category: "Polos",
      gender: "Men",
      price: 1699,
      originalPrice: 2299,
      tag: "BESTSELLER",
      image: "/images/textured_knit_polo.png",
      colors: [
        { name: "Brown", hex: "#4A3525" },
        { name: "Cream", hex: "#F7F3EE" },
        { name: "Black", hex: "#111111" }
      ],
      sizes: ["S", "M", "L", "XL"],
      stock: 20,
      description: "Sophisticated textured quarter-zip knit polo with refined ribbed collar and hem. Crafted from high-gauge luxury cotton.",
      specs: "100% Combed Cotton Knit. Lay flat to dry.",
      inStock: true,
      featured: true,
      reviews: [
        { id: "r4", userName: "Rohan Mehta", rating: 5, comment: "The quarter zip detail is crisp and stylish. Fits true to size.", date: "2026-08-14" }
      ]
    },
    {
      id: "prod-4",
      title: "Tailored Vest",
      subtitle: "White",
      category: "Vests",
      gender: "Women",
      price: 1999,
      originalPrice: 2899,
      tag: "NEW",
      image: "/images/tailored_vest.png",
      colors: [
        { name: "White", hex: "#FFFFFF" },
        { name: "Camel", hex: "#C69C6D" },
        { name: "Black", hex: "#000000" }
      ],
      sizes: ["XS", "S", "M", "L"],
      stock: 15,
      description: "Sleek tailored waistcoat vest with subtle horn-button front and notched hem. Pair with matching trousers for a powerful luxury look.",
      specs: "70% Viscose, 30% Linen with 100% Silk lining.",
      inStock: true,
      featured: true,
      reviews: [
        { id: "r5", userName: "Ananya Roy", rating: 5, comment: "Absolute perfection! Fits like a glove.", date: "2026-08-15" }
      ]
    },
    {
      id: "prod-5",
      title: "Linen Tailored Trouser",
      subtitle: "Oatmeal",
      category: "Trousers",
      gender: "Unisex",
      price: 2499,
      originalPrice: 3299,
      tag: "BESTSELLER",
      image: "/images/hero.png",
      colors: [
        { name: "Oatmeal", hex: "#D6C7B2" },
        { name: "Charcoal", hex: "#363636" }
      ],
      sizes: ["28", "30", "32", "34", "36"],
      stock: 25,
      description: "Relaxed straight-leg tailored trousers with elasticated back waist, horn buttons, and deep side pockets.",
      specs: "100% Fine Linen.",
      inStock: true,
      featured: false,
      reviews: []
    }
  ],
  orders: [
    {
      id: "BRV-98412",
      customerName: "Rahul Kapoor",
      email: "rahul@example.com",
      phone: "+91 98765 43210",
      address: "Flat 402, Sunshine Heights, Bandra West, Mumbai 400050",
      items: [
        {
          id: "prod-1",
          title: "Linen Resort Shirt",
          price: 1799,
          quantity: 1,
          selectedSize: "L",
          selectedColor: "Ivory",
          image: "/images/linen_resort_shirt.png"
        }
      ],
      totalAmount: 1799,
      discountAmount: 0,
      paymentMethod: "UPI",
      status: "Processing",
      createdAt: "2026-08-16T10:30:00.000Z"
    },
    {
      id: "BRV-98411",
      customerName: "Sneha Reddy",
      email: "sneha@example.com",
      phone: "+91 91234 56789",
      address: "12 Jubilee Hills, Road No 36, Hyderabad 500033",
      items: [
        {
          id: "prod-4",
          title: "Tailored Vest",
          price: 1999,
          quantity: 1,
          selectedSize: "S",
          selectedColor: "White",
          image: "http://localhost:5000/images/tailored_vest.png"
        }
      ],
      totalAmount: 1799,
      discountAmount: 200,
      paymentMethod: "Card",
      status: "Delivered",
      createdAt: "2026-08-15T14:20:00.000Z"
    }
  ]
};

// Database Initialization
export function initDB() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
  }
}

export function readData() {
  initDB();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    let dirty = false;
    if (!data.users) {
      data.users = INITIAL_DATA.users;
      dirty = true;
    }
    if (!data.otps) {
      data.otps = INITIAL_DATA.otps;
      dirty = true;
    }
    if (!data.coupons) {
      data.coupons = INITIAL_DATA.coupons;
      dirty = true;
    }
    if (!data.offers) {
      data.offers = INITIAL_DATA.offers;
      dirty = true;
    }
    if (!data.categories) {
      data.categories = INITIAL_DATA.categories;
      dirty = true;
    }
    if (!data.payments) {
      data.payments = [];
      dirty = true;
    }
    if (!data.returns) {
      data.returns = [];
      dirty = true;
    }
    if (!data.settings) {
      data.settings = INITIAL_DATA.settings;
      dirty = true;
    }
    if (dirty) {
      writeData(data);
    }
    return data;
  } catch (err) {
    console.error('Error reading database file:', err);
    return INITIAL_DATA;
  }
}

export function writeData(data) {
  initDB();
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
    return true;
  } catch (err) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (fallbackErr) {
      console.error('Error writing database file:', fallbackErr);
      return false;
    }
  }
}
