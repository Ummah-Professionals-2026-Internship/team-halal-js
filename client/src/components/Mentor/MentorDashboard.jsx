import React from 'react';

import AvailabilityPick from '../availability/AvailabilityPick';
import PageLayoutDashboard from '../PageLayoutDashboard';
import UpcomingSessions from '../UpcomingSessions/UpcomingSessions';

const MentorDashboard = () => {
  return (
    <PageLayoutDashboard userName="Zainab Khan" userRole="Mentor">
      <h1 className="text-2xl font-bold text-center text-[#00212C] mb-6 mt-10">Dashboard</h1>
      <div className="flex items-start gap-6 w-full px-2">
        <div className="w-1/2 bg-[#8ACBDB] p-4 rounded-xl">
          <AvailabilityPick title="Mentoring Hours" />
        </div>
        <div className="w-120 shrink-0 ml-20">
          <UpcomingSessions />
        </div>
      </div>
    </PageLayoutDashboard>
  );
};

export default MentorDashboard;
