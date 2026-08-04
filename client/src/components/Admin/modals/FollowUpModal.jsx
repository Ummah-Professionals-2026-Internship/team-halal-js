import React, { useState } from 'react';
import { sendFeedbackFollowUp } from '../../../api-calls/feedback';

const FollowUpModal = ({ feedback, onClose, onSent }) => {
  const [message, setMessage] = useState(
    "We noticed you had a less than ideal experience with your recent session. Please let us know why, and what we can do to improve."
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const aboutName = `${feedback.about?.firstName ?? 'someone'} ${feedback.about?.lastName ?? ''}`.trim();
  const lowScore = Math.min(feedback.meetingRating, feedback.usefulAdviceRating);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      await sendFeedbackFollowUp(feedback._id, message);
      onSent();
    } catch (err) {
      setError(err.message || 'Failed to send follow-up.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#00212C]">Follow Up on Negative Review</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>
        </div>

        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            {lowScore}/5 quality — session with {aboutName}
          </p>
          {feedback.comments && (
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">
              {feedback.comments}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Type your follow-up message..."
            className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
          />
          <p className="text-xs text-slate-400 mt-1">Sent as both an email and a dashboard notification.</p>
        </div>

        {error && <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs font-medium">{error}</p>}

        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="bg-[#003F55] text-white font-semibold py-2.5 rounded-lg text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {sending ? 'Sending...' : 'Send Follow-Up'}
        </button>
      </div>
    </div>
  );
};

export default FollowUpModal;
