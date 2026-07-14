const twilio = require('twilio');

let client = null;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

/**
 * Sends a text message to a recipient phone number using Twilio.
 * @param {string} to - Recipient phone number (e.g. "+15555555555")
 * @param {string} body - Message text body
 * @returns {Promise<Object>} The sent message details or null
 */
const sendSMS = async (to, body) => {
  if (!client || !fromNumber) {
    console.log('\n--- TWILIO MOCK SMS (NOT CONFIGURED) ---');
    console.log(`To:   ${to}`);
    console.log(`Msg:  ${body}\n`);
    return null;
  }

  try {
    let formattedTo = to;
    if (fromNumber && fromNumber.startsWith('whatsapp:') && !to.startsWith('whatsapp:')) {
      formattedTo = `whatsapp:${to}`;
    }

    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: formattedTo
    });
    console.log(`Successfully sent SMS via Twilio. Message SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Failed to send SMS via Twilio:', error.message);
    throw error;
  }
};

module.exports = { sendSMS };
