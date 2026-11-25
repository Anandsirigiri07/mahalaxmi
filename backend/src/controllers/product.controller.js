const { query, getConnection } = require('../config/db');

/**
 * Get public products with search, category filter, dual pricing, and stock status
 */
async function getProducts(req, res) {
  try {
    const { category_id, search, min_price, max_price, sort } = req.query;
    const category_slug = req.query.category_slug || req.query.category;

    let sql = `
      SELECT p.*,
             c.name_en AS category_name_en,
             c.name_kn AS category_name_kn,
             c.slug AS category_slug,
             COALESCE(i.physical_stock, 0) AS physical_stock,
             COALESCE(i.reserved_stock, 0) AS reserved_stock,
             (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) AS available_stock,
             COALESCE(i.low_stock_threshold, 5) AS low_stock_threshold,
             CASE
               WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= 0 THEN 'out_of_stock'
               WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= COALESCE(i.low_stock_threshold, 5) THEN 'low_stock'
               ELSE 'in_stock'
             END AS stock_status,
             (
               SELECT image_url FROM product_images
               WHERE product_id = p.id
               ORDER BY is_primary DESC, display_order ASC, id ASC
               LIMIT 1
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
    } else if (category_slug) {
      sql += ` AND c.slug = ?`;
      params.push(category_slug);
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      sql += ` AND (p.name_en LIKE ? OR p.name_kn LIKE ? OR p.sku LIKE ? OR p.description_en LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (min_price !== undefined && min_price !== '') {
      const minP = parseFloat(min_price);
      if (!isNaN(minP)) {
        sql += ` AND p.retail_price >= ?`;
        params.push(minP);
      }
    }
    if (max_price !== undefined && max_price !== '') {
      const maxP = parseFloat(max_price);
      if (!isNaN(maxP)) {
        sql += ` AND p.retail_price <= ?`;
        params.push(maxP);
      }
    }

    switch (sort) {
      case 'price_asc':
        sql += ` ORDER BY p.retail_price ASC`;
        break;
      case 'price_desc':
        sql += ` ORDER BY p.retail_price DESC`;
        break;
      case 'wholesale_asc':
        sql += ` ORDER BY p.wholesale_price ASC`;
        break;
      case 'newest':
        sql += ` ORDER BY p.created_at DESC`;
        break;
      default:
        sql += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
    }

    const products = await query(sql, params);

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products: ' + error.message,
      products: []
    });
  }
}

/**
 * Get Single Product Details with images, variants, and live inventory
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const products = await query(
      `SELECT p.*,
              c.name_en AS category_name_en,
              c.name_kn AS category_name_kn,
              c.slug AS category_slug,
              COALESCE(i.physical_stock, 0) AS physical_stock,
              COALESCE(i.reserved_stock, 0) AS reserved_stock,
              (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) AS available_stock,
              COALESCE(i.low_stock_threshold, 5) AS low_stock_threshold,
              CASE
                WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= 0 THEN 'out_of_stock'
                WHEN (COALESCE(i.physical_stock, 0) - COALESCE(i.reserved_stock, 0)) <= COALESCE(i.low_stock_threshold, 5) THEN 'low_stock'
                ELSE 'in_stock'
              END AS stock_status
       FROM products p
       INNER JOIN categories c ON p.category_id = c.id
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const product = products[0];

    const images = await query(
      `SELECT id, image_url, is_primary, display_order FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC, id ASC`,
      [id]
    );

    const variants = await query(
      `SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE ORDER BY id ASC`,
      [id]
    );

    const primaryImage = product.primary_image || images[0]?.image_url || '/assets/products/kada-1250.jpg';
    const craftImage = product.craft_image || images[1]?.image_url || null;

    return res.json({
      success: true,
      product: {
        ...product,
        primary_image: primaryImage,
        craft_image: craftImage,
        images,
        variants
      }
    });
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product.'
    });
  }
}

/**
 * Admin: Create New Product with photo uploads, variants, and initial inventory
 */
async function createProduct(req, res) {
  const conn = await getConnection();
  try {
    const {
      category_id,
      sku,
      name_en,
      name_kn,
      description_en,
      description_kn,
      retail_price,
      wholesale_price,
      moq,
      initial_stock,
      low_stock_threshold,
      variants,
      is_featured
    } = req.body;

    if (!category_id || !sku || !name_en || retail_price === undefined || wholesale_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Category, SKU, English Name, Retail Price, and Wholesale Price are required.'
      });
    }

    const parsedRetail = parseFloat(retail_price);
    const parsedWholesale = parseFloat(wholesale_price);
    const parsedMoq = parseInt(moq || 1, 10);
    const stockQty = parseInt(initial_stock ?? 0, 10);
    const lowThresh = Math.max(1, parseInt(low_stock_threshold || 5, 10));

    if (isNaN(parsedRetail) || parsedRetail <= 0 || isNaN(parsedWholesale) || parsedWholesale <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Retail and wholesale prices must be positive numbers.'
      });
    }

    if (isNaN(parsedMoq) || parsedMoq < 1 || isNaN(stockQty) || stockQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'MOQ must be at least 1 and initial stock cannot be negative.'
      });
    }

    const [existing] = await conn.execute(`SELECT id FROM products WHERE sku = ?`, [sku.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Product SKU "${sku}" already exists. Please choose a unique SKU.`
      });
    }

    await conn.beginTransaction();

    const [prodResult] = await conn.execute(
      `INSERT INTO products (category_id, sku, name_en, name_kn, description_en, description_kn, retail_price, wholesale_price, moq, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [
        parseInt(category_id, 10),
        sku.trim(),
        name_en.trim(),
        name_kn ? name_kn.trim() : name_en.trim(),
        description_en || null,
        description_kn || null,
        parsedRetail,
        parsedWholesale,
        parsedMoq,
        is_featured === true || is_featured === 'true' ? 1 : 0
      ]
    );

    const productId = prodResult.insertId;

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/${file.filename}`;
        const isPrimary = i === 0;
        await conn.execute(
          `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
           VALUES (?, ?, ?, ?)`,
          [productId, imageUrl, isPrimary ? 1 : 0, i]
        );
      }
    }

    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      } catch (e) {
        parsedVariants = [];
      }
    }

    if (Array.isArray(parsedVariants)) {
      for (const v of parsedVariants) {
        if (v.variant_name) {
          const varSku = v.sku || `${sku.trim()}-${v.variant_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          await conn.execute(
            `INSERT INTO product_variants (product_id, sku, variant_name, additional_price, stock_quantity, is_active)
             VALUES (?, ?, ?, ?, ?, TRUE)`,
            [productId, varSku, v.variant_name, parseFloat(v.additional_price || 0), parseInt(v.stock_quantity || 0, 10)]
          );
        }
      }
    }

    await conn.execute(
      `INSERT INTO inventory (product_id, physical_stock, reserved_stock, low_stock_threshold, last_restocked_at)
       VALUES (?, ?, 0, ?, NOW())`,
      [productId, stockQty, lowThresh]
    );

    await conn.execute(
      `INSERT INTO inventory_transactions (product_id, transaction_type, quantity, previous_physical_stock, new_physical_stock, previous_reserved_stock, new_reserved_stock, reference_id, created_by_user_id, notes)
       VALUES (?, 'restock', ?, 0, ?, 0, 0, 'INITIAL_UPLOAD', ?, 'Initial stock on product creation')`,
      [productId, stockQty, stockQty, req.user ? req.user.id : null]
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully with initial inventory.',
      productId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Create Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product: ' + error.message
    });
  } finally {
    conn.release();
  }
}

/**
 * Admin: Update Product
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const {
      category_id,
      name_en,
      name_kn,
      description_en,
      description_kn,
      retail_price,
      wholesale_price,
      moq,
      is_active,
      is_featured
    } = req.body;

    if (retail_price !== undefined && (isNaN(parseFloat(retail_price)) || parseFloat(retail_price) <= 0)) {
      return res.status(400).json({ success: false, message: 'Retail price must be a positive number.' });
    }
    if (wholesale_price !== undefined && (isNaN(parseFloat(wholesale_price)) || parseFloat(wholesale_price) <= 0)) {
      return res.status(400).json({ success: false, message: 'Wholesale price must be a positive number.' });
    }

    const result = await query(
      `UPDATE products
       SET category_id = COALESCE(?, category_id),
           name_en = COALESCE(?, name_en),
           name_kn = COALESCE(?, name_kn),
           description_en = COALESCE(?, description_en),
           description_kn = COALESCE(?, description_kn),
           retail_price = COALESCE(?, retail_price),
           wholesale_price = COALESCE(?, wholesale_price),
           moq = COALESCE(?, moq),
           is_active = COALESCE(?, is_active),
           is_featured = COALESCE(?, is_featured)
       WHERE id = ?`,
      [
        category_id !== undefined ? parseInt(category_id, 10) : null,
        name_en ?? null,
        name_kn ?? null,
        description_en ?? null,
        description_kn ?? null,
        retail_price !== undefined ? parseFloat(retail_price) : null,
        wholesale_price !== undefined ? parseFloat(wholesale_price) : null,
        moq !== undefined ? parseInt(moq, 10) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        id
      ]
    );

    if (result && result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({
      success: true,
      message: 'Product updated successfully.'
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product.'
    });
  }
}

/**
 * Admin: Delete Product
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const [orderCheck] = await query(`SELECT COUNT(*) as cnt FROM order_items WHERE product_id = ?`, [id]);
    if (orderCheck && orderCheck.cnt > 0) {
      await query(`UPDATE products SET is_active = FALSE WHERE id = ?`, [id]);
      return res.json({
        success: true,
        message: 'Product is linked to previous customer orders, so it has been deactivated instead of deleted.'
      });
    }

    const result = await query(`DELETE FROM products WHERE id = ?`, [id]);
    if (result && result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({
      success: true,
      message: 'Product deleted permanently.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product: ' + error.message
    });
  }
}

/**
 * Admin: Add More Photos to an existing Product
 */
async function uploadProductImages(req, res) {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded.' });
    }

    const [existingCount] = await query(`SELECT COUNT(*) as cnt FROM product_images WHERE product_id = ?`, [id]);
    const startOrder = existingCount ? existingCount.cnt : 0;

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const imageUrl = `/uploads/${file.filename}`;
      const isPrimary = startOrder === 0 && i === 0;
      await query(
        `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
         VALUES (?, ?, ?, ?)`,
        [id, imageUrl, isPrimary ? 1 : 0, startOrder + i]
      );
    }

    return res.json({
      success: true,
      message: 'Photos uploaded successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin: Delete Product Image
 */
async function deleteProductImage(req, res) {
  try {
    const { image_id } = req.params;
    await query(`DELETE FROM product_images WHERE id = ?`, [image_id]);
    return res.json({ success: true, message: 'Image deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage
};
