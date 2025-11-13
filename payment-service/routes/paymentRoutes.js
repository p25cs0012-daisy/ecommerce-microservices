// payment-service/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth'); // Your mock auth middleware

// IMPORTANT: Do NOT use router.use(auth) globally.
// Apply 'auth' middleware only to specific routes that require user authentication.

// Route to create a new Razorpay order - REQUIRES AUTH
router.post('/order', auth, paymentController.createRazorpayOrder);

// Route to verify payment (called after successful payment on frontend) - REQUIRES AUTH
router.post('/verify', auth, paymentController.verifyPayment);

// Razorpay Webhook route (IMPORTANT: This route does NOT use the 'auth' middleware)
// It needs the raw body to verify the signature, so express.raw is correct here.
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);


module.exports = router;