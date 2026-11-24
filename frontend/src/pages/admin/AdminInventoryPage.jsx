import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  History, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  X,
  FileText
} from 'lucide-react';
import api from '../../services/api';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({ in_stock: 0, low_stock: 0, out_of_stock: 0, total_items: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Stock Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustAction, setAdjustAction] = useState('add'); // 'add', 'deduct', 'set'
  const [adjustQty, setAdjustQty] = useState(10);
  const [thresholdInput, setThresholdInput] = useState(5);
  const [adjustReason, setAdjustReason] = useState('');
  const [savingAdjust, setSavingAdjust] = useState(false);

  // Audit Logs Modal
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/inventory', { params });
      if (res.data.success) {
        setInventory(res.data.inventory || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.warn('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [statusFilter]);

  const handleOpenAdjust = (item) => {
    setSelectedProduct(item);
    setAdjustQty(10);
    setThresholdInput(item.low_stock_threshold || 5);
    setAdjustReason('');
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSavingAdjust(true);
    try {
      const res = await api.post('/inventory/adjust', {
        product_id: selectedProduct.product_id,
        action: adjustAction,
        quantity: adjustQty,
        low_stock_threshold: thresholdInput,
        reason: adjustReason
      });
      if (res.data.success) {
        setSelectedProduct(null);
        fetchInventory();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust stock.');
    } finally {
      setSavingAdjust(false);
    }
  };

  const handleOpenAuditLogs = async (productId = null) => {
    setShowLogsModal(true);
    setLoadingLogs(true);
    try {
      const params = {};
      if (productId) params.product_id = productId;
      const res = await api.get('/inventory/transactions', { params });
      if (res.data.success) {
        setAuditLogs(res.data.transactions || []);
      }
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-600" />
            <span>Hybrid Inventory & Stock Control</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Automatic order stock reservation & deduction with manual audit overrides
          </p>
        </div>

        <button
          onClick={() => handleOpenAuditLogs()}
          className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 flex items-center gap-1.5 shadow-sm transition"
        >
          <History className="w-4 h-4 text-emerald-700" />
          <span>View Audit Log History</span>
        </button>
      </div>

      {/* 3 Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">In Stock</p>
            <h3 className="text-2xl font-black text-emerald-950 mt-1">{summary.in_stock || 0}</h3>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Low Stock</p>
            <h3 className="text-2xl font-black text-amber-950 mt-1">{summary.low_stock || 0}</h3>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Out of Stock</p>
            <h3 className="text-2xl font-black text-red-950 mt-1">{summary.out_of_stock || 0}</h3>
          </div>
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
            placeholder="Search SKU or name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 bg-white"
          >
            <option value="">All Stock Levels</option>
            <option value="in_stock">In Stock Only</option>
            <option value="low_stock">Low Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* Live Inventory Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading inventory details...</div>
        ) : inventory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Jewellery Item</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Physical Stock</th>
                  <th className="py-3.5 px-4">Reserved Stock</th>
                  <th className="py-3.5 px-4 font-black text-emerald-900">Available Stock</th>
                  <th className="py-3.5 px-4">Low Stock Alert</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {inventory.map((item) => (
                  <tr key={item.product_id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3 px-4 font-bold text-stone-900">{item.name_en}</td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-950">{item.sku}</td>
                    <td className="py-3 px-4 font-bold text-stone-700">{item.physical_stock}</td>
                    <td className="py-3 px-4 font-bold text-amber-700">{item.reserved_stock}</td>
                    <td className="py-3 px-4 font-black text-sm text-emerald-800">
                      {item.available_stock}
                    </td>
                    <td className="py-3 px-4 text-stone-500 font-medium">≤ {item.low_stock_threshold}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.stock_status === 'out_of_stock'
                          ? 'bg-red-100 text-red-700'
                          : item.stock_status === 'low_stock'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.stock_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenAdjust(item)}
                        className="px-3 py-1 bg-emerald-850 hover:bg-emerald-900 text-mint-400 rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-stone-500">
            No products in inventory yet. Upload your first product from Products & Pricing.
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif-luxury font-bold text-base text-purple-950">
                Adjust Stock: {selectedProduct.name_en}
              </h3>
              <button onClick={() => setSelectedProduct(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl text-xs space-y-1">
              <p>SKU: <strong>{selectedProduct.sku}</strong></p>
              <p>Current Physical Stock: <strong>{selectedProduct.physical_stock}</strong></p>
              <p>Current Reserved in Active Orders: <strong>{selectedProduct.reserved_stock}</strong></p>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustAction('add')}
                    className={`py-1.5 rounded-lg font-bold border transition ${
                      adjustAction === 'add' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-stone-50 border-stone-300'
                    }`}
                  >
                    + Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustAction('deduct')}
                    className={`py-1.5 rounded-lg font-bold border transition ${
                      adjustAction === 'deduct' ? 'bg-red-700 text-white border-red-700' : 'bg-stone-50 border-stone-300'
                    }`}
                  >
                    - Deduct Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustAction('set')}
                    className={`py-1.5 rounded-lg font-bold border transition ${
                      adjustAction === 'set' ? 'bg-purple-900 text-white border-purple-900' : 'bg-stone-50 border-stone-300'
                    }`}
                  >
                    Set Exact
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Low-Stock Alert Threshold</label>
                <input
                  type="number"
                  min={1}
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Reason / Notes for Audit Log</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received new shipment from workshop"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 border rounded-xl font-bold text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdjust}
                  className="px-5 py-2 bg-emerald-850 hover:bg-emerald-900 text-mint-400 font-extrabold rounded-xl shadow"
                >
                  {savingAdjust ? 'Updating...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif-luxury font-bold text-base text-purple-950 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-700" />
                <span>Inventory Audit Trail (Transactions Log)</span>
              </h3>
              <button onClick={() => setShowLogsModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingLogs ? (
              <div className="p-8 text-center text-xs text-stone-500">Loading audit transactions...</div>
            ) : auditLogs.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 font-bold text-stone-600 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Product</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Change</th>
                      <th className="py-2 px-3">Stock Before → After</th>
                      <th className="py-2 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50">
                        <td className="py-2 px-3 text-stone-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 font-bold text-purple-950">{log.name_en}</td>
                        <td className="py-2 px-3">
                          <span className="font-mono text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                            {log.transaction_type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-stone-900">{log.quantity > 0 ? `+${log.quantity}` : log.quantity}</td>
                        <td className="py-2 px-3 text-stone-600 font-mono">
                          {log.previous_physical_stock} → {log.new_physical_stock}
                        </td>
                        <td className="py-2 px-3 text-stone-500 text-[11px]">{log.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-stone-500">
                No inventory transactions logged yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
