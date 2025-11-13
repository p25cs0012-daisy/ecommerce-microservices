// payment-service/controllers/paymentController.js
const Payment = require('../models/Payment');
const crypto = require('crypto'); // Node.js built-in for HMAC SHA256

// 1. Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
    const { orderId, amount, currency } = req.body;
    const userId = req.userId; // Assuming auth middleware adds userId to req

    // --- DEBUGGING LOGS FOR PAYLOAD ---
    console.log('Incoming request to create Razorpay order:');
    console.log('  orderId:', orderId);
    console.log('  amount:', amount);
    console.log('  currency:', currency);
    console.log('  userId:', userId);
    // --- END DEBUGGING LOGS ---

    if (!orderId || !amount || !currency || !userId) {
        return res.status(400).json({ message: 'Missing required fields: orderId, amount, currency, userId' });
    }

    try {
        // Check if a payment record already exists for this orderId
        let payment = await Payment.findOne({ orderId: orderId });

        if (payment && payment.status !== 'pending' && payment.status !== 'failed') {
            return res.status(409).json({ message: 'Payment already processed for this order.', payment });
        }

        // If a pending/failed payment exists, update it. Otherwise, create a new one.
        if (!payment) {
            payment = new Payment({ userId, orderId, amount, currency });
        } else {
            // Update existing pending/failed payment with new details if necessary
            payment.amount = amount;
            payment.currency = currency;
            payment.status = 'pending';
            payment.razorpayOrderId = null;
            payment.razorpayPaymentId = null;
            payment.razorpaySignature = null;
            payment.failureReason = null;
            payment.paymentDate = null;
        }

        // Prepare options for Razorpay order creation
        const options = {
            amount: amount * 100, // amount in the smallest currency unit (e.g., paise for INR)
            currency: currency,
            receipt: orderId,
            payment_capture: 1 // 1 for auto capture, 0 for manual capture
        };

        // --- MORE DEBUGGING LOGS ---
        console.log('Preparing to call Razorpay API...');
        console.log('  Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);
        console.log('  Razorpay Order Options:', options);
        // --- END MORE DEBUGGING LOGS ---

        // Generate Razorpay order using the instance attached to req
        const razorpayOrder = await req.razorpayInstance.orders.create(options);

        payment.razorpayOrderId = razorpayOrder.id;
        payment.status = 'created'; // Payment record created on Razorpay's end

        await payment.save();

        res.status(201).json({
            message: 'Razorpay order created successfully',
            razorpayOrder,
            paymentId: payment._id,
            key_id: process.env.RAZORPAY_KEY_ID // Send Key ID to frontend for checkout
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error); // Log the full error object for detailed debugging
        res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message || 'Unknown error' });
    }
};

// 2. Verify Payment (after successful transaction on frontend)
exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
        return res.status(400).json({ message: 'Missing required verification details' });
    }

    try {
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }
        if (payment.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ message: 'Razorpay Order ID mismatch' });
        }

        // Generate expected signature
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        // Compare generated signature with the one received from frontend
        if (digest === razorpay_signature) {
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = 'captured'; // Mark as captured (assuming auto-capture)
            payment.paymentDate = new Date();
            await payment.save();
            res.status(200).json({ message: 'Payment verified successfully', payment });

            // TODO: (IMPORTANT) Notify Order Service that payment is successful
            // This would typically be an HTTP call or an event bus message.
            // Example: axios.post('http://order-service/api/orders/payment-success', { orderId: payment.orderId, paymentId: payment._id });

        } else {
            payment.status = 'failed';
            payment.failureReason = 'Signature mismatch';
            await payment.save();
            res.status(400).json({ message: 'Payment verification failed: Signature mismatch', payment });
        }

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Failed to verify payment', error: error.message || 'Unknown error' });
    }
};

// 3. Handle Razorpay Webhooks
exports.handleWebhook = async (req, res) => {
    const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const shasum = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body)); // Webhook body should be raw JSON
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
        console.log('Webhook signature verified successfully.');

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.captured' || event === 'order.paid') {
            const razorpayPaymentId = payload.payment?.entity?.id || payload.order?.entity?.payments?.pop()?.entity?.id;
            const razorpayOrderId = payload.order?.entity?.id || payload.payment?.entity?.order_id;
            const status = payload.payment?.entity?.status || (payload.order?.entity?.status === 'paid' ? 'captured' : 'pending');

            try {
                const payment = await Payment.findOneAndUpdate(
                    { razorpayOrderId: razorpayOrderId },
                    {
                        razorpayPaymentId: razorpayPaymentId,
                        status: status,
                        paymentDate: new Date()
                    },
                    { new: true, upsert: false } // Find and update, do not create if not found
                );

                if (payment) {
                    console.log(`Payment status updated via webhook for order ${razorpayOrderId}: ${status}`);
                    // TODO: (IMPORTANT) Notify Order Service again about payment status.
                    // This is more robust than frontend verification, as webhooks are server-to-server.
                    // Example: axios.post('http://order-service/api/orders/webhook-payment-success', { orderId: payment.orderId, paymentId: payment._id, status: status });
                } else {
                    console.warn(`Payment record not found for Razorpay Order ID: ${razorpayOrderId}`);
                }
            } catch (error) {
                console.error('Error updating payment from webhook:', error);
            }
        } else if (event === 'payment.failed') {
            const razorpayOrderId = payload.payment?.entity?.order_id;
            const failureReason = payload.payment?.entity?.error_description || payload.payment?.entity?.error_reason;

            try {
                const payment = await Payment.findOneAndUpdate(
                    { razorpayOrderId: razorpayOrderId },
                    {
                        status: 'failed',
                        failureReason: failureReason,
                        paymentDate: new Date()
                    },
                    { new: true, upsert: false }
                );
                if (payment) {
                    console.log(`Payment failed via webhook for order ${razorpayOrderId}: ${failureReason}`);
                    // TODO: Notify Order Service about payment failure
                }
            } catch (error) {
                console.error('Error updating failed payment from webhook:', error);
            }
        }
        // Handle other events as needed (e.g., refund, disputed, etc.)

        res.status(200).send('Webhook Received and Processed');
    } else {
        console.warn('Webhook signature verification failed!');
        res.status(403).send('Webhook signature mismatch');
    }
};