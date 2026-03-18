const express = require('express');
const router = express.Router();
const {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    getMenuByRestaurant,
    createMenuItem,
    getOwnerRestaurants,
    updateMenuItem,
    deleteMenuItem,
    updateRestaurant,
    deleteRestaurant
} = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');

// Public routes for browsing
router.get('/', getRestaurants);
// Owner-specific listing must come before :id to avoid route shadowing
router.get('/owner', protect, getOwnerRestaurants);
// Menu route should be before generic :id
router.get('/:id/menu', getMenuByRestaurant);
router.get('/:id', getRestaurantById);

// Protected routes for management (e.g. only authenticated users/admins)
router.post('/', protect, createRestaurant);
router.post('/:id/menu', protect, createMenuItem);
router.put('/:id/menu/:menuId', protect, updateMenuItem);
router.delete('/:id/menu/:menuId', protect, deleteMenuItem);
// Update restaurant details (owner only)
router.put('/:id', protect, updateRestaurant);
// Delete restaurant (owner or admin)
router.delete('/:id', protect, deleteRestaurant);

module.exports = router;
