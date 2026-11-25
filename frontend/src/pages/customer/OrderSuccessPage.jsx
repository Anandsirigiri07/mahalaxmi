import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Check, Phone } from 'lucide-react';
import api from '../../services/api';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success && res.data.order) {
          setOrder(res.data.order);
        }
      } catch (err) {}
    };
    fetchOrder();
  }, [id]);

  const orderNumber = order ? order.order_number : `MN-${id.toString().slice(-6)}`;
  const totalAmount = order ? parseFloat(order.total_amount || 0).toFixed(0) : '0';
  const statusLabel = order?.payment_method === 'cod'
    ? 'Cash on Delivery (Confirmed)'
    : order?.payment_status === 'paid'
      ? 'UPI Payment Verified'
      : 'Pending Verification';

  const whatsappMessage = encodeURIComponent(
    `Hello Mahalaxmi Novelties Kalaburagi, I have placed order #${orderNumber} (₹${totalAmount}). Please confirm dispatch.`
  );

  return (
    <div className="min-h-screen bg-[#280812] text-ivory py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#37141e]/95 border border-gold/40 rounded-3xl p-6 sm:p-8 text-center shadow-deep-3d space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold text-gold-light flex items-center justify-center mx-auto shadow-floating-gold">
          <Check className="w-8 h-8 text-gold animate-bounce" />
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold text-gold-light uppercase tracking-widest block mb-1">
            Order Confirmed &amp; Stock Reserved
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ivory gold-text-glow">
            Thank You for Your Order
          </h1>
          <p className="text-xs text-ivory/70 mt-2">
            Your jewellery order has been safely placed. Physical stock is reserved at our Kalaburagi hub.
          </p>
        </div>

        <div className="bg-[#21040d]/90 border border-gold/25 rounded-2xl p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-outline">Order Reference:</span>
            <span className="font-mono font-bold text-gold-light">#{orderNumber}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-outline">Total Payable:</span>
            <span className="font-bold text-gold font-serif text-sm">₹{totalAmount}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-outline">Hub Location:</span>
            <span className="text-ivory font-medium">Sangam Talkies Complex, Kalaburagi</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gold/20">
            <span className="text-outline">Status:</span>
            <span className="bg-gold/20 border border-gold/30 text-gold-light font-bold px-2 py-0.5 rounded text-[10px]">
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={`https://wa.me/919880042188?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-wine-950 border border-gold/50 text-gold-light font-semibold text-xs flex items-center justify-center space-x-2 shadow-floating-gold hover:bg-wine-900 transition active:scale-95"
          >
            <Phone className="w-4 h-4 text-gold" />
            <span>Notify Store on WhatsApp (+91 98800 42188)</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/account"
              className="py-3 px-4 rounded-xl bg-black/40 border border-gold/40 text-gold-light font-bold text-xs uppercase tracking-wider text-center transition hover:bg-black/60"
            >
              My Orders
            </Link>
            <Link
              to="/catalogue"
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-wine-950 font-bold text-xs uppercase tracking-wider text-center transition active:scale-95 shadow-md"
            >
              Shop More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
