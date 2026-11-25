import React, { useState, useEffect } from 'react';
import { Truck, Edit, X } from 'lucide-react';
import api from '../../services/api';

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [agentForm, setAgentForm] = useState({
    delivery_agent_name: '',
    delivery_agent_phone: '',
    delivery_status: 'assigned',
    tracking_notes: ''
  });

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
      alert(err.response?.data?.message || 'Error updating delivery status.');
    }
  };

  const openAgentModal = (d) => {
    setEditingDelivery(d);
    setAgentForm({
      delivery_agent_name: d.delivery_agent_name || '',
      delivery_agent_phone: d.delivery_agent_phone || '',
      delivery_status: d.delivery_status || 'assigned',
      tracking_notes: d.tracking_notes || ''
    });
  };

  const handleSaveAgent = async (e) => {
    e.preventDefault();
    if (!editingDelivery) return;
    try {
      const res = await api.put(`/admin/deliveries/${editingDelivery.id}`, agentForm);
      if (res.data.success) {
        setEditingDelivery(null);
        fetchDeliveries();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update delivery dispatch details.');
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
            Doorstep parcel routing and agent assignment for PIN codes 585101 to 585105
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
                  <th className="py-3.5 px-4">Customer &amp; Phone</th>
                  <th className="py-3.5 px-4">PIN Code</th>
                  <th className="py-3.5 px-4">Agent Assigned</th>
                  <th className="py-3.5 px-4">Amount (₹)</th>
                  <th className="py-3.5 px-4">Delivery Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
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
                    <td className="py-3 px-4 text-stone-700">
                      {d.delivery_agent_name ? (
                        <div>
                          <p className="font-bold">{d.delivery_agent_name}</p>
                          <p className="text-[10px] text-stone-500">{d.delivery_agent_phone}</p>
                        </div>
                      ) : (
                        <span className="text-stone-400">Unassigned</span>
                      )}
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
                        {String(d.delivery_status || 'assigned').replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <select
                        value={d.delivery_status}
                        onChange={(e) => handleUpdateDelivery(d.id, e.target.value)}
                        className="py-1 px-2 rounded-lg border border-stone-300 font-bold text-xs text-stone-900 bg-white"
                      >
                        <option value="assigned">Assigned</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="failed">Failed</option>
                      </select>
                      <button
                        onClick={() => openAgentModal(d)}
                        className="p-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50"
                        title="Assign Delivery Agent"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
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

      {editingDelivery && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white text-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif-luxury font-bold text-base text-purple-950">
                Dispatch Details · {editingDelivery.order_number}
              </h3>
              <button onClick={() => setEditingDelivery(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAgent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Delivery Agent Name</label>
                <input
                  type="text"
                  value={agentForm.delivery_agent_name}
                  onChange={(e) => setAgentForm({ ...agentForm, delivery_agent_name: e.target.value })}
                  placeholder="e.g. Suresh (Kalaburagi Local)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Agent Phone</label>
                <input
                  type="text"
                  value={agentForm.delivery_agent_phone}
                  onChange={(e) => setAgentForm({ ...agentForm, delivery_agent_phone: e.target.value })}
                  placeholder="+91 98800 00000"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tracking Notes</label>
                <textarea
                  rows={2}
                  value={agentForm.tracking_notes}
                  onChange={(e) => setAgentForm({ ...agentForm, tracking_notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingDelivery(null)} className="px-4 py-2 border rounded-xl font-bold text-stone-600">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-900 text-emerald-200 rounded-xl font-bold">
                  Save Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
