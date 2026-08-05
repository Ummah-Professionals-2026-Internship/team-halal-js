import { useState } from 'react';
import { replyToFeedbackFollowUp } from '../../api-calls/feedback';

const FeedbackFollowUpModal = ({ item, onClose, onReplied }) => {
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reply.trim()) {
      setError('Please write a reply before sending.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await replyToFeedbackFollowUp(item.notification.relatedId, reply);
      onReplied();
    } catch (err) {
      setError(err.message || 'Failed to send reply.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#00212C]">Ummah Professionals wants to know more</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">
          {item.notification.message}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Reply</label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            placeholder="Let us know what happened..."
            className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
          />
        </div>

        {error && <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs font-medium">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting || !reply.trim()}
          className="bg-[#003F55] text-white font-semibold py-2.5 rounded-lg text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {submitting ? 'Sending...' : 'Send Reply'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackFollowUpModal;
