import React, { useState, useEffect } from 'react';
import { Users, Search, Store, Check, X, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (accountTypeFilter) params.account_type = accountTypeFilter;
      if (verificationFilter) params.verification_status = verificationFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/admin/customers', { params });
      if (res.data.success) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      console.warn('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [accountTypeFilter, verificationFilter]);

  const handleVerify = async (userId, status) => {
    try {
      const res = await api.put(`/admin/customers/${userId}/verify`, {
        verification_status: status,
        admin_notes: `Processed by Admin on ${new Date().toLocaleDateString()}`
      });
      if (res.data.success) {
        fetchCustomers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update verification status.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-950" />
            <span>Customer & Wholesale Buyer Verification</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Approve or reject wholesale jewel shop applications to prevent retail exploitation
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchCustomers();
          }}
          className="relative w-full sm:w-96 flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, phone, shop..."
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
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
          >
            <option value="">All Account Types</option>
            <option value="retail">Retail Only</option>
            <option value="wholesale">Wholesale Only</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
          >
            <option value="">All Verification States</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading customers...</div>
        ) : customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Account Type</th>
                  <th className="py-3.5 px-4">Shop Name / GST</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4 font-bold text-stone-900">{c.full_name}</td>
                    <td className="py-3 px-4">
                      <p className="text-stone-800 font-medium">{c.phone}</p>
                      <p className="text-stone-500 text-[10px]">{c.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        c.account_type === 'wholesale' ? 'bg-purple-100 text-purple-900' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {c.account_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.shop_name ? (
                        <div>
                          <p className="font-bold text-stone-800">{c.shop_name}</p>
                          {c.gst_number && <p className="text-[10px] text-stone-500 font-mono">GST: {c.gst_number}</p>}
                        </div>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.account_type === 'wholesale' ? (
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          c.verification_status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.verification_status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {c.verification_status ? c.verification_status.toUpperCase() : 'PENDING'}
                        </span>
                      ) : (
                        <span className="text-stone-400">N/A (Retail)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-800">
                      {c.total_orders} (₹{parseFloat(c.total_spent || 0).toFixed(2)})
                    </td>
                    <td className="py-3 px-4 text-right">
                      {c.account_type === 'wholesale' && (
                        <div className="flex items-center justify-end gap-1.5">
                          {c.verification_status !== 'approved' && (
                            <button
                              onClick={() => handleVerify(c.id, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition"
                            >
                              Approve
                            </button>
                          )}
                          {c.verification_status !== 'rejected' && (
                            <button
                              onClick={() => handleVerify(c.id, 'rejected')}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-stone-500">
            No customer accounts registered yet.
          </div>
        )}
      </div>
    </div>
  );
}
