const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByUser, getOrdersByRestaurant, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/:userId', protect, getOrdersByUser);
router.get('/restaurant/:restaurantId', protect, getOrdersByRestaurant);
router.put('/:orderId/status', protect, updateOrderStatus); // In reality, only admins/restaurant should do this, but protect is fine for now

module.exports = router;
