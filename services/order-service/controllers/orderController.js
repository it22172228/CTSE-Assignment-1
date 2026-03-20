const Order = require('../models/Order');
const axios = require('axios');

const createOrder = async (req, res, next) => {
    try {
        const { restaurantId, items, total } = req.body;

        // In a real system, you'd get userId from token, e.g. req.user.id
        // But per instructions userId might be passed, let's assume it comes from body or auth token.
        // Given we are using JWT, we have req.user from protect middleware.

        if (!restaurantId || !items || items.length === 0 || !total) {
            res.status(400);
            throw new Error('Please add all order fields');
        }

        // Validate restaurant exists via restaurant-service
        try {
            const restaurantServiceUrl = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:4000/api';
            const restaurantResponse = await axios.get(`${restaurantServiceUrl}/restaurants/${restaurantId}`);
            if (!restaurantResponse.data) {
                res.status(400);
                throw new Error('Restaurant not found');
            }
        } catch (restaurantError) {
            console.error('Failed to validate restaurant:', restaurantError.message);
            // Continue anyway - the restaurant might exist but the service is down
        }

        const order = await Order.create({
            userId: req.user.id,
            restaurantId,
            items,
            total,
            status: 'PLACED'
        });

        // Publish event to Notification Service
        try {
            const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2000/api';
            await axios.post(`${notificationUrl}/notifications`, {
                userId: req.user.id,
                message: `Your order ${order._id} has been placed successfully. Total: $${order.total}`
            });
        } catch (notificationError) {
            console.error('Failed to send notification:', notificationError.message);
            // We do not fail the order creation if notification fails
        }

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

const getOrdersByUser = async (req, res, next) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

const getOrdersByRestaurant = async (req, res, next) => {
    try {
        const orders = await Order.find({ restaurantId: req.params.restaurantId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const validStatuses = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        if (!validStatuses.includes(status)) {
            res.status(400);
            throw new Error('Invalid status');
        }

        const order = await Order.findById(req.params.orderId);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        order.status = status;
        const updatedOrder = await order.save();

        // Emit WebSocket event to user
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${order.userId}`).emit('orderStatusUpdated', {
                orderId: updatedOrder._id,
                status: updatedOrder.status,
                message: `Your order status is now: ${status}`,
                timestamp: new Date()
            });
        }

        // Publish status update event to Notification Service
        try {
            const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2000/api';
            await axios.post(`${notificationUrl}/notifications`, {
                userId: order.userId,
                message: `Your order ${order._id} status is now: ${status}`
            });
        } catch (notificationError) {
            console.error('Failed to send notification:', notificationError.message);
        }

        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getOrdersByUser,
    getOrdersByRestaurant,
    updateOrderStatus
};
