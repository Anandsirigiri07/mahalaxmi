import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  Sparkles,
  Plus,
  Minus,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, switchCartMode } = useCart();
  const { isWholesaleApproved, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [pincode, setPincode] = useState('585101');
  const [pinInfo, setPinInfo] = useState(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [cartNotice, setCartNotice] = useState('');

  const subtotal = parseFloat(cart.subtotal || 0);
  const freeThreshold = parseFloat(pinInfo?.free_delivery_threshold ?? 1500);
  const baseFee = pinInfo?.is_serviceable ? parseFloat(pinInfo.delivery_fee ?? 40) : 40;
  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryFee = subtotal === 0 ? 0 : (isFreeDelivery ? 0 : baseFee);
  const grandTotal = subtotal + deliveryFee;

  const verifyPincode = async (pinToCheck) => {
    const clean = String(pinToCheck || '').trim();
    if (clean.length !== 6) {
      setPinInfo({ is_serviceable: false, message: 'Please enter a valid 6-digit Kalaburagi PIN code.' });
      return;
    }
    setCheckingPin(true);
    try {
      const res = await api.get(`/settings/pincodes/check/${clean}`);
      setPinInfo(res.data);
    } catch (err) {
      const fallbackFees = { '585101': 30, '585102': 40, '585103': 40, '585104': 50, '585105': 40 };
      if (fallbackFees[clean] !== undefined) {
        setPinInfo({
          success: true,
          is_serviceable: true,
          locality: 'Kalaburagi Local Hub',
          delivery_fee: fallbackFees[clean],
          free_delivery_threshold: 1500
        });
      } else {
        setPinInfo({
          success: false,
          is_serviceable: false,
          message: `PIN code ${clean} is outside our direct local Kalaburagi delivery zone.`
        });
      }
    } finally {
      setCheckingPin(false);
    }
  };

  useEffect(() => {
    verifyPincode('585101');
  }, []);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    verifyPincode(pincode);
  };

  const handleModeSwitch = async (mode) => {
    setCartNotice('');
    const res = await switchCartMode(mode);
    if (!res.success && res.message) {
      setCartNotice(res.message);
    }
  };

  const handleUpdateQty = async (itemId, nextQty) => {
    setCartNotice('');
    const res = await updateQuantity(itemId, nextQty);
    if (res && !res.success && res.message) {
      setCartNotice(res.message);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#280812] text-ivory flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-wine-900 border border-gold/40 flex items-center justify-center mb-4 shadow-floating-gold">
          <ShoppingBag className="w-10 h-10 text-gold" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ivory gold-text-glow">
          Your Jewellery Vitrine is Empty
        </h2>
        <p className="text-xs sm:text-sm text-ivory/70 max-w-sm mt-2 mb-6">
          Explore our handcrafted royal antique patli bangles, temple sets, and wholesale lots.
        </p>
        <Link
          to="/catalogue"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-bold text-xs uppercase tracking-wider shadow-floating-gold active:scale-95 transition"
        >
          Explore Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#280812] text-ivory pb-32 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gold/20">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory gold-text-glow">
              {cart.cart_type === 'wholesale' ? 'Wholesale Bulk Cart' : 'Jewellery Shopping Cart'}
            </h1>
            <p className="text-xs text-ivory/70 mt-0.5">
              {cart.item_count} items in presentation vitrine
            </p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Segmented Cart Switcher */}
        <div className="p-1 rounded-full bg-black/50 border border-gold/30 shadow-inner flex items-center justify-between">
          <button
            onClick={() => handleModeSwitch('retail')}
            className={`flex-1 py-2 rounded-full text-xs font-semibold tracking-wider transition ${
              cart.cart_type === 'retail'
                ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 font-bold shadow-md'
                : 'text-ivory/70 hover:text-gold-light'
            }`}
          >
            Retail Cart ({cart.cart_type === 'retail' ? cart.item_count : 0})
          </button>
          <button
            onClick={() => handleModeSwitch('wholesale')}
            className={`flex-1 py-2 rounded-full text-xs font-semibold tracking-wider transition ${
              cart.cart_type === 'wholesale'
                ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 font-bold shadow-md'
                : 'text-ivory/70 hover:text-gold-light'
            }`}
          >
            Wholesale Cart ({cart.cart_type === 'wholesale' ? cart.item_count : 0} Lots)
          </button>
        </div>

        {cartNotice && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-amber-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{cartNotice}</span>
          </div>
        )}

        {/* Wholesale Tier Banner */}
        <div className="rounded-2xl bg-[#37141e]/90 border border-gold/30 p-3.5 shadow-floating-card flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-gold-light" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold-light font-bold">
                {isWholesaleApproved || isAdmin ? 'Kalaburagi Wholesale Tier Active' : 'Kalaburagi Direct Retail Pricing'}
              </span>
              <span className="text-[10px] text-gold font-bold">
                {isWholesaleApproved || isAdmin ? 'Verified' : 'Standard'}
              </span>
            </div>
            <p className="text-xs text-ivory/75 truncate mt-0.5">
              {isWholesaleApproved || isAdmin
                ? 'Verified wholesale slab pricing enabled with local Kalaburagi dispatch.'
                : 'Free local delivery on orders above ₹' + freeThreshold.toFixed(0) + '.'}
            </p>
          </div>
        </div>

        {/* Cart Item Cards */}
        <div className="space-y-3">
          {cart.items.map((item) => {
            const itemId = item.cart_item_id || item.id;
            const unitPrice = Number(item.unit_price ?? item.price_per_unit ?? 0);
            const lineTotal = Number(item.line_total ?? item.item_total ?? unitPrice * item.quantity);
            const isWholesaleItem = Boolean(item.is_wholesale_pricing ?? item.is_wholesale);
            const moq = Number(item.moq || item.min_order_qty || 1);

            return (
              <div
                key={itemId}
                className="group relative rounded-2xl bg-[#32101a]/95 border border-gold/30 p-3.5 sm:p-4 shadow-floating-card flex gap-3.5 transition hover:border-gold"
              >
                <div className="relative w-24 h-28 rounded-xl bg-black/40 border border-gold/25 shrink-0 overflow-hidden flex items-center justify-center p-1.5">
                  <img
                    src={item.image_url || '/assets/patli-kada-floral.png'}
                    alt={item.name_en || item.name}
                    className="w-full h-full object-contain filter drop-shadow-md select-none"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-wine-950 text-gold-light font-mono text-[9px] font-bold">
                    ×{item.quantity}
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-ivory truncate">
                        {item.name_en || item.name}
                      </h3>
                      <button
                        onClick={() => removeItem(itemId)}
                        className="text-outline hover:text-red-400 p-1 transition"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-ivory/60 mt-0.5">
                      SKU: <span className="text-gold-light font-mono">{item.sku || 'MN-BG'}</span>
                      {isWholesaleItem && ` · MOQ ${moq}`}
                    </p>

                    <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-gold/20 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_6px_#D4AF6A]"></span>
                      <span className="text-[10px] text-gold-light font-semibold uppercase tracking-wider">
                        {isWholesaleItem ? 'Wholesale Lot' : 'Retail Pack'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-2 pt-2 border-t border-gold/20">
                    <div>
                      <div className="font-serif text-lg sm:text-xl font-bold text-gold gold-text-glow">
                        ₹{lineTotal.toFixed(0)}
                      </div>
                      <div className="text-[10px] text-outline">
                        ₹{unitPrice.toFixed(0)} / unit net
                      </div>
                    </div>

                    <div className="flex items-center bg-black/50 border border-gold/30 rounded-lg shadow-inner">
                      <button
                        onClick={() => {
                          if (isWholesaleItem && item.quantity <= moq) {
                            removeItem(itemId);
                          } else {
                            handleUpdateQty(itemId, item.quantity - 1);
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center text-gold-light hover:text-gold active:scale-90 transition font-bold"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono text-xs font-bold text-gold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(itemId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-gold-light hover:text-gold active:scale-90 transition font-bold"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery PIN Code Card */}
        <div className="rounded-2xl bg-[#37141e]/90 border border-gold/30 p-4 shadow-floating-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gold">
              <Truck className="w-4 h-4 text-gold-light" />
              <h3 className="text-sm font-bold text-ivory">Delivery PIN Code</h3>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-gold-light">
              Kalaburagi Hub
            </span>
          </div>

          <form onSubmit={handlePincodeCheck} className="flex items-center space-x-2">
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="flex-1 bg-black/50 border border-gold/35 text-ivory px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={checkingPin}
              className="px-4 py-2 rounded-xl bg-gold text-wine-950 font-bold text-xs uppercase hover:bg-gold-light transition"
            >
              {checkingPin ? 'Checking...' : 'Check'}
            </button>
          </form>

          {pinInfo && (
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-black/30 border border-gold/20 text-xs">
              {pinInfo.is_serviceable ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_#D4AF6A] shrink-0"></span>
                  <span className="text-ivory/80">
                    {pinInfo.locality} (<span className="font-bold text-gold-light">{pincode}</span>) ·{' '}
                    {isFreeDelivery ? 'FREE Delivery' : `₹${baseFee} Delivery`}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                  <span className="text-amber-300">{pinInfo.message}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Order Summary & Proceed */}
        <div className="p-4 rounded-2xl bg-[#21040d]/90 border border-gold/35 shadow-deep-3d space-y-3">
          <div className="flex justify-between text-xs text-ivory/70">
            <span>Subtotal</span>
            <span className="font-mono font-semibold text-ivory">₹{subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-xs text-ivory/70">
            <span>Delivery Fee</span>
            <span className="font-mono font-semibold text-gold-light">
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </span>
          </div>
          <div className="pt-2 border-t border-gold/20 flex justify-between items-baseline">
            <span className="font-serif text-base font-bold text-ivory">Total Amount</span>
            <span className="font-serif text-2xl font-bold text-gold gold-text-glow">
              ₹{grandTotal.toFixed(0)}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout', { state: { pincode } })}
            disabled={pinInfo && !pinInfo.is_serviceable}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-sans font-bold text-xs tracking-wider uppercase shadow-floating-gold active:scale-95 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
