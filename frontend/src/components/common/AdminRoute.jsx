import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1D050D] text-gold">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in -> redirect to proprietor owner portal
  if (!isAuthenticated) {
    return <Navigate to="/owner" state={{ from: location }} replace />;
  }

  // If logged in but not owner/admin -> show strict access restriction notice
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#1D050D] text-ivory flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#280812] border border-gold/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-wine-950 border border-gold/60 text-gold-light flex items-center justify-center mx-auto shadow-floating-gold">
            <ShieldAlert className="w-8 h-8 text-gold" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-ivory gold-text-glow">
            Proprietor Access Restricted
          </h2>
          <p className="text-xs text-ivory/70 leading-relaxed">
            This dashboard is strictly reserved for store proprietors <strong className="text-gold-light">Manoharsingh P. Rathore</strong> &amp; <strong className="text-gold-light">Jajpal Singh</strong> of Mahalaxmi Novelties.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/owner"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-sans font-bold text-xs uppercase tracking-wider shadow-floating-gold hover:scale-105 transition"
            >
              👑 Proprietor Login
            </Link>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-black/40 border border-gold/30 text-gold-light font-sans font-semibold text-xs hover:bg-black/60 transition"
            >
              Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
