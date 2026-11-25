import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  QrCode,
  Truck,
  Check,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialPin = location.state?.pincode || '585101';

  const [paymentMethod, setPaymentMethod] = useState('upi_qr');
  const [upiUtr, setUpiUtr] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [storeSettings, setStoreSettings] = useState({
    upi_id: '9481242188@okbizaxis',
    upi_name: 'Mahalaxmi Novelties',
    upi_qr_image: '/uploads/default-upi-qr.svg',
    free_delivery_threshold: '1500'
  });
  const [pinCheck, setPinCheck] = useState({
    is_serviceable: true,
    delivery_fee: initialPin === '585101' ? 30 : initialPin === '585104' ? 50 : 40,
    min_order_amount: 200,
    locality: 'Kalaburagi'
  });
  const [address, setAddress] = useState({
    recipient_name: user?.full_name || '',
    phone: user?.phone || '',
    address_line1: '',
    city: 'Kalaburagi',
    state: 'Karnataka',
    pin_code: initialPin,
    landmark: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!orderCompleted && (!cart.items || cart.items.length === 0)) {
      navigate('/cart', { replace: true });
    }
  }, [cart.items, orderCompleted, navigate]);

  useEffect(() => {
    const loadCheckoutMeta = async () => {
      try {
        const [settingsRes, addrRes] = await Promise.all([
          api.get('/settings'),
          api.get('/auth/addresses').catch(() => ({ data: { addresses: [] } }))
        ]);
        if (settingsRes.data?.success && settingsRes.data.settings) {
          setStoreSettings(prev => ({ ...prev, ...settingsRes.data.settings }));
        }
        const addrs = addrRes.data?.addresses || [];
        setSavedAddresses(addrs);
        const def = addrs.find(a => a.is_default) || addrs[0];
        if (def) {
          setAddress({
            recipient_name: def.recipient_name || user?.full_name || '',
            phone: def.phone || user?.phone || '',
            address_line1: def.address_line1 || '',
            city: def.city || 'Kalaburagi',
            state: def.state || 'Karnataka',
            pin_code: def.pin_code || initialPin,
            landmark: def.landmark || ''
          });
        }
      } catch (err) {}
    };
    loadCheckoutMeta();
  }, [user, initialPin]);

  useEffect(() => {
    const clean = String(address.pin_code || '').trim();
    if (clean.length !== 6) return;
    api.get(`/settings/pincodes/check/${clean}`)
      .then(res => setPinCheck(res.data))
      .catch(() => {});
  }, [address.pin_code]);

  const subtotal = parseFloat(cart.subtotal || 0);
  const freeThreshold = parseFloat(storeSettings.free_delivery_threshold || 1500);
  const pinFee = pinCheck?.is_serviceable ? parseFloat(pinCheck.delivery_fee ?? 40) : 40;
  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryFee = subtotal === 0 ? 0 : (isFreeDelivery ? 0 : pinFee);
  const grandTotal = subtotal + deliveryFee;

  const applySavedAddress = (a) => {
    setAddress({
      recipient_name: a.recipient_name || '',
      phone: a.phone || '',
      address_line1: a.address_line1 || '',
      city: a.city || 'Kalaburagi',
      state: a.state || 'Karnataka',
      pin_code: a.pin_code || '585101',
      landmark: a.landmark || ''
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!address.recipient_name.trim() || !address.phone.trim() || !address.address_line1.trim()) {
      setErrorMsg('Please enter your full name, phone number, and delivery street address.');
      return;
    }

    if (!address.pin_code.trim() || address.pin_code.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit Kalaburagi PIN code (585101 - 585105).');
      return;
    }

    if (pinCheck && pinCheck.is_serviceable === false) {
      setErrorMsg(pinCheck.message || `PIN code ${address.pin_code} is outside our local delivery zone.`);
      return;
    }

    if (paymentMethod === 'upi_qr' && (!upiUtr.trim() || upiUtr.trim().length < 10)) {
      setErrorMsg('Please enter your valid 12-digit UPI Transaction / UTR reference ID after scanning the QR code.');
      return;
    }

    setSubmitting(true);

    const orderPayload = {
      cart_id: cart.id || undefined,
      items: cart.items,
      shipping_address: address,
      payment_method: paymentMethod,
      transaction_reference: paymentMethod === 'upi_qr' ? upiUtr.trim() : null,
      notes: 'Order placed via Mahalaxmi Novelties Web Store'
    };

    try {
      const res = await api.post('/orders', orderPayload);
      if (res.data.success) {
        setOrderCompleted(true);
        await clearCart();
        const createdId = res.data.order?.id || res.data.order_id;
        navigate(`/order-success/${createdId}`, { state: { order: res.data.order } });
        return;
      }
      setErrorMsg(res.data.message || 'Unable to place order.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Please verify your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#280812] text-ivory pb-32 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3 pb-2 border-b border-gold/20">
          <button
            onClick={() => navigate('/cart')}
            className="w-9 h-9 rounded-full bg-wine-900 border border-gold/30 flex items-center justify-center text-gold-light active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-serif text-2xl font-bold text-ivory gold-text-glow">
            Bulk &amp; Retail Checkout
          </h1>
        </div>

        {/* Order Summary Pill */}
        <div className="rounded-2xl bg-[#37141e]/90 border border-gold/30 p-4 shadow-floating-card flex items-center justify-between">
          <div>
            <div className="text-xs text-ivory/60 uppercase tracking-wider">Payable Total</div>
            <div className="font-serif text-2xl font-bold text-gold gold-text-glow">
              ₹{grandTotal.toFixed(0)}
            </div>
            <div className="text-[11px] text-ivory/60">
              Subtotal ₹{subtotal.toFixed(0)} · Delivery {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </div>
          </div>
          <span className="font-mono text-xs bg-gold/20 text-gold-light px-3 py-1 rounded-full border border-gold/30 font-bold uppercase">
            {cart.cart_type} Order · {cart.item_count} items
          </span>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          {/* Saved Addresses Selector */}
          {savedAddresses.length > 0 && (
            <div className="rounded-2xl bg-[#32101a]/90 border border-gold/30 p-4 space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider text-gold-light font-bold">
                Saved Kalaburagi Addresses
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {savedAddresses.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => applySavedAddress(a)}
                    className="px-3 py-2 rounded-xl bg-black/40 border border-gold/30 hover:border-gold text-left text-xs shrink-0 max-w-[220px]"
                  >
                    <div className="font-bold text-gold-light">{a.label || 'Saved'} · {a.pin_code}</div>
                    <div className="text-ivory/70 truncate">{a.address_line1}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1. Delivery Address Card */}
          <div className="rounded-2xl bg-[#32101a]/90 border border-gold/30 p-4 sm:p-5 shadow-floating-card space-y-3">
            <div className="flex items-center space-x-2 text-gold-light">
              <Truck className="w-4 h-4 text-gold" />
              <h3 className="font-serif text-base font-bold text-ivory">Delivery Address</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-ivory/70 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.recipient_name}
                  onChange={(e) => setAddress({ ...address, recipient_name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-xs sm:text-sm text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-[11px] text-ivory/70 uppercase tracking-wider block mb-1">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+91 98800 00000"
                  className="w-full bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-xs sm:text-sm text-ivory focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-ivory/70 uppercase tracking-wider block mb-1">Street / Shop Address</label>
              <textarea
                required
                rows={2}
                value={address.address_line1}
                onChange={(e) => setAddress({ ...address, address_line1: e.target.value })}
                placeholder="Shop No., Complex name, Street, Area..."
                className="w-full bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-xs sm:text-sm text-ivory focus:outline-none focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-ivory/70 uppercase tracking-wider block mb-1">City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full bg-[#1D050D] border border-gold/35 rounded-xl px-2.5 py-1.5 text-xs text-ivory"
                />
              </div>
              <div>
                <label className="text-[10px] text-ivory/70 uppercase tracking-wider block mb-1">State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full bg-[#1D050D] border border-gold/35 rounded-xl px-2.5 py-1.5 text-xs text-ivory"
                />
              </div>
              <div>
                <label className="text-[10px] text-ivory/70 uppercase tracking-wider block mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={address.pin_code}
                  onChange={(e) => setAddress({ ...address, pin_code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full bg-[#1D050D] border border-gold/35 rounded-xl px-2.5 py-1.5 text-xs text-ivory font-mono"
                />
              </div>
            </div>

            {pinCheck && (
              <div className={`text-[11px] px-3 py-2 rounded-xl border ${
                pinCheck.is_serviceable
                  ? 'bg-black/30 border-gold/25 text-gold-light'
                  : 'bg-red-950/60 border-red-500/40 text-amber-300'
              }`}>
                {pinCheck.is_serviceable
                  ? `✓ ${pinCheck.locality || 'Kalaburagi Delivery Zone'} · ${isFreeDelivery ? 'FREE Delivery' : `₹${pinFee} Delivery`}`
                  : pinCheck.message}
              </div>
            )}
          </div>

          {/* 2. Payment Selection */}
          <div className="rounded-2xl bg-[#32101a]/90 border border-gold/30 p-4 sm:p-5 shadow-floating-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-ivory">Payment Method</h3>
              <span className="text-[10px] font-mono text-gold-light uppercase tracking-widest">
                100% Free Zero Gateway Fee
              </span>
            </div>

            {/* Option 1: UPI QR Code */}
            <div
              onClick={() => setPaymentMethod('upi_qr')}
              className={`p-4 rounded-xl border transition cursor-pointer space-y-3 ${
                paymentMethod === 'upi_qr'
                  ? 'bg-[#37141e] border-gold shadow-floating-gold'
                  : 'bg-black/40 border-gold/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'upi_qr' ? 'border-gold bg-gold' : 'border-gold/40'}`}>
                    {paymentMethod === 'upi_qr' && <div className="w-1.5 h-1.5 rounded-full bg-wine-950"></div>}
                  </div>
                  <div>
                    <span className="font-serif text-sm font-bold text-gold-light block">
                      Pay via UPI QR (PhonePe / GPay / Paytm / BHIM)
                    </span>
                    <span className="text-[11px] text-ivory/70">Instant store verification &amp; priority dispatch</span>
                  </div>
                </div>
                <QrCode className="w-5 h-5 text-gold" />
              </div>

              {paymentMethod === 'upi_qr' && (
                <div className="pt-3 border-t border-gold/20 flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-gold/60 max-w-[180px]">
                    <img
                      src={storeSettings.upi_qr_image || '/uploads/default-upi-qr.svg'}
                      alt="Mahalaxmi Novelties Store UPI QR Code"
                      className="w-36 h-36 object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/uploads/default-upi-qr.svg';
                      }}
                    />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="font-bold text-gold-light">UPI ID: {storeSettings.upi_id}</div>
                    <div className="text-ivory/70">Account Name: {storeSettings.upi_name}</div>
                    <div className="font-serif font-bold text-gold text-base pt-1">
                      Exact Amount: ₹{grandTotal.toFixed(0)}
                    </div>
                  </div>

                  <div className="w-full text-left pt-2">
                    <label className="text-[11px] text-gold-light uppercase font-bold tracking-wider block mb-1">
                      Enter 12-Digit UPI Transaction ID / UTR Number *
                    </label>
                    <input
                      type="text"
                      required={paymentMethod === 'upi_qr'}
                      value={upiUtr}
                      onChange={(e) => setUpiUtr(e.target.value)}
                      maxLength={20}
                      placeholder="e.g. 432819876543 (from GPay / PhonePe receipt)"
                      className="w-full bg-[#1D050D] border border-gold rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono tracking-widest text-gold-light focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                    <p className="text-[10px] text-ivory/60 mt-1">
                      Our Kalaburagi store admin verifies this reference immediately upon receipt.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Option 2: Cash on Delivery */}
            <div
              onClick={() => setPaymentMethod('cod')}
              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                paymentMethod === 'cod'
                  ? 'bg-[#37141e] border-gold shadow-floating-gold'
                  : 'bg-black/40 border-gold/20'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-gold bg-gold' : 'border-gold/40'}`}>
                  {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-wine-950"></div>}
                </div>
                <div>
                  <span className="font-serif text-sm font-bold text-ivory block">
                    Cash on Delivery (Local Kalaburagi Delivery Routes)
                  </span>
                  <span className="text-[11px] text-ivory/60">Pay cash upon parcel arrival at doorstep</span>
                </div>
              </div>
              <Truck className="w-4 h-4 text-gold-light" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || (pinCheck && pinCheck.is_serviceable === false)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-sans font-bold text-xs sm:text-sm tracking-wider uppercase shadow-floating-gold active:scale-95 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Confirming Reservation...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm &amp; Place Order (₹{grandTotal.toFixed(0)})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
