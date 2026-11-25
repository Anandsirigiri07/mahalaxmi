const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, cartController.getCart);
router.post('/add', optionalAuth, cartController.addToCart);
router.put('/mode', optionalAuth, cartController.switchCartMode);
router.put('/item/:id', optionalAuth, cartController.updateCartItem);
router.delete('/item/:id', optionalAuth, cartController.removeCartItem);
router.delete('/clear', optionalAuth, cartController.clearCart);

module.exports = router;
