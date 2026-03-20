const User = require('../models/User');

const getUserAnalytics = async (req, res, next) => {
    try {
        // Get all users
        const allUsers = await User.find().select('-password').lean();

        // Calculate statistics
        const totalUsers = allUsers.length;

        // Count users by role
        const usersByRole = {
            user: 0,
            owner: 0,
            admin: 0
        };

        allUsers.forEach(u => {
            if (usersByRole.hasOwnProperty(u.role)) {
                usersByRole[u.role]++;
            }
        });

        // Get users created in last 7 days
        const lastSevenDays = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            lastSevenDays[dateKey] = 0;
        }

        allUsers.forEach(user => {
            const dateKey = new Date(user.createdAt).toISOString().split('T')[0];
            if (lastSevenDays.hasOwnProperty(dateKey)) {
                lastSevenDays[dateKey]++;
            }
        });

        res.json({
            totalUsers,
            usersByRole,
            lastSevenDays,
            activeAdmins: usersByRole.admin,
            activeOwners: usersByRole.owner,
            regularUsers: usersByRole.user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserAnalytics
};
