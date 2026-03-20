const Order = require('../models/Order');

const getOrderAnalytics = async (req, res, next) => {
    try {
        // Get all orders
        const allOrders = await Order.find().lean();

        // Calculate statistics
        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Group orders by status
        const ordersByStatus = {};
        const statusCounts = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].forEach(status => {
            ordersByStatus[status] = allOrders.filter(o => o.status === status).length;
        });

        // Get daily orders for the last 7 days
        const lastSevenDays = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            lastSevenDays[dateKey] = 0;
        }

        allOrders.forEach(order => {
            const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
            if (lastSevenDays.hasOwnProperty(dateKey)) {
                lastSevenDays[dateKey]++;
            }
        });

        // Get revenue by restaurant
        const revenueByRestaurant = {};
        allOrders.forEach(order => {
            if (!revenueByRestaurant[order.restaurantId]) {
                revenueByRestaurant[order.restaurantId] = 0;
            }
            revenueByRestaurant[order.restaurantId] += order.total;
        });

        res.json({
            totalOrders,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
            ordersByStatus,
            lastSevenDays,
            revenueByRestaurant
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrderAnalytics
};
