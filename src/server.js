require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB database
connectDB();

const app = express();

// Middleware to parse incoming JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// Simple test API route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is running successfully!' });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
  console.log(`Open http://127.0.0.1:${PORT} to view the app`);
});
