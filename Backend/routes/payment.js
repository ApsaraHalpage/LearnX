const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const mongoose = require('mongoose');

router.post('/create', async (req, res) => {
  const { userId, amount, type, courseId } = req.body;
  console.log('Payment create request:', { userId, amount, type, courseId });

  if (!amount || !type) {
    return res.status(400).json({ message: 'Amount and payment type are required' });
  }

  try {
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: 'Course not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      payment_method_types: ['card'],
      description: `${type} payment for ${courseId ? 'course' : 'general'}`,
      metadata: { userId: userId || 'anonymous', type, courseId: courseId || null },
    });

    const payment = new Payment({
      userId: userId ? new mongoose.Types.ObjectId(userId) : null,
      amount,
      type,
      stripePaymentIntentId: paymentIntent.id,
    });
    await payment.save();

    res.json({ clientSecret: paymentIntent.client_secret, paymentId: payment._id });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.post('/confirm', async (req, res) => {
  const { paymentId } = req.body;
  console.log('Confirm payment request:', { paymentId });

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
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.get('/history', async (req, res) => {
  const { userId } = req.query;
  console.log('History request:', { userId });

  try {
    const query = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
    const transactions = await Payment.find(query).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.get('/invoice/:paymentId', async (req, res) => {
  console.log('Invoice request:', { paymentId: req.params.paymentId });

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
    console.error('Invoice fetch error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;