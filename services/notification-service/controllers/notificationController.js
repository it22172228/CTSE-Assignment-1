const Notification = require('../models/Notification');

const createNotification = async (req, res, next) => {
    try {
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
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createNotification,
    getNotificationsByUser
};
