import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { lang, t } = useLanguage();
  const { addToCart, orderMode } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorTip, setErrorTip] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  const isWholesale = orderMode === 'wholesale';
  const moq = Number(product.moq || product.min_order_qty || 1);
  const qtyToAdd = isWholesale ? Math.max(moq, 1) : 1;
  const isOutOfStock = product.stock_status === 'out_of_stock' || (product.available_stock !== undefined && Number(product.available_stock) <= 0);

  const displayImage = product.primary_image || product.image_url || '/assets/patli-kada-floral.png';
  const retailPrice = Number(product.retail_price ?? 0);
  const wholesalePrice = Number(product.wholesale_price ?? 0);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || adding) return;

    setErrorTip('');
    setAdding(true);
    const res = await addToCart(product, qtyToAdd, isWholesale);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else if (res.message) {
      setErrorTip(res.message);
      setTimeout(() => setErrorTip(''), 3500);
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group relative flex flex-col bg-[#37141e]/90 backdrop-blur-md rounded-2xl p-3 border border-gold/30 shadow-floating-card hover:border-gold hover:shadow-floating-gold transition-all duration-300">
      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        aria-label="Add to Wishlist"
        className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-gold/30 flex items-center justify-center text-gold-light hover:text-gold active:scale-90 transition"
      >
        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-gold text-gold' : 'text-gold-light'}`} />
      </button>

      {/* Floating 3D Image Cutout Container */}
      <Link
        to={`/product/${product.id}`}
        className="relative w-full h-36 sm:h-40 flex items-center justify-center -mt-2 mb-2 overflow-visible block"
      >
        <div className="absolute inset-2 bg-gradient-to-tr from-gold/25 via-gold/10 to-transparent rounded-full filter blur-md pointer-events-none"></div>

        <img
          src={displayImage}
          alt={product.name_en || product.name}
          className="relative z-10 w-full h-full object-contain rounded-xl filter drop-shadow-[0_12px_16px_rgba(10,2,5,0.85)] group-hover:scale-105 transition-transform duration-300 select-none"
          loading="lazy"
        />

        <span className="absolute bottom-1 left-1 z-20 px-2 py-0.5 rounded-md bg-wine-950/90 border border-gold/40 text-[9px] font-bold text-gold-light tracking-wider shadow-sm uppercase">
          Min {moq} sets
        </span>
      </Link>

      {/* Product Information */}
      <div className="flex flex-col flex-1 justify-between gap-1.5 mt-1">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-outline">
              {product.sku || 'MN-01'}
            </span>
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-black/40 border border-gold/20">
              <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-400' : 'bg-gold animate-pulse'}`}></span>
              <span className="text-[9px] font-semibold text-gold-light">
                {isOutOfStock ? t('out_of_stock') : 'Ready'}
              </span>
            </div>
          </div>

          <Link to={`/product/${product.id}`}>
            <h3 className="font-serif text-sm sm:text-base font-bold text-ivory line-clamp-1 leading-snug group-hover:text-gold-light transition">
              {lang === 'kn' ? (product.name_kn || product.name_en) : (product.name_en || product.name)}
            </h3>
          </Link>
        </div>

        {/* Dual Pricing Container */}
        <div className="pt-2 bg-[#21040d]/80 rounded-xl p-2.5 mt-1 border border-gold/20 space-y-1">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-[10px] text-ivory/60">{t('retail_price')}</span>
            <span className="text-xs text-outline font-mono">
              ₹{retailPrice.toFixed(0)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-bold text-gold-light tracking-wide uppercase">
              Wholesale
            </span>
            <span className="text-sm sm:text-base font-bold text-gold gold-text-glow font-sans">
              ₹{wholesalePrice.toFixed(0)}
            </span>
          </div>
        </div>

        {errorTip && (
          <p className="text-[10px] text-amber-300 bg-red-950/70 border border-red-500/40 rounded-lg px-2 py-1 leading-tight">
            {errorTip}
          </p>
        )}

        <button
          onClick={handleQuickAdd}
          disabled={isOutOfStock || adding}
          className={`mt-2 w-full py-2 px-3 rounded-xl font-sans text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center space-x-1.5 active:scale-95 disabled:opacity-50 ${
            added
              ? 'bg-gold text-wine-950 font-bold shadow-floating-gold'
              : 'bg-wine-900/80 hover:bg-gold hover:text-wine-950 text-gold-light border border-gold/40 shadow-sm'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {isOutOfStock
                  ? t('out_of_stock')
                  : isWholesale
                    ? `Order Lot (${moq}pcs)`
                    : t('add_to_cart')}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
