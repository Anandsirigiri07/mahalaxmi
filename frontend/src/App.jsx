import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PwaProvider } from './context/PwaContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import CataloguePage from './pages/customer/CataloguePage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderSuccessPage from './pages/customer/OrderSuccessPage';
import AccountPage from './pages/customer/AccountPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import OwnerPortalPage from './pages/customer/OwnerPortalPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSalesPage from './pages/admin/AdminSalesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminDeliveriesPage from './pages/admin/AdminDeliveriesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function CustomerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <PwaProvider>
            <BrowserRouter>
              <Routes>
                {/* Customer Storefront Routes */}
                <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
                <Route path="/catalogue" element={<CustomerLayout><CataloguePage /></CustomerLayout>} />
                <Route path="/product/:id" element={<CustomerLayout><ProductDetailPage /></CustomerLayout>} />
                <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <CustomerLayout><CheckoutPage /></CustomerLayout>
                  </ProtectedRoute>
                } />
                <Route path="/order-success/:id" element={
                  <ProtectedRoute>
                    <CustomerLayout><OrderSuccessPage /></CustomerLayout>
                  </ProtectedRoute>
                } />
                <Route path="/account" element={
                  <ProtectedRoute>
                    <CustomerLayout><AccountPage /></CustomerLayout>
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<CustomerLayout><LoginPage /></CustomerLayout>} />
                <Route path="/register" element={<CustomerLayout><RegisterPage /></CustomerLayout>} />
                <Route path="/owner" element={<CustomerLayout><OwnerPortalPage /></CustomerLayout>} />

                {/* Admin Portal (Protected by Admin Middleware) */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="sales" element={<AdminSalesPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="deliveries" element={<AdminDeliveriesPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </PwaProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
