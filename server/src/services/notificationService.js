const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendSessionConfirmationEmail } = require('./emailService');

/**
 * Unified notification dispatcher.
 * Saves in-app notification to the database, and dispatches email/SMS as needed.
 */
const sendNotification = async ({
  recipientId,
  senderId,
  type,
  title,
  message,
  relatedId,
  relatedModel,
  metadata = {}
}) => {
  try {
    // 1. Create and save the In-App Notification in DB
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      relatedId,
      relatedModel
    });
    await notification.save();
    console.log(`Saved in-app notification: ${notification._id}`);

    // Fetch recipient and sender users for email/SMS sending
    const recipient = await User.findById(recipientId);
    const sender = senderId ? await User.findById(senderId) : null;

    if (!recipient) {
      console.error(`Notification recipient not found: ${recipientId}`);
      return;
    }

    // 2. Dispatch Email depending on notification type
    if (type === 'session_booked' && metadata.session) {
      // For session booking, identify mentor and mentee roles
      const mentor = recipient.role === 'mentor' ? recipient : sender;
      const mentee = recipient.role === 'mentee' ? recipient : sender;
      
      if (mentor && mentee) {
        sendSessionConfirmationEmail(mentor, mentee, metadata.session).catch(err => {
          console.error('Email dispatch in notification dispatcher failed:', err);
        });
      }
    }

    // 3. Dispatch SMS (Stub / Placeholder for Twilio)
    if (recipient.phone) {
      console.log('\n==================================================');
      console.log('--- DEVELOPMENT MOCK SMS DISPATCH (TWILIO STUB) ---');
      console.log(`To:      ${recipient.phone} (${recipient.firstName})`);
      console.log(`Msg:     ${title} - ${message}`);
      console.log('==================================================\n');
    }

  } catch (err) {
    console.error('Error in sendNotification dispatcher:', err);
  }
};

module.exports = {
  sendNotification
};
