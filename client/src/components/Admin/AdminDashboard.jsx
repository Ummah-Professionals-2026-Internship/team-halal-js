import React, { useState, useEffect } from 'react';
import { getHelpRequests } from '../../api-calls/helpRequests';
import { getMentors } from '../../api-calls/mentors';
import { getMentees } from '../../api-calls/mentees';
import { getAllSessions } from '../../api-calls/sessions';
import { getFeedback } from '../../api-calls/feedback';
import { formatTimeAgo } from './adminUtils';
import AdminHeader from './layout/AdminHeader';
import AdminSidebar from './layout/AdminSidebar';
import ActionItemsSection from './sections/ActionItemsSection';
import HelpRequestsSection from './sections/HelpRequestsSection';
import UserListSection from './sections/UserListSection';
import SessionsListSection from './sections/SessionsListSection';
import UpcomingSessionsSection from './sections/UpcomingSessionsSection';
import FeedbackSection from './sections/FeedbackSection';
import RespondModal from './modals/RespondModal';
import FollowUpModal from './modals/FollowUpModal';
import UserProfileModal from './modals/UserProfileModal';

const AdminDashboard = () => {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [helpRequests, setHelpRequests] = useState([]);
  const [respondingTo, setRespondingTo] = useState(null);
  const [followingUpOn, setFollowingUpOn] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);

  const loadHelpRequests = () => {
    getHelpRequests()
      .then(setHelpRequests)
      .catch(console.error);
  };

  const loadSessions = () => {
    getAllSessions().then(setSessions).catch(console.error);
  };

  const loadFeedback = () => {
    getFeedback().then(setFeedback).catch(console.error);
  };

  useEffect(() => {
    loadHelpRequests();
    getMentors().then(setMentors).catch(console.error);
    getMentees().then(setMentees).catch(console.error);
    loadSessions();
    loadFeedback();
  }, []);

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');

  const sessionAnalytics = {
    quality: feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.meetingRating, 0) / feedback.length).toFixed(1)
      : null,
    usefulness: feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.usefulAdviceRating, 0) / feedback.length).toFixed(1)
      : null,
  };

  const openHelpRequests = helpRequests.filter(hr => hr.status !== 'resolved');

  const helpRequestItems = openHelpRequests.map(hr => {
    const detailParts = [];
    if (hr.topics?.length > 0) detailParts.push(hr.topics.join(', '));
    if (hr.message) detailParts.push(`"${hr.message}"`);
    return {
      id: hr._id,
      type: 'help-request',
      raw: hr,
      title: `${hr.user?.firstName ?? 'Someone'} (${hr.user?.role === 'mentor' ? 'Mentor' : 'Mentee'}) Asked for Help`,
      detail: detailParts.length > 0 ? detailParts.join(' — ') : 'No details provided',
      time: formatTimeAgo(hr.createdAt),
      action: 'Respond',
    };
  });

  const negativeFeedbackItems = feedback
    .filter(f => (f.meetingRating <= 2 || f.usefulAdviceRating <= 2) && !f.followedUpAt)
    .map(f => {
      const submittedByName = `${f.submittedBy?.firstName ?? 'Someone'} ${f.submittedBy?.lastName ?? ''}`.trim();
      const submittedByRole = f.submittedBy?.role === 'mentor' ? 'Mentor' : 'Mentee';
      const aboutName = `${f.about?.firstName ?? 'someone'} ${f.about?.lastName ?? ''}`.trim();
      const lowScore = Math.min(f.meetingRating, f.usefulAdviceRating);
      return {
        id: f._id,
        type: 'feedback',
        raw: f,
        rating: lowScore,
        title: `${submittedByName} (${submittedByRole}) rated session with ${aboutName}`,
        detail: 'Negative Review',
        time: formatTimeAgo(f.createdAt),
        action: 'Follow Up',
      };
    });

  const actionItems = [...helpRequestItems, ...negativeFeedbackItems];

  const latestActivity = (f) => Math.max(new Date(f.createdAt), f.followUpRepliedAt ? new Date(f.followUpRepliedAt) : 0);

  const sortedFeedback = [...feedback].sort((a, b) => latestActivity(b) - latestActivity(a));

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">
      <AdminHeader />

      <div className="flex-1 flex gap-8 p-8 max-w-7xl mx-auto w-full">
        <AdminSidebar
          activeNav={activeNav}
          onNavChange={setActiveNav}
          mentorCount={mentors.length}
          menteeCount={mentees.length}
          sessionAnalytics={sessionAnalytics}
        />

        <main className="flex-1 min-w-0 flex flex-col gap-8">
          {activeNav === 'Help Requests' ? (
            <HelpRequestsSection helpRequests={helpRequests} onRespond={setRespondingTo} />
          ) : activeNav === 'Mentors' ? (
            <UserListSection
              title="All Mentors"
              people={mentors}
              emptyText="No mentors have signed up yet."
              onView={setViewingUser}
            />
          ) : activeNav === 'Mentees' ? (
            <UserListSection
              title="All Mentees"
              people={mentees}
              emptyText="No mentees have signed up yet."
              onView={setViewingUser}
            />
          ) : activeNav === 'Sessions' ? (
            <SessionsListSection sessions={sessions} onSessionsChanged={loadSessions} />
          ) : activeNav === 'Feedback' ? (
            <FeedbackSection feedback={sortedFeedback} />
          ) : (
            <>
              <ActionItemsSection
                actionItems={actionItems}
                onRespond={setRespondingTo}
                onFollowUp={setFollowingUpOn}
                onViewHelpRequests={() => setActiveNav('Help Requests')}
                onViewFeedback={() => setActiveNav('Feedback')}
                onViewSessions={() => setActiveNav('Sessions')}
              />
              <UpcomingSessionsSection
                sessions={upcomingSessions}
                onViewSessions={() => setActiveNav('Sessions')}
                onSessionsChanged={loadSessions}
              />
            </>
          )}
        </main>
      </div>

      {respondingTo && (
        <RespondModal
          helpRequest={respondingTo}
          onClose={() => setRespondingTo(null)}
          onSent={() => {
            setRespondingTo(null);
            loadHelpRequests();
          }}
        />
      )}

      {followingUpOn && (
        <FollowUpModal
          feedback={followingUpOn}
          onClose={() => setFollowingUpOn(null)}
          onSent={() => {
            setFollowingUpOn(null);
            loadFeedback();
          }}
        />
      )}

      {viewingUser && (
        <UserProfileModal person={viewingUser} onClose={() => setViewingUser(null)} />
      )}
    </div>
  );
};

export default AdminDashboard;
