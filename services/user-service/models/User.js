const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
    ,
    role: {
        type: String,
        enum: ['user', 'owner', 'admin'],
        default: 'user'
    }
}, { timestamps: true });

// We could add a pre-save hook for password hashing here, but standard practice often implements it in the controller.
// We'll leave the schema clean and hash in authController.

const User = mongoose.model('User', userSchema);
module.exports = User;
