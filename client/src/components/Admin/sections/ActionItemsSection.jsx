import React from 'react';
import ActionItemRow from '../rows/ActionItemRow';

const ActionItemsSection = ({ actionItems, onRespond, onFollowUp, onViewHelpRequests, onViewFeedback, onViewSessions }) => (
  <div>
    <div className="flex items-center justify-between mb-4 2xl:mb-6 flex-wrap gap-2">
      <div className="flex items-center gap-2.5 2xl:gap-3.5">
        <h1 className="text-2xl 2xl:text-3xl 3xl:text-4xl font-bold text-[#00212C]">Action Items</h1>
        {actionItems.length > 0 && (
          <span className="bg-red-100 text-red-700 text-xs 2xl:text-sm font-bold rounded-full w-6 h-6 2xl:w-7 2xl:h-7 flex items-center justify-center">
            {actionItems.length}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 2xl:gap-3 text-sm 2xl:text-base">
        <button onClick={onViewHelpRequests} className="px-3 2xl:px-4.5 py-1.5 2xl:py-2.5 rounded-lg text-xs 2xl:text-sm font-semibold text-[#003F55] hover:bg-slate-100 transition-colors cursor-pointer">Help Requests</button>
        <button onClick={onViewFeedback} className="px-3 2xl:px-4.5 py-1.5 2xl:py-2.5 rounded-lg text-xs 2xl:text-sm font-semibold text-[#003F55] hover:bg-slate-100 transition-colors cursor-pointer">Feedback</button>
        <button onClick={onViewSessions} className="px-3 2xl:px-4.5 py-1.5 2xl:py-2.5 rounded-lg text-xs 2xl:text-sm font-semibold text-[#003F55] hover:bg-slate-100 transition-colors cursor-pointer">Sessions</button>
      </div>
    </div>
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {actionItems.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 2xl:py-16">
          <svg className="w-8 h-8 2xl:w-12 2xl:h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm 2xl:text-base 3xl:text-lg text-slate-400">You're all caught up — no action items right now.</p>
        </div>
      )}
      {actionItems.map(item => (
        <ActionItemRow key={item.id} item={item} onRespond={onRespond} onFollowUp={onFollowUp} />
      ))}
    </div>
  </div>
);

export default ActionItemsSection;
