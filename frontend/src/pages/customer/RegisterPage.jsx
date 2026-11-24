import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Store, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function RegisterPage() {
  const { register, isSupabaseActive } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('retail'); // 'retail' or 'wholesale'
  const [shopName, setShopName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        full_name: fullName,
        email,
        phone,
        password,
        account_type: accountType,
        business_name: accountType === 'wholesale' ? shopName : null,
        gstin: accountType === 'wholesale' ? gstNumber : null
      };

      await register(payload);
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
            Create an Account
          </h1>
          <p className="text-xs text-ivory/70">
            Choose Retail (Individual) or Wholesale Jeweller / Reseller
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Account Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-gold/30 rounded-2xl">
          <button
            type="button"
            onClick={() => setAccountType('retail')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
              accountType === 'retail'
                ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 shadow-md'
                : 'text-ivory/70 hover:text-gold-light'
            }`}
          >
            Retail Buyer
          </button>
          <button
            type="button"
            onClick={() => setAccountType('wholesale')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
              accountType === 'wholesale'
                ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 shadow-md'
                : 'text-ivory/70 hover:text-gold-light'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Wholesale Jeweller</span>
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ivory/70 mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Rathore"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1D050D] border border-gold/40 text-ivory text-xs sm:text-sm focus:border-gold focus:outline-none"
              />
              <User className="w-4 h-4 text-gold absolute left-3 top-3" />
            </div>
          </div>

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
              Phone Number (WhatsApp)
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94812 00000"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1D050D] border border-gold/40 text-ivory text-xs sm:text-sm focus:border-gold focus:outline-none"
              />
              <Phone className="w-4 h-4 text-gold absolute left-3 top-3" />
            </div>
          </div>

          {accountType === 'wholesale' && (
            <>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gold-light mb-1">
                  Jewellery Store / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Laxmi Jewellers, Kalaburagi"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1D050D] border border-gold text-ivory text-xs sm:text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-ivory/70 mb-1">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="29AAAAA0000A1Z5"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1D050D] border border-gold/40 text-ivory text-xs sm:text-sm font-mono focus:border-gold focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ivory/70 mb-1">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
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
              <span>Registering Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gold/20 text-xs text-ivory/70">
          Already registered?{' '}
          <Link to="/login" className="text-gold font-bold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
