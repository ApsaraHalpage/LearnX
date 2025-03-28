import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Payment.css';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51R7dnkE8bW5YABdDFkLXKlsatcospBFSboYflmq0qGw6hbr1ngUXzHJpXXehkpzRinhhHayzhI6D6D44meDkcNMt00avENlSbW');

const Payment = ({ user }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    paymentType: 'one-time',
    amount: ''
  });
  const [errors, setErrors] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const fetchTransactionHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/payment/history', {
        params: { userId: user?.id }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.cardNumber || formData.cardNumber.length !== 16) 
      tempErrors.cardNumber = 'Card number must be 16 digits';
    if (!formData.expiry || !/^\d{2}\/\d{2}$/.test(formData.expiry)) 
      tempErrors.expiry = 'Expiry must be in MM/YY format';
    if (!formData.cvv || formData.cvv.length !== 3) 
      tempErrors.cvv = 'CVV must be 3 digits';
    if (!formData.name) 
      tempErrors.name = 'Cardholder name is required';
    if (!formData.amount || formData.amount <= 0) 
      tempErrors.amount = 'Amount must be greater than 0';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, 16);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
      }
    }

    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Sending payment request:', { userId: user?.id, amount: formData.amount, type: formData.paymentType });
      const response = await axios.post('http://localhost:5000/api/payment/create', {
        userId: user?.id,
        amount: formData.amount,
        type: formData.paymentType,
      });
      const { clientSecret, paymentId } = response.data;
      console.log('Payment intent created:', { clientSecret, paymentId });

      setCurrentPaymentId(paymentId);

      const stripe = await stripePromise;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: {
            number: formData.cardNumber,
            exp_month: parseInt(formData.expiry.split('/')[0], 10),
            exp_year: parseInt(formData.expiry.split('/')[1], 10),
            cvc: formData.cvv,
          },
          billing_details: { name: formData.name },
        },
      });

      if (result.error) {
        console.error('Stripe confirmation error:', result.error);
        throw new Error(result.error.message);
      }

      console.log('Stripe payment confirmed:', result.paymentIntent);
      await axios.post('http://localhost:5000/api/payment/confirm', { paymentId });

      const transaction = {
        _id: paymentId,
        amount: formData.amount,
        type: formData.paymentType,
        status: 'success',
        createdAt: new Date().toLocaleString(),
      };

      setTransactions([transaction, ...transactions]);
      setShowInvoice(true);
      setFormData({
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: '',
        paymentType: 'one-time',
        amount: ''
      });
    } catch (error) {
      console.error('Payment error:', error.response?.data || error.message);
      setErrors({ submit: error.response?.data?.message || 'Payment failed. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="payment-container">
      <div className="payment-form">
        <h2>Course Payment</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Payment Type</label>
            <select
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
            >
              <option value="one-time">One-Time Payment</option>
              <option value="subscription">Monthly Subscription</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="1"
            />
            {errors.amount && <span className="error">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              maxLength="16"
            />
            {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label>Expiry</label>
              <input
                type="text"
                name="expiry"
                value={formData.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
                maxLength="5"
              />
              {errors.expiry && <span className="error">{errors.expiry}</span>}
            </div>
            <div className="form-group half-width">
              <label>CVV</label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                maxLength="3"
              />
              {errors.cvv && <span className="error">{errors.cvv}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
          {errors.submit && <span className="error submit-error">{errors.submit}</span>}
        </form>
      </div>

      <div className="transaction-history">
        <h3>Transaction History</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t._id}>
                  <td>{t._id}</td>
                  <td>${t.amount}</td>
                  <td>{t.type}</td>
                  <td>{t.createdAt}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showInvoice && (
        <div className="invoice-modal">
          <div className="invoice-content">
            <h3>Payment Invoice</h3>
            <p>Transaction ID: {currentPaymentId}</p>
            <p>Amount: ${formData.amount || transactions[0].amount}</p>
            <p>Type: {formData.paymentType || transactions[0].type}</p>
            <p>Date: {transactions[0]?.createdAt || new Date().toLocaleString()}</p>
            <p>Status: Success</p>
            <button onClick={() => setShowInvoice(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;