const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// All admin routes protected by authenticateUser and requireAdmin
router.use(authenticateUser, requireAdmin);

// Dashboard KPI & Chart Stats
router.get('/dashboard-stats', adminController.getDashboardStats);

// Orders & Payment Verification
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.put('/orders/:id/verify-payment', adminController.verifyPayment);

// Customers & Wholesale Verification
router.get('/customers', adminController.getCustomers);
router.put('/customers/:id/verify', adminController.verifyWholesaleCustomer);

// Local Deliveries Management
router.get('/deliveries', adminController.getDeliveries);
router.put('/deliveries/:id', adminController.updateDelivery);

// Returns Management
router.get('/returns', adminController.getReturns);
router.put('/returns/:id', adminController.handleReturn);

module.exports = router;
