const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateUser } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/owner-login', authController.ownerLogin);
router.post('/logout', authController.logout);
router.get('/me', authenticateUser, authController.getMe);
router.put('/profile', authenticateUser, authController.updateProfile);

// Saved Addresses
router.get('/addresses', authenticateUser, authController.getAddresses);
router.post('/addresses', authenticateUser, authController.addAddress);
router.delete('/addresses/:id', authenticateUser, authController.deleteAddress);

module.exports = router;
