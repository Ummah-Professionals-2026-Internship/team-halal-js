/**
 * Sends a mentorship session confirmation email to both mentor and mentee.
 * Falls back to logging to the console if Resend API Key is not configured.
 * @param {Object} mentor - The mentor User object.
 * @param {Object} mentee - The mentee User object.
 * @param {Object} session - The created Session document.
 */
const sendSessionConfirmationEmail = async (mentor, mentee, session) => {
  const apiKey = process.env.RESEND_API_KEY;

  const sessionDate = new Date(session.scheduledTime);
  const formattedDate = sessionDate.toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = sessionDate.toLocaleTimeString(undefined, { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  const subject = `Mentorship Session Confirmed: ${mentee.firstName} & ${mentor.firstName}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg; color: #00212C;">
      <h2 style="color: #003F55; border-bottom: 2px solid #C5DCE8; padding-bottom: 10px;">Mentorship Session Confirmed</h2>
      <p>Assalamu Alaikum,</p>
      <p>We are pleased to confirm that your mentorship session has been scheduled.</p>
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #4a5568; width: 120px;">Mentor:</td>
            <td style="padding: 6px 0;">${mentor.firstName} ${mentor.lastName} (${mentor.email})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Mentee:</td>
            <td style="padding: 6px 0;">${mentee.firstName} ${mentee.lastName} (${mentee.email})</td>
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
            <td style="padding: 6px 0;">${formattedTime} (UTC)</td>
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
        <h4 style="margin-bottom: 5px; color: #00212C;">Message from Mentee:</h4>
        <blockquote style="margin: 0; padding: 10px 15px; background-color: #edf2f7; border-left: 4px solid #8ACBDB; font-style: italic;">
          "${session.details}"
        </blockquote>
      </div>
      ` : ''}

      <p style="font-size: 14px; color: #718096; margin-top: 30px;">
        If you need to reschedule or cancel, please coordinate with each other and make adjustments through the dashboard.
      </p>
      
      <p style="margin-top: 20px; font-weight: bold;">
        Best regards,<br>
        The Ummah Professionals Team
      </p>
    </div>
  `;

  // If Resend API Key is not set, log the details for local development
  if (!apiKey) {
    console.log('\n==================================================');
    console.log('--- DEVELOPMENT MOCK EMAIL DISPATCH (RESEND) ---');
    console.log(`To:      ${mentor.email}, ${mentee.email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Meet:    ${session.link || 'None'}`);
    console.log('--- HTML Body ---');
    console.log(htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 300) + '...');
    console.log('==================================================\n');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Ummah Professionals <onboarding@resend.dev>', // default resend domain
        to: [mentor.email, mentee.email],
        subject: subject,
        html: htmlContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
    } else {
      console.log('Confirmation email successfully sent via Resend API. ID:', data.id);
    }
  } catch (error) {
    console.error('Error sending confirmation email via Resend API direct POST:', error);
  }

};

/**
 * Sends a mentorship session rescheduling email to both mentor and mentee.
 * Falls back to logging to the console if Resend API Key is not configured.
 * @param {Object} mentor - The mentor User object.
 * @param {Object} mentee - The mentee User object.
 * @param {Object} session - The updated Session document.
 * @param {Date|string} oldScheduledTime - The old scheduled time.
 */
const sendSessionRescheduleEmail = async (mentor, mentee, session, oldScheduledTime) => {
  const apiKey = process.env.RESEND_API_KEY;

  const oldDate = new Date(oldScheduledTime);
  const formattedOldDate = oldDate.toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedOldTime = oldDate.toLocaleTimeString(undefined, { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  const sessionDate = new Date(session.scheduledTime);
  const formattedDate = sessionDate.toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = sessionDate.toLocaleTimeString(undefined, { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  const subject = `Mentorship Session Rescheduled: ${mentee.firstName} & ${mentor.firstName}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg; color: #00212C;">
      <h2 style="color: #003F55; border-bottom: 2px solid #C5DCE8; padding-bottom: 10px;">Mentorship Session Rescheduled</h2>
      <p>Assalamu Alaikum,</p>
      <p>We are writing to confirm that your mentorship session has been rescheduled by the mentee.</p>
      
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #4a5568; width: 120px;">Mentor:</td>
            <td style="padding: 6px 0;">${mentor.firstName} ${mentor.lastName} (${mentor.email})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Mentee:</td>
            <td style="padding: 6px 0;">${mentee.firstName} ${mentee.lastName} (${mentee.email})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #4a5568;">Service:</td>
            <td style="padding: 6px 0; text-transform: capitalize;">${session.service}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #e53e3e;">Original Time:</td>
            <td style="padding: 6px 0; text-decoration: line-through; color: #718096;">${formattedOldDate} at ${formattedOldTime} (UTC)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #38a169;">New Time:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #2f855a;">${formattedDate} at ${formattedTime} (UTC)</td>
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
        <h4 style="margin-bottom: 5px; color: #00212C;">Message from Mentee:</h4>
        <blockquote style="margin: 0; padding: 10px 15px; background-color: #edf2f7; border-left: 4px solid #8ACBDB; font-style: italic;">
          "${session.details}"
        </blockquote>
      </div>
      ` : ''}

      <p style="font-size: 14px; color: #718096; margin-top: 30px;">
        If you need to make further changes, please coordinate through the dashboard.
      </p>
      
      <p style="margin-top: 20px; font-weight: bold;">
        Best regards,<br>
        The Ummah Professionals Team
      </p>
    </div>
  `;

  // If Resend API Key is not set, log the details for local development
  if (!apiKey) {
    console.log('\n==================================================');
    console.log('--- DEVELOPMENT MOCK EMAIL DISPATCH (RESEND) ---');
    console.log(`To:      ${mentor.email}, ${mentee.email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Meet:    ${session.link || 'None'}`);
    console.log('--- HTML Body ---');
    console.log(htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 300) + '...');
    console.log('==================================================\n');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Ummah Professionals <onboarding@resend.dev>',
        to: [mentor.email, mentee.email],
        subject: subject,
        html: htmlContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
    } else {
      console.log('Confirmation email successfully sent via Resend API. ID:', data.id);
    }
  } catch (error) {
    console.error('Error sending confirmation email via Resend API direct POST:', error);
  }
};

module.exports = {
  sendSessionConfirmationEmail,
  sendSessionRescheduleEmail
};
