const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.get('/status', aiController.getAiStatus);
router.post('/stylist', aiController.getStylistAdvice);

module.exports = router;
