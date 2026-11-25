import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, loginWithGoogle, isSupabaseActive, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/account';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin/dashboard' : from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, from, navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try with email.');
    } finally {
      setSubmitting(false);
    }
  };

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

        {isSupabaseActive && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-sans font-semibold text-xs tracking-wide shadow-md transition flex items-center justify-center space-x-2.5 active:scale-95 border border-stone-300"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="flex-1 h-px bg-gold/25"></div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">or sign in with email</span>
              <div className="flex-1 h-px bg-gold/25"></div>
            </div>
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
