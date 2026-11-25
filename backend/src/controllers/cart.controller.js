const { query, getConnection } = require('../config/db');

function formatCartItems(items) {
  let subtotal = 0;
  let itemCount = 0;

  const formatted = items.map(item => {
    const unitPrice = parseFloat(item.unit_price || 0);
    const quantity = parseInt(item.quantity, 10) || 1;
    const lineTotal = unitPrice * quantity;
    subtotal += lineTotal;
    itemCount += quantity;
    return {
      ...item,
      id: item.cart_item_id,
      name: item.name_en,
      unit_price: unitPrice,
      price_per_unit: unitPrice,
      line_total: lineTotal,
      item_total: lineTotal,
      is_wholesale: Boolean(item.is_wholesale_pricing),
      is_wholesale_pricing: Boolean(item.is_wholesale_pricing),
      min_order_qty: item.moq || 1
    };
  });

  return { formatted, subtotal, itemCount };
}

/**
 * Get Cart items with live product info and stock check
 */
async function getCart(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || req.query.session_id || 'guest';
    const isWholesaleUser = req.user && (
      req.user.role === 'admin' ||
      (req.user.account_type === 'wholesale' && req.user.verification_status === 'approved')
    );

    let cart;
    if (userId) {
      const carts = await query(`SELECT * FROM carts WHERE user_id = ? LIMIT 1`, [userId]);
      cart = carts[0];
    } else {
      const carts = await query(`SELECT * FROM carts WHERE session_id = ? AND user_id IS NULL LIMIT 1`, [sessionId]);
      cart = carts[0];
    }

    if (!cart) {
      return res.json({
        success: true,
        cart: {
          items: [],
          item_count: 0,
          subtotal: 0,
          cart_type: isWholesaleUser ? 'wholesale' : 'retail'
        }
      });
    }

    const rawItems = await query(
      `SELECT ci.id AS cart_item_id,
              ci.quantity,
              ci.unit_price,
              ci.is_wholesale_pricing,
              (ci.quantity * ci.unit_price) AS line_total,
              p.id AS product_id,
              p.sku,
              p.name_en,
              p.name_kn,
              p.retail_price,
              p.wholesale_price,
              p.moq,
              c.name_en AS category_name,
              (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) AS available_stock,
              (
                SELECT image_url FROM product_images
                WHERE product_id = p.id
                ORDER BY is_primary DESC, display_order ASC, id ASC LIMIT 1
              ) AS image_url
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       INNER JOIN categories c ON p.category_id = c.id
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE ci.cart_id = ? AND p.is_active = TRUE`,
      [cart.id]
    );

    const { formatted, subtotal, itemCount } = formatCartItems(rawItems);

    return res.json({
      success: true,
      cart: {
        id: cart.id,
        cart_type: cart.cart_type,
        items: formatted,
        item_count: itemCount,
        subtotal
      }
    });
  } catch (error) {
    console.error('Get Cart Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve shopping cart: ' + error.message,
      cart: { items: [], item_count: 0, subtotal: 0 }
    });
  }
}

/**
 * Add Item to Cart
 */
async function addToCart(req, res) {
  const conn = await getConnection();
  try {
    const { product_id, quantity = 1, is_wholesale = false } = req.body;
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || 'guest-' + Date.now();

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const parsedQty = parseInt(quantity, 10);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive whole number.' });
    }

    const isWholesaleVerified = req.user && (
      req.user.role === 'admin' ||
      (req.user.account_type === 'wholesale' && req.user.verification_status === 'approved')
    );

    if (is_wholesale && !isWholesaleVerified) {
      return res.status(403).json({
        success: false,
        message: req.user
          ? 'Wholesale pricing requires an Admin-approved Wholesale Jeweller account. Please switch to Retail mode or wait for verification.'
          : 'Wholesale ordering requires signing in with an approved Wholesale Jeweller account. Switch to Retail mode or sign in.'
      });
    }

    await conn.beginTransaction();

    const [products] = await conn.execute(
      `SELECT p.*, (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) AS available_stock
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.id = ? AND p.is_active = TRUE`,
      [product_id]
    );

    if (products.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Product not found or inactive.' });
    }

    const product = products[0];
    const availableStock = product.available_stock;

    if (availableStock <= 0) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: 'This jewellery piece is currently out of stock.'
      });
    }

    const effectiveWholesale = Boolean(is_wholesale && isWholesaleVerified);
    const minQty = effectiveWholesale ? Math.max(product.moq || 1, 1) : 1;
    let addQty = parsedQty;

    if (effectiveWholesale && addQty < minQty) {
      addQty = minQty;
    }

    if (addQty > availableStock) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} units currently available in store.`
      });
    }

    const unitPrice = effectiveWholesale ? parseFloat(product.wholesale_price) : parseFloat(product.retail_price);
    const targetCartType = effectiveWholesale ? 'wholesale' : 'retail';

    let cartId;
    if (userId) {
      const [userCarts] = await conn.execute(`SELECT id FROM carts WHERE user_id = ?`, [userId]);
      if (userCarts.length > 0) {
        cartId = userCarts[0].id;
        await conn.execute(`UPDATE carts SET cart_type = ? WHERE id = ?`, [targetCartType, cartId]);
      } else {
        const [newCart] = await conn.execute(
          `INSERT INTO carts (user_id, session_id, cart_type) VALUES (?, ?, ?)`,
          [userId, sessionId, targetCartType]
        );
        cartId = newCart.insertId;
      }
    } else {
      const [sessionCarts] = await conn.execute(
        `SELECT id FROM carts WHERE session_id = ? AND user_id IS NULL`,
        [sessionId]
      );
      if (sessionCarts.length > 0) {
        cartId = sessionCarts[0].id;
      } else {
        const [newCart] = await conn.execute(
          `INSERT INTO carts (user_id, session_id, cart_type) VALUES (NULL, ?, ?)`,
          [sessionId, targetCartType]
        );
        cartId = newCart.insertId;
      }
    }

    const [existingItems] = await conn.execute(
      `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`,
      [cartId, product_id]
    );

    if (existingItems.length > 0) {
      const newTotalQty = existingItems[0].quantity + addQty;
      if (newTotalQty > availableStock) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Total in cart would exceed available stock (${availableStock}).`
        });
      }
      await conn.execute(
        `UPDATE cart_items SET quantity = ?, unit_price = ?, is_wholesale_pricing = ? WHERE id = ?`,
        [newTotalQty, unitPrice, effectiveWholesale ? 1 : 0, existingItems[0].id]
      );
    } else {
      await conn.execute(
        `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, is_wholesale_pricing)
         VALUES (?, ?, ?, ?, ?)`,
        [cartId, product_id, addQty, unitPrice, effectiveWholesale ? 1 : 0]
      );
    }

    await conn.commit();

    return res.json({
      success: true,
      message: `${product.name_en} added to cart.`,
      sessionId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Add to Cart Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
}

/**
 * Verify the caller owns the cart item
 */
async function loadOwnedCartItem(cartItemId, req) {
  const userId = req.user ? req.user.id : null;
  const sessionId = req.headers['x-session-id'] || 'guest';

  const items = await query(
    `SELECT ci.*, c.user_id AS cart_user_id, c.session_id AS cart_session_id,
            p.moq, (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) AS available_stock
     FROM cart_items ci
     INNER JOIN carts c ON ci.cart_id = c.id
     INNER JOIN products p ON ci.product_id = p.id
     LEFT JOIN inventory i ON p.id = i.product_id
     WHERE ci.id = ?`,
    [cartItemId]
  );

  if (!items || items.length === 0) return { error: 404, item: null };

  const item = items[0];
  const isOwner = userId
    ? Number(item.cart_user_id) === Number(userId)
    : (!item.cart_user_id && item.cart_session_id === sessionId);

  if (!isOwner) return { error: 403, item: null };
  return { error: null, item };
}

/**
 * Update Cart Item Quantity
 */
async function updateCartItem(req, res) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const newQty = parseInt(quantity, 10);

    if (!Number.isInteger(newQty)) {
      return res.status(400).json({ success: false, message: 'Valid integer quantity is required.' });
    }

    const { error, item } = await loadOwnedCartItem(id, req);
    if (error === 404) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }
    if (error === 403) {
      return res.status(403).json({ success: false, message: 'Unauthorized cart access.' });
    }

    if (newQty <= 0) {
      await query(`DELETE FROM cart_items WHERE id = ?`, [id]);
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    if (item.is_wholesale_pricing && newQty < item.moq) {
      return res.status(400).json({
        success: false,
        message: `Wholesale minimum order quantity for this item is ${item.moq} units.`
      });
    }

    if (newQty > item.available_stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.available_stock} items available in stock.`
      });
    }

    await query(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [newQty, id]);

    return res.json({ success: true, message: 'Cart updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Delete single cart item
 */
async function removeCartItem(req, res) {
  try {
    const { id } = req.params;
    const { error } = await loadOwnedCartItem(id, req);
    if (error === 404) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }
    if (error === 403) {
      return res.status(403).json({ success: false, message: 'Unauthorized cart access.' });
    }
    await query(`DELETE FROM cart_items WHERE id = ?`, [id]);
    return res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Clear full cart
 */
async function clearCart(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || 'guest';

    if (userId) {
      await query(`DELETE ci FROM cart_items ci INNER JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = ?`, [userId]);
    } else {
      await query(`DELETE ci FROM cart_items ci INNER JOIN carts c ON ci.cart_id = c.id WHERE c.session_id = ? AND c.user_id IS NULL`, [sessionId]);
    }

    return res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Switch cart pricing mode (retail vs wholesale)
 */
async function switchCartMode(req, res) {
  const conn = await getConnection();
  try {
    const { mode } = req.body;
    if (!['retail', 'wholesale'].includes(mode)) {
      return res.status(400).json({ success: false, message: 'Mode must be retail or wholesale.' });
    }

    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || 'guest';
    const isWholesaleVerified = req.user && (
      req.user.role === 'admin' ||
      (req.user.account_type === 'wholesale' && req.user.verification_status === 'approved')
    );

    if (mode === 'wholesale' && !isWholesaleVerified) {
      return res.status(403).json({
        success: false,
        message: 'Wholesale cart pricing requires an Admin-approved Wholesale Jeweller account.'
      });
    }

    await conn.beginTransaction();

    const [carts] = userId
      ? await conn.execute(`SELECT id FROM carts WHERE user_id = ? LIMIT 1`, [userId])
      : await conn.execute(`SELECT id FROM carts WHERE session_id = ? AND user_id IS NULL LIMIT 1`, [sessionId]);

    if (carts.length === 0) {
      await conn.commit();
      return res.json({ success: true, message: `Switched to ${mode} mode.` });
    }

    const cartId = carts[0].id;
    await conn.execute(`UPDATE carts SET cart_type = ? WHERE id = ?`, [mode, cartId]);

    const [items] = await conn.execute(
      `SELECT ci.id, ci.quantity, p.retail_price, p.wholesale_price, p.moq,
              (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) AS available_stock
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    for (const item of items) {
      const targetPrice = mode === 'wholesale' ? parseFloat(item.wholesale_price) : parseFloat(item.retail_price);
      let targetQty = item.quantity;
      if (mode === 'wholesale') {
        targetQty = Math.max(targetQty, item.moq || 1);
        if (targetQty > item.available_stock && item.available_stock > 0) {
          targetQty = item.available_stock;
        }
      }
      await conn.execute(
        `UPDATE cart_items SET quantity = ?, unit_price = ?, is_wholesale_pricing = ? WHERE id = ?`,
        [targetQty, targetPrice, mode === 'wholesale' ? 1 : 0, item.id]
      );
    }

    await conn.commit();
    return res.json({ success: true, message: `Cart switched to ${mode} pricing.` });
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  switchCartMode
};
