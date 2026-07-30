import React from 'react';

const isNew = (createdAt) => (Date.now() - new Date(createdAt).getTime()) < 48 * 60 * 60 * 1000;

const formatSessionTiming = (scheduledTime) => {
  const diffMs = new Date(scheduledTime).getTime() - Date.now();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours <= 1 && diffHours >= -1) return 'Happening Now';
  const days = Math.round(diffMs / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `Session in ${days} days`;
};

const AdminSessionCard = ({ session, onViewDetails, onManage, onViewFeedback }) => {
  const mentorName = `${session.mentor?.firstName ?? 'Unknown'} ${session.mentor?.lastName ?? ''}`.trim();
  const menteeName = `${session.mentee?.firstName ?? 'Unknown'} ${session.mentee?.lastName ?? ''}`.trim();
  const when = new Date(session.scheduledTime);
  const dateStr = when.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const upcoming = session.status === 'scheduled';

  return (
    <div className={`bg-white rounded-xl border border-slate-100 border-l-4 ${upcoming ? 'border-l-[#007CA6]' : 'border-l-emerald-400'} shadow-sm hover:shadow-md transition-shadow p-4 flex items-start justify-between gap-4`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-[#00212C] text-sm">{mentorName} and {menteeName}</p>
          {isNew(session.createdAt) && (
            <span className="bg-[#fdbb36] text-[#00212C] text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
              New
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 capitalize mt-0.5">{session.service}</p>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onViewDetails(session)}
            className="bg-slate-100 text-[#003F55] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            View Details
          </button>
          {upcoming ? (
            <>
              <button
                onClick={() => onManage(session)}
                className="border border-[#003F55] text-[#003F55] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                Manage
              </button>
              <a
                href={session.link || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!session.link}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                  session.link
                    ? 'bg-[#003F55] text-white hover:brightness-110 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                Join Meeting
              </a>
            </>
          ) : (
            <button
              onClick={() => onViewFeedback(session)}
              className="bg-[#003F55] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:brightness-110 transition"
            >
              View Feedback
            </button>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        {upcoming && (
          <p className="text-xs font-bold text-[#007CA6] mb-1">{formatSessionTiming(session.scheduledTime)}</p>
        )}
        <p className="text-xs text-slate-500">{dateStr}</p>
        <p className="text-xs text-slate-500">{timeStr}</p>
      </div>
    </div>
  );
};

export default AdminSessionCard;
