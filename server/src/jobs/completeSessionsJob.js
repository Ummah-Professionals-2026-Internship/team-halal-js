const cron = require('node-cron');
const Session = require('../models/Session');
const { sendNotification } = require('../services/notificationService');

// Marks any scheduled session as completed once its end time has passed,
// then asks both participants to leave feedback.
async function completePastSessions() {
    try {
        const now = new Date();
        const scheduledSessions = await Session.find({ status: 'scheduled' }).select('scheduledTime duration mentor mentee service');

        const toComplete = scheduledSessions.filter(s => {
            const durationMin = s.duration || 30;
            const endTime = new Date(s.scheduledTime.getTime() + durationMin * 60 * 1000);
            return endTime <= now;
        });

        if (toComplete.length === 0) return;

        await Session.updateMany(
            { _id: { $in: toComplete.map(s => s._id) } },
            { $set: { status: 'completed' } }
        );

        for (const session of toComplete) {
            const message = `Your ${session.service} session has ended. Share your feedback with the Ummah Professionals team.`;

            await sendNotification({
                recipientId: session.mentor,
                senderId: session.mentee,
                type: 'feedback_requested',
                title: 'How was your session?',
                message,
                relatedId: session._id,
                relatedModel: 'Session',
                metadata: { session }
            }).catch(err => console.error('Feedback request notification failed:', err));

            await sendNotification({
                recipientId: session.mentee,
                senderId: session.mentor,
                type: 'feedback_requested',
                title: 'How was your session?',
                message,
                relatedId: session._id,
                relatedModel: 'Session',
                metadata: { session }
            }).catch(err => console.error('Feedback request notification failed:', err));
        }

        console.log(`Marked ${toComplete.length} session(s) as completed and requested feedback.`);
    } catch (err) {
        console.error('Error running completePastSessions job:', err);
    }
}

// Runs every 15 minutes
function startCompleteSessionsJob() {
    cron.schedule('*/15 * * * *', completePastSessions);
    // Also run once on startup so sessions don't wait up to 15 minutes after a restart
    completePastSessions();
}

module.exports = { startCompleteSessionsJob, completePastSessions };
