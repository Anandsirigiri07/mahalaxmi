const { query, getConnection } = require('../config/db');

/**
 * Admin Dashboard Unified Statistics
 * Zero Mock Data — All dynamic from MySQL, defaulting cleanly to 0 / empty arrays
 */
async function getDashboardStats(req, res) {
  try {
    // 1. Top Row: 4 KPI Cards
    const salesKpiRows = await query(`
      SELECT COALESCE(SUM(total_amount), 0) AS total_sales
      FROM orders
      WHERE payment_status = 'paid'
    `);
    const salesKpi = salesKpiRows?.[0] || { total_sales: 0 };

    const ordersTodayRows = await query(`
      SELECT COUNT(*) AS orders_today
      FROM orders
      WHERE DATE(created_at) = CURDATE()
    `);
    const ordersTodayKpi = ordersTodayRows?.[0] || { orders_today: 0 };

    const lowStockRows = await query(`
      SELECT COUNT(p.id) AS low_stock_items
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = TRUE
        AND (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= COALESCE(i.low_stock_threshold, 5)
    `);
    const lowStockKpi = lowStockRows?.[0] || { low_stock_items: 0 };

    const customersRows = await query(`
      SELECT COUNT(*) AS total_customers
      FROM users
      WHERE role = 'customer'
    `);
    const customersKpi = customersRows?.[0] || { total_customers: 0 };

    // 2. Middle Row: Sales Overview Area Chart (Monthly & Weekly)
    const monthlySales = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%b %Y') AS period,
        DATE_FORMAT(created_at, '%Y-%m') AS sort_key,
        COALESCE(SUM(total_amount), 0) AS sales,
        COUNT(id) AS order_count
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY period, sort_key
      ORDER BY sort_key ASC
    `);

    const weeklySales = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%d %b') AS period,
        DATE_FORMAT(created_at, '%Y-%m-%d') AS sort_key,
        COALESCE(SUM(total_amount), 0) AS sales,
        COUNT(id) AS order_count
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY period, sort_key
      ORDER BY sort_key ASC
    `);

    // 3. Middle Row Right: Inventory Status Live Counts
    const invStatusRows = await query(`
      SELECT 
        COUNT(CASE WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) > COALESCE(i.low_stock_threshold, 5) THEN 1 END) AS in_stock,
        COUNT(CASE WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) > 0 AND (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= COALESCE(i.low_stock_threshold, 5) THEN 1 END) AS low_stock,
        COUNT(CASE WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= 0 THEN 1 END) AS out_of_stock,
        COUNT(p.id) AS total_products
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = TRUE
    `);
    const invStatus = invStatusRows?.[0] || { in_stock: 0, low_stock: 0, out_of_stock: 0, total_products: 0 };

    // 4. Lower Middle Row: Top Selling Products
    const topProducts = await query(`
      SELECT 
        p.id,
        p.sku,
        p.name_en,
        p.name_kn,
        COALESCE(SUM(oi.quantity), 0) AS total_quantity_sold,
        COALESCE(SUM(oi.subtotal), 0) AS total_revenue,
        (
          SELECT image_url FROM product_images
          WHERE product_id = p.id
          ORDER BY is_primary DESC, id ASC LIMIT 1
        ) AS thumbnail
      FROM products p
      INNER JOIN order_items oi ON p.id = oi.product_id
      INNER JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
      GROUP BY p.id
      ORDER BY total_revenue DESC
      LIMIT 5
    `);

    // 5. Lower Middle Row: Recent Orders
    const recentOrders = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.order_type,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.total_amount,
        o.created_at,
        u.full_name AS customer_name,
        u.phone AS customer_phone
      FROM orders o
      INNER JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `);

    // 6. Lower Middle Row: Shipment Status Donut Data
    const shipmentRows = await query(`
      SELECT 
        COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) AS delivered,
        COUNT(CASE WHEN order_status IN ('out_for_delivery', 'processing', 'confirmed') THEN 1 END) AS on_delivery,
        COUNT(CASE WHEN order_status = 'return_requested' THEN 1 END) AS returned,
        COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) AS canceled
      FROM orders
    `);
    const shipmentCounts = shipmentRows?.[0] || { delivered: 0, on_delivery: 0, returned: 0, canceled: 0 };

    // 7. Bottom Row: Customer Activity
    const customerTypesRows = await query(`
      SELECT 
        COUNT(CASE WHEN account_type = 'retail' THEN 1 END) AS retail_count,
        COUNT(CASE WHEN account_type = 'wholesale' THEN 1 END) AS wholesale_count,
        COUNT(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) AS new_signups
      FROM users
      WHERE role = 'customer'
    `);
    const customerTypes = customerTypesRows?.[0] || { retail_count: 0, wholesale_count: 0, new_signups: 0 };

    // 8. Bottom Row: Category Performance
    const categoryPerformance = await query(`
      SELECT 
        c.id,
        c.name_en,
        c.name_kn,
        COUNT(DISTINCT p.id) AS product_count,
        COALESCE(SUM(oi.subtotal), 0) AS sales_amount
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `);

    return res.json({
      success: true,
      kpis: {
        total_sales: parseFloat(salesKpi.total_sales || 0),
        orders_today: parseInt(ordersTodayKpi.orders_today || 0, 10),
        low_stock_items: parseInt(lowStockKpi.low_stock_items || 0, 10),
        total_customers: parseInt(customersKpi.total_customers || 0, 10)
      },
      charts: {
        monthly_sales: monthlySales || [],
        weekly_sales: weeklySales || [],
        inventory_status: invStatus || { in_stock: 0, low_stock: 0, out_of_stock: 0, total_products: 0 },
        shipment_status: [
          { name: 'Delivered', value: shipmentCounts ? shipmentCounts.delivered : 0, color: '#10B981' },
          { name: 'On Delivery', value: shipmentCounts ? shipmentCounts.on_delivery : 0, color: '#F59E0B' },
          { name: 'Returned', value: shipmentCounts ? shipmentCounts.returned : 0, color: '#6366F1' },
          { name: 'Canceled', value: shipmentCounts ? shipmentCounts.canceled : 0, color: '#EF4444' }
        ],
        customer_activity: {
          active_users: parseInt(customersKpi.total_customers || 0, 10),
          new_signups: parseInt(customerTypes.new_signups || 0, 10),
          distribution: [
            { name: 'Retail', value: customerTypes ? customerTypes.retail_count : 0, color: '#D97706' },
            { name: 'Wholesale', value: customerTypes ? customerTypes.wholesale_count : 0, color: '#064E3B' }
          ]
        },
        category_performance: categoryPerformance || []
      },
      top_products: topProducts || [],
      recent_orders: recentOrders || []
    });
  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics: ' + error.message,
      kpis: { total_sales: 0, orders_today: 0, low_stock_items: 0, total_customers: 0 },
      charts: { monthly_sales: [], weekly_sales: [], inventory_status: { in_stock: 0, low_stock: 0, out_of_stock: 0 }, shipment_status: [], customer_activity: {}, category_performance: [] },
      top_products: [],
      recent_orders: []
    });
  }
}

/**
 * Admin: Get All Orders with Filter & Search
 */
async function getAllOrders(req, res) {
  try {
    const { status, payment_status, search, page = 1, limit = 20 } = req.query;

    let sql = `
      SELECT o.*,
             u.full_name AS customer_name,
             u.phone AS customer_phone,
             u.email AS customer_email,
             p.transaction_reference,
             p.payment_status AS p_payment_status,
             d.delivery_status,
             d.delivery_agent_name,
             d.delivery_agent_phone,
             COUNT(oi.id) AS item_count
      FROM orders o
      INNER JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN deliveries d ON o.id = d.order_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ` AND o.order_status = ?`;
      params.push(status);
    }
    if (payment_status) {
      sql += ` AND o.payment_status = ?`;
      params.push(payment_status);
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ` AND (o.order_number LIKE ? OR u.full_name LIKE ? OR u.phone LIKE ? OR p.transaction_reference LIKE ?)`;
      params.push(term, term, term, term);
    }

    sql += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    params.push(parseInt(limit, 10), offset);

    const orders = await query(sql, params);

    const [totalRows] = await query(`SELECT COUNT(*) as count FROM orders`);

    return res.json({
      success: true,
      orders,
      total: totalRows ? totalRows.count : 0
    });
  } catch (error) {
    console.error('Admin Get Orders Error:', error);
    return res.status(500).json({ success: false, message: error.message, orders: [] });
  }
}

/**
 * Admin: Update Order Status with Transaction-Safe Inventory State Machine
 */
async function updateOrderStatus(req, res) {
  const conn = await getConnection();
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    if (!order_status) {
      return res.status(400).json({ success: false, message: 'New order status is required.' });
    }

    await conn.beginTransaction();

    const [orders] = await conn.execute(`SELECT * FROM orders WHERE id = ? FOR UPDATE`, [id]);
    if (orders.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];
    const prevStatus = order.order_status;

    // Transitioning to 'confirmed', 'processing', or 'delivered' from 'pending'
    // In our hybrid model: 'pending' had stock reserved. If confirmed or delivered,
    // deduct from physical_stock and clear reserved_stock.
    if (['confirmed', 'processing', 'out_for_delivery', 'delivered'].includes(order_status) && prevStatus === 'pending') {
      const [items] = await conn.execute(`SELECT * FROM order_items WHERE order_id = ?`, [id]);

      for (let item of items) {
        const [invRows] = await conn.execute(
          `SELECT physical_stock, reserved_stock FROM inventory WHERE product_id = ? FOR UPDATE`,
          [item.product_id]
        );

        if (invRows.length > 0) {
          const inv = invRows[0];
          const newPhysical = Math.max(0, inv.physical_stock - item.quantity);
          const newReserved = Math.max(0, inv.reserved_stock - item.quantity);

          await conn.execute(
            `UPDATE inventory SET physical_stock = ?, reserved_stock = ? WHERE product_id = ?`,
            [newPhysical, newReserved, item.product_id]
          );

          await conn.execute(
            `INSERT INTO inventory_transactions
             (product_id, transaction_type, quantity, previous_physical_stock, new_physical_stock, previous_reserved_stock, new_reserved_stock, reference_id, created_by_user_id, notes)
             VALUES (?, 'order_fulfilled', ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.product_id,
              item.quantity,
              inv.physical_stock,
              newPhysical,
              inv.reserved_stock,
              newReserved,
              order.order_number,
              req.user.id,
              `Stock deducted upon order status change to ${order_status}`
            ]
          );
        }
      }
    } else if (order_status === 'cancelled' && prevStatus !== 'cancelled') {
      // Release reserved stock if was pending
      const [items] = await conn.execute(`SELECT * FROM order_items WHERE order_id = ?`, [id]);
      for (let item of items) {
        const [invRows] = await conn.execute(
          `SELECT physical_stock, reserved_stock FROM inventory WHERE product_id = ? FOR UPDATE`,
          [item.product_id]
        );
        if (invRows.length > 0) {
          const inv = invRows[0];
          if (prevStatus === 'pending') {
            const newReserved = Math.max(0, inv.reserved_stock - item.quantity);
            await conn.execute(`UPDATE inventory SET reserved_stock = ? WHERE product_id = ?`, [newReserved, item.product_id]);
          } else {
            // If already deducted physical, restore it
            const newPhysical = inv.physical_stock + item.quantity;
            await conn.execute(`UPDATE inventory SET physical_stock = ? WHERE product_id = ?`, [newPhysical, item.product_id]);
          }

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
              inv.reserved_stock,
              order.order_number,
              req.user.id,
              `Stock restored/released upon cancellation by admin`
            ]
          );
        }
      }
    }

    await conn.execute(`UPDATE orders SET order_status = ? WHERE id = ?`, [order_status, id]);

    // Update Delivery status if out for delivery / delivered
    if (order_status === 'out_for_delivery') {
      await conn.execute(`UPDATE deliveries SET delivery_status = 'out_for_delivery', dispatched_at = NOW() WHERE order_id = ?`, [id]);
    } else if (order_status === 'delivered') {
      await conn.execute(`UPDATE deliveries SET delivery_status = 'delivered', delivered_at = NOW() WHERE order_id = ?`, [id]);
      // If payment was COD, mark as paid upon delivery
      if (order.payment_method === 'cod') {
        await conn.execute(`UPDATE orders SET payment_status = 'paid' WHERE id = ?`, [id]);
        await conn.execute(`UPDATE payments SET payment_status = 'paid', verified_at = NOW() WHERE order_id = ?`, [id]);
      }
    }

    await conn.commit();

    return res.json({
      success: true,
      message: `Order #${order.order_number} status updated to ${order_status}.`
    });
  } catch (error) {
    await conn.rollback();
    console.error('Update Order Status Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
}

/**
 * Admin: One-Click UPI Payment Verification
 */
async function verifyPayment(req, res) {
  try {
    const { id } = req.params;
    const { status = 'paid', remarks } = req.body; // 'paid' or 'failed'
    const adminId = req.user.id;

    await query(
      `UPDATE payments
       SET payment_status = ?,
           verified_by_user_id = ?,
           verified_at = NOW(),
           admin_remarks = ?
       WHERE order_id = ?`,
      [status, adminId, remarks || 'Verified by Admin', id]
    );

    await query(
      `UPDATE orders SET payment_status = ? WHERE id = ?`,
      [status, id]
    );

    return res.json({
      success: true,
      message: status === 'paid' ? 'Payment confirmed and verified successfully!' : 'Payment marked as rejected/failed.'
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: Customers Management
 */
async function getCustomers(req, res) {
  try {
    const { account_type, verification_status, search } = req.query;

    let sql = `
      SELECT u.id, u.full_name, u.email, u.phone, u.role, u.account_type, u.is_active, u.created_at,
             cp.shop_name, cp.gst_number, cp.verification_status, cp.admin_notes, cp.verified_at,
             COUNT(DISTINCT o.id) AS total_orders,
             COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) AS total_spent
      FROM users u
      LEFT JOIN customer_profiles cp ON u.id = cp.user_id
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
    `;
    const params = [];

    if (account_type) {
      sql += ` AND u.account_type = ?`;
      params.push(account_type);
    }

    if (verification_status) {
      sql += ` AND cp.verification_status = ?`;
      params.push(verification_status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR cp.shop_name LIKE ?)`;
      params.push(term, term, term, term);
    }

    sql += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const customers = await query(sql, params);

    return res.json({
      success: true,
      customers
    });
  } catch (error) {
    console.error('Get Customers Error:', error);
    return res.status(500).json({ success: false, message: error.message, customers: [] });
  }
}

/**
 * Admin: Verify / Approve / Reject Wholesale Buyer
 */
async function verifyWholesaleCustomer(req, res) {
  try {
    const { id } = req.params; // user_id
    const { verification_status, admin_notes } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(verification_status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status.' });
    }

    await query(
      `UPDATE customer_profiles
       SET verification_status = ?,
           admin_notes = ?,
           verified_at = CASE WHEN ? = 'approved' THEN NOW() ELSE verified_at END
       WHERE user_id = ?`,
      [verification_status, admin_notes || null, verification_status, id]
    );

    return res.json({
      success: true,
      message: `Customer wholesale status updated to ${verification_status}.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: Get and Update Local Kalaburagi Deliveries
 */
async function getDeliveries(req, res) {
  try {
    const deliveries = await query(`
      SELECT d.*,
             o.order_number,
             o.total_amount,
             o.shipping_address_json,
             u.full_name AS customer_name,
             u.phone AS customer_phone
      FROM deliveries d
      INNER JOIN orders o ON d.order_id = o.id
      INNER JOIN users u ON o.user_id = u.id
      ORDER BY d.created_at DESC
    `);
    return res.json({ success: true, deliveries });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateDelivery(req, res) {
  try {
    const { id } = req.params;
    const { delivery_agent_name, delivery_agent_phone, delivery_status, tracking_notes } = req.body;

    await query(
      `UPDATE deliveries
       SET delivery_agent_name = COALESCE(?, delivery_agent_name),
           delivery_agent_phone = COALESCE(?, delivery_agent_phone),
           delivery_status = COALESCE(?, delivery_status),
           tracking_notes = COALESCE(?, tracking_notes),
           dispatched_at = CASE WHEN ? = 'out_for_delivery' THEN NOW() ELSE dispatched_at END,
           delivered_at = CASE WHEN ? = 'delivered' THEN NOW() ELSE delivered_at END
       WHERE id = ?`,
      [delivery_agent_name, delivery_agent_phone, delivery_status, tracking_notes, delivery_status, delivery_status, id]
    );

    return res.json({ success: true, message: 'Delivery details updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: Returns Management
 */
async function getReturns(req, res) {
  try {
    const returns = await query(`
      SELECT r.*,
             o.order_number,
             o.total_amount,
             u.full_name AS customer_name,
             u.phone AS customer_phone
      FROM returns r
      INNER JOIN orders o ON r.order_id = o.id
      INNER JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    return res.json({ success: true, returns });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function handleReturn(req, res) {
  try {
    const { id } = req.params;
    const { status, admin_notes, refund_amount } = req.body; // 'approved', 'rejected', 'completed'

    await query(
      `UPDATE returns
       SET status = ?,
           admin_notes = ?,
           refund_amount = COALESCE(?, refund_amount)
       WHERE id = ?`,
      [status, admin_notes || null, refund_amount, id]
    );

    return res.json({ success: true, message: `Return request marked as ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  verifyPayment,
  getCustomers,
  verifyWholesaleCustomer,
  getDeliveries,
  updateDelivery,
  getReturns,
  handleReturn
};
