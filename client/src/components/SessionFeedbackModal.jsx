import React, { useState } from 'react';
import { submitFeedback } from '../api-calls/feedback';
import useCurrentUser from './useCurrentUser';

const StarRating = ({ value, onChange }) => (
  <div className="flex justify-center gap-1.5">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`text-3xl leading-none transition-colors cursor-pointer ${
          star <= value ? 'text-[#fdbb36]' : 'text-white hover:text-[#fdbb36]/50'
        }`}
        style={{ WebkitTextStroke: star <= value ? undefined : '1.5px #00212C' }}
      >
        ★
      </button>
    ))}
  </div>
);

const SessionFeedbackModal = ({ sessionId, otherPersonName, onClose, onSubmitted }) => {
  const { user } = useCurrentUser();
  const [meetingRating, setMeetingRating] = useState(0);
  const [usefulAdviceRating, setUsefulAdviceRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isMentor = user?.role === 'mentor';
  const adviceQuestion = isMentor ? 'Were you able to give useful advice?' : 'Did you receive useful advice?';

  const handleSubmit = async () => {
    if (!meetingRating || !usefulAdviceRating) {
      setError('Please rate both questions before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitFeedback({ sessionId, meetingRating, usefulAdviceRating, comments });
      onSubmitted();
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[#C5DCE8] rounded-2xl p-8 w-full max-w-md flex flex-col gap-5 text-center relative">
        <button onClick={onClose} className="absolute top-4 right-5 text-2xl font-bold text-[#00212C] cursor-pointer">&times;</button>

        <p className="text-[#00212C] font-medium">
          Congratulations on completing your mentorship session{otherPersonName ? ` with ${otherPersonName}` : ''}!
          Share your feedback with the Ummah Professionals team.
        </p>

        <div>
          <p className="text-[#00212C] font-semibold mb-2">How was the meeting?</p>
          <StarRating value={meetingRating} onChange={setMeetingRating} />
        </div>

        <div>
          <p className="text-[#00212C] font-semibold mb-2">{adviceQuestion}</p>
          <StarRating value={usefulAdviceRating} onChange={setUsefulAdviceRating} />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-[#00212C] font-medium">Additional comments?</p>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full rounded-lg p-3 text-sm text-[#00212C] resize-none h-28 border border-gray-300 outline-none bg-white"
          />
        </div>

        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#003F55] text-white font-semibold py-2 rounded-lg text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default SessionFeedbackModal;
