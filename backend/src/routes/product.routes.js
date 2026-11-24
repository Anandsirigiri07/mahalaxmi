const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateUser, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public endpoints
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin endpoints (with multiple image uploads)
router.post('/', authenticateUser, requireAdmin, upload.array('images', 8), productController.createProduct);
router.put('/:id', authenticateUser, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticateUser, requireAdmin, productController.deleteProduct);

// Additional image management
router.post('/:id/images', authenticateUser, requireAdmin, upload.array('images', 8), productController.uploadProductImages);
router.delete('/images/:image_id', authenticateUser, requireAdmin, productController.deleteProductImage);

module.exports = router;
