const { query, getConnection } = require('../config/db');

/**
 * Get comprehensive inventory table for Admin
 */
async function getInventoryStatus(req, res) {
  try {
    const { status, category_id, search } = req.query;

    let sql = `
      SELECT p.id AS product_id,
             p.sku,
             p.name_en,
             p.name_kn,
             p.retail_price,
             p.wholesale_price,
             c.name_en AS category_name,
             COALESCE(i.physical_stock, 0) AS physical_stock,
             COALESCE(i.reserved_stock, 0) AS reserved_stock,
             (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) AS available_stock,
             COALESCE(i.low_stock_threshold, 5) AS low_stock_threshold,
             i.last_restocked_at,
             i.updated_at,
             CASE
               WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= 0 THEN 'out_of_stock'
               WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= COALESCE(i.low_stock_threshold, 5) THEN 'low_stock'
               ELSE 'in_stock'
             END AS stock_status,
             (
               SELECT image_url FROM product_images
               WHERE product_id = p.id
               ORDER BY is_primary DESC, display_order ASC, id ASC LIMIT 1
             ) AS primary_image
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = TRUE
    `;

    const params = [];

    if (category_id) {
      sql += ` AND p.category_id = ?`;
      params.push(category_id);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ` AND (p.name_en LIKE ? OR p.sku LIKE ?)`;
      params.push(term, term);
    }

    if (status === 'out_of_stock') {
      sql += ` AND (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= 0`;
    } else if (status === 'low_stock') {
      sql += ` AND (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) > 0 AND (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= COALESCE(i.low_stock_threshold, 5)`;
    } else if (status === 'in_stock') {
      sql += ` AND (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) > COALESCE(i.low_stock_threshold, 5)`;
    }

    sql += ` ORDER BY p.name_en ASC`;

    const inventory = await query(sql, params);

    const [counts] = await query(`
      SELECT 
        COUNT(CASE WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) > COALESCE(i.low_stock_threshold, 5) THEN 1 END) AS in_stock,
        COUNT(CASE WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) > 0 AND (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= COALESCE(i.low_stock_threshold, 5) THEN 1 END) AS low_stock,
        COUNT(CASE WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= 0 THEN 1 END) AS out_of_stock,
        COUNT(p.id) AS total_items
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = TRUE
    `);

    return res.json({
      success: true,
      summary: counts || { in_stock: 0, low_stock: 0, out_of_stock: 0, total_items: 0 },
      inventory
    });
  } catch (error) {
    console.error('Get Inventory Status Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory: ' + error.message,
      summary: { in_stock: 0, low_stock: 0, out_of_stock: 0, total_items: 0 },
      inventory: []
    });
  }
}

/**
 * Admin: Manual Stock Adjustment
 */
async function adjustStock(req, res) {
  const conn = await getConnection();
  try {
    const { product_id, action, quantity, low_stock_threshold, reason } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    if (!['add', 'deduct', 'set'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be add, deduct, or set.' });
    }

    const qtyChange = parseInt(quantity, 10);
    if (isNaN(qtyChange) || qtyChange < 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a non-negative integer.' });
    }

    await conn.beginTransaction();

    const [rows] = await conn.execute(
      `SELECT * FROM inventory WHERE product_id = ? FOR UPDATE`,
      [product_id]
    );

    let currentInv = rows.length > 0 ? rows[0] : null;

    if (!currentInv) {
      await conn.execute(
        `INSERT INTO inventory (product_id, physical_stock, reserved_stock, low_stock_threshold)
         VALUES (?, 0, 0, 5)`,
        [product_id]
      );
      currentInv = { physical_stock: 0, reserved_stock: 0, low_stock_threshold: 5 };
    }

    const prevPhysical = currentInv.physical_stock;
    const prevReserved = currentInv.reserved_stock;
    let newPhysical = prevPhysical;
    let newThreshold = currentInv.low_stock_threshold;

    if (action === 'add') {
      newPhysical = prevPhysical + qtyChange;
    } else if (action === 'deduct') {
      newPhysical = Math.max(0, prevPhysical - qtyChange);
    } else if (action === 'set') {
      newPhysical = Math.max(0, qtyChange);
    }

    if (low_stock_threshold !== undefined && low_stock_threshold !== null && low_stock_threshold !== '') {
      const parsedThresh = parseInt(low_stock_threshold, 10);
      if (!isNaN(parsedThresh)) {
        newThreshold = Math.max(1, parsedThresh);
      }
    }

    await conn.execute(
      `UPDATE inventory
       SET physical_stock = ?,
           low_stock_threshold = ?,
           last_restocked_at = CASE WHEN ? > ? THEN NOW() ELSE last_restocked_at END,
           updated_at = NOW()
       WHERE product_id = ?`,
      [newPhysical, newThreshold, newPhysical, prevPhysical, product_id]
    );

    const actualDiff = newPhysical - prevPhysical;
    await conn.execute(
      `INSERT INTO inventory_transactions
       (product_id, transaction_type, quantity, previous_physical_stock, new_physical_stock, previous_reserved_stock, new_reserved_stock, reference_id, created_by_user_id, notes)
       VALUES (?, 'manual_adjustment', ?, ?, ?, ?, ?, 'MANUAL_OVERRIDE', ?, ?)`,
      [
        product_id,
        actualDiff,
        prevPhysical,
        newPhysical,
        prevReserved,
        prevReserved,
        req.user.id,
        reason ? reason.trim() : `Manual stock update (${action})`
      ]
    );

    await conn.commit();

    return res.json({
      success: true,
      message: 'Stock updated successfully.',
      inventory: {
        product_id,
        previous_physical_stock: prevPhysical,
        new_physical_stock: newPhysical,
        reserved_stock: prevReserved,
        available_stock: newPhysical - prevReserved,
        low_stock_threshold: newThreshold
      }
    });
  } catch (error) {
    await conn.rollback();
    console.error('Adjust Stock Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to adjust stock: ' + error.message
    });
  } finally {
    conn.release();
  }
}

/**
 * Admin: Get Inventory Audit Transaction Log
 */
async function getInventoryTransactions(req, res) {
  try {
    const { product_id, limit = 50 } = req.query;

    let sql = `
      SELECT it.*,
             p.sku,
             p.name_en,
             p.name_kn,
             u.full_name AS created_by_name
      FROM inventory_transactions it
      INNER JOIN products p ON it.product_id = p.id
      LEFT JOIN users u ON it.created_by_user_id = u.id
    `;
    const params = [];

    if (product_id) {
      sql += ` WHERE it.product_id = ?`;
      params.push(product_id);
    }

    sql += ` ORDER BY it.created_at DESC LIMIT ?`;
    params.push(Math.max(1, parseInt(limit, 10) || 50));

    const transactions = await query(sql, params);

    return res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Inventory Transactions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions.',
      transactions: []
    });
  }
}

module.exports = {
  getInventoryStatus,
  adjustStock,
  getInventoryTransactions
};
