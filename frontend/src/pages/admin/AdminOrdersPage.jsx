import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  X,
  RotateCcw
} from 'lucide-react';
import api from '../../services/api';

function formatShippingAddress(raw) {
  if (!raw) return '—';
  if (typeof raw === 'string') return raw;
  const line = raw.address_line1 || raw.street || '';
  const area = raw.locality_name || raw.city || 'Kalaburagi';
  const pin = raw.pin_code || raw.pincode || '';
  const name = raw.recipient_name || raw.name || '';
  return [name, line, area, pin ? `PIN ${pin}` : ''].filter(Boolean).join(', ');
}

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'returns'
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
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

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/returns');
      if (res.data.success) {
        setReturns(res.data.returns || []);
      }
    } catch (err) {
      console.warn('Error loading returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else {
      fetchReturns();
    }
  }, [activeTab, statusFilter, paymentFilter]);

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

  const handleVerifyPayment = async (orderId, status = 'paid') => {
    const confirmText = status === 'paid'
      ? 'Confirm that you have verified this customer UPI payment in your store bank account?'
      : 'Mark this payment as FAILED / rejected?';
    if (!window.confirm(confirmText)) return;
    try {
      const res = await api.put(`/admin/orders/${orderId}/verify-payment`, {
        status,
        remarks: status === 'paid' ? 'Verified by Admin via Dashboard' : 'Rejected by Admin'
      });
      if (res.data.success) {
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating payment.');
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

  const handleReturnStatus = async (returnId, status) => {
    try {
      const res = await api.put(`/admin/returns/${returnId}`, { status });
      if (res.data.success) {
        fetchReturns();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update return request.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-950" />
            <span>Order &amp; Payment Management</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            One-click UPI UTR verification, dispatch tracking, returns, and transaction-safe stock deductions
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'orders' ? 'bg-emerald-900 text-emerald-200 shadow' : 'text-stone-600'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              activeTab === 'returns' ? 'bg-emerald-900 text-emerald-200 shadow' : 'text-stone-600'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Return Requests</span>
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <>
          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchOrders();
              }}
              className="relative w-full sm:w-96 flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search order #, customer, UTR..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              </div>
              <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-900 text-emerald-200 text-xs font-bold">
                Search
              </button>
            </form>

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
                <option value="return_requested">Return Requested</option>
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
                <option value="failed">Failed</option>
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
                      <th className="py-3.5 px-4">Order ID &amp; Date</th>
                      <th className="py-3.5 px-4">Customer &amp; Phone</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Amount (₹)</th>
                      <th className="py-3.5 px-4">Payment &amp; UTR</th>
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
                            {String(o.order_type || 'retail').toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-black text-stone-900 text-sm">
                          ₹{parseFloat(o.total_amount).toFixed(2)}
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-stone-500 uppercase">
                                {o.payment_method === 'upi_qr' ? 'UPI' : 'COD'}
                              </span>
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                o.payment_status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.payment_status === 'pending_verification'
                                    ? 'bg-amber-100 text-amber-900'
                                    : o.payment_status === 'failed'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-stone-100 text-stone-700'
                              }`}>
                                {o.payment_status}
                              </span>
                            </div>

                            {o.transaction_reference && (
                              <div className="font-mono text-[10px] text-stone-700 block">
                                UTR: <strong>{o.transaction_reference}</strong>
                              </div>
                            )}

                            {o.payment_status === 'pending_verification' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleVerifyPayment(o.id, 'paid')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm transition"
                                >
                                  ✓ Verify UTR
                                </button>
                                <button
                                  onClick={() => handleVerifyPayment(o.id, 'failed')}
                                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm transition"
                                >
                                  ✗ Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={o.order_status}
                            disabled={updatingId === o.id}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className="py-1 px-2 rounded-lg border border-stone-300 font-bold text-xs text-stone-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
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
        </>
      ) : (
        /* Returns Tab */
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-stone-500">Loading return requests...</div>
          ) : returns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Reason</th>
                    <th className="py-3.5 px-4">Refund (₹)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {returns.map((r) => (
                    <tr key={r.id} className="hover:bg-amber-50/30">
                      <td className="py-3 px-4 font-mono font-bold text-purple-950">{r.order_number}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-stone-900">{r.customer_name}</p>
                        <p className="text-[10px] text-stone-500">{r.customer_phone}</p>
                      </td>
                      <td className="py-3 px-4 text-stone-700 max-w-xs">{r.reason}</td>
                      <td className="py-3 px-4 font-bold text-stone-900">₹{parseFloat(r.refund_amount || r.total_amount || 0).toFixed(2)}</td>
                      <td className="py-3 px-4 font-bold uppercase text-[10px] text-stone-800">{r.status}</td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={r.status}
                          onChange={(e) => handleReturnStatus(r.id, e.target.value)}
                          className="py-1 px-2 rounded-lg border border-stone-300 font-bold text-xs text-stone-900 bg-white"
                        >
                          <option value="requested">Requested</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-stone-500">
              No return requests submitted yet.
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white text-stone-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl">
              <div>
                <p className="font-bold text-stone-800">Customer Info</p>
                <p className="text-stone-600 mt-1">{selectedOrder.customer_name}</p>
                <p className="text-stone-600">{selectedOrder.customer_phone}</p>
                <p className="text-stone-600">{selectedOrder.customer_email}</p>
              </div>

              <div>
                <p className="font-bold text-stone-800">Delivery Address</p>
                <p className="text-stone-600 mt-1">
                  {formatShippingAddress(selectedOrder.shipping_address_json)}
                </p>
              </div>
            </div>

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
