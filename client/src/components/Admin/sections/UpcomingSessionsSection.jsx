import React, { useState } from 'react';
import UpcomingSessionCard from '../cards/UpcomingSessionCard';
import ManageSessionModal from '../modals/ManageSessionModal';

const UpcomingSessionsSection = ({ sessions, onViewSessions, onSessionsChanged }) => {
  const [managingSession, setManagingSession] = useState(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 2xl:mb-6">
        <h2 className="text-2xl 2xl:text-3xl 3xl:text-4xl font-bold text-[#00212C]">Upcoming Sessions</h2>
        <button onClick={onViewSessions} className="text-[#003F55] underline text-sm 2xl:text-base cursor-pointer">View All</button>
      </div>
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 2xl:py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <svg className="w-8 h-8 2xl:w-12 2xl:h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm 2xl:text-base 3xl:text-lg text-slate-400">No upcoming sessions.</p>
        </div>
      ) : (
        <div className="flex gap-4 2xl:gap-6 overflow-x-auto pb-2">
          {sessions.map(session => (
            <UpcomingSessionCard key={session._id} session={session} onManage={setManagingSession} />
          ))}
        </div>
      )}

      {managingSession && (
        <ManageSessionModal
          session={managingSession}
          onClose={() => setManagingSession(null)}
          onDone={() => {
            setManagingSession(null);
            onSessionsChanged();
          }}
        />
      )}
    </div>
  );
};

export default UpcomingSessionsSection;
