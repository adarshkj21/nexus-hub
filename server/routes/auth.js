// server/routes/auth.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('/models/User');

// Secret for JWT – ideally, set this in your .env file
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// @desc    Sign Up a new user
// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Create a new user
    const user = await User.create({ username, password });
    if (user) {
      // Generate token
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
      res.status(201).json({
        token,
        user: { username: user.username }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Login an existing user
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
      res.json({
        token,
        user: { username: user.username }
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
