import { useState } from 'react'
import SessionCard from './SessionCard'
import CompletedSessionCard from './CompletedSessionCard'
import SectionHeading from '../SectionHeading'
import useSessions from './useSessions'
import SessionFeedbackModal from '../SessionFeedbackModal'

const CountBadge = ({ count }) => (
  <span className="shrink-0 rounded-full bg-[#fdbb36]/15 px-3 py-1 text-xs font-bold text-[#00212C]">
    {count}
  </span>
)

const EmptyState = ({ text }) => (
  <div className="bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center">
    <p className="text-sm text-slate-400">{text}</p>
  </div>
)

const UpcomingSessions = ({ showCompleted = true }) => {
  const { sessions, refetch } = useSessions();
  const [feedbackSession, setFeedbackSession] = useState(null);

  const isPast = s => new Date(s.scheduledTime) < new Date();
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && !isPast(s));
  const completedSessions = sessions
    .filter(s => s.status === 'completed' || (s.status === 'scheduled' && isPast(s)))
    .sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));

  const pendingFeedbackSessions = completedSessions.filter(s => !s.hasSubmittedFeedback);

  const handleOpenFeedback = ({ sessionId, otherPersonName }) => {
    setFeedbackSession({ sessionId, otherPersonName });
  };

  return (
    <div className="flex flex-col gap-6">
      {pendingFeedbackSessions.length > 0 && (
        <div className="bg-gradient-to-r from-[#003F55] to-[#005B7F] text-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fdbb36]/20 text-[#fdbb36] flex items-center justify-center font-bold text-xl shrink-0">
              ★
            </div>
            <div>
              <p className="font-bold text-sm">Action Item: Feedback Required</p>
              <p className="text-xs text-slate-200 mt-0.5">
                You have {pendingFeedbackSessions.length} completed session{pendingFeedbackSessions.length > 1 ? 's' : ''} awaiting your feedback.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const target = pendingFeedbackSessions[0];
              const partner = target.mentee || target.mentor;
              const partnerName = partner ? `${partner.firstName} ${partner.lastName}`.trim() : '';
              handleOpenFeedback({ sessionId: target._id, otherPersonName: partnerName });
            }}
            className="bg-[#fdbb36] hover:bg-[#e5a72e] text-[#00212C] font-bold text-xs px-4 py-2 rounded-lg transition shrink-0 cursor-pointer shadow-sm"
          >
            Leave Feedback
          </button>
        </div>
      )}

      <div>
        <SectionHeading
          title="Upcoming Sessions"
          right={<CountBadge count={upcomingSessions.length} />}
          className="mb-4"
        />
        <div className="max-h-80 overflow-y-auto pr-1 -mr-1">
          {upcomingSessions.length > 0
            ? upcomingSessions.map(session => (
                <SessionCard
                  key={session._id}
                  sessionId={session._id}
                  mentee={session.mentee}
                  {...session}
                  onLeaveFeedback={handleOpenFeedback}
                />
              ))
            : <EmptyState text="No upcoming sessions yet." />}
        </div>
      </div>

      {showCompleted && (
        <div>
          <SectionHeading title="Completed Sessions" className="mb-4" />
          <div className="max-h-80 overflow-y-auto pr-1 -mr-1 flex flex-col gap-3">
            {completedSessions.length > 0
              ? completedSessions.map(session => (
                  <CompletedSessionCard
                    key={session._id}
                    mentee={session.mentee}
                    service={session.service}
                    scheduledTime={session.scheduledTime}
                    details={session.details}
                  />
                ))
              : <EmptyState text="No completed sessions so far." />}
          </div>
        </div>
      )}

      {feedbackSession && (
        <SessionFeedbackModal
          sessionId={feedbackSession.sessionId}
          otherPersonName={feedbackSession.otherPersonName}
          onClose={() => setFeedbackSession(null)}
          onSubmitted={() => {
            setFeedbackSession(null);
            if (refetch) refetch();
            else window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default UpcomingSessions
