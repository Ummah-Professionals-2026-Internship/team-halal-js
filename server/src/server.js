require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const authRoutes = require('./routes/auth');
const mentorRoutes = require('./routes/Mentor');
const menteeRoutes = require('./routes/Mentee');
const matchRoutes = require('./routes/matches');
const uploadRoutes = require('./routes/upload');
const calendarRoutes = require('./routes/calendar');
const sessionRoutes = require('./routes/sessions');
const notificationRoutes = require('./routes/notifications');

// Connect to database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());


// Serve static files from public folder (React client build)
app.use(express.static(path.join(__dirname, '../public')));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', calendarRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/mentees', menteeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notifications', notificationRoutes);

// React SPA fallback for all non-API routes
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return res.sendFile(path.join(__dirname, '../public/index.html'));
  }
  next();
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
