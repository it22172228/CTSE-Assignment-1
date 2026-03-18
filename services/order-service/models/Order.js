const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: String, // String or ObjectId, String is easier for cross-service if not using populate
        required: true,
    },
    restaurantId: {
        type: String,
        required: true,
    },
    items: [{
        menuItemId: String,
        name: String,
        price: Number,
        quantity: Number
    }],
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'],
        default: 'PLACED'
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
