const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to fetch events from Google Calendar and extract start, end, and day of week
const fetchAndExtractGoogleEvents = async (accessToken, userEmail) => {
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(); // 30 days range

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch events from Google Calendar:', await response.text());
      return [];
    }

    const data = await response.json();
    const events = data.items || [];
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return events.map(event => {
      const startStr = event.start.dateTime || event.start.date;
      const endStr = event.end.dateTime || event.end.date;
      const start = new Date(startStr);
      const end = new Date(endStr);
      const day = daysOfWeek[start.getDay()];

      return {
        day,
        start,
        end
      };
    });
  } catch (error) {
    console.error('Error in fetchAndExtractGoogleEvents:', error);
    return [];
  }
};

// Helper to generate mock busy slots for the next 30 days (weekdays 9 AM to 5 PM)
const generateMockBusySlots = () => {
  const slots = [];
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  for (let i = 0; i < 30; i++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + i);
    const dayOfWeekIndex = targetDate.getDay();
    const dayName = daysOfWeek[dayOfWeekIndex];

    // If it's a weekday, simulate a busy block from 9:00 AM to 5:00 PM
    if (dayOfWeekIndex !== 0 && dayOfWeekIndex !== 6) {
      const start = new Date(targetDate);
      start.setHours(9, 0, 0, 0);

      const end = new Date(targetDate);
      end.setHours(17, 0, 0, 0);

      slots.push({
        day: dayName,
        start,
        end
      });
    }
  }
  return slots;
};

// GET /api/auth/google - Initiate OAuth Flow
router.get('/google', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(401).send('Authentication token required.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Google Calendar Setup Needed</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen p-6">
          <div class="bg-white p-8 rounded-xl shadow-md max-w-lg w-full border border-gray-200">
            <h2 class="text-xl font-bold text-red-600 mb-4">Google OAuth Configuration Required</h2>
            <p class="text-gray-700 mb-4 leading-relaxed text-sm">
              To open the standard Google login screen, you must configure your Google Calendar API credentials in your server's environment file.
            </p>
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs font-mono mb-4 overflow-x-auto">
              # Add this to your server/.env file:<br>
              GOOGLE_CLIENT_ID=your_actual_client_id_here<br>
              GOOGLE_CLIENT_SECRET=your_actual_client_secret_here<br>
              GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
            </div>
            <p class="text-xs text-gray-500 mb-4">
              Make sure to configure the same redirect URI in your Google Cloud Console Credentials page.
            </p>
            <button onclick="window.history.back()" class="w-full text-center py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors text-sm font-semibold">
              Go Back
            </button>
          </div>
        </body>
        </html>
      `);
    }

    const scope = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${userId}&access_type=offline&prompt=consent`;
    return res.redirect(url);
  } catch (err) {
    return res.status(401).send('Invalid or expired authentication token.');
  }
});

// GET /api/auth/google/callback - Handle OAuth Callback
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query; // state is the userId
  if (!state) {
    return res.status(400).send('Missing state (userId) parameter.');
  }

  try {
    const user = await User.findById(state);
    if (!user) {
      return res.status(404).send('User not found.');
    }

    const useRealGoogle = process.env.GOOGLE_CLIENT_ID && 
                          process.env.GOOGLE_CLIENT_SECRET && 
                          process.env.GOOGLE_REDIRECT_URI;

    let busySlots = [];

    if (useRealGoogle && code !== 'mock_code_123') {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenResponse.ok) {
        console.error('OAuth exchange error:', await tokenResponse.text());
        return res.redirect(`${FRONTEND_URL}/${user.role === 'mentor' ? 'mentor/availability-setup' : 'mentee/academic-setup'}?calendarError=true`);
      }

      const tokenData = await tokenResponse.json();

      let calendarEmail = user.email;
      try {
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          calendarEmail = profileData.email || calendarEmail;
        }
      } catch (err) {
        console.error('Failed to fetch Google user profile:', err);
      }

      user.calendarAccess = true;
      user.googleCalendarTokens = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || '',
        expiryDate: Date.now() + (tokenData.expires_in * 1000),
        email: calendarEmail
      };

      // Extract busy times from user's primary Google Calendar
      busySlots = await fetchAndExtractGoogleEvents(tokenData.access_token, calendarEmail);
    } else {
      // Mock code connection
      user.calendarAccess = true;
      user.googleCalendarTokens = {
        accessToken: 'mock_access_token_123',
        refreshToken: 'mock_refresh_token_123',
        expiryDate: Date.now() + 3600 * 1000,
        email: user.email
      };

      // Generate mock busy slots (weekdays 9am to 5pm) for algorithm matching testing
      busySlots = generateMockBusySlots();
    }

    user.calendarBusySlots = busySlots;
    await user.save();

    const redirectUrl = `${FRONTEND_URL}/${user.role === 'mentor' ? 'mentor/availability-setup' : 'mentee/academic-setup'}?calendarConnected=true`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).send('Error during Google Calendar callback parsing.');
  }
});

// POST /api/auth/google/disconnect - Disconnect Google Calendar and clear busy slots
router.post('/google/disconnect', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.calendarAccess = false;
    user.googleCalendarTokens = undefined;
    user.calendarBusySlots = [];
    await user.save();

    res.status(200).json({ message: 'Google Calendar disconnected successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
