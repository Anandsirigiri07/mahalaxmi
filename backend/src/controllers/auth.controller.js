const bcrypt = require('bcryptjs');
const { query, getConnection } = require('../config/db');
const { generateToken, cookieOptions } = require('../config/jwt');

/**
 * Merge any guest session cart items into the logged-in user's cart
 */
async function mergeGuestCart(userId, sessionId) {
  if (!userId || !sessionId || sessionId === 'guest') return;
  try {
    const guestCarts = await query(
      `SELECT id FROM carts WHERE session_id = ? AND user_id IS NULL LIMIT 1`,
      [sessionId]
    );
    if (!guestCarts || guestCarts.length === 0) return;
    const guestCartId = guestCarts[0].id;
    const guestItems = await query(`SELECT * FROM cart_items WHERE cart_id = ?`, [guestCartId]);
    if (!guestItems || guestItems.length === 0) return;

    const userCarts = await query(`SELECT id FROM carts WHERE user_id = ? LIMIT 1`, [userId]);
    let userCartId;
    if (userCarts && userCarts.length > 0) {
      userCartId = userCarts[0].id;
    } else {
      const created = await query(
        `INSERT INTO carts (user_id, session_id, cart_type) VALUES (?, ?, 'retail')`,
        [userId, sessionId]
      );
      userCartId = created.insertId;
    }

    for (const gi of guestItems) {
      const existing = await query(
        `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`,
        [userCartId, gi.product_id]
      );
      if (existing && existing.length > 0) {
        await query(`UPDATE cart_items SET quantity = ? WHERE id = ?`, [
          existing[0].quantity + gi.quantity,
          existing[0].id
        ]);
      } else {
        await query(
          `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, is_wholesale_pricing)
           VALUES (?, ?, ?, ?, ?)`,
          [userCartId, gi.product_id, gi.quantity, gi.unit_price, gi.is_wholesale_pricing ? 1 : 0]
        );
      }
      await query(`DELETE FROM cart_items WHERE id = ?`, [gi.id]);
    }
  } catch (err) {
    console.warn('Guest cart merge notice:', err.message);
  }
}

/**
 * Register a new user (Retail or Wholesale)
 */
async function register(req, res) {
  const conn = await getConnection();
  try {
    const {
      full_name,
      email,
      phone,
      password,
      account_type,
      shop_name,
      business_name,
      gst_number,
      gstin
    } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, phone, and password.'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check existing email
    const existing = await query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const resolvedAccountType = account_type === 'wholesale' ? 'wholesale' : 'retail';
    const resolvedShopName = (shop_name || business_name || '').trim() || null;
    const resolvedGstNumber = (gst_number || gstin || '').trim() || null;

    await conn.beginTransaction();

    const [userResult] = await conn.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role, account_type, is_active)
       VALUES (?, ?, ?, ?, 'customer', ?, TRUE)`,
      [full_name.trim(), normalizedEmail, String(phone).trim(), password_hash, resolvedAccountType]
    );

    const userId = userResult.insertId;

    if (resolvedAccountType === 'wholesale') {
      await conn.execute(
        `INSERT INTO customer_profiles (user_id, shop_name, gst_number, verification_status)
         VALUES (?, ?, ?, 'pending')`,
        [userId, resolvedShopName, resolvedGstNumber]
      );
    }

    await conn.commit();

    await mergeGuestCart(userId, req.headers['x-session-id']);

    const token = generateToken({ id: userId, email: normalizedEmail, role: 'customer' });
    res.cookie('token', token, cookieOptions);

    return res.status(201).json({
      success: true,
      message: resolvedAccountType === 'wholesale'
        ? 'Wholesale account created successfully! Verification is pending Admin approval.'
        : 'Retail account created successfully!',
      token,
      user: {
        id: userId,
        full_name: full_name.trim(),
        email: normalizedEmail,
        phone: String(phone).trim(),
        role: 'customer',
        account_type: resolvedAccountType,
        shop_name: resolvedShopName,
        gst_number: resolvedGstNumber,
        verification_status: resolvedAccountType === 'wholesale' ? 'pending' : null
      }
    });
  } catch (error) {
    await conn.rollback();
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration: ' + error.message
    });
  } finally {
    conn.release();
  }
}

/**
 * Login User (Admin or Customer)
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.'
      });
    }

    const users = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.password_hash, u.role, u.account_type, u.is_active,
              cp.shop_name, cp.gst_number, cp.verification_status
       FROM users u
       LEFT JOIN customer_profiles cp ON u.id = cp.user_id
       WHERE u.email = ?`,
      [String(email).trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.'
      });
    }

    const isMatch = Boolean(user.password_hash) && bcrypt.compareSync(String(password), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    await mergeGuestCart(user.id, req.headers['x-session-id']);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, cookieOptions);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        account_type: user.account_type,
        shop_name: user.shop_name || null,
        gst_number: user.gst_number || null,
        verification_status: user.verification_status || null
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
}

/**
 * Check Owner Configuration Status (without exposing owner credentials)
 */
async function getOwnerStatus(req, res) {
  try {
    const owners = await query(
      `SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE ORDER BY id ASC LIMIT 1`
    );

    const isRegistered = Boolean(owners && owners.length > 0);
    return res.json({
      success: true,
      isRegistered,
      registrationClosed: true,
      owner: null,
      message: isRegistered
        ? 'Authorized owner account configured. Sign in with your owner email and password.'
        : 'No owner account configured yet. Owner login is locked until owner credentials are set.'
    });
  } catch (error) {
    console.error('Owner Status Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Public owner registration is disabled; owner credentials must be configured explicitly
 */
async function ownerRegister(req, res) {
  return res.status(403).json({
    success: false,
    message: 'Owner self-registration is disabled. Only an explicitly configured owner email and password can access the Owner Portal.'
  });
}

/**
 * Owner / Proprietor Direct Gateway (strict email + password only)
 */
async function ownerLogin(req, res) {
  try {
    const { email, identifier, password, pin } = req.body;
    const cleanEmail = String(email || identifier || '').trim().toLowerCase();
    const cleanSecret = String(password || pin || '').trim();

    if (!cleanEmail || !cleanSecret) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your authorized Owner Email and Password.'
      });
    }

    const adminUsers = await query("SELECT * FROM users WHERE role = 'admin' AND is_active = TRUE");
    if (!adminUsers || adminUsers.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'No owner account is currently configured. Owner access is locked.'
      });
    }

    const matched = adminUsers.find(
      u => u.email && u.email.toLowerCase() === cleanEmail
    );

    if (!matched) {
      const customerMatch = await query("SELECT id FROM users WHERE email = ? AND role = 'customer' LIMIT 1", [cleanEmail]);
      if (customerMatch && customerMatch.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Customer accounts cannot access the Owner Portal. Please use Customer Sign-In.'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid Owner Email or Password.'
      });
    }

    const isSecretMatch = Boolean(matched.password_hash) && bcrypt.compareSync(cleanSecret, matched.password_hash);
    if (!isSecretMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Owner Email or Password. Access denied.'
      });
    }

    const token = generateToken({ id: matched.id, email: matched.email, role: 'admin' });
    res.cookie('token', token, cookieOptions);

    return res.json({
      success: true,
      message: `Welcome, ${matched.full_name}. Owner access granted.`,
      token,
      user: {
        id: matched.id,
        full_name: matched.full_name,
        email: matched.email,
        phone: matched.phone,
        role: 'admin',
        account_type: matched.account_type
      }
    });
  } catch (error) {
    console.error('Owner Login Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Current Logged-in User Info
 */
async function getMe(req, res) {
  try {
    const addresses = await query(
      `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    );

    return res.json({
      success: true,
      user: {
        ...req.user,
        addresses
      }
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.'
    });
  }
}

/**
 * Logout
 */
function logout(req, res) {
  res.clearCookie('token');
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
}

/**
 * Update Profile
 */
async function updateProfile(req, res) {
  try {
    const { full_name, phone, shop_name, business_name, gst_number, gstin } = req.body;
    const userId = req.user.id;

    await query(
      `UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?`,
      [full_name ? full_name.trim() : null, phone ? String(phone).trim() : null, userId]
    );

    if (req.user.account_type === 'wholesale') {
      const resolvedShop = shop_name !== undefined ? shop_name : business_name;
      const resolvedGst = gst_number !== undefined ? gst_number : gstin;
      await query(
        `INSERT INTO customer_profiles (user_id, shop_name, gst_number)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE shop_name = VALUES(shop_name), gst_number = VALUES(gst_number)`,
        [userId, resolvedShop ?? null, resolvedGst ?? null]
      );
    }

    const updatedUsers = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.account_type, u.is_active,
              cp.shop_name, cp.gst_number, cp.verification_status
       FROM users u
       LEFT JOIN customer_profiles cp ON u.id = cp.user_id
       WHERE u.id = ?`,
      [userId]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUsers[0] || req.user
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.'
    });
  }
}

/**
 * Saved Addresses CRUD
 */
async function getAddresses(req, res) {
  try {
    const addresses = await query(
      `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function addAddress(req, res) {
  try {
    const { label, recipient_name, phone, address_line1, address_line2, landmark, city, state, pin_code, is_default } = req.body;

    if (!recipient_name || !phone || !address_line1 || !pin_code) {
      return res.status(400).json({
        success: false,
        message: 'Recipient name, phone, address line 1, and PIN code are required.'
      });
    }

    if (is_default) {
      await query(`UPDATE addresses SET is_default = FALSE WHERE user_id = ?`, [req.user.id]);
    }

    const result = await query(
      `INSERT INTO addresses (user_id, label, recipient_name, phone, address_line1, address_line2, landmark, city, state, pin_code, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        label || 'Shop',
        recipient_name.trim(),
        String(phone).trim(),
        address_line1.trim(),
        address_line2 ? address_line2.trim() : null,
        landmark ? landmark.trim() : null,
        city || 'Kalaburagi',
        state || 'Karnataka',
        String(pin_code).trim(),
        is_default ? 1 : 0
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      addressId: result.insertId
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteAddress(req, res) {
  try {
    const addressId = req.params.id;
    const result = await query(`DELETE FROM addresses WHERE id = ? AND user_id = ?`, [addressId, req.user.id]);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    return res.json({ success: true, message: 'Address removed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  register,
  login,
  getOwnerStatus,
  ownerRegister,
  ownerLogin,
  getMe,
  logout,
  updateProfile,
  getAddresses,
  addAddress,
  deleteAddress
};
