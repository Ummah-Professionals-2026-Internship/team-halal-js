import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';
import SessionCard from '../UpcomingSessions/SessionCard';
import SectionHeading from '../SectionHeading';
import SessionFeedbackModal from '../SessionFeedbackModal';
import { getMenteeSessions } from '../../api-calls/sessions';

const CountBadge = ({ count }) => (
  <span className="shrink-0 rounded-full bg-[#fdbb36]/15 px-3 py-1 text-xs font-bold text-[#00212C]">
    {count}
  </span>
);

const EmptyState = ({ text }) => (
  <div className="bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center">
    <p className="text-sm text-slate-400">{text}</p>
  </div>
);

const MenteeSessionsDashboard = () => {
  const { user, refreshUser } = useCurrentUser();
  const userName = `${user.firstName} ${user.lastName}`;
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [feedbackSession, setFeedbackSession] = useState(null);

  const fetchSessions = () => {
    getMenteeSessions()
      .then(setSessions)
      .catch(console.error);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

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
    <PageLayoutDashboard userName={userName} userRole="Mentee" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser}>
      <div className="max-w-2xl mx-auto w-full mt-6 flex flex-col gap-6 pb-4">
        <div>
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">Dashboard</h1>
        </div>

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
                const partner = target.mentor;
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
          {upcomingSessions.length > 0
            ? upcomingSessions.map(s => (
                <SessionCard
                  key={s._id}
                  sessionId={s._id}
                  mentee={s.mentor}
                  service={s.service}
                  scheduledTime={s.scheduledTime}
                  link={s.link}
                  status={s.status}
                  details={s.details}
                  hasSubmittedFeedback={s.hasSubmittedFeedback}
                  onLeaveFeedback={handleOpenFeedback}
                />
              ))
            : <EmptyState text="No upcoming sessions yet." />}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/mentee-dashboard')}
            className="bg-[#003F55] text-white font-semibold px-6 py-2 rounded-lg text-sm cursor-pointer hover:bg-[#002b3a] transition"
          >
            Add Session
          </button>
        </div>

        <div>
          <SectionHeading title="Completed Sessions" className="mb-4" />
          {completedSessions.length > 0
            ? completedSessions.map(s => (
                <SessionCard
                  key={s._id}
                  sessionId={s._id}
                  mentee={s.mentor}
                  service={s.service}
                  scheduledTime={s.scheduledTime}
                  link={s.link}
                  status={s.status}
                  details={s.details}
                  hasSubmittedFeedback={s.hasSubmittedFeedback}
                  onLeaveFeedback={handleOpenFeedback}
                />
              ))
            : <EmptyState text="No completed sessions so far." />}
        </div>
      </div>

      {feedbackSession && (
        <SessionFeedbackModal
          sessionId={feedbackSession.sessionId}
          otherPersonName={feedbackSession.otherPersonName}
          onClose={() => setFeedbackSession(null)}
          onSubmitted={() => {
            setFeedbackSession(null);
            fetchSessions();
          }}
        />
      )}
    </PageLayoutDashboard>
  );
};

export default MenteeSessionsDashboard;
