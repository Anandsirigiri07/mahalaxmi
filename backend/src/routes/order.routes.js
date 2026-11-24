const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticateUser } = require('../middleware/auth');

router.post('/', authenticateUser, orderController.placeOrder);
router.get('/my-orders', authenticateUser, orderController.getMyOrders);
router.get('/:id', authenticateUser, orderController.getOrderDetails);
router.post('/:id/cancel', authenticateUser, orderController.cancelOrder);
router.post('/:id/return', authenticateUser, orderController.requestReturn);

module.exports = router;
