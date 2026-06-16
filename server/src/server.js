require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

// Connect to database
connectDB();

const app = express();

app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
