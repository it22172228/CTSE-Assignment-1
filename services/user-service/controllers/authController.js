const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        if (user) {
            // Send notification
            try {
                const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2000/api';
                const sendUrl = notificationUrl.replace(/\/$/, '').endsWith('/notifications') ? notificationUrl.replace(/\/$/, '') : `${notificationUrl.replace(/\/$/, '')}/notifications`;
                await axios.post(sendUrl, {
                    userId: user._id.toString(),
                    message: `Welcome to our platform, ${user.name}! Your account has been successfully registered.`
                });
            } catch (notificationError) {
                console.error('Failed to send registration notification:', notificationError.message);
            }

            res.status(201).json({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            console.log('User logged in, sending notification for:', user._id.toString());
            // Send notification
            try {
                const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2000/api';
                const sendUrl = notificationUrl.replace(/\/$/, '').endsWith('/notifications') ? notificationUrl.replace(/\/$/, '') : `${notificationUrl.replace(/\/$/, '')}/notifications`;
                console.log('Sending notification to:', sendUrl);
                const response = await axios.post(sendUrl, {
                    userId: user._id.toString(),
                    message: `Successful login! Welcome back, ${user.name}.`
                });
                console.log('Notification sent, response status:', response.status);
            } catch (notificationError) {
                console.error('Failed to send login notification:', notificationError.message);
            }

            res.json({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401);
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
};
