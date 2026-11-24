import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Truck, 
  Eye, 
  X,
  CreditCard,
  Phone,
  MapPin
} from 'lucide-react';
import api from '../../services/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/admin/orders', { params });
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.warn('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { order_status: newStatus });
      if (res.data.success) {
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    if (!window.confirm('Confirm that you have verified this customer UPI payment in your store bank account?')) return;
    try {
      const res = await api.put(`/admin/orders/${orderId}/verify-payment`, { status: 'paid', remarks: 'Verified by Admin via Dashboard' });
      if (res.data.success) {
        alert('Payment verified and marked as PAID!');
        fetchOrders();
      }
    } catch (err) {
      alert('Error verifying payment.');
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data.success) {
        setSelectedOrder(res.data.order);
      }
    } catch (err) {
      alert('Failed to load order details.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-950" />
            <span>Order & Payment Management</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            One-click UPI UTR verification, dispatch tracking, and transaction-safe stock deductions
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            placeholder="Search order #, customer, UTR..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
          >
            <option value="">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
          >
            <option value="">All Payments</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer & Phone</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Amount (₹)</th>
                  <th className="py-3.5 px-4">Payment & UTR</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-purple-950 block">{o.order_number}</span>
                      <span className="text-[10px] text-stone-500">{new Date(o.created_at).toLocaleDateString()}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-900 block">{o.customer_name}</span>
                      <span className="text-[11px] text-stone-500">{o.customer_phone}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        o.order_type === 'wholesale' ? 'bg-purple-100 text-purple-900' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {o.order_type.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-black text-stone-900 text-sm">
                      ₹{parseFloat(o.total_amount).toFixed(2)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.payment_status === 'pending_verification'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {o.payment_status}
                        </span>

                        {o.transaction_reference && (
                          <div className="font-mono text-[10px] text-stone-700 block">
                            UTR: <strong>{o.transaction_reference}</strong>
                          </div>
                        )}

                        {o.payment_status === 'pending_verification' && (
                          <button
                            onClick={() => handleVerifyPayment(o.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm transition block"
                          >
                            ✓ Verify UTR
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={o.order_status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="py-1 px-2 rounded-lg border border-stone-300 font-bold text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewOrder(o.id)}
                        className="p-1.5 rounded-lg border hover:bg-stone-50 text-stone-600"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-stone-500">
            No customer orders recorded yet.
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif-luxury font-bold text-base text-purple-950">
                  Order Details: {selectedOrder.order_number}
                </h3>
                <span className="text-[11px] text-stone-500">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl">
              <div>
                <p className="font-bold text-stone-800">Customer Info</p>
                <p className="text-stone-600 mt-1">{selectedOrder.customer_name}</p>
                <p className="text-stone-600">{selectedOrder.customer_phone}</p>
                <p className="text-stone-600">{selectedOrder.customer_email}</p>
              </div>

              <div>
                <p className="font-bold text-stone-800">Delivery Address</p>
                {selectedOrder.shipping_address_json && (
                  <p className="text-stone-600 mt-1">
                    {typeof selectedOrder.shipping_address_json === 'string'
                      ? selectedOrder.shipping_address_json
                      : `${selectedOrder.shipping_address_json.address_line1}, ${selectedOrder.shipping_address_json.locality_name || ''}, Kalaburagi - ${selectedOrder.shipping_address_json.pin_code}`}
                  </p>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="font-bold text-xs text-stone-800 mb-2 uppercase">Order Line Items</p>
              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 text-xs">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-stone-900">{item.product_name}</p>
                      <p className="text-[10px] text-stone-500">SKU: {item.sku} | Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-stone-800">₹{parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-stone-200 pt-3 flex justify-between items-center text-xs sm:text-sm">
              <span className="font-bold text-stone-700">Total Order Amount:</span>
              <span className="text-xl font-black text-purple-950">
                ₹{parseFloat(selectedOrder.total_amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
