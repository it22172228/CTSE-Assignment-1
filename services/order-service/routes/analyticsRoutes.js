const express = require('express');
const router = express.Router();
const { getOrderAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Only admins should access analytics
router.get('/', protect, getOrderAnalytics);

module.exports = router;
