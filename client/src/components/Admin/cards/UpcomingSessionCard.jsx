import React from 'react';

const isNew = (createdAt) => (Date.now() - new Date(createdAt).getTime()) < 48 * 60 * 60 * 1000;

const UpcomingSessionCard = ({ session, onManage }) => {
  const mentorName = `${session.mentor?.firstName ?? 'Unknown'} ${session.mentor?.lastName ?? ''}`.trim();
  const menteeName = `${session.mentee?.firstName ?? 'Unknown'} ${session.mentee?.lastName ?? ''}`.trim();
  const when = new Date(session.scheduledTime);
  const dateStr = when.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="bg-white rounded-xl border border-slate-100 border-l-4 border-l-[#007CA6] shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-2 shrink-0 w-64">
      {session.rescheduleRequestedAt ? (
        <span className="self-start bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
          Reschedule Requested
        </span>
      ) : isNew(session.createdAt) && (
        <span className="self-start bg-[#fdbb36]/20 text-[#00212C] text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
          New
        </span>
      )}
      <p className="font-bold text-[#00212C] text-sm">{mentorName} and {menteeName}</p>
      <p className="text-xs text-slate-500 capitalize">
        {session.service} · {dateStr}
        <br />
        {timeStr}
      </p>
      <div className="flex flex-col gap-1.5 mt-1">
        <button
          onClick={() => onManage(session)}
          className="border border-[#003F55] text-[#003F55] text-xs font-semibold py-1.5 rounded-lg hover:bg-slate-50 transition"
        >
          Manage
        </button>
        <a
          href={session.link || undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!session.link}
          className={`text-center text-xs font-semibold py-1.5 rounded-lg transition ${
            session.link
              ? 'bg-[#003F55] text-white hover:brightness-110 cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
          }`}
        >
          Join Meeting
        </a>
      </div>
    </div>
  );
};

export default UpcomingSessionCard;
