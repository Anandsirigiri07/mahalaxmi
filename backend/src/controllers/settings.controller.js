const { query } = require('../config/db');

const ALLOWED_SETTING_KEYS = new Set([
  'store_name_en',
  'store_name_kn',
  'store_proprietor',
  'store_address',
  'store_tagline_en',
  'store_tagline_kn',
  'store_phone',
  'store_whatsapp',
  'store_email',
  'upi_id',
  'upi_name',
  'upi_qr_image',
  'default_delivery_fee',
  'free_delivery_threshold',
  'wholesale_min_order_total',
  'google_maps_embed_url'
]);

/**
 * Public: Get Business Settings as Key-Value map
 */
async function getSettings(req, res) {
  try {
    const rows = await query(`SELECT setting_key, setting_value, description FROM business_settings`);
    const settings = {};
    for (const r of rows) {
      settings[r.setting_key] = r.setting_value;
    }

    return res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get Settings Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve business settings.'
    });
  }
}

/**
 * Admin: Update Business Settings
 */
async function updateSettings(req, res) {
  try {
    const incoming = { ...req.body };

    if (req.file) {
      incoming.upi_qr_image = `/uploads/${req.file.filename}`;
    }

    for (const [key, val] of Object.entries(incoming)) {
      if (!ALLOWED_SETTING_KEYS.has(key)) continue;
      if ((typeof val === 'string' || typeof val === 'number') && val !== 'undefined' && val !== 'null') {
        await query(
          `INSERT INTO business_settings (setting_key, setting_value)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [key, String(val)]
        );
      }
    }

    return res.json({
      success: true,
      message: 'Store settings updated successfully.'
    });
  } catch (error) {
    console.error('Update Settings Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * PIN Codes Controller Methods
 */
async function getPincodes(req, res) {
  try {
    const pincodes = await query(`SELECT * FROM delivery_pincodes ORDER BY pin_code ASC`);
    return res.json({ success: true, pincodes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function checkPincode(req, res) {
  try {
    const { pincode } = req.params;
    const cleanPin = String(pincode || '').trim();
    const pincodes = await query(
      `SELECT * FROM delivery_pincodes WHERE pin_code = ? AND is_active = TRUE`,
      [cleanPin]
    );

    const thresholdRows = await query(
      `SELECT setting_value FROM business_settings WHERE setting_key = 'free_delivery_threshold'`
    );
    const freeThreshold = thresholdRows.length > 0 ? parseFloat(thresholdRows[0].setting_value) : 1500;

    if (pincodes.length === 0) {
      return res.json({
        success: false,
        is_serviceable: false,
        free_delivery_threshold: freeThreshold,
        message: `PIN code ${cleanPin} is outside our direct local delivery zone in Kalaburagi. Contact +91 98800 42188 on WhatsApp for parcel dispatch.`
      });
    }

    const pin = pincodes[0];
    return res.json({
      success: true,
      is_serviceable: true,
      locality: pin.locality_name,
      delivery_fee: parseFloat(pin.delivery_fee),
      min_order_amount: parseFloat(pin.min_order_amount),
      estimated_delivery_hours: pin.estimated_delivery_hours,
      free_delivery_threshold: freeThreshold
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function addPincode(req, res) {
  try {
    const { pin_code, locality_name, delivery_fee, min_order_amount, estimated_delivery_hours } = req.body;
    if (!pin_code || !locality_name) {
      return res.status(400).json({ success: false, message: 'PIN code and locality name are required.' });
    }

    await query(
      `INSERT INTO delivery_pincodes (pin_code, locality_name, delivery_fee, min_order_amount, estimated_delivery_hours)
       VALUES (?, ?, ?, ?, ?)`,
      [
        String(pin_code).trim(),
        locality_name.trim(),
        parseFloat(delivery_fee || 40),
        parseFloat(min_order_amount || 300),
        parseInt(estimated_delivery_hours || 24, 10)
      ]
    );

    return res.status(201).json({ success: true, message: 'PIN code delivery route added.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'This PIN code already exists.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updatePincode(req, res) {
  try {
    const { id } = req.params;
    const { locality_name, delivery_fee, min_order_amount, estimated_delivery_hours, is_active } = req.body;

    await query(
      `UPDATE delivery_pincodes
       SET locality_name = COALESCE(?, locality_name),
           delivery_fee = COALESCE(?, delivery_fee),
           min_order_amount = COALESCE(?, min_order_amount),
           estimated_delivery_hours = COALESCE(?, estimated_delivery_hours),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        locality_name ?? null,
        delivery_fee !== undefined ? parseFloat(delivery_fee) : null,
        min_order_amount !== undefined ? parseFloat(min_order_amount) : null,
        estimated_delivery_hours !== undefined ? parseInt(estimated_delivery_hours, 10) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      ]
    );

    return res.json({ success: true, message: 'PIN code configuration updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deletePincode(req, res) {
  try {
    const { id } = req.params;
    await query(`DELETE FROM delivery_pincodes WHERE id = ?`, [id]);
    return res.json({ success: true, message: 'PIN code removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  getPincodes,
  checkPincode,
  addPincode,
  updatePincode,
  deletePincode
};
