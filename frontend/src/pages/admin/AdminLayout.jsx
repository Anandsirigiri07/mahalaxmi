import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingBag, 
  Boxes, 
  Gem, 
  Users, 
  Truck, 
  Settings, 
  LogOut, 
  Sparkles, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminNavItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Sales Overview', path: '/admin/sales', icon: TrendingUp },
  { name: 'Order Management', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Inventory Control', path: '/admin/inventory', icon: Boxes },
  { name: 'Products & Pricing', path: '/admin/products', icon: Gem },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Local Delivery', path: '/admin/deliveries', icon: Truck },
  { name: 'Store Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1D050D] text-ivory flex">
      {/* 1. Left Sidebar (Imperial Wine & Champagne Gold) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#280812] border-r border-gold/30 text-ivory flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } shadow-2xl`}>
        {/* Brand & Header */}
        <div>
          <div className="p-5 border-b border-gold/20 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-wine-950 border border-gold/60 flex items-center justify-center text-gold-light font-serif font-bold text-base shadow-floating-gold">
                MN
              </div>
              <div>
                <h2 className="font-serif font-bold text-sm tracking-wider text-ivory gold-text-glow">
                  MAHALAXMI
                </h2>
                <span className="text-[10px] font-mono font-bold text-gold-light uppercase tracking-widest block">
                  Proprietor Portal
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gold hover:text-gold-light"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-bold shadow-floating-gold'
                        : 'text-ivory/70 hover:bg-wine-900/60 hover:text-gold-light'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Admin Profile & Log Out */}
        <div className="p-4 border-t border-gold/20 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-black/40 border border-gold/30 text-gold-light text-xs font-semibold flex items-center justify-center space-x-1.5 hover:bg-black/60 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Storefront</span>
          </Link>

          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 text-gold-light flex items-center justify-center text-xs font-bold">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ivory truncate">
                {user?.full_name || 'Store Owner'}
              </p>
              <p className="text-[10px] text-ivory/50 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#280812]/95 backdrop-blur-md border-b border-gold/20 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gold p-1.5 rounded-lg bg-black/40 border border-gold/30"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
              <span className="text-xs font-mono text-gold-light uppercase tracking-wider">
                👑 Mahalaxmi Novelties · Owner Executive Portal
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <Link
              to="/catalogue"
              className="hidden sm:inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gold/15 text-gold-light border border-gold/30 hover:border-gold transition"
            >
              <span>Catalogue</span>
            </Link>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#1D050D] text-ivory">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
