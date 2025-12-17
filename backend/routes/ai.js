const express = require('express');
const router = express.Router();
const { generateDescription, enhanceDescription } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes are protected
router.post('/generate-description', protect, generateDescription);
router.post('/enhance-description', protect, enhanceDescription);

module.exports = router;
