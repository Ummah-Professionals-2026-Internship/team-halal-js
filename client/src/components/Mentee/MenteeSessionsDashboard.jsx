import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';
import SessionCard from '../UpcomingSessions/SessionCard';
import UpcomingSessions from '../UpcomingSessions/UpcomingSessions';
import SectionHeading from '../SectionHeading';

const MenteeSessionsDashboard = () => {
  const { user, refreshUser } = useCurrentUser();
  const userName = `${user.firstName} ${user.lastName}`;
  const navigate = useNavigate();
  const { state } = useLocation();
  const mentor = state?.mentor;

  const pendingScheduledTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentee" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser}>
      <div className="max-w-2xl mx-auto w-full mt-6 flex flex-col gap-6 pb-4">
        <div>
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">Dashboard</h1>
        </div>

        {mentor && (
          <div>
            <SectionHeading title="Upcoming Sessions" className="mb-4" />
            <SessionCard
              mentee={mentor}
              service={mentor.volunteeringFor?.[0] || 'Session'}
              scheduledTime={pendingScheduledTime}
            />
            <button
              onClick={() => navigate('/mentee-dashboard')}
              className="mt-3 bg-[#003F55] text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Add Session
            </button>
          </div>
        )}

        <UpcomingSessions />
      </div>
    </PageLayoutDashboard>
  );
};

export default MenteeSessionsDashboard;
