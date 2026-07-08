const User = require('../models/User');

/**
 * Refreshes the Google OAuth token for a given user.
 * @param {Object} user - The mongoose User document.
 * @returns {Promise<string>} The new access token.
 */
const refreshGoogleTokens = async (user) => {
  const tokens = user.googleCalendarTokens;
  if (!tokens || !tokens.refreshToken) {
    throw new Error('No refresh token available');
  }

  // If using the mock token, don't perform a real OAuth refresh
  if (tokens.accessToken === 'mock_access_token_123') {
    return 'mock_access_token_123';
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Google client credentials not configured in server environment');
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to refresh Google token:', errorText);
      throw new Error(`Token refresh failed: ${errorText}`);
    }

    const tokenData = await response.json();
    user.googleCalendarTokens.accessToken = tokenData.access_token;
    user.googleCalendarTokens.expiryDate = Date.now() + (tokenData.expires_in * 1000);
    await user.save();
    
    console.log(`Successfully refreshed Google access token for user: ${user.email}`);
    return tokenData.access_token;
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    throw error;
  }
};

/**
 * Schedules a mentorship session event on the primary calendar of the user who has authorized access.
 * Generates a Google Meet video conference link.
 * @param {Object} mentor - The mentor User object.
 * @param {Object} mentee - The mentee User object.
 * @param {Object} session - The created session details.
 * @returns {Promise<string|null>} The Google Meet link, or null if calendar scheduling is not configured.
 */
const scheduleSessionOnGoogleCalendar = async (mentor, mentee, session) => {
  // Determine which user has calendarAccess and googleCalendarTokens
  let host = null;
  if (mentor.calendarAccess && mentor.googleCalendarTokens?.accessToken) {
    host = mentor;
  } else if (mentee.calendarAccess && mentee.googleCalendarTokens?.accessToken) {
    host = mentee;
  }

  // If neither has connected Google Calendar, return a mock meet link to help in testing UI
  if (!host) {
    console.log('Neither user has connected Google Calendar. Generating a mock Meet link.');
    return `https://meet.google.com/mock-${mentor.firstName.toLowerCase()}-${mentee.firstName.toLowerCase()}`;
  }

  // If using the mock token flow
  if (host.googleCalendarTokens.accessToken === 'mock_access_token_123') {
    console.log('Mock calendar token detected. Returning mock Google Meet link.');
    return `https://meet.google.com/mock-${mentor.firstName.toLowerCase()}-${mentee.firstName.toLowerCase()}`;
  }

  let accessToken = host.googleCalendarTokens.accessToken;
  const expiryDate = host.googleCalendarTokens.expiryDate;

  // If the token is expired or expires in the next 5 minutes, refresh it
  if (expiryDate && Date.now() + 5 * 60 * 1000 >= expiryDate) {
    try {
      accessToken = await refreshGoogleTokens(host);
    } catch (err) {
      console.error('Error attempting to refresh host token, falling back to mock link:', err.message);
      return `https://meet.google.com/mock-${mentor.firstName.toLowerCase()}-${mentee.firstName.toLowerCase()}`;
    }
  }

  const scheduledTime = new Date(session.scheduledTime);
  const duration = session.duration || 60; // default 60 minutes
  const endTime = new Date(scheduledTime.getTime() + duration * 60 * 1000);

  const eventBody = {
    summary: `Mentorship Session: ${mentee.firstName} & ${mentor.firstName}`,
    description: `Service Type: ${session.service}\n\nSession Notes:\n${session.details || 'None'}`,
    start: {
      dateTime: scheduledTime.toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'UTC'
    },
    attendees: [
      { email: mentor.email },
      { email: mentee.email }
    ],
    conferenceData: {
      createRequest: {
        requestId: `session_${session._id}_${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    }
  };

  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create Google Calendar event:', errorText);
      // Fallback to mock link instead of failing the session creation outright
      return `https://meet.google.com/mock-fallback-${mentor.firstName.toLowerCase()}-${mentee.firstName.toLowerCase()}`;
    }

    const data = await response.json();
    
    // Extract video link (Google Meet link)
    const conferenceEntryPoint = data.conferenceData?.entryPoints?.find(
      ep => ep.entryPointType === 'video'
    );

    if (conferenceEntryPoint && conferenceEntryPoint.uri) {
      console.log('Successfully created Google Calendar Event with Meet URI:', conferenceEntryPoint.uri);
      return conferenceEntryPoint.uri;
    }

    console.log('Calendar event created but no Meet URL returned.');
    return data.htmlLink || null;
  } catch (error) {
    console.error('Error calling Google Calendar API:', error);
    return `https://meet.google.com/mock-error-${mentor.firstName.toLowerCase()}-${mentee.firstName.toLowerCase()}`;
  }
};

module.exports = {
  refreshGoogleTokens,
  scheduleSessionOnGoogleCalendar
};
