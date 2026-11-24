import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Crown, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Boxes, 
  Users, 
  Store,
  Sparkles,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function OwnerPortalPage() {
  const { ownerLogin, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [selectedOwner, setSelectedOwner] = useState('manohar'); // 'manohar' or 'jajpal'
  const [pin, setPin] = useState('1250');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const owners = [
    {
      id: 'manohar',
      name: 'Manoharsingh P. Rathore',
      title: 'Proprietor & Founder',
      phone: '+91 94812 42188',
      initials: 'MR',
      description: 'Overall executive governance, wholesale pricing policy, and supplier relations.'
    },
    {
      id: 'jajpal',
      name: 'Jajpal Singh',
      title: 'Managing Store Partner',
      phone: '+91 98800 42188',
      initials: 'JS',
      description: 'Kalaburagi showroom operations, daily dispatches, inventory control & client orders.'
    }
  ];

  const handleAccess = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await ownerLogin(selectedOwner, pin);
      if (res?.success) {
        navigate('/admin/dashboard');
      } else {
        setError(res?.message || 'Access denied.');
      }
    } catch (err) {
      setError(err.message || 'Owner authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1D050D] text-ivory py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Golden Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-xl w-full relative z-10 space-y-6">
        
        {/* Crown Monogram Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold-light text-xs font-mono tracking-widest uppercase shadow-floating-gold">
            <Crown className="w-3.5 h-3.5 text-gold" />
            <span>Exclusive Executive Gateway</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ivory gold-text-glow tracking-wide">
            Mahalaxmi Novelties
          </h1>
          <p className="text-xs sm:text-sm text-ivory/70 max-w-md mx-auto">
            Proprietor &amp; Managing Partner Executive Portal · S.B. Temple Road, Kalaburagi
          </p>
        </div>

        {/* Access Box */}
        <div className="bg-[#280812]/95 border border-gold/40 rounded-3xl p-6 sm:p-8 shadow-deep-3d backdrop-blur-xl space-y-6">
          
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gold-light mb-3">
              1. Select Authorized Owner / Managing Partner:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {owners.map((o) => {
                const isSelected = selectedOwner === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedOwner(o.id)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-200 relative ${
                      isSelected
                        ? 'bg-gold/15 border-gold shadow-floating-gold ring-1 ring-gold'
                        : 'bg-black/30 border-gold/25 hover:border-gold/50 opacity-80'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-xs ${
                        isSelected ? 'bg-gold text-wine-950' : 'bg-wine-950 text-gold-light border border-gold/40'
                      }`}>
                        {o.initials}
                      </div>
                      <div>
                        <div className="text-xs font-serif font-bold text-ivory">
                          {o.name}
                        </div>
                        <div className="text-[10px] text-gold-light font-medium">
                          {o.title}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-ivory/60 mt-1">
                      <Phone className="w-3 h-3 text-gold" />
                      <span>{o.phone}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleAccess} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-gold-light">
                  2. Owner Security Passcode (PIN):
                </label>
                <span className="text-[11px] text-ivory/50 font-mono">
                  Default PIN: <strong className="text-gold-light">1250</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN (e.g. 1250)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#140308] border border-gold/40 text-ivory font-mono text-sm tracking-widest focus:border-gold focus:outline-none"
                />
                <KeyRound className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-sans font-bold text-xs uppercase tracking-wider shadow-floating-gold hover:scale-[1.01] active:scale-95 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Verifying Proprietor Access...</span>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  <span>Enter Owner Executive Dashboard →</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Analytics Summary Box */}
          <div className="pt-4 border-t border-gold/20">
            <p className="text-[11px] font-mono uppercase tracking-wider text-gold-light mb-2.5">
              Available in Your Dashboard:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl bg-black/30 border border-gold/20">
                <TrendingUp className="w-3.5 h-3.5 text-gold mx-auto mb-1" />
                <span className="text-[10px] text-ivory/80 block">Sales Analytics</span>
              </div>
              <div className="p-2 rounded-xl bg-black/30 border border-gold/20">
                <Boxes className="w-3.5 h-3.5 text-gold mx-auto mb-1" />
                <span className="text-[10px] text-ivory/80 block">Live Stock Health</span>
              </div>
              <div className="p-2 rounded-xl bg-black/30 border border-gold/20">
                <Users className="w-3.5 h-3.5 text-gold mx-auto mb-1" />
                <span className="text-[10px] text-ivory/80 block">Wholesale Jewellers</span>
              </div>
              <div className="p-2 rounded-xl bg-black/30 border border-gold/20">
                <Store className="w-3.5 h-3.5 text-gold mx-auto mb-1" />
                <span className="text-[10px] text-ivory/80 block">Catalog &amp; Pricing</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-gold hover:underline">
              ← Return to Customer Storefront
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
