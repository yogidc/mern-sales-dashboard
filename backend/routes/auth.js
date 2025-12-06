const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check if this is the first user - make them admin
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    const hashedPw = await bcrypt.hash(password, 10);
    const user = new User({ 
      email, 
      password: hashedPw,
      role: isFirstUser ? 'admin' : (role || 'viewer')
    });
    
    await user.save();
    res.status(201).json({ 
      message: 'User created successfully',
      isAdmin: isFirstUser,
      note: isFirstUser ? 'You are the first user and have been made admin automatically!' : ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      role: user.role,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make yourself admin (only if no admin exists)
router.post('/make-admin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Verify user credentials
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists && adminExists._id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'An admin already exists. Contact them to grant you admin access.' });
    }

    // Make user admin
    user.role = 'admin';
    await user.save();

    res.json({ 
      message: 'You have been made admin successfully!',
      role: 'admin'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

