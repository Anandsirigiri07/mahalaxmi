const { query } = require('../config/db');

/**
 * Public: Get Business Settings as Key-Value map
 */
async function getSettings(req, res) {
  try {
    const rows = await query(`SELECT setting_key, setting_value, description FROM business_settings`);
    const settings = {};
    for (let r of rows) {
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
    const settings = req.body;

    // Handle new UPI QR file if uploaded
    if (req.file) {
      settings['upi_qr_image'] = `/uploads/${req.file.filename}`;
    }

    for (let [key, val] of Object.entries(settings)) {
      if (typeof val === 'string' || typeof val === 'number') {
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
    const pincodes = await query(
      `SELECT * FROM delivery_pincodes WHERE pin_code = ? AND is_active = TRUE`,
      [pincode.trim()]
    );

    if (pincodes.length === 0) {
      return res.json({
        success: false,
        is_serviceable: false,
        message: `PIN code ${pincode} is outside our direct local delivery zone in Kalaburagi.`
      });
    }

    const pin = pincodes[0];
    return res.json({
      success: true,
      is_serviceable: true,
      locality: pin.locality_name,
      delivery_fee: parseFloat(pin.delivery_fee),
      min_order_amount: parseFloat(pin.min_order_amount),
      estimated_delivery_hours: pin.estimated_delivery_hours
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
      [pin_code.trim(), locality_name.trim(), delivery_fee || 40, min_order_amount || 300, estimated_delivery_hours || 24]
    );

    return res.status(201).json({ success: true, message: 'PIN code delivery route added.' });
  } catch (error) {
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
      [locality_name, delivery_fee, min_order_amount, estimated_delivery_hours, is_active, id]
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
