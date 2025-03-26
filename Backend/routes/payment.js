const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// Create Payment Intent
router.post('/create', async (req, res) => {
  const { userId, amount, type, courseId } = req.body;

  if (!amount || !type) {
    return res.status(400).json({ message: 'Amount and payment type are required' });
  }

  try {
    // Validate course if provided
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      description: `${type} payment for ${courseId ? 'course' : 'general'}`,
      metadata: { userId: userId || 'anonymous', type, courseId: courseId || null },
    });

    // Save initial payment record
    const payment = new Payment({
      userId: userId ? mongoose.Types.ObjectId(userId) : null,
      amount,
      type,
      stripePaymentIntentId: paymentIntent.id,
    });
    await payment.save();

    res.json({ clientSecret: paymentIntent.client_secret, paymentId: payment._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Confirm Payment (Webhook or Callback)
router.post('/confirm', async (req, res) => {
  const { paymentId } = req.body;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      payment.status = 'success';
      await payment.save();
      res.json({ message: 'Payment confirmed', payment });
    } else {
      payment.status = 'failed';
      await payment.save();
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get Transaction History
router.get('/history', async (req, res) => {
  const { userId } = req.query; // Optional: filter by user

  try {
    const query = userId ? { userId: mongoose.Types.ObjectId(userId) } : {};
    const transactions = await Payment.find(query).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get Invoice (Single Transaction)
router.get('/invoice/:paymentId', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const invoice = {
      paymentId: payment._id,
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      date: payment.createdAt,
      stripePaymentIntentId: payment.stripePaymentIntentId,
    };
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;