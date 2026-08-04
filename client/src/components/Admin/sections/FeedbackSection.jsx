import React from 'react';
import FeedbackRow from '../rows/FeedbackRow';

const FeedbackSection = ({ feedback }) => (
  <div>
    <div className="flex items-center gap-2.5 mb-4">
      <h1 className="text-2xl font-bold text-[#00212C]">Feedback</h1>
      <span className="bg-slate-100 text-slate-600 text-xs font-bold rounded-full px-2.5 py-1">{feedback.length} Reviews</span>
    </div>
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {feedback.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-sm text-slate-400">No feedback submitted yet.</p>
        </div>
      )}
      {feedback.map(f => (
        <FeedbackRow key={f._id} feedback={f} />
      ))}
    </div>
  </div>
);

export default FeedbackSection;
