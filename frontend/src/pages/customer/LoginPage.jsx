import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function LoginPage() {
  const { login, isSupabaseActive } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/account';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res?.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#280812] text-ivory py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#37141e]/95 border border-gold/40 rounded-3xl p-6 sm:p-8 shadow-deep-3d space-y-6">
        
        {/* Monogram Crest */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-wine-950/90 border border-gold/60 text-gold-light flex items-center justify-center mx-auto shadow-floating-gold">
            <span className="font-serif text-xl font-bold tracking-wider">MN</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory gold-text-glow">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-ivory/70">
            Mahalaxmi Novelties · Wholesale &amp; Retail Jewellery Kalaburagi
          </p>

          {isSupabaseActive && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-[10px] text-gold-light">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
              <span>Supabase Authentication Ready</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ivory/70 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1D050D] border border-gold/40 text-ivory text-xs sm:text-sm focus:border-gold focus:outline-none"
              />
              <Mail className="w-4 h-4 text-gold absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ivory/70 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1D050D] border border-gold/40 text-ivory text-xs sm:text-sm focus:border-gold focus:outline-none"
              />
              <Lock className="w-4 h-4 text-gold absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-sans font-bold text-xs uppercase tracking-wider shadow-floating-gold active:scale-95 transition flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gold/20 text-xs text-ivory/70 space-y-2">
          <div>
            New customer or wholesale jeweller?{' '}
            <Link to="/register" className="text-gold font-bold hover:underline">
              Register Account
            </Link>
          </div>
          <div className="pt-1 text-[11px] text-ivory/50">
            Store Proprietor?{' '}
            <Link to="/owner" className="text-gold-light hover:underline font-semibold">
              Owner Portal →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
