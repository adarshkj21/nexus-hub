// server/index.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const questRoutes = require('./routes/quest');
const authRoutes = require('./routes/auth');  // Import auth routes
const cors = require('cors');

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Mount API routes
app.use('/api/chapters', questRoutes);
app.use('/api/auth', authRoutes); // Mount auth routes

// Basic route
app.get('/', (req, res) => {
  res.send('Backend API for NexusHub - Learn Module');
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
