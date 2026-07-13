/**
 * Helper to format date and time in the recipient's local timezone.
 * Falls back to UTC if the timezone is missing or invalid.
 * @param {Date|string} dateObj - The date to format
 * @param {string} timeZone - Timezone string (e.g. "America/New_York")
 * @returns {Object} Object containing formattedDate and formattedTime
 */
const formatDateTimeForUser = (dateObj, timeZone) => {
  const date = new Date(dateObj);
  const optionsDate = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const optionsTime = {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  };

  if (timeZone) {
    optionsDate.timeZone = timeZone;
    optionsTime.timeZone = timeZone;
  } else {
    optionsDate.timeZone = 'UTC';
    optionsTime.timeZone = 'UTC';
  }

  try {
    const formattedDate = date.toLocaleDateString('en-US', optionsDate);
    const formattedTime = date.toLocaleTimeString('en-US', optionsTime);
    return { formattedDate, formattedTime };
  } catch (error) {
    console.error(`Invalid timezone "${timeZone}", falling back to UTC formatting:`, error);
    optionsDate.timeZone = 'UTC';
    optionsTime.timeZone = 'UTC';
    const formattedDate = date.toLocaleDateString('en-US', optionsDate);
    const formattedTime = date.toLocaleTimeString('en-US', optionsTime);
    return { formattedDate, formattedTime };
  }
};

/**
 * Helper to generate a standard compliant iCalendar (.ics) string.
 * @param {Object} mentor - Mentor user object
 * @param {Object} mentee - Mentee user object
 * @param {Object} session - Session document
 * @param {boolean} isCancel - Whether this is a cancellation request
 * @returns {string} ICS compliant text string
 */
const generateICSString = (mentor, mentee, session, isCancel = false) => {
  const sessionDate = new Date(session.scheduledTime);
  const duration = session.duration || 60; // default 60 minutes
  const endDate = new Date(sessionDate.getTime() + duration * 60 * 1000);

  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const dtStart = formatICSDate(sessionDate);
  const dtEnd = formatICSDate(endDate);
  const dtStamp = formatICSDate(new Date());
  const uid = `session_${session._id}@ummahprofessionals.com`;

  const summary = `Mentorship Session: ${mentee.firstName} & ${mentor.firstName}`;
  const description = `Service Type: ${session.service}\nMentor: ${mentor.firstName} ${mentor.lastName} (${mentor.email})\nMentee: ${mentee.firstName} ${mentee.lastName} (${mentee.email})\nMeeting Link: ${session.link || 'None'}\n\nNotes:\n${session.details || 'None'}`;
  const location = session.link || 'Google Meet (link to be provided)';

  // Escape special characters for ICS format
  const cleanSummary = summary.replace(/[,;]/g, '\\$&').replace(/\n/g, '\\n');
  const cleanDesc = description.replace(/[,;]/g, '\\$&').replace(/\n/g, '\\n');
  const cleanLocation = location.replace(/[,;]/g, '\\$&').replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ummah Professionals//Mentorship App//EN',
    'CALSCALE:GREGORIAN',
    isCancel ? 'METHOD:CANCEL' : 'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:${cleanLocation}`,
    'ORGANIZER;CN="Ummah Professionals":mailto:no-reply@lahagetutoring.com',
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="${mentor.firstName} ${mentor.lastName}":mailto:${mentor.email}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="${mentee.firstName} ${mentee.lastName}":mailto:${mentee.email}`,
    isCancel ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};

/**
 * Universal sender using Resend REST API.
 * Supports mock console logging in development.
 */
const sendResendEmail = async ({ apiKey, to, subject, html, attachments }) => {
  const fromEmail = 'Ummah Professionals <no-reply@lahagetutoring.com>';

  if (!apiKey) {
    console.log('\n==================================================');
    console.log(`--- DEVELOPMENT MOCK EMAIL DISPATCH ---`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('--- Body Preview ---');
    console.log(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200) + '...');
    if (attachments && attachments.length > 0) {
      console.log(`Attachment: ${attachments[0].filename} (Generated in-memory)`);
    }
    console.log('==================================================\n');
    return;
  }

  try {
    const payload = {
      from: fromEmail,
      to: [to],
      subject,
      html,
    };

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Resend API error for ${to}:`, data);
    } else {
      console.log(`Tailored email successfully sent to ${to}. ID:`, data.id);
    }
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

/**
 * Sends separate, tailored mentorship session confirmation emails.
 * @param {Object} mentor - The mentor User object.
 * @param {Object} mentee - The mentee User object.
 * @param {Object} session - The created Session document.
 */
const sendSessionConfirmationEmail = async (mentor, mentee, session) => {
  const apiKey = process.env.RESEND_API_KEY;

  // Generate calendar invite attachment
  const icsContent = generateICSString(mentor, mentee, session);
  const base64ICS = Buffer.from(icsContent).toString('base64');
  const attachments = [
    {
      content: base64ICS,
      filename: 'invite.ics'
    }
  ];

  // Helper template snippet for session parameters
  const getSessionDetailsHtml = (partnerName, partnerRole, formattedDate, formattedTime) => `
    <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5568; width: 120px;">${partnerRole}:</td>
          <td style="padding: 6px 0;">${partnerName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Service:</td>
          <td style="padding: 6px 0; text-transform: capitalize;">${session.service}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Date:</td>
          <td style="padding: 6px 0;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Time:</td>
          <td style="padding: 6px 0;">${formattedTime}</td>
        </tr>
        ${session.link ? `
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Meeting Link:</td>
          <td style="padding: 6px 0;">
            <a href="${session.link}" style="color: #003F55; font-weight: bold; text-decoration: underline;" target="_blank" rel="noopener noreferrer">
              Join Google Meet
            </a>
          </td>
        </tr>
        ` : ''}
      </table>
    </div>
    ${session.details ? `
    <div style="margin: 20px 0;">
      <h4 style="margin-bottom: 5px; color: #00212C;">Message details:</h4>
      <blockquote style="margin: 0; padding: 10px 15px; background-color: #edf2f7; border-left: 4px solid #8ACBDB; font-style: italic;">
        "${session.details}"
      </blockquote>
    </div>
    ` : ''}
  `;

  // 1. Send Mentor Email (Formatted in Mentor's timezone)
  const mentorTimes = formatDateTimeForUser(session.scheduledTime, mentor.timeZone);
  const mentorSubject = `New Mentorship Booking: ${mentee.firstName} ${mentee.lastName}`;
  const mentorHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #00212C;">
      <h2 style="color: #003F55; border-bottom: 2px solid #C5DCE8; padding-bottom: 10px;">New Mentorship Booking</h2>
      <p>Assalamu Alaikum ${mentor.firstName},</p>
      <p>A new mentorship session has been scheduled with you by <strong>${mentee.firstName} ${mentee.lastName}</strong>.</p>
      
      ${getSessionDetailsHtml(
        `${mentee.firstName} ${mentee.lastName} (${mentee.email})`, 
        'Mentee', 
        mentorTimes.formattedDate, 
        mentorTimes.formattedTime
      )}
      
      <p style="font-size: 14px; color: #718096; margin-top: 30px;">
        An invite (.ics file) has been attached to this email. You can add it directly to your calendar. If you need to reschedule or cancel, please coordinate through the dashboard.
      </p>
      <p style="margin-top: 20px; font-weight: bold;">
        Best regards,<br>
        The Ummah Professionals Team
      </p>
    </div>
  `;
  await sendResendEmail({
    apiKey,
    to: mentor.email,
    subject: mentorSubject,
    html: mentorHtml,
    attachments
  });

  // 2. Send Mentee Email (Formatted in Mentee's timezone)
  const menteeTimes = formatDateTimeForUser(session.scheduledTime, mentee.timeZone);
  const menteeSubject = `Mentorship Session Confirmed: ${mentor.firstName} ${mentor.lastName}`;
  const menteeHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #00212C;">
      <h2 style="color: #003F55; border-bottom: 2px solid #C5DCE8; padding-bottom: 10px;">Mentorship Session Confirmed</h2>
      <p>Assalamu Alaikum ${mentee.firstName},</p>
      <p>Your mentorship session with <strong>${mentor.firstName} ${mentor.lastName}</strong> has been successfully scheduled.</p>
      
      ${getSessionDetailsHtml(
        `${mentor.firstName} ${mentor.lastName} (${mentor.email})`, 
        'Mentor', 
        menteeTimes.formattedDate, 
        menteeTimes.formattedTime
      )}
      
      <p style="font-size: 14px; color: #718096; margin-top: 30px;">
        An invite (.ics file) has been attached to this email. You can add it directly to your calendar. If you need to reschedule or cancel, please coordinate through the dashboard.
      </p>
      <p style="margin-top: 20px; font-weight: bold;">
        Best regards,<br>
        The Ummah Professionals Team
      </p>
    </div>
  `;
  await sendResendEmail({
    apiKey,
    to: mentee.email,
    subject: menteeSubject,
    html: menteeHtml,
    attachments
  });
};

/**
 * Sends separate, tailored mentorship session rescheduling emails.
 * @param {Object} mentor - The mentor User object.
 * @param {Object} mentee - The mentee User object.
 * @param {Object} session - The updated Session document.
 * @param {Date|string} oldScheduledTime - The old scheduled time.
 * @param {string} initiatorRole - The role of the user who initiated the reschedule ('mentor' or 'mentee')
 */
const sendSessionRescheduleEmail = async (mentor, mentee, session, oldScheduledTime, initiatorRole = 'mentee') => {
  const apiKey = process.env.RESEND_API_KEY;

  // Generate calendar invite attachment (updating the invite)
  const icsContent = generateICSString(mentor, mentee, session);
  const base64ICS = Buffer.from(icsContent).toString('base64');
  const attachments = [
    {
      content: base64ICS,
      filename: 'invite.ics'
    }
  ];

  // Helper template snippet for reschedule session parameters
  const getRescheduleDetailsHtml = (partnerName, partnerRole, formattedOldDate, formattedOldTime, formattedDate, formattedTime) => `
    <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5568; width: 120px;">${partnerRole}:</td>
          <td style="padding: 6px 0;">${partnerName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Service:</td>
          <td style="padding: 6px 0; text-transform: capitalize;">${session.service}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #e53e3e;">Original Time:</td>
          <td style="padding: 6px 0; text-decoration: line-through; color: #718096;">${formattedOldDate} at ${formattedOldTime}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #38a169;">New Time:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #2f855a;">${formattedDate} at ${formattedTime}</td>
        </tr>
        ${session.link ? `
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Meeting Link:</td>
          <td style="padding: 6px 0;">
            <a href="${session.link}" style="color: #003F55; font-weight: bold; text-decoration: underline;" target="_blank" rel="noopener noreferrer">
              Join Google Meet
            </a>
          </td>
        </tr>
        ` : ''}
      </table>
    </div>
    ${session.details ? `
    <div style="margin: 20px 0;">
      <h4 style="margin-bottom: 5px; color: #00212C;">Message details:</h4>
      <blockquote style="margin: 0; padding: 10px 15px; background-color: #edf2f7; border-left: 4px solid #8ACBDB; font-style: italic;">
        "${session.details}"
      </blockquote>
    </div>
    ` : ''}
  `;

  // 1. Send Mentor Email (Formatted in Mentor's timezone)
  const mentorOldTimes = formatDateTimeForUser(oldScheduledTime, mentor.timeZone);
  const mentorNewTimes = formatDateTimeForUser(session.scheduledTime, mentor.timeZone);
  const mentorSubject = `Mentorship Session Rescheduled: ${mentee.firstName} ${mentee.lastName}`;
  
  const mentorIntroText = initiatorRole === 'mentor'
    ? `Your mentorship session with <strong>${mentee.firstName} ${mentee.lastName}</strong> has been rescheduled by you.`
    : `Your mentorship session has been rescheduled by the mentee, <strong>${mentee.firstName} ${mentee.lastName}</strong>.`;

  const mentorHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #00212C;">
      <h2 style="color: #003F55; border-bottom: 2px solid #C5DCE8; padding-bottom: 10px;">Mentorship Session Rescheduled</h2>
      <p>Assalamu Alaikum ${mentor.firstName},</p>
      <p>${mentorIntroText}</p>
      
      ${getRescheduleDetailsHtml(
        `${mentee.firstName} ${mentee.lastName} (${mentee.email})`, 
        'Mentee', 
        mentorOldTimes.formattedDate, 
        mentorOldTimes.formattedTime,
        mentorNewTimes.formattedDate,
        mentorNewTimes.formattedTime
      )}
      
      <p style="font-size: 14px; color: #718096; margin-top: 30px;">
        An updated invite (.ics file) has been attached. You can open it to update the event directly in your calendar.
      </p>
      <p style="margin-top: 20px; font-weight: bold;">
        Best regards,<br>
        The Ummah Professionals Team
      </p>
    </div>
  `;
  await sendResendEmail({
    apiKey,
    to: mentor.email,
    subject: mentorSubject,
    html: mentorHtml,
    attachments
  });

  // 2. Send Mentee Email (Formatted in Mentee's timezone)
  const menteeOldTimes = formatDateTimeForUser(oldScheduledTime, mentee.timeZone);
  const menteeNewTimes = formatDateTimeForUser(session.scheduledTime, mentee.timeZone);
  const menteeSubject = `Mentorship Session Rescheduled: ${mentor.firstName} ${mentor.lastName}`;

  const menteeIntroText = initiatorRole === 'mentor'
    ? `Your mentorship session with <strong>${mentor.firstName} ${mentor.lastName}</strong> has been rescheduled by the mentor.`
    : `Your mentorship session with <strong>${mentor.firstName} ${mentor.lastName}</strong> has been rescheduled by you.`;

  const menteeHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #00212C;">
      <h2 style="color: #003F55; border-bottom: 2px solid #C5DCE8; padding-bottom: 10px;">Mentorship Session Rescheduled</h2>
      <p>Assalamu Alaikum ${mentee.firstName},</p>
      <p>${menteeIntroText}</p>
      
      ${getRescheduleDetailsHtml(
        `${mentor.firstName} ${mentor.lastName} (${mentor.email})`, 
        'Mentor', 
        menteeOldTimes.formattedDate, 
        menteeOldTimes.formattedTime,
        menteeNewTimes.formattedDate,
        menteeNewTimes.formattedTime
      )}
      
      <p style="font-size: 14px; color: #718096; margin-top: 30px;">
        An updated invite (.ics file) has been attached. You can open it to update the event directly in your calendar.
      </p>
      <p style="margin-top: 20px; font-weight: bold;">
        Best regards,<br>
        The Ummah Professionals Team
      </p>
    </div>
  `;
  await sendResendEmail({
    apiKey,
    to: mentee.email,
    subject: menteeSubject,
    html: menteeHtml,
    attachments
  });
};

module.exports = {
  sendSessionConfirmationEmail,
  sendSessionRescheduleEmail
};
