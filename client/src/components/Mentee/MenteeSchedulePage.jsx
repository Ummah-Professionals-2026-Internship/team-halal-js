import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';
import MentorProfileCard from './MentorProfileCard';
import AvailabilityPick from '../availability/AvailabilityPick';

const MenteeSchedulePage = () => {
  const { user } = useCurrentUser();
  const userName = `${user.firstName} ${user.lastName}`;
  const { state } = useLocation();
  const navigate = useNavigate();
  const mentor = state?.mentor;
  const mentorName = mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Mentor';
  const mentorSlots = (mentor?.manualAvailabilitySlots||[]).map(
    slot => `${slot.day}-${slot.startTime}`
  )


  return (
    <PageLayoutDashboard userName={userName} userRole="Mentee" userPhoto={user.profilePicture} onBack={() => navigate(-1)}>
      <div className="flex flex-col items-center gap-4 pb-4">
          <h1 className="text-2xl font-bold text-[#00212C]">
            Schedule a Mentorship Session With {mentorName}
          </h1>

          <div className="flex w-full max-w-4xl gap-6 items-center">
            {mentor && <MentorProfileCard mentor={mentor} />}

            <div className="flex-1 bg-[#C5DCE8] rounded-2xl p-4 flex flex-col gap-3">
              <AvailabilityPick title={`${mentorName}'s Availability`}  mentorSlots={mentorSlots} readOnly />

              <div className="text-center">
                <p className="font-semibold text-[#00212C] text-sm">Auto-Selected Meeting Time:</p>
                <p className="text-xs text-[#00212C] mt-1">Click to Select Another Time on The Calendar</p>
              </div>

              <button
                onClick={() => navigate('/mentee/booking', { state: { mentor } })}
                className="bg-[#003F55] text-white font-semibold py-2 rounded-lg text-sm w-full"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
    </PageLayoutDashboard>
  );
};

export default MenteeSchedulePage;
