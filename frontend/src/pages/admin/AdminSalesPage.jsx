import React, { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, ShoppingBag, Calendar, ArrowUpRight } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import api from '../../services/api';

export default function AdminSalesPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard-stats');
        if (res.data.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Error fetching sales:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesStats();
  }, []);

  const totalSales = stats?.kpis?.total_sales || 0;
  const monthlyData = stats?.charts?.monthly_sales || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-luxury text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Sales & Revenue Analytics</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Historical sales tracking computed purely from confirmed customer payments
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-stone-500 uppercase font-bold block">Lifetime Revenue</span>
          <span className="text-2xl font-black text-emerald-800">
            ₹{parseFloat(totalSales).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Monthly Sales Area Chart */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h3 className="font-serif-luxury text-base font-bold text-stone-900">
          Monthly Revenue Performance (Last 6 Months)
        </h3>

        <div className="h-80 w-full">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGreenArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="period" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(value) => [`₹${parseFloat(value).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#064E3B', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={3} fill="url(#salesGreenArea)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-stone-50 rounded-2xl">
              <TrendingUp className="w-10 h-10 text-stone-300 mb-2" />
              <p className="text-xs font-bold text-stone-700">No Sales History Yet</p>
              <p className="text-[11px] text-stone-500 max-w-sm mt-1">
                Completed paid orders will generate interactive monthly revenue curves here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
