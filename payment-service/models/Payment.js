const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true // Index for efficient lookup by user
    },
    orderId: { // This would be the ID from your Order Service
        type: String,
        required: true,
        unique: true, // A payment should be unique per order
        index: true
    },
    razorpayOrderId: {
        type: String,
        unique: true, // Razorpay order ID is unique
        sparse: true // Allows nulls for orders not yet processed by Razorpay
    },
    razorpayPaymentId: {
        type: String,
        unique: true,
        sparse: true
    },
    razorpaySignature: {
        type: String,
        sparse: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['pending', 'created', 'authorized', 'captured', 'refunded', 'failed'],
        default: 'pending',
        index: true
    },
    paymentDate: {
        type: Date
    },
    failureReason: {
        type: String
    }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

module.exports = mongoose.model('Payment', paymentSchema);