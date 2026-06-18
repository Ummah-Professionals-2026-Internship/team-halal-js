import React from 'react';
import PageLayoutDashboard from '../PageLayoutDashboard';
import UpcomingSessions from '../UpcomingSessions/UpcomingSessions';
import MentorAvailabilityCard from './MentorAvailabilityCard';
import useCurrentUser from '../useCurrentUser';

const MentorDashboard = () => {
  const { user, refreshUser } = useCurrentUser()
  const userName = `${user.firstName} ${user.lastName}`

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentor" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser}>
      <h1 className="text-2xl font-bold text-center text-[#00212C] mb-6 mt-10">Dashboard</h1>
      <div className="flex items-start gap-6 w-full px-2">
        <MentorAvailabilityCard />
        <div className="flex-1 min-w-0">
          <UpcomingSessions />
        </div>
      </div>
    </PageLayoutDashboard>
  );
};

export default MentorDashboard;
