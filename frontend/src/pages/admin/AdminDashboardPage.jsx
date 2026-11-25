import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  IndianRupee, 
  ShoppingBag, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Boxes, 
  ArrowRight,
  Package,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  BarChart, 
  Bar,
  Legend
} from 'recharts';
import api from '../../services/api';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [salesTimeframe, setSalesTimeframe] = useState('monthly'); // 'monthly' or 'weekly'
  const [stats, setStats] = useState({
    kpis: {
      total_sales: 0,
      orders_today: 0,
      low_stock_items: 0,
      total_customers: 0
    },
    charts: {
      monthly_sales: [],
      weekly_sales: [],
      inventory_status: { in_stock: 0, low_stock: 0, out_of_stock: 0, total_products: 0 },
      shipment_status: [
        { name: 'Delivered', value: 0, color: '#10B981' },
        { name: 'On Delivery', value: 0, color: '#F59E0B' },
        { name: 'Returned', value: 0, color: '#6366F1' },
        { name: 'Canceled', value: 0, color: '#EF4444' }
      ],
      customer_activity: {
        active_users: 0,
        new_signups: 0,
        distribution: [
          { name: 'Retail', value: 0, color: '#D97706' },
          { name: 'Wholesale', value: 0, color: '#064E3B' }
        ]
      },
      category_performance: []
    },
    top_products: [],
    recent_orders: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard-stats');
        if (res.data.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const kpis = stats.kpis || { total_sales: 0, orders_today: 0, low_stock_items: 0, total_customers: 0 };
  const charts = stats.charts || {};
  const activeSalesData = salesTimeframe === 'monthly' ? (charts.monthly_sales || []) : (charts.weekly_sales || []);

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Completed</span>;
      case 'out_for_delivery':
      case 'shipped':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Shipped</span>;
      case 'processing':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Processing</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Canceled</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 text-[11px] font-bold px-2 py-0.5 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Owner Executive Header Banner */}
      <div className="bg-gradient-to-r from-wine-950 via-[#37141e] to-wine-950 border border-gold/40 rounded-3xl p-6 shadow-floating-gold text-ivory flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-gold/20 text-gold-light border border-gold/30 text-[11px] font-mono tracking-widest uppercase font-bold">
            <span>👑 Store Owner Executive Analysis</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory gold-text-glow">
            Mahalaxmi Novelties Store Dashboard
          </h1>
          <p className="text-xs text-ivory/70 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Sangam Talkies Complex, S.B. Temple Road, Kalaburagi - 585 101</span>
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/admin/products"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 text-xs font-bold uppercase tracking-wider shadow-sm hover:scale-105 transition"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="px-3.5 py-2 rounded-xl bg-black/40 border border-gold/40 text-gold-light text-xs font-bold uppercase tracking-wider hover:bg-black/60 transition"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* 1. TOP ROW: 4 Pastel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Sales (₹) — Pastel Emerald */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              Total Sales
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
              ₹{kpis.total_sales ? parseFloat(kpis.total_sales).toFixed(2) : '0.00'}
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              Confirmed Paid Orders
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center p-3 shadow-md">
            <IndianRupee className="w-6 h-6 text-emerald-100" />
          </div>
        </div>

        {/* KPI 2: Orders Today — Pastel Blue */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-100/70 border border-blue-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-1">
              Orders Today
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-sky-950">
              {kpis.orders_today || 0}
            </h3>
            <p className="text-[11px] text-sky-700 font-medium mt-1">
              Placed Today
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center p-3 shadow-md">
            <ShoppingBag className="w-6 h-6 text-sky-100" />
          </div>
        </div>

        {/* KPI 3: Low Stock Items — Pastel Amber */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/70 border border-amber-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              Low Stock Items
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-950">
              {kpis.low_stock_items || 0}
            </h3>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              At or Below Threshold
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center p-3 shadow-md">
            <AlertTriangle className="w-6 h-6 text-amber-100" />
          </div>
        </div>

        {/* KPI 4: Total Customers — Pastel Purple */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/70 border border-purple-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">
              Total Customers
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-950">
              {kpis.total_customers || 0}
            </h3>
            <p className="text-[11px] text-purple-700 font-medium mt-1">
              Retail & Wholesale Buyers
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-900 text-white flex items-center justify-center p-3 shadow-md">
            <Users className="w-6 h-6 text-purple-200" />
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: Left 2/3 Sales Overview (Smooth Green Area Chart) | Right 1/3 Inventory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 2/3 Width: Sales Overview Area Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-stone-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Sales Overview (₹)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Real revenue trends computed directly from verified paid orders
              </p>
            </div>

            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setSalesTimeframe('monthly')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  salesTimeframe === 'monthly'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSalesTimeframe('weekly')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  salesTimeframe === 'weekly'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {activeSalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeSalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGreenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="period" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(value) => [`₹${parseFloat(value).toFixed(2)}`, 'Sales Revenue']}
                    contentStyle={{ backgroundColor: '#064E3B', borderRadius: '12px', color: '#fff', border: 'none' }}
                    itemStyle={{ color: '#34D399', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#059669"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#salesGreenGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              /* Graceful Empty State for Chart */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <TrendingUp className="w-10 h-10 text-stone-300 mb-2" />
                <p className="text-xs font-bold text-stone-700">No Sales Recorded Yet</p>
                <p className="text-[11px] text-stone-500 max-w-sm mt-1">
                  Once customer orders are confirmed and payments are verified, live revenue area trends will populate here dynamically.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3 Width: Inventory Status Live Counts Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <h3 className="font-serif-luxury text-base font-bold text-stone-900 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <span>Inventory Status</span>
              </h3>
              <span className="text-[11px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                Live Counts
              </span>
            </div>

            <div className="space-y-3">
              {/* In Stock */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></div>
                  <span className="text-xs font-bold text-emerald-950">In Stock Items</span>
                </div>
                <span className="text-lg font-black text-emerald-700">
                  {charts.inventory_status?.in_stock || 0}
                </span>
              </div>

              {/* Low Stock */}
              <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></div>
                  <span className="text-xs font-bold text-amber-950">Low Stock Items</span>
                </div>
                <span className="text-lg font-black text-amber-700">
                  {charts.inventory_status?.low_stock || 0}
                </span>
              </div>

              {/* Out of Stock */}
              <div className="flex items-center justify-between p-3.5 bg-red-50/70 border border-red-200 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-500 shrink-0"></div>
                  <span className="text-xs font-bold text-red-950">Out of Stock</span>
                </div>
                <span className="text-lg font-black text-red-700">
                  {charts.inventory_status?.out_of_stock || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Full Width Green "Manage Inventory" button */}
          <Link
            to="/admin/inventory"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-900 hover:bg-emerald-950 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition hover:scale-[1.01]"
          >
            <span>Manage Inventory</span>
            <ArrowRight className="w-4 h-4 text-emerald-300" />
          </Link>
        </div>
      </div>

      {/* 3. LOWER MIDDLE ROW (3 Cards): Top Selling Products | Recent Orders | Shipment Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Top Selling Products */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <h3 className="font-serif-luxury text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Top Selling Products</span>
              </h3>
              <Link to="/admin/products" className="text-[11px] font-bold text-amber-700 hover:underline">
                View All
              </Link>
            </div>

            {stats.top_products && stats.top_products.length > 0 ? (
              <div className="space-y-3">
                {stats.top_products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-0">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-600">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-stone-900 truncate">{p.name_en}</p>
                        <p className="text-stone-500 text-[10px]">SKU: {p.sku}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-black text-emerald-700">₹{parseFloat(p.total_revenue).toFixed(2)}</span>
                      <span className="text-[10px] text-stone-500 block">{p.total_quantity_sold} sold</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Clean Empty State */
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-stone-50 rounded-2xl">
                <Package className="w-8 h-8 text-stone-300 mb-1.5" />
                <p className="text-xs font-bold text-stone-700">No Sales Recorded Yet</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Top performing jewellery designs will appear here as orders are placed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Recent Orders */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <h3 className="font-serif-luxury text-sm font-bold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-purple-900" />
                <span>Recent Orders</span>
              </h3>
              <Link to="/admin/orders" className="text-[11px] font-bold text-purple-900 hover:underline">
                View All
              </Link>
            </div>

            {stats.recent_orders && stats.recent_orders.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-0">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-purple-950">{o.order_number}</span>
                      </div>
                      <p className="text-stone-500 text-[10px] truncate max-w-[120px]">{o.customer_name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getOrderStatusBadge(o.order_status)}
                      <span className="font-bold text-stone-900 text-xs">
                        ₹{parseFloat(o.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Clean Empty State */
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-stone-50 rounded-2xl">
                <ShoppingBag className="w-8 h-8 text-stone-300 mb-1.5" />
                <p className="text-xs font-bold text-stone-700">No Orders Yet</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Customer orders placed online or via COD will show up here in real time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Shipment Status Donut Chart */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <h3 className="font-serif-luxury text-sm font-bold text-stone-900 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <span>Shipment Status</span>
              </h3>
              <span className="text-[10px] text-stone-500 font-semibold">Local Dispatch</span>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              {charts.shipment_status && charts.shipment_status.some(s => s.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.shipment_status}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {charts.shipment_status.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} orders`, name]}
                      contentStyle={{ backgroundColor: '#064E3B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-full border-4 border-dashed border-stone-300 mx-auto mb-2 flex items-center justify-center text-stone-400 font-bold text-xs">
                    0
                  </div>
                  <p className="text-xs font-bold text-stone-600">No Shipments Dispatched</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Delivered, On Delivery, Returned & Canceled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ROW (2 Cards): Customer Activity | Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card 1: Customer Activity (Active Users, New Signups, Retail vs Wholesale pie) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-stone-100 pb-3 mb-4 flex items-center justify-between">
              <h3 className="font-serif-luxury text-sm font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-900" />
                <span>Customer Activity</span>
              </h3>
              <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                Active Buyers
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Active Accounts</span>
                <span className="text-xl font-black text-purple-950">
                  {charts.customer_activity?.active_users || 0}
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-center">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">New Signups (30d)</span>
                <span className="text-xl font-black text-amber-700">
                  {charts.customer_activity?.new_signups || 0}
                </span>
              </div>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              {charts.customer_activity?.distribution && charts.customer_activity.distribution.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.customer_activity.distribution}
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {charts.customer_activity.distribution.map((entry, index) => (
                        <Cell key={`cust-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} buyers`, name]}
                      contentStyle={{ backgroundColor: '#064E3B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-xs text-stone-400">
                  Retail vs. Wholesale ratio will be visualised here.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Category Performance (Vertical Green Bar Chart across jewellery categories) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-stone-100 pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-sm font-bold text-stone-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Category Performance</span>
                </h3>
                <p className="text-[11px] text-stone-500">Live product counts across the 6 core jewellery categories</p>
              </div>
            </div>

            <div className="h-64 w-full">
              {charts.category_performance && charts.category_performance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.category_performance} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis
                      dataKey="name_en"
                      stroke="#9CA3AF"
                      fontSize={10}
                      tickLine={false}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      formatter={(val, name) => [name === 'product_count' ? `${val} products` : `₹${val}`, name === 'product_count' ? 'Active Designs' : 'Sales']}
                      contentStyle={{ backgroundColor: '#064E3B', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="product_count" fill="#059669" radius={[6, 6, 0, 0]} name="Products Added" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-stone-50 rounded-2xl">
                  <Boxes className="w-8 h-8 text-stone-300 mb-2" />
                  <p className="text-xs font-bold text-stone-700">6 Core Categories Ready</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">As products are added via Products & Pricing, bars will dynamically rise.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
