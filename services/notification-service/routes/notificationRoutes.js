const express = require('express');
const router = express.Router();
const { createNotification, getNotificationsByUser } = require('../controllers/notificationController');

// The internal event from Order Service uses this route. 
// In a completely secure environment, we'd verify a server-to-server token here.
router.post('/', createNotification);

// Let's assume fetching notifications requires the client to pass the user ID. We can add protect middleware if needed.
const { protect } = require('../middleware/authMiddleware');
router.get('/:userId', protect, getNotificationsByUser);

module.exports = router;
