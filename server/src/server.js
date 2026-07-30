require('dotenv').config();
const express = require('express');
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
const helpRequestRoutes = require('./routes/helpRequests');
const feedbackRoutes = require('./routes/feedback');
const { startCompleteSessionsJob } = require('./jobs/completeSessionsJob');

// Connect to database
connectDB();

// Periodically marks past sessions as completed
startCompleteSessionsJob();

const app = express();

app.use(express.json());

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
app.use('/api/help-requests', helpRequestRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
