import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('mn_cart');
    return saved ? JSON.parse(saved) : {
      items: [],
      item_count: 0,
      subtotal: 0,
      cart_type: 'retail'
    };
  });
  const [loading, setLoading] = useState(false);
  const [orderMode, setOrderMode] = useState('retail'); // 'retail' or 'wholesale'

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('mn_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
        if (res.data.cart.cart_type) {
          setOrderMode(res.data.cart.cart_type);
        }
      }
    } catch (err) {
      // In offline/client-first mode, retain local cart state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (product, quantity = 1, isWholesale = false, size = '2.6', finish = 'Matte Gold') => {
    const productId = product.id || product.product_id;
    const price = isWholesale ? (product.wholesale_price || 450) : (product.retail_price || 1200);

    // Try backend API first
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
    } catch (err) {
      // Graceful local cart update
    }

    // Local cart calculation
    setCart(prev => {
      const existingIndex = prev.items.findIndex(i => (i.product_id || i.id) === productId && i.size === size);
      let updatedItems = [...prev.items];
      
      if (existingIndex > -1) {
        const item = updatedItems[existingIndex];
        const newQty = item.quantity + quantity;
        updatedItems[existingIndex] = {
          ...item,
          quantity: newQty,
          item_total: newQty * item.price_per_unit
        };
      } else {
        updatedItems.push({
          id: Date.now(),
          product_id: productId,
          name: product.name || 'Royal Antique Filigree Patli Kada',
          sku: product.sku || 'MN-BG-108',
          image_url: product.image_url || '/assets/patli-kada-floral.png',
          size: size,
          finish: finish,
          price_per_unit: price,
          retail_price: product.retail_price || 1200,
          wholesale_price: product.wholesale_price || 450,
          is_wholesale: isWholesale,
          quantity: quantity,
          min_order_qty: product.min_order_qty || 12,
          item_total: price * quantity
        });
      }

      const itemCount = updatedItems.reduce((acc, curr) => acc + curr.quantity, 0);
      const subtotal = updatedItems.reduce((acc, curr) => acc + (curr.item_total || curr.price_per_unit * curr.quantity), 0);

      return {
        items: updatedItems,
        item_count: itemCount,
        subtotal: subtotal,
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
    } catch (err) {}

    setCart(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === cartItemId || item.product_id === cartItemId) {
          return {
            ...item,
            quantity: quantity,
            item_total: quantity * item.price_per_unit
          };
        }
        return item;
      });
      const itemCount = updatedItems.reduce((acc, curr) => acc + curr.quantity, 0);
      const subtotal = updatedItems.reduce((acc, curr) => acc + (curr.item_total || curr.price_per_unit * curr.quantity), 0);
      return {
        ...prev,
        items: updatedItems,
        item_count: itemCount,
        subtotal: subtotal
      };
    });

    return { success: true };
  };

  const removeItem = async (cartItemId) => {
    try {
      await api.delete(`/cart/item/${cartItemId}`);
      await fetchCart();
      return { success: true };
    } catch (err) {}

    setCart(prev => {
      const updatedItems = prev.items.filter(item => item.id !== cartItemId && item.product_id !== cartItemId);
      const itemCount = updatedItems.reduce((acc, curr) => acc + curr.quantity, 0);
      const subtotal = updatedItems.reduce((acc, curr) => acc + (curr.item_total || curr.price_per_unit * curr.quantity), 0);
      return {
        ...prev,
        items: updatedItems,
        item_count: itemCount,
        subtotal: subtotal
      };
    });

    return { success: true };
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
    } catch (err) {}
    setCart({ items: [], item_count: 0, subtotal: 0, cart_type: 'retail' });
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
