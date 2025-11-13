// payment-service/server.js
require('dotenv').config();

// Add these console logs to verify key loading
console.log('RAZORPAY_KEY_ID loaded:', process.env.RAZORPAY_KEY_ID ? 'Loaded' : 'NOT LOADED');
console.log('RAZORPAY_KEY_SECRET loaded:', process.env.RAZORPAY_KEY_SECRET ? 'Loaded' : 'NOT LOADED');
// If you want to see the actual keys for debugging (be cautious in production)
// console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
// console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET);


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay'); // Import Razorpay
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 8005;

// Initialize Razorpay instance once
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middleware to attach razorpayInstance to req object
app.use((req, res, next) => {
    req.razorpayInstance = razorpayInstance;
    next();
});

app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all routes

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/paymentsdb')
    .then(() => console.log('Payment Service connected to MongoDB'))
    .catch(err => {
        console.error('Payment Service MongoDB connection error:', err);
        process.exit(1);
    });

// Routes
app.use('/api/payments', paymentRoutes);

// Error handling middleware (optional but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => console.log(`Payment Service listening on port ${PORT}`));