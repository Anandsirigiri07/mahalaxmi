import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Crown, 
  KeyRound, 
  ArrowRight, 
  Lock,
  AlertTriangle,
  CheckCircle2, 
  TrendingUp, 
  Boxes, 
  Users, 
  Store,
  Sparkles,
  Phone,
  LogOut,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function OwnerPortalPage() {
  const { user, isAdmin, ownerLogin, logout, getOwnerStatus } = useAuth();
  const navigate = useNavigate();

  const [ownerInfo, setOwnerInfo] = useState({
    name: 'Manoharsingh P. Rathore',
    title: 'Store Proprietor',
    phone: '+91 94812 42188'
  });
  const [isRegistrationClosed, setIsRegistrationClosed] = useState(true);
  const [pin, setPin] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerAttemptMsg, setRegisterAttemptMsg] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await getOwnerStatus();
        if (res?.success) {
          setIsRegistrationClosed(res.registrationClosed ?? true);
          if (res.owner?.name) {
            setOwnerInfo(prev => ({
              ...prev,
              name: res.owner.name,
              phone: res.owner.phone || prev.phone
            }));
          }
        }
      } catch (err) {
        // Fallback default is locked single owner
        setIsRegistrationClosed(true);
      }
    };
    checkStatus();
  }, [getOwnerStatus]);

  const handleAccess = async (e) => {
    e.preventDefault();
    setError('');
    setRegisterAttemptMsg('');
    setLoading(true);

    try {
      const res = await ownerLogin({ identifier, pin });
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

  const handleRegisterAttempt = () => {
    setRegisterAttemptMsg(
      '⚠️ Registration Locked: The Store Owner account has already been registered and secured. Mahalaxmi Novelties enforces strict Single-Owner governance. No other accounts can register in this portal.'
    );
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
            <span>Single-Owner Executive Gateway</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ivory gold-text-glow tracking-wide">
            Mahalaxmi Novelties
          </h1>
          <p className="text-xs sm:text-sm text-ivory/70 max-w-md mx-auto">
            Proprietor Terminal · Sangam Talkies Complex, S.B. Temple Road, Kalaburagi
          </p>
        </div>

        {/* Security & Registration Lock Status Banner */}
        <div className="bg-[#24060f] border border-gold/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-gold-light" />
            </div>
            <div>
              <span className="font-semibold text-gold-light block">Owner Account Registered &amp; Secured</span>
              <span className="text-[11px] text-ivory/60">Registration is permanently closed to all other members</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
            🔒 LOCKED
          </span>
        </div>

        {/* Case 1: If current logged in user is a regular customer (NOT owner) */}
        {user && !isAdmin && (
          <div className="bg-amber-950/40 border border-amber-500/50 rounded-3xl p-6 text-center space-y-4 shadow-lg backdrop-blur-xl">
            <div className="w-12 h-12 rounded-full bg-amber-950 border border-amber-500/60 text-amber-300 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-amber-200">
                Customer Account Detected
              </h3>
              <p className="text-xs text-ivory/70 max-w-md mx-auto leading-relaxed">
                You are currently signed in as <strong className="text-gold-light">{user.full_name || user.email}</strong>. 
                Owner sales analytics, revenue figures, and store administration are strictly confidential and restricted to the Store Proprietor.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/catalogue"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-sans font-bold text-xs uppercase tracking-wider shadow-floating-gold hover:scale-105 transition flex items-center justify-center space-x-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse &amp; Order Store Items</span>
              </Link>
              <button
                onClick={logout}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-black/40 border border-gold/30 text-gold-light font-sans font-semibold text-xs hover:bg-black/60 transition flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Customer Session</span>
              </button>
            </div>
          </div>
        )}

        {/* Case 2: If current logged in user is already the Owner */}
        {user && isAdmin && (
          <div className="bg-[#280812]/95 border border-gold/50 rounded-3xl p-6 text-center space-y-4 shadow-deep-3d">
            <div className="w-12 h-12 rounded-full bg-wine-950 border border-gold text-gold-light flex items-center justify-center mx-auto shadow-floating-gold">
              <Crown className="w-6 h-6 text-gold" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-gold-light">
                Proprietor Session Active
              </h3>
              <p className="text-xs text-ivory/80">
                Logged in as <strong>{user.full_name}</strong>. Your executive analytics and wholesale controls are ready.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-sans font-bold text-xs uppercase tracking-wider shadow-floating-gold hover:scale-105 transition flex items-center justify-center space-x-2"
              >
                <Crown className="w-4 h-4" />
                <span>Open Owner Executive Dashboard →</span>
              </button>
              <Link
                to="/"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-black/40 border border-gold/30 text-gold-light font-sans font-semibold text-xs hover:bg-black/60 transition flex items-center justify-center space-x-1.5"
              >
                <span>Storefront</span>
              </Link>
            </div>
          </div>
        )}

        {/* Case 3: Owner Login Form (When not logged in) */}
        {!user && (
          <div className="bg-[#280812]/95 border border-gold/40 rounded-3xl p-6 sm:p-8 shadow-deep-3d backdrop-blur-xl space-y-6">
            
            {/* Registered Owner Card */}
            <div className="p-4 rounded-2xl bg-[#17040a] border border-gold/30 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-full bg-wine-950 border border-gold/60 flex items-center justify-center font-serif font-bold text-gold-light text-sm shadow-floating-gold">
                    MR
                  </div>
                  <div>
                    <div className="text-sm font-serif font-bold text-ivory">
                      {ownerInfo.name}
                    </div>
                    <div className="text-[11px] text-gold-light font-medium">
                      Store Proprietor · Exclusive Executive Access
                    </div>
                    <div className="flex items-center space-x-1.5 text-[11px] text-ivory/60 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-gold" />
                      <span>Single Owner Account Locked &amp; Protected</span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold-light text-[10px] font-mono uppercase font-bold">
                  Owner Portal
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs">
                {error}
              </div>
            )}

            {registerAttemptMsg && (
              <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs leading-relaxed">
                {registerAttemptMsg}
              </div>
            )}

            {/* Owner Login Form */}
            <form onSubmit={handleAccess} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gold-light mb-1.5">
                  Owner Email or Registered Phone:
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your registered Owner Email or Phone"
                  className="w-full px-4 py-3 rounded-xl bg-[#140308] border border-gold/40 text-ivory font-mono text-xs focus:border-gold focus:outline-none"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gold-light mb-1.5">
                  Owner Secret Passcode / Password:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter Secret Passcode"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#140308] border border-gold/40 text-ivory font-mono text-sm tracking-widest focus:border-gold focus:outline-none"
                    autoComplete="current-password"
                  />
                  <KeyRound className="w-4 h-4 text-gold absolute left-3.5 top-3.5" />
                </div>
              </div>

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
                    <span>Unlock Owner Executive Dashboard →</span>
                  </>
                )}
              </button>
            </form>

            {/* Registration Disabled Notice & Attempt Button */}
            <div className="pt-4 border-t border-gold/20 flex items-center justify-between text-xs text-ivory/60">
              <span className="text-[11px]">Need to register as another member?</span>
              <button
                type="button"
                onClick={handleRegisterAttempt}
                className="text-[11px] text-gold-light hover:underline font-medium"
              >
                Register as Member (Locked)
              </button>
            </div>

            {/* Quick Analytics Summary Box */}
            <div className="pt-2">
              <p className="text-[11px] font-mono uppercase tracking-wider text-gold-light mb-2.5">
                Executive Owner Privileges:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-black/30 border border-gold/20">
                  <TrendingUp className="w-3.5 h-3.5 text-gold mx-auto mb-1" />
                  <span className="text-[10px] text-ivory/80 block">Total Sales</span>
                </div>
                <div className="p-2 rounded-xl bg-black/30 border border-gold/20">
                  <Boxes className="w-3.5 h-3.5 text-gold mx-auto mb-1" />
                  <span className="text-[10px] text-ivory/80 block">Stock Health</span>
                </div>
                <div className="p-2 rounded-xl bg-black/30 border border-gold/20">
                  <Users className="w-3.5 h-3.5 text-gold mx-auto mb-1" />
                  <span className="text-[10px] text-ivory/80 block">Wholesale Approvals</span>
                </div>
                <div className="p-2 rounded-xl bg-black/30 border border-gold/20">
                  <Store className="w-3.5 h-3.5 text-gold mx-auto mb-1" />
                  <span className="text-[10px] text-ivory/80 block">Dispatch Control</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link to="/catalogue" className="text-xs text-gold hover:underline">
                ← Return to Novelty Storefront (Browse Items &amp; Orders)
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}