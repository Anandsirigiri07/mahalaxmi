import React, { useState, useEffect } from 'react';
import { Settings, Save, QrCode, MapPin, Upload, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    store_name_en: '',
    store_name_kn: '',
    store_proprietor: '',
    store_address: '',
    store_phone: '',
    store_whatsapp: '',
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

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
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
      for (let [k, v] of Object.entries(settings)) {
        formData.append(k, v);
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-950" />
            <span>Store Configuration & UPI QR Management</span>
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
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Payee Registered Name *</label>
                  <input
                    type="text"
                    required
                    value={settings.upi_name}
                    onChange={(e) => setSettings({ ...settings, upi_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Contact & Proprietor Info */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-serif-luxury font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
            Shop Information & Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Proprietor Name *</label>
              <input
                type="text"
                required
                value={settings.store_proprietor}
                onChange={(e) => setSettings({ ...settings, store_proprietor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Phone Number (Calling) *</label>
              <input
                type="text"
                required
                value={settings.store_phone}
                onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">WhatsApp Order Number *</label>
              <input
                type="text"
                required
                value={settings.store_whatsapp}
                onChange={(e) => setSettings({ ...settings, store_whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Free Delivery Minimum Order (₹)</label>
              <input
                type="number"
                value={settings.free_delivery_threshold}
                onChange={(e) => setSettings({ ...settings, free_delivery_threshold: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Physical Store Address *</label>
              <input
                type="text"
                required
                value={settings.store_address}
                onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Kalaburagi Delivery Pincodes Table */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-3 text-xs">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {pincodes.map((pin) => (
                  <tr key={pin.id}>
                    <td className="py-2 px-3 font-mono font-bold text-purple-950">{pin.pin_code}</td>
                    <td className="py-2 px-3 text-stone-800">{pin.locality_name}</td>
                    <td className="py-2 px-3 font-bold text-emerald-800">₹{parseFloat(pin.delivery_fee).toFixed(2)}</td>
                    <td className="py-2 px-3">₹{parseFloat(pin.min_order_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-emerald-850 hover:bg-emerald-900 text-mint-400 font-extrabold text-sm rounded-2xl shadow-lg transition"
        >
          {saving ? 'Saving Changes...' : 'Save Settings & Configuration'}
        </button>
      </form>
    </div>
  );
}
