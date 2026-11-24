const { query, getConnection } = require('../config/db');

/**
 * Generate Order Number (e.g. MN-20261123-1001)
 */
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MN-${dateStr}-${randomSuffix}`;
}

/**
 * Customer: Place New Order (UPI QR or COD) with Atomic Stock Reservation
 */
async function placeOrder(req, res) {
  const conn = await getConnection();
  try {
    const userId = req.user.id;
    const {
      cart_id,
      items: directItems,
      shipping_address,
      payment_method, // 'upi_qr' or 'cod'
      transaction_reference, // 12-digit UTR for UPI
      notes
    } = req.body;

    if (!shipping_address || !shipping_address.pin_code) {
      return res.status(400).json({
        success: false,
        message: 'A valid Kalaburagi delivery address with PIN code is required.'
      });
    }

    if (!payment_method || !['upi_qr', 'cod'].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Please choose either UPI QR Code or Cash on Delivery (COD).'
      });
    }

    if (payment_method === 'upi_qr') {
      if (!transaction_reference || transaction_reference.trim().length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Please provide the valid 12-digit UPI Transaction ID / UTR reference after scanning and paying.'
        });
      }
    }

    // 1. Verify Local PIN Code eligibility
    const [pincodes] = await conn.execute(
      `SELECT * FROM delivery_pincodes WHERE pin_code = ? AND is_active = TRUE`,
      [shipping_address.pin_code.trim()]
    );

    if (pincodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: `PIN code ${shipping_address.pin_code} is currently outside our local Kalaburagi delivery zone. Please contact us via WhatsApp for custom parcel arrangements.`
      });
    }

    const pinRule = pincodes[0];

    // 2. Retrieve Items (from cart or direct payload)
    let orderItems = [];

    if (cart_id) {
      const [dbCartItems] = await conn.execute(
        `SELECT ci.*, p.sku, p.name_en, p.retail_price, p.wholesale_price, p.moq
         FROM cart_items ci
         INNER JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = ?`,
        [cart_id]
      );
      orderItems = dbCartItems;
    } else if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      orderItems = directItems;
    } else {
      // Find user's active cart
      const [userCarts] = await conn.execute(`SELECT id FROM carts WHERE user_id = ? LIMIT 1`, [userId]);
      if (userCarts.length > 0) {
        const [dbCartItems] = await conn.execute(
          `SELECT ci.*, p.sku, p.name_en, p.retail_price, p.wholesale_price, p.moq
           FROM cart_items ci
           INNER JOIN products p ON ci.product_id = p.id
           WHERE ci.cart_id = ?`,
          [userCarts[0].id]
        );
        orderItems = dbCartItems;
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add jewellery items before checking out.'
      });
    }

    // Start Transaction for Stock Reservation & Order Placement
    await conn.beginTransaction();

    let subtotal = 0;
    const validatedItems = [];
    const isWholesaleBuyer = req.user.account_type === 'wholesale' && req.user.verification_status === 'approved';

    // 3. Lock & Validate Inventory for each product
    for (let item of orderItems) {
      const [invRows] = await conn.execute(
        `SELECT p.id, p.sku, p.name_en, p.retail_price, p.wholesale_price, p.moq,
                COALESCE(i.physical_stock, 0) AS physical_stock,
                COALESCE(i.reserved_stock, 0) AS reserved_stock
         FROM products p
         LEFT JOIN inventory i ON p.id = i.product_id
         WHERE p.id = ? FOR UPDATE`,
        [item.product_id]
      );

      if (invRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: `Item with product ID ${item.product_id} no longer exists.`
        });
      }

      const prod = invRows[0];
      const available = prod.physical_stock - prod.reserved_stock;
      const qty = parseInt(item.quantity, 10);

      if (qty <= 0) continue;

      if (qty > available) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${prod.name_en}". Only ${available} available, but requested ${qty}.`
        });
      }

      const useWholesale = (item.is_wholesale_pricing || isWholesaleBuyer) && qty >= prod.moq;
      const unitPrice = useWholesale ? parseFloat(prod.wholesale_price) : parseFloat(prod.retail_price);
      const lineTotal = unitPrice * qty;

      subtotal += lineTotal;
      validatedItems.push({
        product_id: prod.id,
        variant_id: item.variant_id || null,
        product_name: prod.name_en,
        sku: prod.sku,
        unit_price: unitPrice,
        quantity: qty,
        subtotal: lineTotal,
        is_wholesale: useWholesale ? 1 : 0,
        current_physical: prod.physical_stock,
        current_reserved: prod.reserved_stock
      });
    }

    // 4. Calculate Delivery Charges
    let deliveryCharge = parseFloat(pinRule.delivery_fee || 40);
    // Fetch free delivery threshold from settings
    const [settingRows] = await conn.execute(
      `SELECT setting_value FROM business_settings WHERE setting_key = 'free_delivery_threshold'`
    );
    const freeDeliveryThreshold = settingRows.length > 0 ? parseFloat(settingRows[0].setting_value) : 1500;

    if (subtotal >= freeDeliveryThreshold) {
      deliveryCharge = 0.00;
    }

    const totalAmount = subtotal + deliveryCharge;
    const orderNumber = generateOrderNumber();
    const orderType = isWholesaleBuyer ? 'wholesale' : 'retail';
    const orderStatus = 'pending';
    const paymentStatus = payment_method === 'upi_qr' ? 'pending_verification' : 'pending';

    // 5. Insert Orders Record
    const [orderResult] = await conn.execute(
      `INSERT INTO orders
       (order_number, user_id, order_type, order_status, payment_status, payment_method, subtotal, delivery_charge, total_amount, shipping_address_json, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        orderType,
        orderStatus,
        paymentStatus,
        payment_method,
        subtotal,
        deliveryCharge,
        totalAmount,
        JSON.stringify(shipping_address),
        notes || null
      ]
    );

    const orderId = orderResult.insertId;

    // 6. Insert Order Items & Reserve Stock
    for (let item of validatedItems) {
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, variant_id, product_name, sku, unit_price, quantity, subtotal, is_wholesale)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.variant_id,
          item.product_name,
          item.sku,
          item.unit_price,
          item.quantity,
          item.subtotal,
          item.is_wholesale
        ]
      );

      // Reserve stock in inventory
      const newReserved = item.current_reserved + item.quantity;
      await conn.execute(
        `UPDATE inventory SET reserved_stock = ? WHERE product_id = ?`,
        [newReserved, item.product_id]
      );

      // Log inventory transaction (order_reserved)
      await conn.execute(
        `INSERT INTO inventory_transactions
         (product_id, transaction_type, quantity, previous_physical_stock, new_physical_stock, previous_reserved_stock, new_reserved_stock, reference_id, created_by_user_id, notes)
         VALUES (?, 'order_reserved', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.product_id,
          item.quantity,
          item.current_physical,
          item.current_physical,
          item.current_reserved,
          newReserved,
          orderNumber,
          userId,
          `Stock reserved for order ${orderNumber}`
        ]
      );
    }

    // 7. Insert Payment Record
    await conn.execute(
      `INSERT INTO payments (order_id, user_id, payment_method, amount, transaction_reference, payment_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        userId,
        payment_method,
        totalAmount,
        payment_method === 'upi_qr' ? transaction_reference.trim() : null,
        paymentStatus
      ]
    );

    // 8. Insert Delivery Dispatch Record
    await conn.execute(
      `INSERT INTO deliveries (order_id, pin_code, delivery_status, tracking_notes)
       VALUES (?, ?, 'assigned', ?)`,
      [
        orderId,
        shipping_address.pin_code.trim(),
        `Order placed for ${pinRule.locality_name}, Kalaburagi.`
      ]
    );

    // 9. Clear user's cart
    await conn.execute(
      `DELETE ci FROM cart_items ci INNER JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = ?`,
      [userId]
    );

    // 10. Add Notification for Admin
    await conn.execute(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (NULL, ?, ?, 'order')`,
      [
        `New Order Received: ${orderNumber}`,
        `Customer placed order ${orderNumber} for ₹${totalAmount.toFixed(2)} via ${payment_method === 'upi_qr' ? 'UPI QR' : 'COD'}.`
      ]
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: payment_method === 'upi_qr'
        ? 'Order placed successfully! Your UPI payment reference is queued for Admin verification.'
        : 'Order placed successfully with Cash on Delivery!',
      order: {
        id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount,
        order_status: orderStatus,
        payment_status: paymentStatus,
        payment_method: payment_method
      }
    });
  } catch (error) {
    await conn.rollback();
    console.error('Place Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to place order: ' + error.message
    });
  } finally {
    conn.release();
  }
}

/**
 * Customer: Get My Orders
 */
async function getMyOrders(req, res) {
  try {
    const orders = await query(
      `SELECT o.*,
              COUNT(oi.id) AS item_count,
              p.transaction_reference,
              d.delivery_status,
              d.delivery_agent_name,
              d.delivery_agent_phone
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN payments p ON o.id = p.order_id
       LEFT JOIN deliveries d ON o.id = d.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders.'
    });
  }
}

/**
 * Customer: Get Order Details by ID
 */
async function getOrderDetails(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let sql = `
      SELECT o.*, 
             u.full_name AS customer_name,
             u.email AS customer_email,
             u.phone AS customer_phone,
             p.transaction_reference,
             p.verified_at,
             d.delivery_status,
             d.delivery_agent_name,
             d.delivery_agent_phone,
             d.tracking_notes,
             d.dispatched_at,
             d.delivered_at
      FROM orders o
      INNER JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN deliveries d ON o.id = d.order_id
      WHERE o.id = ?
    `;
    const params = [id];

    if (!isAdmin) {
      sql += ` AND o.user_id = ?`;
      params.push(userId);
    }

    const orders = await query(sql, params);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Fetch Items
    const items = await query(
      `SELECT oi.*, 
              (SELECT image_url FROM product_images WHERE product_id = oi.product_id ORDER BY is_primary DESC, id ASC LIMIT 1) AS image_url
       FROM order_items oi
       WHERE oi.order_id = ?`,
      [id]
    );

    return res.json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('Get Order Details Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order.' });
  }
}

/**
 * Customer / Admin: Cancel Order (Releases Reserved Stock)
 */
async function cancelOrder(req, res) {
  const conn = await getConnection();
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    await conn.beginTransaction();

    let sql = `SELECT * FROM orders WHERE id = ? FOR UPDATE`;
    const [orders] = await conn.execute(sql, [id]);

    if (orders.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    if (!isAdmin && order.user_id !== userId) {
      await conn.rollback();
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (['delivered', 'cancelled'].includes(order.order_status)) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.order_status}.`
      });
    }

    // Release reserved inventory
    const [items] = await conn.execute(`SELECT * FROM order_items WHERE order_id = ?`, [id]);

    for (let item of items) {
      const [invRows] = await conn.execute(
        `SELECT physical_stock, reserved_stock FROM inventory WHERE product_id = ? FOR UPDATE`,
        [item.product_id]
      );

      if (invRows.length > 0) {
        const inv = invRows[0];
        // If order was already confirmed/delivered, physical was deducted; if pending/processing, reserved was held
        let newReserved = Math.max(0, inv.reserved_stock - item.quantity);
        await conn.execute(
          `UPDATE inventory SET reserved_stock = ? WHERE product_id = ?`,
          [newReserved, item.product_id]
        );

        await conn.execute(
          `INSERT INTO inventory_transactions
           (product_id, transaction_type, quantity, previous_physical_stock, new_physical_stock, previous_reserved_stock, new_reserved_stock, reference_id, created_by_user_id, notes)
           VALUES (?, 'order_cancelled', ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.product_id,
            item.quantity,
            inv.physical_stock,
            inv.physical_stock,
            inv.reserved_stock,
            newReserved,
            order.order_number,
            userId,
            `Stock released upon cancellation of order ${order.order_number}: ${reason || 'Customer request'}`
          ]
        );
      }
    }

    // Update order status
    await conn.execute(
      `UPDATE orders SET order_status = 'cancelled', notes = CONCAT(COALESCE(notes, ''), ' [Cancelled: ', ?, ']') WHERE id = ?`,
      [reason || 'User cancelled', id]
    );

    await conn.execute(
      `UPDATE payments SET payment_status = 'failed' WHERE order_id = ? AND payment_status != 'paid'`,
      [id]
    );

    await conn.commit();

    return res.json({
      success: true,
      message: 'Order cancelled successfully and inventory stock released.'
    });
  } catch (error) {
    await conn.rollback();
    console.error('Cancel Order Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
}

/**
 * Customer: Request Return for Delivered Order
 */
async function requestReturn(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Please specify the reason for the return request.' });
    }

    const orders = await query(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    if (order.order_status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Returns can only be requested for orders that have been successfully delivered.'
      });
    }

    await query(
      `INSERT INTO returns (order_id, user_id, reason, status, refund_amount)
       VALUES (?, ?, ?, 'requested', ?)`,
      [id, userId, reason.trim(), order.total_amount]
    );

    await query(
      `UPDATE orders SET order_status = 'return_requested' WHERE id = ?`,
      [id]
    );

    return res.status(201).json({
      success: true,
      message: 'Return request submitted. Our Kalaburagi shop team will review and contact you.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  requestReturn
};
