import React from 'react';

const formatTimeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const STYLES = {
  reschedule: {
    badge: 'bg-[#fdbb36]/15 text-[#b8860b]',
    button: 'bg-[#fdbb36] text-[#00212C] hover:brightness-95',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  cancelled: {
    badge: 'bg-red-100 text-red-600',
    button: 'bg-red-500 text-white hover:bg-red-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  feedback: {
    badge: 'bg-indigo-100 text-indigo-600',
    button: 'bg-indigo-500 text-white hover:bg-indigo-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.06 0-2.075-.163-3.016-.463L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  rescheduled: {
    badge: 'bg-emerald-100 text-emerald-600',
    button: 'bg-emerald-500 text-white hover:bg-emerald-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  followup: {
    badge: 'bg-purple-100 text-purple-600',
    button: 'bg-purple-500 text-white hover:bg-purple-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  'help-response': {
    badge: 'bg-sky-100 text-sky-600',
    button: 'bg-sky-500 text-white hover:bg-sky-600',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 17.25h.007v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const ActionItemsCard = ({ actionItems, loading, onAction }) => (
  <div>
    <div className="flex items-center gap-2.5 mb-4">
      <h2 className="text-2xl font-bold text-[#00212C]">Action Items</h2>
      {actionItems.length > 0 && (
        <span className="bg-red-100 text-red-700 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {actionItems.length}
        </span>
      )}
    </div>
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {!loading && actionItems.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-slate-400">You're all caught up — no action items right now.</p>
        </div>
      )}
      {actionItems.map(item => {
        const style = STYLES[item.type];
        return (
          <div
            key={`${item.type}-${item.id}`}
            className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.badge}`}>
                {style.icon}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#00212C] text-sm truncate">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {item.detail} · {formatTimeAgo(item.time)}
                </p>
              </div>
            </div>
            <button
              onClick={() => onAction(item)}
              className={`shrink-0 font-semibold text-sm px-4 py-2 rounded-lg transition cursor-pointer ${style.button}`}
            >
              {item.action}
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

export default ActionItemsCard;
