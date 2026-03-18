const User = require('../models/User');

const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserProfile,
};
