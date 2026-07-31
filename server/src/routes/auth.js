const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');
const { sendAdminInviteEmail } = require('../services/emailService');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ADMIN_EMAIL_DOMAIN = '@ummahprofessionals.com';
const isAdminEmail = (email) => (email || '').trim().toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN);

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

// PATCH /api/auth/me - Update current user profile
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      if (user.role === 'admin' && !isAdminEmail(email)) {
        return res.status(400).json({ message: 'Admin email addresses must end in @ummahprofessionals.com.' });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'An account with that email address already exists.' });
      }
      user.email = email;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/register (Public registration for Mentors and Mentees)
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with that email already exists' });
    }

    // Public registration strictly assigns mentor or mentee (defaults to mentee if invalid)
    const assignedRole = (role === 'mentor') ? 'mentor' : 'mentee';

    const user = new User({ firstName, lastName, email, password, role: assignedRole });
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

    if (!user.password && user.googleId) {
      return res.status(400).json({
        isGoogleAccount: true,
        message: 'This account was created using Google Sign-In. Please sign in with Google.'
      });
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

// POST /api/auth/admin/setup (First Super Admin Setup with Secret Key)
router.post('/admin/setup', async (req, res) => {
  const { firstName, lastName, email, password, secret } = req.body;

  const validSecret = process.env.ADMIN_SETUP_SECRET || 'UmmahAdmin2026SecretKey';

  if (!secret || secret !== validSecret) {
    return res.status(401).json({ message: 'Invalid Admin Secret Key.' });
  }

  if (!isAdminEmail(email)) {
    return res.status(400).json({ message: 'Admin email addresses must end in @ummahprofessionals.com.' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with that email already exists.' });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: 'admin',
      hasCompletedProfile: true
    });

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
        hasCompletedProfile: true
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/admin/invite (Send Resend Invitation Email to New Admin)
router.post('/admin/invite', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }

  if (!isAdminEmail(email)) {
    return res.status(400).json({ message: 'Admin invitations can only be sent to @ummahprofessionals.com email addresses.' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    const inviteToken = jwt.sign(
      { inviteEmail: email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '48h' }
    );

    const inviteUrl = `${FRONTEND_URL}/admin/register?token=${inviteToken}`;

    await sendAdminInviteEmail(email, inviteUrl);

    res.json({ message: 'Admin invitation email sent successfully!', inviteUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/admin/register (Complete registration for invited admin)
router.post('/admin/register', async (req, res) => {
  const { token, firstName, lastName, password } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Invitation token is required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin' || !decoded.inviteEmail) {
      return res.status(400).json({ message: 'Invalid invitation token.' });
    }

    if (!isAdminEmail(decoded.inviteEmail)) {
      return res.status(400).json({ message: 'Admin accounts must use an @ummahprofessionals.com email address.' });
    }

    const existing = await User.findOne({ email: decoded.inviteEmail });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email address has already been registered.' });
    }

    const user = new User({
      firstName,
      lastName,
      email: decoded.inviteEmail,
      password,
      role: 'admin',
      hasCompletedProfile: true
    });

    await user.save();

    const authToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token: authToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        hasCompletedProfile: true
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invitation token has expired. Please ask an admin to send a new invite.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/auth/google/signin - Initiate Google Sign-In OAuth flow (no JWT required)
router.get('/google/signin', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_SIGNIN_REDIRECT_URI || 'http://localhost:5000/api/auth/google/signin/callback';

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
  const redirectUri = process.env.GOOGLE_SIGNIN_REDIRECT_URI || 'http://localhost:5000/api/auth/google/signin/callback';

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
        redirect_uri: redirectUri,
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

