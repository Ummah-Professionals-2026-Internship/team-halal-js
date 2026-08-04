import React, { useEffect, useState } from 'react';
import { getFeedbackForSession } from '../../../api-calls/feedback';

const Stars = ({ value }) => (
  <span className="text-[#fdbb36] text-xs">
    {'★'.repeat(value)}
    <span className="text-slate-300">{'★'.repeat(5 - value)}</span>
  </span>
);

const FeedbackEntry = ({ feedback }) => {
  const name = `${feedback.submittedBy?.firstName ?? 'Someone'} ${feedback.submittedBy?.lastName ?? ''}`.trim();
  const role = feedback.submittedBy?.role === 'mentor' ? 'Mentor' : 'Mentee';

  return (
    <div className="border border-slate-100 rounded-lg p-3">
      <p className="font-bold text-[#00212C] text-sm">
        {name} <span className="text-slate-400 font-normal">({role})</span>
      </p>
      <div className="flex items-center gap-4 mt-1.5">
        <span className="text-xs text-slate-600">Meeting: <Stars value={feedback.meetingRating} /></span>
        <span className="text-xs text-slate-600">Useful Advice: <Stars value={feedback.usefulAdviceRating} /></span>
      </div>
      {feedback.comments && (
        <p className="text-sm text-slate-700 italic mt-1.5">"{feedback.comments}"</p>
      )}
      {feedback.followUpReply && (
        <div className="mt-2 pl-3 border-l-2 border-[#8ACBDB] bg-slate-50 rounded-r-lg py-2 px-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Reviewer's reply</p>
          <p className="text-sm text-slate-700">{feedback.followUpReply}</p>
        </div>
      )}
    </div>
  );
};

const ViewSessionFeedbackModal = ({ session, onClose }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getFeedbackForSession(session._id)
      .then(setFeedback)
      .catch(err => setError(err.message || 'Failed to load feedback.'))
      .finally(() => setLoading(false));
  }, [session._id]);

  const mentorName = `${session.mentor?.firstName ?? 'Mentor'} ${session.mentor?.lastName ?? ''}`.trim();
  const menteeName = `${session.mentee?.firstName ?? 'Mentee'} ${session.mentee?.lastName ?? ''}`.trim();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#00212C]">Session Feedback</h3>
            <p className="text-xs text-slate-400">{mentorName} and {menteeName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer shrink-0 ml-3">&times;</button>
        </div>

        {loading && <p className="text-sm text-slate-400 text-center py-4">Loading feedback...</p>}
        {error && <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs font-medium">{error}</p>}

        {!loading && !error && feedback.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">Neither the mentor nor mentee has submitted feedback yet.</p>
        )}

        {!loading && feedback.map(f => (
          <FeedbackEntry key={f._id} feedback={f} />
        ))}

        <button
          onClick={onClose}
          className="bg-[#003F55] text-white font-semibold py-2 rounded-lg text-sm w-full mt-1"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewSessionFeedbackModal;
