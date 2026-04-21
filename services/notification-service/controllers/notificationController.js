const Notification = require('../models/Notification');

const createNotification = async (req, res, next) => {
    try {
        console.log('Incoming notification request:', req.body);
        const { userId, message } = req.body;

        if (!userId || !message) {
            res.status(400);
            throw new Error('Please add userId and message');
        }

        const notification = await Notification.create({
            userId,
            message
        });

        res.status(201).json(notification);
    } catch (error) {
        next(error);
    }
};

const getNotificationsByUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const notifications = await Notification.find({ 
            userId: { $in: [userId, 'all_users'] } 
        }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createNotification,
    getNotificationsByUser
};
