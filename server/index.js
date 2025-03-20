// server/index.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const questRoutes = require('./routes/quest');
const cors = require('cors');

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors());         // Enable CORS for all requests

// Mount API routes
app.use('/api/chapters', questRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Backend API for NexusHub - Learn Module');
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
