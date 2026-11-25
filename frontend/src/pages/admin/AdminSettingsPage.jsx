import React, { useState, useEffect } from 'react';
import { Settings, QrCode, Check, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    store_name_en: '',
    store_name_kn: '',
    store_proprietor: '',
    store_address: '',
    store_phone: '',
    store_whatsapp: '',
    store_email: '',
    upi_id: '',
    upi_name: '',
    upi_qr_image: '',
    default_delivery_fee: '40',
    free_delivery_threshold: '1500'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [message, setMessage] = useState('');

  // Pincodes management
  const [pincodes, setPincodes] = useState([]);
  const [newPin, setNewPin] = useState({ pin_code: '', locality_name: '', delivery_fee: '40', min_order_amount: '300' });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success && res.data.settings) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }

      const pinRes = await api.get('/settings/pincodes');
      if (pinRes.data.success) {
        setPincodes(pinRes.data.pincodes || []);
      }
    } catch (err) {
      console.warn('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleQrFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const formData = new FormData();
      for (const [k, v] of Object.entries(settings)) {
        if (v !== undefined && v !== null) {
          formData.append(k, v);
        }
      }
      if (qrFile) {
        formData.append('upi_qr_file', qrFile);
      }

      const res = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setMessage('Settings and store UPI QR code updated successfully.');
        fetchSettings();
      }
    } catch (err) {
      setMessage('Failed to save settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAddPincode = async () => {
    if (!newPin.pin_code.trim() || !newPin.locality_name.trim()) return;
    try {
      const res = await api.post('/settings/pincodes', newPin);
      if (res.data.success) {
        setNewPin({ pin_code: '', locality_name: '', delivery_fee: '40', min_order_amount: '300' });
        fetchSettings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add PIN code.');
    }
  };

  const handleDeletePincode = async (id) => {
    if (!window.confirm('Remove this delivery PIN code?')) return;
    try {
      await api.delete(`/settings/pincodes/${id}`);
      fetchSettings();
    } catch (err) {}
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-950" />
            <span>Store Configuration &amp; UPI QR Management</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Update physical store contact info, payment QR image, and Kalaburagi delivery pricing
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* UPI QR Code Section */}
        <div className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-serif-luxury font-bold text-base text-purple-950 flex items-center gap-2 border-b border-amber-100 pb-3">
            <QrCode className="w-5 h-5 text-amber-600" />
            <span>Store UPI QR Payment Setup (100% Free Payments)</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-40 h-40 rounded-2xl bg-stone-50 border-2 border-dashed border-amber-300 p-2 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={qrPreview || settings.upi_qr_image || '/uploads/default-upi-qr.svg'}
                alt="Store QR Preview"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-3 flex-1 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Upload New UPI QR Code Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrFileChange}
                  className="text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Store UPI ID *</label>
                  <input
                    type="text"
                    required
                    value={settings.upi_id}
                    onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold text-stone-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Payee Registered Name *</label>
                  <input
                    type="text"
                    required
                    value={settings.upi_name}
                    onChange={(e) => setSettings({ ...settings, upi_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Contact & Proprietor Info */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-serif-luxury font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
            Shop Information &amp; Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Proprietor Name *</label>
              <input
                type="text"
                required
                value={settings.store_proprietor}
                onChange={(e) => setSettings({ ...settings, store_proprietor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Phone Number (Calling) *</label>
              <input
                type="text"
                required
                value={settings.store_phone}
                onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">WhatsApp Order Number *</label>
              <input
                type="text"
                required
                value={settings.store_whatsapp}
                onChange={(e) => setSettings({ ...settings, store_whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Free Delivery Minimum Order (₹)</label>
              <input
                type="number"
                value={settings.free_delivery_threshold}
                onChange={(e) => setSettings({ ...settings, free_delivery_threshold: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-stone-900 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Physical Store Address *</label>
              <input
                type="text"
                required
                value={settings.store_address}
                onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium text-stone-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Kalaburagi Delivery Pincodes Table */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-serif-luxury font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
            Active Kalaburagi Delivery Routes
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 font-bold text-stone-600">
                <tr>
                  <th className="py-2 px-3">PIN Code</th>
                  <th className="py-2 px-3">Locality / Landmarks</th>
                  <th className="py-2 px-3">Delivery Fee (₹)</th>
                  <th className="py-2 px-3">Min Order (₹)</th>
                  <th className="py-2 px-3 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {pincodes.map((pin) => (
                  <tr key={pin.id}>
                    <td className="py-2 px-3 font-mono font-bold text-purple-950">{pin.pin_code}</td>
                    <td className="py-2 px-3 text-stone-800">{pin.locality_name}</td>
                    <td className="py-2 px-3 font-bold text-emerald-800">₹{parseFloat(pin.delivery_fee).toFixed(2)}</td>
                    <td className="py-2 px-3 text-stone-800">₹{parseFloat(pin.min_order_amount).toFixed(2)}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeletePincode(pin.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        title="Delete PIN"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-stone-100">
            <input
              type="text"
              maxLength={6}
              placeholder="PIN (e.g. 585106)"
              value={newPin.pin_code}
              onChange={(e) => setNewPin({ ...newPin, pin_code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              className="px-3 py-2 rounded-xl border border-stone-300 font-mono text-stone-900 bg-white"
            />
            <input
              type="text"
              placeholder="Locality Name"
              value={newPin.locality_name}
              onChange={(e) => setNewPin({ ...newPin, locality_name: e.target.value })}
              className="sm:col-span-2 px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white"
            />
            <input
              type="number"
              placeholder="Fee ₹"
              value={newPin.delivery_fee}
              onChange={(e) => setNewPin({ ...newPin, delivery_fee: e.target.value })}
              className="px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white"
            />
            <button
              type="button"
              onClick={handleAddPincode}
              className="px-3 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-emerald-300 font-bold flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add PIN</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="w-full py-4 bg-emerald-900 hover:bg-emerald-950 text-emerald-300 font-extrabold text-sm rounded-2xl shadow-lg transition disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : 'Save Settings & Configuration'}
        </button>
      </form>
    </div>
  );
}
