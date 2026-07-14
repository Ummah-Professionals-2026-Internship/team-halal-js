const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendSessionConfirmationEmail, sendSessionRescheduleEmail, sendSessionCancellationEmail } = require('./emailService');
const { sendSMS } = require('./smsService');

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
    // Fetch recipient and sender users for preference checks and email/SMS sending
    const recipient = await User.findById(recipientId);
    const sender = senderId ? await User.findById(senderId) : null;

    if (!recipient) {
      console.error(`Notification recipient not found: ${recipientId}`);
      return;
    }

    const prefs = recipient.notificationPreferences || {};
    const inAppEnabled = prefs.inApp !== false;
    const emailEnabled = prefs.email !== false;
    const smsEnabled = prefs.sms !== false;

    // 1. Create and save the In-App Notification in DB if enabled
    if (inAppEnabled) {
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
    } else {
      console.log(`In-app notification skipped for recipient ${recipientId} due to user preference.`);
    }

    // 2. Dispatch Email depending on notification type and if email is enabled
    if (emailEnabled) {
      if (type === 'session_booked' && metadata.session) {
        // For session booking, identify mentor and mentee roles
        const mentor = recipient.role === 'mentor' ? recipient : sender;
        const mentee = recipient.role === 'mentee' ? recipient : sender;
        
        if (mentor && mentee) {
          sendSessionConfirmationEmail(mentor, mentee, metadata.session).catch(err => {
            console.error('Email dispatch in notification dispatcher failed:', err);
          });
        }
      } else if (type === 'session_rescheduled' && metadata.session) {
        // For session rescheduling, identify mentor and mentee roles
        const mentor = recipient.role === 'mentor' ? recipient : sender;
        const mentee = recipient.role === 'mentee' ? recipient : sender;
        
        const initiatorRole = sender ? sender.role : 'mentee';
        
        if (mentor && mentee) {
          sendSessionRescheduleEmail(mentor, mentee, metadata.session, metadata.oldScheduledTime, initiatorRole).catch(err => {
            console.error('Email dispatch in notification dispatcher failed:', err);
          });
        }
      } else if (type === 'session_cancelled' && metadata.session) {
        // For session cancellation, identify mentor and mentee roles
        const mentor = recipient.role === 'mentor' ? recipient : sender;
        const mentee = recipient.role === 'mentee' ? recipient : sender;
        
        const initiatorRole = sender ? sender.role : 'mentee';
        
        if (mentor && mentee) {
          sendSessionCancellationEmail(mentor, mentee, metadata.session, initiatorRole).catch(err => {
            console.error('Email dispatch in notification dispatcher failed:', err);
          });
        }
      }
    } else {
      console.log(`Email dispatch skipped for recipient ${recipientId} due to user preference.`);
    }

    // 3. Dispatch SMS (Real Twilio Integration)
    if (smsEnabled && recipient.phone) {
      sendSMS(recipient.phone, `${title} - ${message}`).catch(err => {
        console.error('Error sending SMS via notification dispatcher:', err);
      });
    } else if (!smsEnabled) {
      console.log(`SMS dispatch skipped for recipient ${recipientId} due to user preference.`);
    }

  } catch (err) {
    console.error('Error in sendNotification dispatcher:', err);
  }
};

module.exports = {
  sendNotification
};
