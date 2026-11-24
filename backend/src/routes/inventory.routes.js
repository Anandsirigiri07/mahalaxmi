const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateUser, requireAdmin, inventoryController.getInventoryStatus);
router.post('/adjust', authenticateUser, requireAdmin, inventoryController.adjustStock);
router.get('/transactions', authenticateUser, requireAdmin, inventoryController.getInventoryTransactions);

module.exports = router;
