const { verifyToken } = require('../config/jwt');
const { query } = require('../config/db');

/**
 * Authenticates user from Bearer header or cookie
 */
async function authenticateUser(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.'
      });
    }

    // Fetch user details from database
    const users = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.account_type, u.is_active,
              cp.shop_name, cp.gst_number, cp.verification_status
       FROM users u
       LEFT JOIN customer_profiles cp ON u.id = cp.user_id
       WHERE u.id = ? AND u.is_active = TRUE`,
      [decoded.id]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated.'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication verification failure.'
    });
  }
}

/**
 * Optional authentication middleware: attaches user if present, doesn't block if guest
 */
async function optionalAuth(req, res, next) {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const users = await query(
          `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.account_type, u.is_active,
                  cp.shop_name, cp.gst_number, cp.verification_status
           FROM users u
           LEFT JOIN customer_profiles cp ON u.id = cp.user_id
           WHERE u.id = ? AND u.is_active = TRUE`,
          [decoded.id]
        );
        if (users && users.length > 0) {
          req.user = users[0];
        }
      }
    }
  } catch (err) {
    // Non-blocking for optional
    req.user = null;
  }
  next();
}

/**
 * Restrict to Admin role only
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.'
    });
  }
  next();
}

/**
 * Restrict to verified Wholesale account
 */
function requireVerifiedWholesale(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required for wholesale operations.'
    });
  }

  if (req.user.role === 'admin') {
    return next(); // Admins bypass wholesale restriction
  }

  if (req.user.account_type !== 'wholesale') {
    return res.status(403).json({
      success: false,
      message: 'This action is reserved for Wholesale buyers. Please upgrade your account.'
    });
  }

  if (req.user.verification_status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Your Wholesale business verification is still pending Admin approval.'
    });
  }

  next();
}

module.exports = {
  authenticateUser,
  optionalAuth,
  requireAdmin,
  requireVerifiedWholesale
};
