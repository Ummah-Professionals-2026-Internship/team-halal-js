const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// GET /api/auth/me - Get current user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('firstName lastName email role profilePicture mentorProfile menteeProfile manualAvailabilitySlots linkedinUrl university majors additionalInfo timeZone')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const clientTimeZone = req.headers['x-timezone'];
    if (clientTimeZone && user.timeZone !== clientTimeZone) {
      user.timeZone = clientTimeZone;
      await user.save();
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with that email already exists' });
    }

    const user = new User({ firstName, lastName, email, password, role });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        hasCompletedProfile: user.hasCompletedProfile
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        hasCompletedProfile: user.hasCompletedProfile
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/auth/google/signin - Initiate Google Sign-In OAuth flow (no JWT required)
router.get('/google/signin', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_SIGNIN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ message: 'Google Sign-In is not configured on the server.' });
  }

  const scope = 'openid profile email';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=select_account`;

  return res.redirect(url);
});

// GET /api/auth/google/signin/callback - Handle Google Sign-In callback
router.get('/google/signin/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}/login?googleError=cancelled`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_SIGNIN_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', await tokenResponse.text());
      return res.redirect(`${FRONTEND_URL}/login?googleError=token`);
    }

    const tokenData = await tokenResponse.json();

    // Get user's profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileResponse.ok) {
      console.error('Google profile fetch failed:', await profileResponse.text());
      return res.redirect(`${FRONTEND_URL}/login?googleError=profile`);
    }

    const profile = await profileResponse.json();
    const googleId = profile.id || profile.sub;
    const { email, given_name: firstName, family_name: lastName, picture } = profile;

    // Find existing user by googleId or email (avoid matching unset/undefined fields in MongoDB)
    const queryConditions = [];
    if (googleId) queryConditions.push({ googleId });
    if (email) queryConditions.push({ email });

    let user = null;
    if (queryConditions.length > 0) {
      user = await User.findOne({ $or: queryConditions });
    }

    if (user) {
      // Link googleId and keep profile picture in sync with Google,
      // but never overwrite a manually uploaded custom photo
      const hasCustomPhoto = user.profilePicture && !user.profilePicture.startsWith('https://');
      let needsSave = false;
      if (!user.googleId && googleId) { user.googleId = googleId; needsSave = true; }
      if (picture && !hasCustomPhoto) { user.profilePicture = picture; needsSave = true; }
      if (needsSave) await user.save();

      // Issue JWT and redirect to the right dashboard
      const jwtToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const destination = user.hasCompletedProfile
        ? (user.role === 'mentor' ? '/mentor-dashboard' : '/mentee-dashboard')
        : (user.role === 'mentor' ? '/mentor/profile-setup' : '/mentee/profile-setup');

      return res.redirect(`${FRONTEND_URL}/login?token=${jwtToken}&dest=${encodeURIComponent(destination)}`);
    }

    // New user — send them to role-selection page with a short-lived temp token
    const tempToken = jwt.sign(
      { googleId, email, firstName, lastName, picture },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.redirect(`${FRONTEND_URL}/google-register?tempToken=${tempToken}`);

  } catch (err) {
    console.error('Google sign-in callback error:', err);
    return res.redirect(`${FRONTEND_URL}/login?googleError=server`);
  }
});

// POST /api/auth/google/register - Complete registration for new Google users (role selection)
router.post('/google/register', async (req, res) => {
  const { tempToken, role } = req.body;

  if (!tempToken || !role) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const { googleId, email, firstName, lastName, picture } = decoded;

    // Double-check they haven't registered in the meantime (avoid matching unset/undefined fields)
    const queryConditions = [];
    if (googleId) queryConditions.push({ googleId });
    if (email) queryConditions.push({ email });

    let existing = null;
    if (queryConditions.length > 0) {
      existing = await User.findOne({ $or: queryConditions });
    }
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists. Please log in.' });
    }

    const user = new User({ firstName, lastName, email, googleId, role, ...(picture && { profilePicture: picture }) });
    await user.save();

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        hasCompletedProfile: user.hasCompletedProfile,
      },
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please sign in with Google again.' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

