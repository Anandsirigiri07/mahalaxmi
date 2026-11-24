const { query } = require('../config/db');

async function getAllCategories(req, res) {
  try {
    const categories = await query(`
      SELECT c.*, 
             COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
      WHERE c.is_active = TRUE
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.id ASC
    `);

    return res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories: ' + error.message
    });
  }
}

async function getCategoryBySlug(req, res) {
  try {
    const { slug } = req.params;
    const categories = await query(`
      SELECT * FROM categories WHERE (slug = ? OR id = ?) AND is_active = TRUE
    `, [slug, isNaN(slug) ? 0 : parseInt(slug, 10)]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.'
      });
    }

    return res.json({
      success: true,
      category: categories[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching category: ' + error.message
    });
  }
}

async function createCategory(req, res) {
  try {
    const { name_en, name_kn, slug, description_en, description_kn, image_url, display_order } = req.body;
    if (!name_en || !name_kn || !slug) {
      return res.status(400).json({ success: false, message: 'English name, Kannada name, and slug are required.' });
    }

    const [result] = await query(
      `INSERT INTO categories (name_en, name_kn, slug, description_en, description_kn, image_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name_en, name_kn, slug, description_en || null, description_kn || null, image_url || null, display_order || 0]
    );

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      categoryId: result.insertId
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name_en, name_kn, slug, description_en, description_kn, image_url, display_order, is_active } = req.body;

    await query(
      `UPDATE categories
       SET name_en = COALESCE(?, name_en),
           name_kn = COALESCE(?, name_kn),
           slug = COALESCE(?, slug),
           description_en = COALESCE(?, description_en),
           description_kn = COALESCE(?, description_kn),
           image_url = COALESCE(?, image_url),
           display_order = COALESCE(?, display_order),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name_en, name_kn, slug, description_en, description_kn, image_url, display_order, is_active, id]
    );

    return res.json({ success: true, message: 'Category updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    // Check if category has products
    const [prodCheck] = await query(`SELECT COUNT(*) as cnt FROM products WHERE category_id = ?`, [id]);
    if (prodCheck && prodCheck.cnt > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that contains products. Reassign or delete products first.'
      });
    }

    await query(`DELETE FROM categories WHERE id = ?`, [id]);
    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
