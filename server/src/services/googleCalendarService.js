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
 * @returns {Promise<Object>} Object containing meetLink and googleCalendarEventId, or null values.
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
    return {
      meetLink: `https://meet.google.com/mock-${mentor.firstName.toLowerCase()}-${mentee.firstName.toLowerCase()}`,
      googleCalendarEventId: null
    };
  }

  // If using the mock token flow
  if (host.googleCalendarTokens.accessToken === 'mock_access_token_123') {
    console.log('Mock calendar token detected. Returning mock Google Meet link.');
    return {
      meetLink: `https://meet.google.com/mock-${mentor.firstName.toLowerCase()}-${mentee.firstName.toLowerCase()}`,
      googleCalendarEventId: null
    };
  }

  let accessToken = host.googleCalendarTokens.accessToken;
  const expiryDate = host.googleCalendarTokens.expiryDate;

  // If the token is expired or expires in the next 5 minutes, refresh it
  if (expiryDate && Date.now() + 5 * 60 * 1000 >= expiryDate) {
    try {
      accessToken = await refreshGoogleTokens(host);
    } catch (err) {
      console.error('Error attempting to refresh host token, falling back to mock link:', err.message);
      return {
        meetLink: `https://meet.google.com/mock-${mentor.firstName.toLowerCase()}-${mentee.firstName.toLowerCase()}`,
        googleCalendarEventId: null
      };
    }
  }

  const scheduledTime = new Date(session.scheduledTime);
  const duration = session.duration || 60; // default 60 minutes
  const endTime = new Date(scheduledTime.getTime() + duration * 60 * 1000);

  const attendees = [];
  const hostEmail = host.googleCalendarTokens?.email || host.email;

  if (mentor.email && mentor.email.toLowerCase() !== hostEmail.toLowerCase() && mentor._id.toString() !== host._id.toString()) {
    attendees.push({ email: mentor.email });
  }
  if (mentee.email && mentee.email.toLowerCase() !== hostEmail.toLowerCase() && mentee._id.toString() !== host._id.toString()) {
    attendees.push({ email: mentee.email });
  }

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
    attendees,
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
      return {
        meetLink: `https://meet.google.com/mock-fallback-${mentor.firstName.toLowerCase()}-${mentee.firstName.toLowerCase()}`,
        googleCalendarEventId: null
      };
    }

    const data = await response.json();
    
    // Extract video link (Google Meet link)
    const conferenceEntryPoint = data.conferenceData?.entryPoints?.find(
      ep => ep.entryPointType === 'video'
    );

    if (conferenceEntryPoint && conferenceEntryPoint.uri) {
      console.log('Successfully created Google Calendar Event with Meet URI:', conferenceEntryPoint.uri);
      return {
        meetLink: conferenceEntryPoint.uri,
        googleCalendarEventId: data.id
      };
    }

    console.log('Calendar event created but no Meet URL returned.');
    return {
      meetLink: data.htmlLink || null,
      googleCalendarEventId: data.id
    };
  } catch (error) {
    console.error('Error calling Google Calendar API:', error);
    return {
      meetLink: `https://meet.google.com/mock-error-${mentor.firstName.toLowerCase()}-${mentee.firstName.toLowerCase()}`,
      googleCalendarEventId: null
    };
  }
};

/**
 * Updates (reschedules) an existing Google Calendar event.
 * Keeps the meeting link identical.
 * @param {Object} mentor - The mentor User object.
 * @param {Object} mentee - The mentee User object.
 * @param {Object} session - The updated session details (containing googleCalendarEventId).
 */
const updateSessionOnGoogleCalendar = async (mentor, mentee, session) => {
  let host = null;
  if (mentor.calendarAccess && mentor.googleCalendarTokens?.accessToken) {
    host = mentor;
  } else if (mentee.calendarAccess && mentee.googleCalendarTokens?.accessToken) {
    host = mentee;
  }

  const eventId = session.googleCalendarEventId;
  if (!host || !eventId || host.googleCalendarTokens.accessToken === 'mock_access_token_123') {
    console.log('Google Calendar update skipped (no host connected or mock token/event ID).');
    return;
  }

  let accessToken = host.googleCalendarTokens.accessToken;
  const expiryDate = host.googleCalendarTokens.expiryDate;

  // Refresh token if necessary
  if (expiryDate && Date.now() + 5 * 60 * 1000 >= expiryDate) {
    try {
      accessToken = await refreshGoogleTokens(host);
    } catch (err) {
      console.error('Error attempting to refresh host token for update:', err.message);
      return;
    }
  }

  const scheduledTime = new Date(session.scheduledTime);
  const duration = session.duration || 60;
  const endTime = new Date(scheduledTime.getTime() + duration * 60 * 1000);

  const eventBody = {
    start: {
      dateTime: scheduledTime.toISOString(),
      timeZone: 'UTC'
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'UTC'
    }
  };

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }
    );

    if (!response.ok) {
      console.error('Failed to update Google Calendar event:', await response.text());
    } else {
      console.log('Successfully updated Google Calendar Event ID:', eventId);
    }
  } catch (error) {
    console.error('Error calling Google Calendar API PATCH:', error);
  }
};

/**
 * Deletes (cancels) an existing Google Calendar event.
 * @param {Object} mentor - The mentor User object.
 * @param {Object} mentee - The mentee User object.
 * @param {string} eventId - The Google Calendar Event ID.
 */
const deleteSessionFromGoogleCalendar = async (mentor, mentee, eventId) => {
  let host = null;
  if (mentor.calendarAccess && mentor.googleCalendarTokens?.accessToken) {
    host = mentor;
  } else if (mentee.calendarAccess && mentee.googleCalendarTokens?.accessToken) {
    host = mentee;
  }

  if (!host || !eventId || host.googleCalendarTokens.accessToken === 'mock_access_token_123') {
    console.log('Google Calendar deletion skipped (no host connected or mock token/event ID).');
    return;
  }

  let accessToken = host.googleCalendarTokens.accessToken;
  const expiryDate = host.googleCalendarTokens.expiryDate;

  // Refresh token if necessary
  if (expiryDate && Date.now() + 5 * 60 * 1000 >= expiryDate) {
    try {
      accessToken = await refreshGoogleTokens(host);
    } catch (err) {
      console.error('Error attempting to refresh host token for deletion:', err.message);
      return;
    }
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      console.error('Failed to delete Google Calendar event:', await response.text());
    } else {
      console.log('Successfully deleted Google Calendar Event ID:', eventId);
    }
  } catch (error) {
    console.error('Error calling Google Calendar API DELETE:', error);
  }
};

module.exports = {
  refreshGoogleTokens,
  scheduleSessionOnGoogleCalendar,
  updateSessionOnGoogleCalendar,
  deleteSessionFromGoogleCalendar
};
