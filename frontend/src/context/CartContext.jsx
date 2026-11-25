import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const emptyCart = {
  items: [],
  item_count: 0,
  subtotal: 0,
  cart_type: 'retail'
};

function readStoredCart() {
  try {
    const saved = localStorage.getItem('mn_cart');
    return saved ? JSON.parse(saved) : emptyCart;
  } catch (e) {
    localStorage.removeItem('mn_cart');
    return emptyCart;
  }
}

function normalizeCartItem(item) {
  const unitPrice = Number(item.unit_price ?? item.price_per_unit ?? 0);
  const quantity = Number(item.quantity || 1);
  const lineTotal = Number(item.line_total ?? item.item_total ?? unitPrice * quantity);
  return {
    ...item,
    id: item.cart_item_id || item.id,
    cart_item_id: item.cart_item_id || item.id,
    name: item.name_en || item.name || 'Jewellery Item',
    name_en: item.name_en || item.name || 'Jewellery Item',
    unit_price: unitPrice,
    price_per_unit: unitPrice,
    line_total: lineTotal,
    item_total: lineTotal,
    is_wholesale: Boolean(item.is_wholesale_pricing ?? item.is_wholesale),
    is_wholesale_pricing: Boolean(item.is_wholesale_pricing ?? item.is_wholesale),
    moq: Number(item.moq || item.min_order_qty || 1),
    min_order_qty: Number(item.moq || item.min_order_qty || 1)
  };
}

function normalizeCart(rawCart) {
  if (!rawCart || !Array.isArray(rawCart.items)) return emptyCart;
  const items = rawCart.items.map(normalizeCartItem);
  const item_count = items.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = items.reduce((acc, it) => acc + it.line_total, 0);
  return {
    ...rawCart,
    items,
    item_count,
    subtotal,
    cart_type: rawCart.cart_type || 'retail'
  };
}

export const CartProvider = ({ children }) => {
  const { user, isWholesaleApproved, isAdmin } = useAuth();
  const [cart, setCart] = useState(readStoredCart);
  const [loading, setLoading] = useState(false);
  const [orderMode, setOrderMode] = useState(() => {
    return readStoredCart().cart_type || 'retail';
  });

  useEffect(() => {
    try {
      localStorage.setItem('mn_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.cart) {
        const normalized = normalizeCart(res.data.cart);
        setCart(normalized);
        if (normalized.items.length > 0 && normalized.cart_type) {
          setOrderMode(normalized.cart_type);
        }
      }
    } catch (err) {
      // Retain local cart only if network is unreachable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  const addToCart = async (product, quantity = 1, isWholesale = false, size = '2.6', finish = 'Matte Gold') => {
    const productId = product.id || product.product_id;

    try {
      const res = await api.post('/cart/add', {
        product_id: productId,
        quantity,
        is_wholesale: isWholesale
      });
      if (res.data.success) {
        await fetchCart();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Unable to add item to cart.' };
    } catch (err) {
      // Return server validation/permission error directly without faking local cart state
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }
    }

    // Network offline fallback (only if server unreachable)
    if (isWholesale && !isWholesaleApproved && !isAdmin) {
      return {
        success: false,
        message: 'Wholesale ordering requires an Admin-approved Wholesale Jeweller account.'
      };
    }

    const price = isWholesale ? Number(product.wholesale_price || 0) : Number(product.retail_price || 0);
    setCart(prev => {
      const existingIndex = prev.items.findIndex(i => Number(i.product_id || i.id) === Number(productId));
      const updatedItems = [...prev.items];

      if (existingIndex > -1) {
        const item = updatedItems[existingIndex];
        const newQty = item.quantity + quantity;
        updatedItems[existingIndex] = normalizeCartItem({
          ...item,
          quantity: newQty,
          unit_price: price,
          is_wholesale_pricing: isWholesale,
          line_total: newQty * price
        });
      } else {
        updatedItems.push(normalizeCartItem({
          id: Date.now(),
          product_id: productId,
          name_en: product.name_en || product.name,
          sku: product.sku,
          image_url: product.primary_image || product.image_url || '/assets/patli-kada-floral.png',
          size,
          finish,
          unit_price: price,
          retail_price: Number(product.retail_price || 0),
          wholesale_price: Number(product.wholesale_price || 0),
          is_wholesale_pricing: isWholesale,
          quantity,
          moq: Number(product.moq || product.min_order_qty || 1),
          line_total: price * quantity
        }));
      }

      const item_count = updatedItems.reduce((acc, curr) => acc + curr.quantity, 0);
      const subtotal = updatedItems.reduce((acc, curr) => acc + curr.line_total, 0);

      return {
        items: updatedItems,
        item_count,
        subtotal,
        cart_type: isWholesale ? 'wholesale' : 'retail'
      };
    });

    return { success: true, message: `Added ${quantity} unit(s) to cart.` };
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      return removeItem(cartItemId);
    }

    try {
      const res = await api.put(`/cart/item/${cartItemId}`, { quantity });
      if (res.data.success) {
        await fetchCart();
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Unable to update cart.' };
    } catch (err) {
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }
    }

    setCart(prev => {
      const updatedItems = prev.items.map(item => {
        if ((item.cart_item_id || item.id) === cartItemId) {
          return normalizeCartItem({
            ...item,
            quantity,
            line_total: quantity * item.unit_price
          });
        }
        return item;
      });
      const item_count = updatedItems.reduce((acc, curr) => acc + curr.quantity, 0);
      const subtotal = updatedItems.reduce((acc, curr) => acc + curr.line_total, 0);
      return { ...prev, items: updatedItems, item_count, subtotal };
    });

    return { success: true };
  };

  const removeItem = async (cartItemId) => {
    try {
      const res = await api.delete(`/cart/item/${cartItemId}`);
      if (res.data.success) {
        await fetchCart();
        return { success: true };
      }
    } catch (err) {
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }
    }

    setCart(prev => {
      const updatedItems = prev.items.filter(item => (item.cart_item_id || item.id) !== cartItemId);
      const item_count = updatedItems.reduce((acc, curr) => acc + curr.quantity, 0);
      const subtotal = updatedItems.reduce((acc, curr) => acc + curr.line_total, 0);
      return { ...prev, items: updatedItems, item_count, subtotal };
    });

    return { success: true };
  };

  const switchCartMode = async (mode) => {
    setOrderMode(mode);
    if (!cart.items || cart.items.length === 0) {
      setCart(prev => ({ ...prev, cart_type: mode }));
      return { success: true };
    }
    try {
      const res = await api.put('/cart/mode', { mode });
      if (res.data.success) {
        await fetchCart();
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      if (err.response?.data?.message) {
        return { success: false, message: err.response.data.message };
      }
    }
    return { success: false, message: 'Could not switch cart mode.' };
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
    } catch (err) {}
    setCart(emptyCart);
    localStorage.removeItem('mn_cart');
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      orderMode,
      setOrderMode,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      switchCartMode,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
