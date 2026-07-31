import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';
import { getMatchSuggestions } from '../../api-calls/mentees';
import { getMenteeSessions } from '../../api-calls/sessions';
import MentorCard from './MentorCard';
import SessionFeedbackModal from '../SessionFeedbackModal';

const MenteeDashboard = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useCurrentUser();
  const userName = `${user.firstName} ${user.lastName}`;

  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackSession, setFeedbackSession] = useState(null);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([
      getMatchSuggestions(),
      getMenteeSessions().catch(() => [])
    ])
      .then(([mentorData, sessionData]) => {
        setMentors(mentorData);
        setSessions(sessionData);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSchedule = (mentor, recommended) => {
    navigate('/mentee/schedule', { state: { mentor, recommended } });
  };

  const isPast = s => new Date(s.scheduledTime) < new Date();
  const completedSessions = sessions.filter(s => s.status === 'completed' || (s.status === 'scheduled' && isPast(s)));
  const pendingFeedbackSessions = completedSessions.filter(s => !s.hasSubmittedFeedback);

  const handleOpenFeedback = ({ sessionId, otherPersonName }) => {
    setFeedbackSession({ sessionId, otherPersonName });
  };

  const recommended = mentors[0] || null;
  const moreMentors = mentors.slice(1);

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentee" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser}>
      <div className="max-w-3xl mx-auto w-full pb-4">
        <div className="mb-6 mt-2">
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">
            Welcome back{user.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Find your best mentor match.</p>
        </div>

        {/* Action Item Banner for Pending Feedback */}
        {pendingFeedbackSessions.length > 0 && (
          <div className="bg-gradient-to-r from-[#003F55] to-[#005B7F] text-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4 mb-6">
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

        <div className="flex flex-col items-center w-full gap-3">
          {loading && (
            <p className="text-gray-500 mt-4">Finding your best mentors...</p>
          )}

          {error && (
            <p className="text-red-500 mt-4">Could not load mentors: {error}</p>
          )}

          {!loading && !error && mentors.length === 0 && (
            <p className="text-gray-500 mt-4">No mentors found yet. Check back soon!</p>
          )}

          {!loading && !error && recommended && (
            <>
              <p className="text-[#00212C] self-start">Recommended Mentor</p>
              <MentorCard
                mentor={recommended}
                bg="bg-[#C5DCE8]"
                recommended
                onSchedule={handleSchedule}
              />
            </>
          )}

          {!loading && !error && moreMentors.length > 0 && (
            <>
              <p className="text-[#00212C] self-start mt-2">More Mentors</p>
              <div className="flex flex-col w-full gap-3">
                {moreMentors.map((mentor) => (
                  <MentorCard
                    key={mentor._id}
                    mentor={mentor}
                    bg="bg-white border border-slate-200"
                    onSchedule={handleSchedule}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {feedbackSession && (
        <SessionFeedbackModal
          sessionId={feedbackSession.sessionId}
          otherPersonName={feedbackSession.otherPersonName}
          onClose={() => setFeedbackSession(null)}
          onSubmitted={() => {
            setFeedbackSession(null);
            fetchDashboardData();
          }}
        />
      )}
    </PageLayoutDashboard>
  );
};

export default MenteeDashboard;
