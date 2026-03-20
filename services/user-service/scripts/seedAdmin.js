const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@smarteat.com', role: 'admin' });
        if (existingAdmin) {
            console.log('Admin already exists!');
            console.log('Email: admin@smarteat.com');
            console.log('Password: Admin@123');
            await mongoose.connection.close();
            return;
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@smarteat.com',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('✅ Admin account created successfully!');
        console.log('');
        console.log('Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━');
        console.log('Email: admin@smarteat.com');
        console.log('Password: Admin@123');
        console.log('');
        console.log('Admin ID:', admin._id);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
