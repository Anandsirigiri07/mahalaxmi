# Mahalaxmi Novelties (ಮಹಾಲಕ್ಷ್ಮೀ ನಾವೆಲ್ಟೀಸ್) — B2B + B2C Jewellery E-Commerce & Inventory Management Platform

> **Location:** Shop No. 8-713/13, Ground Floor, Sangam Talkies Complex, S.B. Temple Road, Kalaburagi - 585 101, Karnataka  
> **Proprietor:** Manoharsingh P. Rathore  
> **Business Tagline:** Wholesale Dealers — No Sales Representative  
> **Direct Contact:** WhatsApp: `+91 98800 42188` | Phone: `+91 94812 42188`  
> **Owner Access:** Restricted to explicitly configured owner credentials  

---

## 💎 Project Highlights & 100% Free-Tier Architecture

1. **Strict Rule — Zero Mock Data:**
   - **Zero Dummy Products:** The database seed (`database/seed.sql`) and frontend are strictly free of fake jewellery prices, dummy items, sample orders, and mock charts.
   - **Graceful Empty States:** The homepage, catalogue, shopping cart, customer order history, and admin dashboard render clean, resilient empty states with ₹0 KPI defaults and instructional call-to-actions until real jewellery photos and prices are uploaded via the Admin Dashboard.
2. **Dual Public Pricing (B2B + B2C):**
   - Every jewellery card publicly displays **both** the Retail Price and the Wholesale Price with Minimum Order Quantity (MOQ) (e.g., *Retail: ₹500 | Wholesale: ₹350 · Min. 6 sets*).
   - Buying mode switchers let customers choose Retail (1+ pcs) or Wholesale (enforces `qty >= MOQ` and verified wholesale accounts).
3. **Hybrid Manual + Automatic Inventory Engine:**
   - Tracks `physical_stock`, `reserved_stock`, and `available_stock = physical_stock - reserved_stock` in MySQL transactions.
   - **Automatic:** Placing an order reserves stock; confirming an order or payment deducts physical stock and clears reserved stock; order cancellation releases reserved stock.
   - **Manual:** Admin can add stock, deduct stock, set exact counts, update low-stock alert thresholds, and audit all transactions with timestamps.
4. **100% Free Payment System (UPI QR + COD):**
   - **UPI QR Code:** Displays store UPI QR code, exact payable amount (₹), and requires customer to enter their **12-digit UPI UTR / Transaction ID**, saved as `Pending Verification` with 1-click Admin verification.
   - **Cash on Delivery (COD):** Available for Kalaburagi local delivery routes.
5. **Local Kalaburagi Delivery Validator:**
   - Validates PIN codes (`585101`, `585102`, `585103`, `585104`, `585105`) with configurable delivery fees and free delivery threshold (₹1,500).
6. **Bilingual English + ಕನ್ನಡ (Kannada):**
   - Instant header toggle for store titles, navigation, and the 6 core categories.
7. **PWA & Zero Paid Third-Party Services:**
   - Installable PWA (`vite-plugin-pwa` with web manifest, service worker, icons, and offline shell fallback).
   - Free client-side image compression (`browser-image-compression` to &lt;200KB) with direct multipart upload to local Multer storage (`/uploads`).
   - Free Google Maps iframe for Sangam Talkies Complex, Kalaburagi.

---

## 🏗️ Tech Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS, Lucide React icons, Recharts, `vite-plugin-pwa`, `browser-image-compression`.
- **Backend:** Node.js, Express.js REST API, `mysql2/promise`, JWT + Cookie authentication, `bcryptjs` password hashing, Multer multipart storage.
- **Database:** MySQL 8.0+ relational schema (`database/schema.sql`, `database/seed.sql`).

---

## 📁 Repository Structure

```
Mahalaxmi/
├── backend/
│   ├── .env                    # Environment variables (DB credentials, JWT secret, Port)
│   ├── .env.example            # Example configuration
│   ├── package.json            # Node backend dependencies
│   ├── uploads/                # Local storage for uploaded product photos & UPI QR code
│   │   └── default-upi-qr.svg  # Default stylized UPI QR asset
│   └── src/
│       ├── server.js           # Express app bootstrap & route registration
│       ├── config/
│       │   ├── db.js           # MySQL connection pool & auto-init runner
│       │   ├── jwt.js          # JWT sign/verify configuration
│       │   └── initDbScript.js # Standalone DB setup script (`npm run init-db`)
│       ├── middleware/
│       │   ├── auth.js         # JWT auth, requireAdmin, requireVerifiedWholesale
│       │   └── upload.js       # Multer storage configuration
│       ├── controllers/
│       │   ├── admin.controller.js      # Dashboard stats, orders, customers, delivery
│       │   ├── auth.controller.js       # Register, login, profile, addresses
│       │   ├── cart.controller.js       # Cart add/update/remove with MOQ validation
│       │   ├── category.controller.js   # 6 core jewellery categories CRUD
│       │   ├── inventory.controller.js  # Live stock control & audit logs
│       │   ├── order.controller.js      # Atomic stock reservation & checkout
│       │   ├── product.controller.js    # Dual pricing product CRUD & image uploads
│       │   └── settings.controller.js   # Store settings & PIN code rules
│       └── routes/                      # Express route endpoints
├── frontend/
│   ├── package.json            # Vite React dependencies
│   ├── vite.config.js          # Vite config with PWA manifest & proxy
│   ├── tailwind.config.js      # Warm gold, deep maroon & emerald theme
│   ├── public/                 # PWA icons & offline shell fallback
│   │   ├── favicon.svg
│   │   ├── pwa-192x192.png
│   │   ├── pwa-512x512.png
│   │   └── offline.html
│   └── src/
│       ├── App.jsx             # React router & context provider tree
│       ├── main.jsx            # Entry point & PWA service worker registration
│       ├── index.css           # Tailwind base styles & luxury typography
│       ├── context/
│       │   ├── AuthContext.jsx     # User authentication & wholesale status
│       │   ├── CartContext.jsx     # Cart items & retail/wholesale mode
│       │   ├── LanguageContext.jsx # English & Kannada bilingual state
│       │   └── PwaContext.jsx      # Install prompt & offline detector
│       ├── services/
│       │   └── api.js              # Axios instance with credentials
│       ├── components/common/
│       │   ├── Navbar.jsx          # Top announcement, bilingual switch, cart badge
│       │   ├── Footer.jsx          # Shop info, WhatsApp direct, Google Maps embed
│       │   ├── ProductCard.jsx     # Dual public pricing card with stock badge
│       │   ├── EmptyState.jsx      # Graceful zero-mock placeholder
│       │   ├── ProtectedRoute.jsx  # Customer authentication guard
│       │   └── AdminRoute.jsx      # Administrator route guard
│       └── pages/
│           ├── customer/           # Storefront, Catalogue, Detail, Cart, Checkout, Orders
│           └── admin/              # Emerald Sidebar Dashboard, Products, Orders, Inventory
└── database/
    ├── schema.sql              # Relational MySQL tables & constraints
    └── seed.sql                # Strict essentials: 6 categories, Kalaburagi PINs, Admin
```

---

## ⚙️ Step-by-Step Setup Guide

### 1. Prerequisites
- **Node.js** v18+ and **npm** v9+ installed.
- **MySQL Server** (Local MySQL, XAMPP, or MariaDB) running on `localhost:3306`.

### 2. Database Setup
Ensure MySQL is running. The backend can automatically create the database and run the schema/seed on server startup, or you can run the SQL script directly:

```sql
-- Via MySQL CLI or phpMyAdmin / MySQL Workbench:
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

Or run the automated Node initialization script from `backend/`:
```bash
cd backend
npm run init-db
```

### 3. Backend Setup
1. Open terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Verify or update `.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=mahalaxmi_novelties
   JWT_SECRET=mahalaxmi_super_secure_jwt_secret_kalaburagi_2026
   CLIENT_URL=http://localhost:5173
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   *The server runs on `http://localhost:5000` and displays confirmation of MySQL database connection.*

### 4. Frontend Setup
1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔑 Accessing the Admin Dashboard

1. Navigate to: `http://localhost:5173/owner` (or `/login`)
2. Sign in using your explicitly configured Owner Email and Password (no default owner credentials are seeded).
3. You will be redirected to `/admin/dashboard`, featuring:
   - **Left Sidebar:** Deep Emerald Green (`#064E3B`) with active pill in Bright Mint Green (`#34D399`).
   - **4 Pastel KPI Cards:** Total Sales, Orders Today, Low Stock Items, Total Customers (defaulting cleanly to ₹0 / 0).
   - **Smooth Green Area Chart:** Monthly & Weekly sales view.
   - **Live Inventory Status Card:** In Stock, Low Stock, and Out of Stock counters with "Manage Inventory" button.
   - **Products & Pricing (`/admin/products`):** Upload real jewellery photos (with automatic camera capture and client-side compression to &lt;200KB), set Retail & Wholesale prices, SKU, and initial stock.
   - **Order Management (`/admin/orders`):** One-click verification of customer 12-digit UPI UTR numbers and status tracking.
   - **Customer Verification (`/admin/customers`):** Approve or reject Wholesale Jeweller accounts.
   - **Local Delivery (`/admin/deliveries`):** Manage doorstep parcel dispatches in Kalaburagi.
   - **Store Settings (`/admin/settings`):** Update store phone numbers, address, and upload custom shop UPI QR code.

---

## 📦 Production Build & PWA Verification

To test the production PWA bundle:
```bash
cd frontend
npm run build
npm run preview
```
The application will generate `dist/sw.js` and `dist/manifest.webmanifest` and can be installed as a standalone desktop/mobile app on Chrome, Edge, Android, and iOS.
