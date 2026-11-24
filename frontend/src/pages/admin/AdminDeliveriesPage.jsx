import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Phone, User, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/deliveries');
      if (res.data.success) {
        setDeliveries(res.data.deliveries || []);
      }
    } catch (err) {
      console.warn('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateDelivery = async (deliveryId, newStatus) => {
    try {
      const res = await api.put(`/admin/deliveries/${deliveryId}`, {
        delivery_status: newStatus
      });
      if (res.data.success) {
        fetchDeliveries();
      }
    } catch (err) {
      alert('Error updating delivery status.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>Local Kalaburagi Delivery Dispatch</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Doorstep parcel routing for PIN codes 585101 to 585105
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading deliveries...</div>
        ) : deliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer & Phone</th>
                  <th className="py-3.5 px-4">PIN Code & Area</th>
                  <th className="py-3.5 px-4">Amount (₹)</th>
                  <th className="py-3.5 px-4">Delivery Status</th>
                  <th className="py-3.5 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-purple-950">{d.order_number}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-stone-900">{d.customer_name}</p>
                      <p className="text-[11px] text-stone-500">{d.customer_phone}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-stone-800">
                      PIN: {d.pin_code}
                    </td>
                    <td className="py-3 px-4 font-black text-stone-900">
                      ₹{parseFloat(d.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        d.delivery_status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.delivery_status === 'out_for_delivery'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {d.delivery_status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={d.delivery_status}
                        onChange={(e) => handleUpdateDelivery(d.id, e.target.value)}
                        className="py-1 px-2 rounded-lg border border-stone-300 font-bold text-xs bg-white"
                      >
                        <option value="assigned">Assigned</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-stone-500">
            No active local delivery dispatches currently scheduled.
          </div>
        )}
      </div>
    </div>
  );
}
