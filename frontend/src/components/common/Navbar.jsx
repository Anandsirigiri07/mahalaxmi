import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Globe, 
  ShoppingBag, 
  User, 
  Search, 
  Grid, 
  Home, 
  ShieldCheck,
  Bot
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { usePwa } from '../../context/PwaContext';
import AiStylistModal from './AiStylistModal';

export default function Navbar() {
  const { lang, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, isAdmin, isSupabaseActive } = useAuth();
  const { cart } = useCart();
  const { isInstallable, installApp } = usePwa();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const totalCartCount = cart.items ? cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ==================== 1. SLIM LUXURY TOP BAR ==================== */}
      <header className="sticky top-0 z-40 bg-[#1D050D]/95 backdrop-blur-xl border-b border-gold/30 text-ivory">
        {/* Top Info Strip */}
        <div className="bg-[#120308] border-b border-gold/15 py-1 px-4 text-[11px] text-ivory/80">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center space-x-3 truncate">
              <span className="flex items-center space-x-1 text-gold-light font-medium">
                <MapPin className="w-3 h-3 text-gold" />
                <span className="truncate">Sangam Talkies Complex, S.B. Temple Road, Kalaburagi - 585 101</span>
              </span>
              <span className="hidden md:inline text-gold/40">•</span>
              <span className="hidden md:flex items-center space-x-1 text-ivory/70">
                <Phone className="w-3 h-3 text-gold" />
                <span>+91 94812 42188 / 98800 42188</span>
              </span>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0">
              {isSupabaseActive && (
                <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gold/15 border border-gold/40 text-[10px] text-gold-light">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                  <span>Supabase Active</span>
                </span>
              )}

              {isInstallable && (
                <button
                  onClick={installApp}
                  className="px-2 py-0.5 rounded-full bg-gold/20 hover:bg-gold/30 text-gold-light text-[10px] font-semibold border border-gold/40 transition"
                >
                  📲 Install App
                </button>
              )}

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-black/40 border border-gold/30 text-gold-light text-[11px] font-medium hover:border-gold transition"
                title="Toggle English / Kannada"
              >
                <Globe className="w-3 h-3 text-gold" />
                <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Brand Logo & Monogram */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-wine-950/80 border border-gold/60 p-1 flex items-center justify-center shadow-floating-gold group-hover:scale-105 transition-transform">
              <span className="font-serif text-gold-light font-bold text-sm tracking-wider">MN</span>
            </div>
            <div>
              <div className="font-serif text-lg sm:text-xl font-bold tracking-wide text-ivory group-hover:text-gold-light transition gold-text-glow leading-tight">
                {lang === 'kn' ? 'ಮಹಾಲಕ್ಷ್ಮೀ ನಾವೆಲ್ಟೀಸ್' : 'MAHALAXMI NOVELTIES'}
              </div>
              <p className="text-[10px] font-sans text-gold/80 tracking-widest uppercase font-medium">
                Wholesale &amp; Retail Jewellery · Kalaburagi
              </p>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold tracking-wider uppercase">
            <Link 
              to="/" 
              className={`hover:text-gold-light transition ${isActive('/') ? 'text-gold-light border-b border-gold pb-0.5' : 'text-ivory/80'}`}
            >
              Home
            </Link>
            <Link 
              to="/catalogue" 
              className={`hover:text-gold-light transition ${isActive('/catalogue') ? 'text-gold-light border-b border-gold pb-0.5' : 'text-ivory/80'}`}
            >
              Catalogue
            </Link>
            <button
              onClick={() => setAiModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-gold/25 via-gold/15 to-transparent border border-gold/40 text-gold-light hover:border-gold transition shadow-floating-gold"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-light animate-pulse" />
              <span>AI Stylist</span>
            </button>
            {isAdmin && (
              <Link 
                to="/admin/dashboard" 
                className="px-2.5 py-1 rounded-lg bg-gold/20 text-gold-light border border-gold/40 hover:bg-gold/30 transition flex items-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3">
            {/* AI Stylist mobile button */}
            <button
              onClick={() => setAiModalOpen(true)}
              className="md:hidden relative w-9 h-9 rounded-full bg-wine-900/60 border border-gold/40 flex items-center justify-center text-gold-light shadow-md active:scale-95 transition"
              aria-label="AI Stylist"
              title="AI Jewellery Stylist"
            >
              <Sparkles className="w-4 h-4 text-gold-light" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold animate-ping"></span>
            </button>

            {/* Account Link */}
            <Link
              to={isAuthenticated ? "/account" : "/login"}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-gold/30 text-xs text-gold-light hover:bg-white/10 transition"
            >
              <User className="w-3.5 h-3.5 text-gold" />
              <span>{isAuthenticated ? (user.full_name?.split(' ')[0] || 'Account') : 'Login'}</span>
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 border border-gold/40 flex items-center justify-center text-gold-light shadow-floating-gold hover:border-gold active:scale-95 transition"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-gold-light" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-wine-950 font-sans font-bold text-[10px] flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ==================== 2. FLOATING BOTTOM NAVIGATION (MOBILE) ==================== */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 max-w-[390px] mx-auto">
        <div className="h-16 px-3 bg-[#1D050D]/90 backdrop-blur-2xl border border-gold/40 rounded-full shadow-deep-3d flex items-center justify-between">
          
          {/* 1. Home */}
          <Link
            to="/"
            className={`relative flex flex-col items-center justify-center flex-1 py-1 transition ${
              isActive('/') ? 'text-gold-light' : 'text-ivory/60 hover:text-gold-light'
            }`}
          >
            {isActive('/') && <div className="absolute -inset-1 rounded-full bg-gold/25 blur-md pointer-events-none"></div>}
            <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition ${
              isActive('/') ? 'bg-gradient-to-b from-gold/30 to-gold/10 border border-gold shadow-floating-gold' : ''
            }`}>
              <Home className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold tracking-wider mt-0.5">Home</span>
          </Link>

          {/* 2. Categories / Catalogue */}
          <Link
            to="/catalogue"
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              isActive('/catalogue') ? 'text-gold-light' : 'text-ivory/60 hover:text-gold-light'
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
              isActive('/catalogue') ? 'bg-gradient-to-b from-gold/30 to-gold/10 border border-gold shadow-floating-gold' : ''
            }`}>
              <Grid className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-medium tracking-wider mt-0.5">Catalogue</span>
          </Link>

          {/* 3. AI Stylist */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-ivory/70 hover:text-gold-light transition group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/25 to-gold/5 border border-gold/50 flex items-center justify-center shadow-floating-gold group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4 text-gold-light animate-pulse" />
            </div>
            <span className="text-[9px] font-semibold text-gold-light tracking-wider mt-0.5">AI Stylist</span>
          </button>

          {/* 4. Cart */}
          <Link
            to="/cart"
            className={`relative flex flex-col items-center justify-center flex-1 py-1 transition ${
              isActive('/cart') ? 'text-gold-light' : 'text-ivory/60 hover:text-gold-light'
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
              isActive('/cart') ? 'bg-gradient-to-b from-gold/30 to-gold/10 border border-gold shadow-floating-gold' : ''
            }`}>
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-gold text-wine-950 font-bold text-[9px] flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium tracking-wider mt-0.5">Cart</span>
          </Link>

          {/* 5. Account */}
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              isActive('/account') || isActive('/login') ? 'text-gold-light' : 'text-ivory/60 hover:text-gold-light'
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
              isActive('/account') || isActive('/login') ? 'bg-gradient-to-b from-gold/30 to-gold/10 border border-gold shadow-floating-gold' : ''
            }`}>
              <User className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-medium tracking-wider mt-0.5">
              {isAuthenticated ? 'Profile' : 'Login'}
            </span>
          </Link>

        </div>
      </nav>

      {/* AI Stylist Modal */}
      <AiStylistModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </>
  );
}
