import React from 'react';
import { formatTimeAgo } from '../adminUtils';

const Stars = ({ value }) => (
  <span className="text-[#fdbb36] text-xs">
    {'★'.repeat(value)}
    <span className="text-slate-300">{'★'.repeat(5 - value)}</span>
  </span>
);

const FeedbackRow = ({ feedback }) => {
  const submittedByName = `${feedback.submittedBy?.firstName ?? 'Someone'} ${feedback.submittedBy?.lastName ?? ''}`.trim();
  const aboutName = `${feedback.about?.firstName ?? 'someone'} ${feedback.about?.lastName ?? ''}`.trim();
  const isLow = feedback.meetingRating <= 2 || feedback.usefulAdviceRating <= 2;

  return (
    <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-[#00212C] text-sm">
            {submittedByName} ({feedback.submittedBy?.role === 'mentor' ? 'Mentor' : 'Mentee'}) on session with {aboutName}
          </p>
          {isLow && (
            <span className="bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
              Negative Review
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 capitalize">{feedback.session?.service}</p>
        <div className="flex items-center gap-4 mt-1.5">
          <span className="text-xs text-slate-600">Meeting: <Stars value={feedback.meetingRating} /></span>
          <span className="text-xs text-slate-600">Useful Advice: <Stars value={feedback.usefulAdviceRating} /></span>
        </div>
        {feedback.comments && (
          <p className="text-sm text-slate-700 italic mt-1.5">"{feedback.comments}"</p>
        )}
        <p className="text-xs text-slate-400 mt-1.5">{formatTimeAgo(feedback.createdAt)}</p>
        {feedback.followUpReply && (
          <div className="mt-2 pl-3 border-l-2 border-[#8ACBDB] bg-slate-50 rounded-r-lg py-2 px-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">
              Reviewer's reply · {formatTimeAgo(feedback.followUpRepliedAt)}
            </p>
            <p className="text-sm text-slate-700">{feedback.followUpReply}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackRow;
