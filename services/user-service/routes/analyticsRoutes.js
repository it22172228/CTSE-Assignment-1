const express = require('express');
const router = express.Router();
const { getUserAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Only admins should access analytics
router.get('/', protect, getUserAnalytics);

module.exports = router;
