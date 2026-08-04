import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { replyToFeedbackFollowUp } from '../api-calls/feedback';
import { getSessionById } from '../api-calls/sessions';
import useCurrentUser from './useCurrentUser';

const NotificationDetailModal = ({ notification, onClose }) => {
  const isFollowUp = notification.type === 'feedback_followup';
  const isReschedule = notification.type === 'reschedule_requested';
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    if (!isReschedule) return;
    setSessionLoading(true);
    getSessionById(notification.relatedId)
      .then(setSession)
      .catch(err => setSessionError(err.message || 'Failed to load session.'))
      .finally(() => setSessionLoading(false));
  }, [isReschedule, notification.relatedId]);

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    setError('');
    try {
      await replyToFeedbackFollowUp(notification.relatedId, reply);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleReschedule = () => {
    if (!session) return;
    const otherParty = user?.role === 'mentor' ? session.mentee : session.mentor;
    navigate('/mentee/schedule', { state: { mentor: otherParty, rescheduleSessionId: session._id } });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#00212C]">{notification.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer shrink-0 ml-3">&times;</button>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">
          {notification.message}
        </div>

        <p className="text-xs text-slate-400">
          {new Date(notification.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </p>

        {isFollowUp && !sent && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Reply</label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              placeholder="Let us know why, and what we can do to improve..."
              className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
            />
          </div>
        )}

        {isFollowUp && sent && (
          <p className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-sm font-medium">
            Thanks — your reply has been sent to our team.
          </p>
        )}

        {isReschedule && sessionError && (
          <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs font-medium">{sessionError}</p>
        )}

        {error && <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs font-medium">{error}</p>}

        {isFollowUp && !sent ? (
          <button
            onClick={handleSendReply}
            disabled={sending || !reply.trim()}
            className="bg-[#003F55] text-white font-semibold py-2 rounded-lg text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {sending ? 'Sending...' : 'Send Reply'}
          </button>
        ) : isReschedule ? (
          <button
            onClick={handleReschedule}
            disabled={sessionLoading || !session}
            className="bg-[#fdbb36] text-[#00212C] font-semibold py-2 rounded-lg text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {sessionLoading ? 'Loading...' : 'Reschedule Now'}
          </button>
        ) : (
          <button
            onClick={onClose}
            className="bg-[#003F55] text-white font-semibold py-2 rounded-lg text-sm w-full transition"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationDetailModal;
