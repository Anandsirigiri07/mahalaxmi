const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.post('/', authenticateUser, requireAdmin, categoryController.createCategory);
router.put('/:id', authenticateUser, requireAdmin, categoryController.updateCategory);
router.delete('/:id', authenticateUser, requireAdmin, categoryController.deleteCategory);

module.exports = router;
