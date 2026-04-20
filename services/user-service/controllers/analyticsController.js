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

        // Get monthly user registrations for the last 12 months
        const monthlyRegistrations = {};
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyRegistrations[monthKey] = 0;
        }

        allUsers.forEach(user => {
            const userDate = new Date(user.createdAt);
            const monthKey = `${userDate.getFullYear()}-${String(userDate.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyRegistrations.hasOwnProperty(monthKey)) {
                monthlyRegistrations[monthKey]++;
            }
        });

        // Get user growth by role over time (simplified - last 12 months)
        const userGrowthByRole = {
            user: monthlyRegistrations,
            owner: { ...monthlyRegistrations },
            admin: { ...monthlyRegistrations }
        };

        // Reset and calculate properly
        Object.keys(userGrowthByRole.user).forEach(month => {
            userGrowthByRole.user[month] = 0;
            userGrowthByRole.owner[month] = 0;
            userGrowthByRole.admin[month] = 0;
        });

        allUsers.forEach(user => {
            const userDate = new Date(user.createdAt);
            const monthKey = `${userDate.getFullYear()}-${String(userDate.getMonth() + 1).padStart(2, '0')}`;
            if (userGrowthByRole[user.role] && userGrowthByRole[user.role].hasOwnProperty(monthKey)) {
                userGrowthByRole[user.role][monthKey]++;
            }
        });

        res.json({
            totalUsers,
            usersByRole,
            lastSevenDays,
            activeAdmins: usersByRole.admin,
            activeOwners: usersByRole.owner,
            regularUsers: usersByRole.user,
            monthlyRegistrations,
            userGrowthByRole
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserAnalytics
};
