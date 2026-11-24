import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Upload, 
  Camera, 
  Sparkles, 
  AlertCircle, 
  Check, 
  X,
  Boxes,
  Image as ImageIcon
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import api from '../../services/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    category_id: '',
    name_en: '',
    name_kn: '',
    description_en: '',
    description_kn: '',
    retail_price: '',
    wholesale_price: '',
    moq: 6,
    initial_stock: 20,
    low_stock_threshold: 5,
    is_featured: false
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [formError, setFormError] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.warn('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories || []);
        if (res.data.categories.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: res.data.categories[0].id }));
        }
      }
    } catch (e) {
      console.warn('Error loading categories:', e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle client-side image compression with browser-image-compression
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setCompressionProgress('Compressing images (< 200KB)...');
    const compressedFiles = [];
    const previews = [];

    const options = {
      maxSizeMB: 0.2, // max 200KB
      maxWidthOrHeight: 800,
      useWebWorker: true
    };

    for (let file of files) {
      try {
        const compressedFile = await imageCompression(file, options);
        compressedFiles.push(compressedFile);
        previews.push(URL.createObjectURL(compressedFile));
      } catch (err) {
        console.warn('Compression fallback to original:', err);
        compressedFiles.push(file);
        previews.push(URL.createObjectURL(file));
      }
    }

    setSelectedFiles(compressedFiles);
    setPreviewUrls(previews);
    setCompressionProgress(`${compressedFiles.length} photo(s) compressed and ready for upload.`);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.sku || !formData.category_id || !formData.name_en || !formData.retail_price || !formData.wholesale_price) {
      setFormError('Please fill in SKU, Category, English Name, and both Retail and Wholesale prices.');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('sku', formData.sku.trim());
      data.append('category_id', formData.category_id);
      data.append('name_en', formData.name_en.trim());
      data.append('name_kn', formData.name_kn.trim() || formData.name_en.trim());
      data.append('description_en', formData.description_en);
      data.append('description_kn', formData.description_kn);
      data.append('retail_price', formData.retail_price);
      data.append('wholesale_price', formData.wholesale_price);
      data.append('moq', formData.moq);
      data.append('initial_stock', formData.initial_stock);
      data.append('low_stock_threshold', formData.low_stock_threshold);
      data.append('is_featured', formData.is_featured);

      // Attach compressed image files
      selectedFiles.forEach((file) => {
        data.append('images', file, file.name);
      });

      const res = await api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setShowAddModal(false);
        setFormData({
          sku: '',
          category_id: categories[0]?.id || '',
          name_en: '',
          name_kn: '',
          description_en: '',
          description_kn: '',
          retail_price: '',
          wholesale_price: '',
          moq: 6,
          initial_stock: 20,
          low_stock_threshold: 5,
          is_featured: false
        });
        setSelectedFiles([]);
        setPreviewUrls([]);
        setCompressionProgress('');
        fetchProducts();
      } else {
        setFormError(res.data.message || 'Failed to create product.');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Server error creating product.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        fetchProducts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-stone-900">
            Products & Dual Pricing Management
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage real product photos, SKU codes, retail prices, wholesale rates, and minimum order quantities
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-850 hover:bg-emerald-900 text-mint-400 font-extrabold text-xs flex items-center gap-2 shadow transition hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4 text-mint-400" />
          <span>Upload Real Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by SKU or jewellery name..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Jewellery Item</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Retail Price (₹)</th>
                  <th className="py-3.5 px-4">Wholesale Rate (₹)</th>
                  <th className="py-3.5 px-4">MOQ</th>
                  <th className="py-3.5 px-4">Available Stock</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                        {p.primary_image ? (
                          <img src={p.primary_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-600">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 leading-snug">{p.name_en}</p>
                        <p className="text-[10px] text-stone-500">{p.name_kn}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-950">{p.sku}</td>
                    <td className="py-3 px-4 font-medium text-stone-700">{p.category_name_en}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">₹{parseFloat(p.retail_price).toFixed(2)}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-800">₹{parseFloat(p.wholesale_price).toFixed(2)}</td>
                    <td className="py-3 px-4 font-bold text-amber-700">{p.moq} sets</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                        p.available_stock <= 0
                          ? 'bg-red-100 text-red-700'
                          : p.available_stock <= p.low_stock_threshold
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.available_stock} in stock
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.name_en)}
                        className="text-stone-400 hover:text-red-600 transition p-1"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Graceful Zero Mock Data Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Boxes className="w-7 h-7" />
            </div>
            <h3 className="font-serif-luxury font-bold text-stone-900 text-base">
              No Jewellery Products Added Yet
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Click the button below to upload your first genuine jewellery piece with camera photos and wholesale pricing.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-emerald-850 hover:bg-emerald-900 text-mint-400 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4 text-mint-400" />
              <span>Add First Product</span>
            </button>
          </div>
        )}
      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif-luxury font-bold text-lg text-purple-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>Upload New Jewellery Product</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Image Upload Input with Camera Support & Automatic Browser Compression */}
              <div className="border-2 border-dashed border-amber-300 rounded-2xl p-4 bg-amber-50/40 text-center space-y-2">
                <div className="flex justify-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow transition">
                    <Camera className="w-4 h-4" />
                    <span>Take Photo / Choose Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-stone-500">
                  Multiple photos supported. Client-side compression automatically reduces each to &lt;200KB.
                </p>

                {compressionProgress && (
                  <p className="text-[11px] font-bold text-emerald-700">{compressionProgress}</p>
                )}

                {/* Previews */}
                {previewUrls.length > 0 && (
                  <div className="flex gap-2 justify-center flex-wrap pt-2">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-amber-400 shadow-sm">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. MN-MZ-001"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Jewellery Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_en} ({c.name_kn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="e.g. Matte Finish Temple Choker Set"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Product Name (ಕನ್ನಡ)</label>
                  <input
                    type="text"
                    value={formData.name_kn}
                    onChange={(e) => setFormData({ ...formData, name_kn: e.target.value })}
                    placeholder="e.g. ಮ್ಯಾಟ್ ಫಿನಿಶ್ ದೇವಸ್ಥಾನ ಶೈಲಿಯ ಚೋಕರ್ ಸೆಟ್"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Public Retail Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.retail_price}
                    onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-950 mb-1">Public Wholesale Rate (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.wholesale_price}
                    onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                    placeholder="e.g. 350"
                    className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-purple-50/40 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Minimum Order Qty (MOQ) for Wholesale *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Initial Physical Stock *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.initial_stock}
                    onChange={(e) => setFormData({ ...formData, initial_stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Design specs, plating durability, polish..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 bg-emerald-850 hover:bg-emerald-900 text-mint-400 font-extrabold rounded-xl shadow transition"
                >
                  {uploading ? 'Compressing & Uploading...' : 'Save Product & Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
