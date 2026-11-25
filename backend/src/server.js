const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const { initDatabase, ensureDbInitialized, isDbConnected } = require('./config/db');
const { localUploadDir, tmpUploadDir } = require('./middleware/upload');

// Route Handlers
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');
const settingsRoutes = require('./routes/settings.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

// 1. Security & Core Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id']
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Ensure database/embedded store is initialized on first request (critical for serverless)
app.use('/api', async (req, res, next) => {
  try {
    await ensureDbInitialized();
    next();
  } catch (err) {
    next(err);
  }
});

// 2. Serve Static Uploads (Product photos, UPI QR code, runtime tmp uploads on serverless)
if (fs.existsSync(tmpUploadDir)) {
  app.use('/uploads', express.static(tmpUploadDir));
}
app.use('/uploads', express.static(localUploadDir));

// 3. Health Check API
app.get('/api/health', async (req, res) => {
  await ensureDbInitialized();
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
app.use('/api/ai', aiRoutes);

// 5. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// 6. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Uploaded file exceeds the 5MB limit.'
    });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request payload.'
    });
  }
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
    console.log(`=======================================================`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
