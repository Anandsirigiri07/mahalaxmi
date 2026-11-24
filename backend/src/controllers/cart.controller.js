const { query, getConnection } = require('../config/db');

/**
 * Get Cart items with live product info and stock check
 */
async function getCart(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || req.query.session_id || 'guest';
    const isWholesaleUser = req.user && req.user.account_type === 'wholesale' && req.user.verification_status === 'approved';

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

    const items = await query(
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
                ORDER BY is_primary DESC, id ASC LIMIT 1
              ) AS image_url
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       INNER JOIN categories c ON p.category_id = c.id
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE ci.cart_id = ? AND p.is_active = TRUE`,
      [cart.id]
    );

    let subtotal = 0;
    let itemCount = 0;

    for (let item of items) {
      subtotal += parseFloat(item.line_total);
      itemCount += item.quantity;
    }

    return res.json({
      success: true,
      cart: {
        id: cart.id,
        cart_type: cart.cart_type,
        items,
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

    await conn.beginTransaction();

    // Fetch product details
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

    const isWholesaleVerified = req.user && req.user.account_type === 'wholesale' && req.user.verification_status === 'approved';
    const effectiveWholesale = is_wholesale && (isWholesaleVerified || (req.user && req.user.role === 'admin'));

    const minQty = effectiveWholesale ? Math.max(product.moq, 1) : 1;
    let addQty = parseInt(quantity, 10);

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

    // Determine unit price
    const unitPrice = effectiveWholesale ? product.wholesale_price : product.retail_price;
    const targetCartType = effectiveWholesale ? 'wholesale' : 'retail';

    // Find or create cart
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

    // Check if item already in cart
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
 * Update Cart Item Quantity
 */
async function updateCartItem(req, res) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const newQty = parseInt(quantity, 10);

    if (newQty <= 0) {
      await query(`DELETE FROM cart_items WHERE id = ?`, [id]);
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    // Check available stock & MOQ
    const items = await query(
      `SELECT ci.*, p.moq, (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) AS available_stock
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE ci.id = ?`,
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const item = items[0];
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
      await query(`DELETE ci FROM cart_items ci INNER JOIN carts c ON ci.cart_id = c.id WHERE c.session_id = ?`, [sessionId]);
    }

    return res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
