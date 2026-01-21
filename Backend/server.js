const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('Stripe Secret Key Status:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set');
console.log('mongodb+srv://sahandarmasena0:tXanEUZz3pgeVWLH@itpmcluster.ilg9r.mongodb.net/?retryWrites=true&w=majority&appName=ITPMcluster:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const quizRoutes = require('./routes/quiz');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payment');

app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));