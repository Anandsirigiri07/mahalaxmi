import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  Trash2,
  Plus,
  RotateCcw,
  X,
  LogOut,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AccountPage() {
  const { user, logout, refreshUser, isSupabaseActive } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'addresses', 'profile'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState('');

  // Return modal
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Address Management
  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [newAddress, setNewAddress] = useState({
    label: 'Shop',
    recipient_name: user?.full_name || '',
    phone: user?.phone || '',
    address_line1: '',
    landmark: '',
    city: 'Kalaburagi',
    pin_code: '585101',
    is_default: true
  });

  // Profile Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [userPhone, setUserPhone] = useState(user?.phone || '');
  const [shopName, setShopName] = useState(user?.shop_name || user?.business_name || '');
  const [gstNumber, setGstNumber] = useState(user?.gst_number || user?.gstin || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setUserPhone(user.phone || '');
      setShopName(user.shop_name || user.business_name || '');
      setGstNumber(user.gst_number || user.gstin || '');
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
    fetchAddresses();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (e) {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/auth/addresses');
      if (res.data.success) {
        setAddresses(res.data.addresses || []);
      }
    } catch (e) {}
  };

  const handleCancelOrder = async (orderId, orderNumber) => {
    if (!window.confirm(`Cancel order #${orderNumber}? Reserved stock will be released.`)) return;
    setOrderFeedback('');
    try {
      const res = await api.post(`/orders/${orderId}/cancel`, { reason: 'Cancelled by customer' });
      if (res.data.success) {
        setOrderFeedback(res.data.message);
        fetchOrders();
      }
    } catch (err) {
      setOrderFeedback(err.response?.data?.message || 'Unable to cancel order.');
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!returnOrder || !returnReason.trim()) return;
    setSubmittingReturn(true);
    try {
      const res = await api.post(`/orders/${returnOrder.id}/return`, { reason: returnReason.trim() });
      if (res.data.success) {
        setOrderFeedback(res.data.message);
        setReturnOrder(null);
        setReturnReason('');
        fetchOrders();
      }
    } catch (err) {
      setOrderFeedback(err.response?.data?.message || 'Unable to submit return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError('');
    try {
      const res = await api.post('/auth/addresses', newAddress);
      if (res.data.success) {
        setShowAddAddress(false);
        setNewAddress({
          label: 'Shop',
          recipient_name: user?.full_name || '',
          phone: user?.phone || '',
          address_line1: '',
          landmark: '',
          city: 'Kalaburagi',
          pin_code: '585101',
          is_default: false
        });
        fetchAddresses();
      }
    } catch (err) {
      setAddressError(err.response?.data?.message || 'Failed to add address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/auth/addresses/${id}`);
      fetchAddresses();
    } catch (err) {}
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMsg('');
    try {
      const res = await api.put('/auth/profile', {
        full_name: fullName,
        phone: userPhone,
        shop_name: shopName,
        gst_number: gstNumber
      });
      if (res.data.success) {
        await refreshUser();
        setProfileMsg('Profile updated successfully.');
      }
    } catch (err) {
      setProfileMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#280812] text-ivory pb-32 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* User Profile Card */}
        <div className="rounded-3xl bg-[#37141e]/95 border border-gold/40 p-5 sm:p-6 shadow-deep-3d flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-wine-950 border-2 border-gold/60 text-gold-light flex items-center justify-center font-serif text-2xl font-bold shadow-floating-gold shrink-0">
              {user?.full_name?.charAt(0) || 'M'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-ivory gold-text-glow">
                  {user?.full_name || 'Valued Jeweller'}
                </h1>
                <span className="font-mono text-[10px] bg-gold/20 text-gold-light border border-gold/40 px-2 py-0.5 rounded-full uppercase font-bold">
                  {user?.role === 'admin' ? 'Store Admin' : (user?.account_type || 'Retail')}
                </span>
                {user?.account_type === 'wholesale' && user?.verification_status && (
                  <span className="font-mono text-[10px] bg-black/40 border border-gold/30 text-gold-light px-2 py-0.5 rounded-full uppercase">
                    Wholesale: {user.verification_status}
                  </span>
                )}
              </div>
              <p className="text-xs text-ivory/70 mt-0.5">{user?.email}</p>
              {user?.phone && <p className="text-xs font-mono text-gold/80">{user.phone}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isSupabaseActive && (
              <span className="px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-[10px] text-gold-light font-medium">
                Supabase Sync
              </span>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-wine-950/80 hover:bg-wine-900 border border-gold/40 text-gold-light text-xs font-bold transition flex items-center space-x-1.5 active:scale-95 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-gold/20 pb-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 shadow-md'
                : 'text-ivory/70 hover:text-gold-light'
            }`}
          >
            Orders &amp; Reservations
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 shadow-md'
                : 'text-ivory/70 hover:text-gold-light'
            }`}
          >
            Saved Addresses ({addresses.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-gold to-gold-light text-wine-950 shadow-md'
                : 'text-ivory/70 hover:text-gold-light'
            }`}
          >
            {user?.account_type === 'wholesale' ? 'Wholesale Profile' : 'Account Profile'}
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orderFeedback && (
              <div className="p-3 rounded-xl bg-gold/15 border border-gold/40 text-gold-light text-xs font-semibold">
                {orderFeedback}
              </div>
            )}

            {loadingOrders ? (
              <div className="text-center py-10 text-xs text-ivory/60">Loading your orders...</div>
            ) : orders.length > 0 ? (
              orders.map((o) => {
                const status = o.order_status || o.status || 'pending';
                const canCancel = ['pending', 'confirmed', 'processing'].includes(status);
                const canReturn = status === 'delivered';

                return (
                  <div
                    key={o.id}
                    className="rounded-2xl bg-[#32101a]/95 border border-gold/30 p-4 sm:p-5 shadow-floating-card space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gold/20">
                      <div>
                        <span className="font-mono text-xs font-bold text-gold-light">
                          Order #{o.order_number}
                        </span>
                        <span className="text-[11px] text-ivory/50 block">
                          Placed on {new Date(o.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-black/40 border border-gold/30 text-[10px] font-bold text-ivory uppercase">
                          Order: {status.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-gold/20 border border-gold/30 text-[10px] font-bold text-gold-light uppercase">
                          Payment: {String(o.payment_status || 'pending').replace(/_/g, ' ')}
                        </span>
                        <span className="font-serif font-bold text-gold text-base">
                          ₹{Number(o.total_amount).toFixed(0)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {o.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center space-x-2">
                            <img
                              src={it.image_url || '/assets/patli-kada-floral.png'}
                              alt=""
                              className="w-10 h-10 rounded-lg object-contain bg-black/40 border border-gold/20 p-1"
                            />
                            <div>
                              <div className="font-bold text-ivory">{it.product_name || it.name_en}</div>
                              <div className="text-[11px] text-ivory/60">
                                SKU: {it.sku} · Qty: {it.quantity}
                              </div>
                            </div>
                          </div>
                          <span className="font-mono text-gold font-semibold">
                            ₹{Number(it.subtotal ?? it.total_price ?? (it.unit_price || 0) * it.quantity).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gold/15 flex flex-wrap items-center justify-between gap-2 text-xs text-ivory/60">
                      <span>
                        Payment: {o.payment_method === 'upi_qr' ? 'UPI QR Code' : 'Cash on Delivery'}
                        {o.transaction_reference ? ` · UTR: ${o.transaction_reference}` : ''}
                      </span>

                      <div className="flex items-center space-x-2">
                        {canCancel && (
                          <button
                            onClick={() => handleCancelOrder(o.id, o.order_number)}
                            className="px-3 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 text-[11px] font-bold transition"
                          >
                            Cancel Order
                          </button>
                        )}
                        {canReturn && (
                          <button
                            onClick={() => setReturnOrder(o)}
                            className="px-3 py-1 rounded-lg bg-black/40 hover:bg-black/60 border border-gold/40 text-gold-light text-[11px] font-bold flex items-center space-x-1 transition"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Request Return</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 rounded-2xl bg-[#37141e]/50 border border-gold/20 p-6">
                <Package className="w-10 h-10 text-gold mx-auto mb-2" />
                <p className="text-xs text-ivory/70">No jewellery orders placed yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-ivory">Delivery Addresses</h3>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="px-4 py-2 rounded-xl bg-gold text-wine-950 font-bold text-xs flex items-center space-x-1 shadow-floating-gold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="rounded-2xl bg-[#32101a]/95 border border-gold/40 p-5 space-y-3 text-xs">
                {addressError && (
                  <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{addressError}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-ivory"
                  >
                    <option value="Shop">Shop</option>
                    <option value="Home">Home</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Recipient Name"
                    value={newAddress.recipient_name}
                    onChange={(e) => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
                    className="bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-ivory"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-ivory"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Address Line 1 (Shop No., Complex, Street)"
                  value={newAddress.address_line1}
                  onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                  className="w-full bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-ivory"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    className="bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-ivory"
                  />
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-ivory"
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="PIN (585101)"
                    value={newAddress.pin_code}
                    onChange={(e) => setNewAddress({ ...newAddress, pin_code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-ivory font-mono"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowAddAddress(false)} className="px-4 py-2 rounded-xl bg-black/40 text-ivory/70">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-gold text-wine-950 font-bold">
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map(a => (
                  <div key={a.id} className="rounded-2xl bg-[#32101a]/95 border border-gold/30 p-4 flex justify-between items-start gap-3">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-gold" />
                        <span className="font-bold text-gold-light uppercase">{a.label}</span>
                        {a.is_default && (
                          <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[10px]">Default</span>
                        )}
                      </div>
                      <p className="font-bold text-ivory">{a.recipient_name} · {a.phone}</p>
                      <p className="text-ivory/75">{a.address_line1}</p>
                      <p className="text-ivory/60 font-mono">{a.city} - {a.pin_code}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(a.id)}
                      className="text-ivory/50 hover:text-red-400 p-1 transition"
                      aria-label="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-2xl bg-[#37141e]/50 border border-gold/20 p-6 text-xs text-ivory/70">
                No saved addresses yet. Add your Kalaburagi shop or home address for faster checkout.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="rounded-2xl bg-[#32101a]/95 border border-gold/30 p-5 space-y-4">
            <h3 className="font-serif text-lg font-bold text-ivory">
              {user?.account_type === 'wholesale' ? 'Wholesale Jeweller Details' : 'Personal Account Details'}
            </h3>

            {profileMsg && (
              <div className="p-3 rounded-xl bg-gold/15 border border-gold/40 text-gold-light text-xs font-semibold">
                {profileMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-ivory/70 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-xs sm:text-sm text-ivory"
                />
              </div>

              <div>
                <label className="text-[11px] text-ivory/70 uppercase tracking-wider block mb-1">WhatsApp Phone</label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-xs sm:text-sm text-ivory"
                />
              </div>

              {user?.account_type === 'wholesale' && (
                <>
                  <div>
                    <label className="text-[11px] text-ivory/70 uppercase tracking-wider block mb-1">Store / Firm Name</label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-xs sm:text-sm text-ivory"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-ivory/70 uppercase tracking-wider block mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      className="w-full bg-[#1D050D] border border-gold/35 rounded-xl px-3 py-2 text-xs sm:text-sm text-ivory font-mono"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="px-6 py-2.5 rounded-xl bg-gold text-wine-950 font-bold text-xs uppercase tracking-wider shadow-floating-gold active:scale-95 transition"
            >
              {updatingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>

      {/* Return Request Modal */}
      {returnOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#280812] border border-gold/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-deep-3d">
            <div className="flex items-center justify-between border-b border-gold/20 pb-3">
              <h3 className="font-serif text-lg font-bold text-gold-light">
                Request Return · #{returnOrder.order_number}
              </h3>
              <button onClick={() => setReturnOrder(null)} className="text-ivory/60 hover:text-gold">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
              <div>
                <label className="block text-ivory/80 font-semibold mb-1.5">Reason for Return *</label>
                <textarea
                  required
                  rows={3}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Describe the issue (e.g., damaged piece, wrong size)..."
                  className="w-full bg-[#1D050D] border border-gold/40 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setReturnOrder(null)} className="px-4 py-2 rounded-xl bg-black/40 text-ivory/70">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="px-5 py-2 rounded-xl bg-gold text-wine-950 font-bold"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
