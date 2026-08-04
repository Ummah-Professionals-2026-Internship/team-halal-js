import React, { useState } from 'react';
import AdminSessionCard from '../cards/AdminSessionCard';
import SessionDetailsModal from '../modals/SessionDetailsModal';
import ManageSessionModal from '../modals/ManageSessionModal';
import ViewSessionFeedbackModal from '../modals/ViewSessionFeedbackModal';

const isNew = (createdAt) => (Date.now() - new Date(createdAt).getTime()) < 48 * 60 * 60 * 1000;
const isRecentlyCompleted = (scheduledTime) => (Date.now() - new Date(scheduledTime).getTime()) < 7 * 24 * 60 * 60 * 1000;

const SessionsListSection = ({ sessions, onSessionsChanged }) => {
  const [tab, setTab] = useState('Upcoming');
  const [viewingSession, setViewingSession] = useState(null);
  const [managingSession, setManagingSession] = useState(null);
  const [viewingFeedbackSession, setViewingFeedbackSession] = useState(null);

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const newlyAdded = upcomingSessions.filter(s => isNew(s.createdAt)).length;
  const recentlyCompleted = completedSessions.filter(s => isRecentlyCompleted(s.scheduledTime)).length;

  const visibleSessions = tab === 'Upcoming' ? upcomingSessions : completedSessions;

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#00212C] text-center">All Sessions</h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          {upcomingSessions.length} Upcoming Sessions · {newlyAdded} New Added · {recentlyCompleted} Recently Completed
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setTab('Upcoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            tab === 'Upcoming' ? 'bg-[#fdbb36] text-[#00212C]' : 'text-[#00212C] hover:bg-slate-100'
          }`}
        >
          Upcoming
          <span className="bg-white/60 rounded-full px-2 py-0.5 text-xs">{upcomingSessions.length}</span>
        </button>
        <button
          onClick={() => setTab('Completed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            tab === 'Completed' ? 'bg-[#fdbb36] text-[#00212C]' : 'text-[#00212C] hover:bg-slate-100'
          }`}
        >
          Completed
          <span className="bg-white/60 rounded-full px-2 py-0.5 text-xs">{completedSessions.length}</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {visibleSessions.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-slate-400">No {tab.toLowerCase()} sessions.</p>
          </div>
        )}
        {visibleSessions.map(session => (
          <AdminSessionCard
            key={session._id}
            session={session}
            onViewDetails={setViewingSession}
            onManage={setManagingSession}
            onViewFeedback={setViewingFeedbackSession}
          />
        ))}
      </div>

      {viewingSession && (
        <SessionDetailsModal session={viewingSession} onClose={() => setViewingSession(null)} />
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

      {viewingFeedbackSession && (
        <ViewSessionFeedbackModal session={viewingFeedbackSession} onClose={() => setViewingFeedbackSession(null)} />
      )}
    </div>
  );
};

export default SessionsListSection;
