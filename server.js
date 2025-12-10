// =========================================
// OrbitCart Aerospace E-Commerce Server
// Node.js + Express + SQLite + EJS
// =========================================

const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------------------
// 1. EXPRESS MIDDLEWARE
// -----------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'orbitcart-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Public static folder (CSS, images, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Template engine setup (EJS)
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'ejs');

// -----------------------------------------
// 2. AUTHENTICATION MIDDLEWARE
// -----------------------------------------
// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
}

// Middleware to make user info available to templates
app.use((req, res, next) => {
    res.locals.user = req.session.userId ? {
        id: req.session.userId,
        username: req.session.username
    } : null;
    next();
});

// -----------------------------------------
// 3. ROUTES (Controllers)
// -----------------------------------------
const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const customersRouter = require('./routes/customers');

// Mount route modules
app.use('/api/auth', authRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/customers', customersRouter);

// -----------------------------------------
// 4. HOME PAGE (rendered template)
// -----------------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -----------------------------------------
// 4. API FALLBACK FOR OLD STATIC VERSION
//    (If your DB is not implemented yet)
// -----------------------------------------

// Temporary in-memory product catalog
// REMOVE THIS once SQLite DB is implemented
const fallbackProducts = [
  { id: 'oc-001', name: 'Flight Computer Dev Board', category: 'Avionics', price: 499.0 },
  { id: 'oc-002', name: 'Triple-Axis MEMS IMU', category: 'Sensors', price: 189.0 },
  { id: 'oc-003', name: 'Differential Pressure Transducer', category: 'Sensors', price: 129.0 },
  // … keep the rest of your 20 products here …
];

// GET /api/products → legacy mode only
app.get('/api/products', (req, res) => {
  res.json(fallbackProducts);
});

// GET /api/products/:id → legacy mode only
app.get('/api/products/:id', (req, res) => {
  const product = fallbackProducts.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// -----------------------------------------
// 5. SEARCH ENDPOINT (optional)
// -----------------------------------------
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const results = fallbackProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
  res.json({ query: q, count: results.length, results });
});

// -----------------------------------------
// 6. 404 HANDLER (MUST be last)
// -----------------------------------------
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// -----------------------------------------
// 7. START SERVER
// -----------------------------------------
app.listen(PORT, () => {
  console.log(`OrbitCart server running at http://localhost:${PORT}`);
});
