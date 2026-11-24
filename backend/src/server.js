const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const { initDatabase, isDbConnected } = require('./config/db');

// Route Handlers
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security & Core Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id']
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 2. Serve Static Uploads (Product photos, UPI QR code, etc.)
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// 3. Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    store: 'Mahalaxmi Novelties (ಮಹಾಲಕ್ಷ್ಮೀ ನಾವೆಲ್ಟೀಸ್)',
    location: 'Sangam Talkies Complex, Kalaburagi - 585 101',
    database_connected: isDbConnected(),
    timestamp: new Date().toISOString()
  });
});

// 4. API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// 5. 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// 6. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

// 7. Start Server and Initialize Database
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` ✨ Mahalaxmi Novelties Backend API Server Running`);
    console.log(` 📍 Location: S.B. Temple Road, Kalaburagi - 585 101`);
    console.log(` 🌐 Server URL: http://localhost:${PORT}`);
    console.log(` 📱 Client Allowed Origin: ${CLIENT_URL}`);
    console.log(` 🛡️  Default Admin: admin@mahalaxminovelties.com`);
    console.log(`=======================================================`);
  });
}

startServer();
