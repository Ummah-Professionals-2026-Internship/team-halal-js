require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const authRoutes = require('./routes/auth');
const mentorRoutes = require('./routes/Mentor');
const menteeRoutes = require('./routes/Mentee');
const uploadRoutes = require('./routes/upload');

// Connect to database
connectDB();

const app = express();

app.use(express.json());

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/mentees', menteeRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
