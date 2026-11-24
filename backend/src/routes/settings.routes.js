const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticateUser, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public Store Settings & PIN Code Checker
router.get('/', settingsController.getSettings);
router.get('/pincodes', settingsController.getPincodes);
router.get('/pincodes/check/:pincode', settingsController.checkPincode);

// Admin Configuration Management
router.put('/', authenticateUser, requireAdmin, upload.single('upi_qr_file'), settingsController.updateSettings);
router.post('/pincodes', authenticateUser, requireAdmin, settingsController.addPincode);
router.put('/pincodes/:id', authenticateUser, requireAdmin, settingsController.updatePincode);
router.delete('/pincodes/:id', authenticateUser, requireAdmin, settingsController.deletePincode);

module.exports = router;
