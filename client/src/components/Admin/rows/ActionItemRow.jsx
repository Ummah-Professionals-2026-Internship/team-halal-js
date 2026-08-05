import React from 'react';

const ActionItemRow = ({ item, onRespond, onFollowUp, onViewSessions, onViewReply }) => {
  const handleClick = () => {
    if (item.type === 'help-request') onRespond(item.raw);
    else if (item.type === 'feedback') onFollowUp(item.raw);
    else if (item.type === 'reschedule-pending') onViewSessions();
    else if (item.type === 'feedback-reply') onViewReply(item.raw);
  };

  return (
    <div className="flex items-center justify-between gap-4 px-6 2xl:px-8 py-4 2xl:py-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors">
      <div className="flex items-center gap-4 2xl:gap-5 min-w-0">
        {item.type === 'feedback' ? (
          <div className="flex items-center justify-center gap-1 bg-red-100 border-2 border-red-300 text-red-700 rounded-full px-3 2xl:px-4 py-1.5 2xl:py-2 shrink-0">
            <span className="font-extrabold text-base 2xl:text-xl leading-none">{item.rating}</span>
            <span className="text-xs 2xl:text-sm font-semibold leading-none">/5</span>
          </div>
        ) : (
          <div className="w-9 h-9 2xl:w-12 2xl:h-12 rounded-full bg-[#fdbb36]/15 text-[#b8860b] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 2xl:w-6 2xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <p className="font-bold text-[#00212C] text-sm 2xl:text-base 3xl:text-lg truncate">{item.title}</p>
          <p className="text-xs 2xl:text-sm 3xl:text-base text-slate-500 mt-0.5">
            {item.type === 'feedback' ? (
              <span className="text-red-600 font-semibold">{item.detail}</span>
            ) : item.detail}
            {' '}· {item.time}
          </p>
        </div>
      </div>
      <button
        onClick={handleClick}
        className="shrink-0 bg-[#fdbb36] text-[#00212C] font-semibold text-sm 2xl:text-base 3xl:text-lg px-4 2xl:px-6 py-2 2xl:py-3 rounded-lg 2xl:rounded-xl hover:brightness-95 transition"
      >
        {item.action}
      </button>
    </div>
  );
};

export default ActionItemRow;
