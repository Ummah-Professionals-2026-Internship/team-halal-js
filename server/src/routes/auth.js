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
<<<<<<< HEAD
    const user = await User.findById(req.user.id).select('-password')
=======
    const user = await User.findById(req.user.id).select('firstName lastName email role profilePicture mentorProfile menteeProfile manualAvailabilitySlots linkedinUrl university majors additionalInfo timeZone')
>>>>>>> feat/admin-dashboard
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

// POST /api/auth/admin/register
router.post('/admin/register', async (req, res) => {
  const { firstName, lastName, email, password, adminSecret } = req.body;

  const validSecret = process.env.ADMIN_SECRET || 'admin123';
  if (adminSecret !== validSecret) {
    return res.status(403).json({ message: 'Invalid admin secret code' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'An account with that email already exists' });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: 'admin',
      hasCompletedProfile: true,
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
        hasCompletedProfile: true,
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

<<<<<<< HEAD
    if (user.googleId || !user.password) {
=======
    if (!user.password && user.googleId) {
>>>>>>> feat/admin-dashboard
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
<<<<<<< HEAD
  const host = req.headers.host || 'localhost:5000';
  const protocol = req.protocol || 'http';
  const redirectUri = process.env.GOOGLE_SIGNIN_REDIRECT_URI || `${protocol}://${host}/api/auth/google/signin/callback`;
  const { app_redirect } = req.query;
=======
  const redirectUri = process.env.GOOGLE_SIGNIN_REDIRECT_URI || 'http://localhost:5000/api/auth/google/signin/callback';
>>>>>>> feat/admin-dashboard

  if (!clientId || !redirectUri) {
    return res.status(500).json({ message: 'Google Sign-In is not configured on the server.' });
  }

  const scope = 'openid profile email';
  const state = app_redirect ? encodeURIComponent(app_redirect) : '';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline&prompt=select_account`;

  return res.redirect(url);
});

// GET /api/auth/google/signin/callback - Handle Google Sign-In callback
router.get('/google/signin/callback', async (req, res) => {
<<<<<<< HEAD
  const { code, error, state } = req.query;

  let appRedirect = '';
  if (state) {
    try {
      const decodedState = decodeURIComponent(state);
      if (decodedState.startsWith('{')) {
        const parsedState = JSON.parse(decodedState);
        appRedirect = parsedState.app_redirect || '';
      } else {
        appRedirect = decodedState;
      }
    } catch {
      appRedirect = decodeURIComponent(state);
    }
  }

  const clientOrigin = appRedirect || (process.env.FRONTEND_URL || 'http://localhost:5173');

  const redirectTarget = (path) => {
    if (clientOrigin.startsWith('exp://') || (clientOrigin.includes('://') && !clientOrigin.startsWith('http://') && !clientOrigin.startsWith('https://'))) {
      let cleanPath = path.startsWith('/') ? path.slice(1) : path;
      if (cleanPath.startsWith('login?')) {
        cleanPath = cleanPath.replace('login?', '');
      }
      const joinChar = clientOrigin.includes('?') ? '&' : '?';
      return `${clientOrigin}${joinChar}${cleanPath}`;
    }
    const cleanOrigin = clientOrigin.endsWith('/') ? clientOrigin.slice(0, -1) : clientOrigin;
    return `${cleanOrigin}${path.startsWith('/') ? path : '/' + path}`;
  };

  const sendResponse = (path) => {
    const targetUrl = redirectTarget(path);
    if (clientOrigin.startsWith('exp://') || (clientOrigin.includes('://') && !clientOrigin.startsWith('http://') && !clientOrigin.startsWith('https://'))) {
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redirecting to App...</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background-color: #00202b;
                color: #ffffff;
                text-align: center;
                padding: 20px;
                box-sizing: border-box;
              }
              .card {
                background: rgba(255, 255, 255, 0.05);
                padding: 32px 24px;
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                max-width: 320px;
                width: 100%;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
              }
              .spinner {
                width: 44px;
                height: 44px;
                border: 4px solid rgba(255, 255, 255, 0.15);
                border-top: 4px solid #00b4d8;
                border-radius: 50%;
                animation: spin 0.9s linear infinite;
                margin: 0 auto 20px auto;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              h2 { margin: 0 0 10px 0; font-size: 22px; font-weight: 600; }
              p { margin: 0; opacity: 0.8; font-size: 14px; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="spinner"></div>
              <h2>Authentication Complete!</h2>
              <p>Redirecting back to application...</p>
            </div>
            <script>
              setTimeout(function() {
                window.location.href = ${JSON.stringify(targetUrl)};
              }, 1500);
            </script>
          </body>
        </html>
      `);
    }
    return res.redirect(targetUrl);
  };
=======
  const { code, error } = req.query;
  const redirectUri = process.env.GOOGLE_SIGNIN_REDIRECT_URI || 'http://localhost:5000/api/auth/google/signin/callback';
>>>>>>> feat/admin-dashboard

  if (error || !code) {
    return sendResponse('/login?googleError=cancelled');
  }

  try {
    const host = req.headers.host || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const usedRedirectUri = process.env.GOOGLE_SIGNIN_REDIRECT_URI || `${protocol}://${host}/api/auth/google/signin/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
<<<<<<< HEAD
        redirect_uri: usedRedirectUri,
=======
        redirect_uri: redirectUri,
>>>>>>> feat/admin-dashboard
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', await tokenResponse.text());
      return sendResponse('/login?googleError=token');
    }

    const tokenData = await tokenResponse.json();

    // Get user's profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileResponse.ok) {
      console.error('Google profile fetch failed:', await profileResponse.text());
      return sendResponse('/login?googleError=profile');
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

      return sendResponse(`/login?token=${jwtToken}&dest=${encodeURIComponent(destination)}`);
    }

    // New user — send them to role-selection page with a short-lived temp token
    const tempToken = jwt.sign(
      { googleId, email, firstName, lastName, picture },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    return sendResponse(`/google-register?tempToken=${tempToken}`);

  } catch (err) {
    console.error('Google sign-in callback error:', err);
    return sendResponse('/login?googleError=server');
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

// POST /api/auth/google/native - Handle Google authentication directly from Mobile App (code or access_token)
router.post('/google/native', async (req, res) => {
  const { code, accessToken, redirectUri } = req.body;

  try {
    let googleToken = accessToken;

    if (code) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri || 'https://auth.expo.io/@anonymous/mobile',
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        console.error('Mobile Google code exchange failed:', await tokenRes.text());
        return res.status(400).json({ message: 'Google code exchange failed.' });
      }

      const tokenData = await tokenRes.json();
      googleToken = tokenData.access_token;
    }

    if (!googleToken) {
      return res.status(400).json({ message: 'Access token or authorization code is required.' });
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${googleToken}` },
    });

    if (!profileResponse.ok) {
      return res.status(400).json({ message: 'Invalid Google access token.' });
    }

    const profile = await profileResponse.json();
    const googleId = profile.id || profile.sub;
    const { email, given_name: firstName, family_name: lastName, picture } = profile;

    const queryConditions = [];
    if (googleId) queryConditions.push({ googleId });
    if (email) queryConditions.push({ email });

    let user = null;
    if (queryConditions.length > 0) {
      user = await User.findOne({ $or: queryConditions });
    }

    if (!user) {
      user = new User({
        firstName: firstName || 'User',
        lastName: lastName || '',
        email: email.toLowerCase(),
        googleId,
        profilePicture: picture,
        role: 'mentee',
        hasCompletedProfile: false,
      });
      await user.save();
    } else {
      let needsSave = false;
      if (!user.googleId && googleId) { user.googleId = googleId; needsSave = true; }
      if (picture && (!user.profilePicture || user.profilePicture.startsWith('https://'))) {
        user.profilePicture = picture;
        needsSave = true;
      }
      if (needsSave) await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
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
    console.error('Google native auth error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/push-token - Register or update user's Expo push token
router.post('/push-token', requireAuth, async (req, res) => {
  const { pushToken } = req.body;
  if (!pushToken) {
    return res.status(400).json({ message: 'Push token is required' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { expoPushToken: pushToken } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Push token registered successfully', expoPushToken: user.expoPushToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

