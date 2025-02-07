require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();

// Middleware setup
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse incoming JSON requests

// MongoDB connection
const dbURI = process.env.MONGODB_URI;  // Get the connection string from .env
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    logError('MongoDB Connection Error', err);
  });

// User model
const User = require('./models/User');  // Ensure you have 'User.js' model with fields for email, password, name, etc.


// Enhanced error logging function
const logError = (message, error) => {
  console.error(`[ERROR] ${message}:`, error.message);
  console.error('Stack Trace:', error.stack);
  // Here you can extend to log errors to a file or external logging service
};

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET, // Ensure you have JWT_SECRET in .env
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token, role: user.role });
  } catch (error) {
    logError('Error during login', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const newUser = new User({
      name,
      email,
      password,
      phone,
      role: role || 'worker',  // Default role is 'worker' if not provided
    });

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully. Please log in.' });
  } catch (error) {
    logError('Error during signup', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Centralized Error Handler for unhandled errors
app.use((err, req, res, next) => {
  logError('Unhandled Error', err); // Log the full error details
  res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
});

// Server setup
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
