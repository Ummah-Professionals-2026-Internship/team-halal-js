import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';
import SessionCard from '../UpcomingSessions/SessionCard';
import SectionHeading from '../SectionHeading';
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

  useEffect(() => {
    getMenteeSessions()
      .then(setSessions)
      .catch(console.error);
  }, []);

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentee" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser}>
      <div className="max-w-2xl mx-auto w-full mt-6 flex flex-col gap-6 pb-4">
        <div>
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">Dashboard</h1>
        </div>

        <div>
          <SectionHeading
            title="Upcoming Sessions"
            right={<CountBadge count={upcomingSessions.length} />}
            className="mb-4"
          />
          {upcomingSessions.length > 0
            ? upcomingSessions.map(s => (
                <SessionCard key={s._id} sessionId={s._id} mentee={s.mentor} service={s.service} scheduledTime={s.scheduledTime} link={s.link} status={s.status} />
              ))
            : <EmptyState text="No upcoming sessions yet." />}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/mentee-dashboard')}
            className="bg-[#003F55] text-white font-semibold px-6 py-2 rounded-lg text-sm"
          >
            Add Session
          </button>
        </div>

        <div>
          <SectionHeading title="Completed Sessions" className="mb-4" />
          {completedSessions.length > 0
            ? completedSessions.map(s => (
                <SessionCard key={s._id} sessionId={s._id} mentee={s.mentor} service={s.service} scheduledTime={s.scheduledTime} link={s.link} status={s.status} />
              ))
            : <EmptyState text="No completed sessions so far." />}
        </div>
      </div>
    </PageLayoutDashboard>
  );
};

export default MenteeSessionsDashboard;
