import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';

const MenteeBooking = () => {
  const { user } = useCurrentUser();
  const userName = `${user.firstName} ${user.lastName}`;
  const { state } = useLocation();
  const navigate = useNavigate();
  const mentor = state?.mentor;
  const mentorName = mentor ? `${mentor.firstName} ${mentor.lastName}` : 'your mentor';
  const selectedTime = state?.selectedTime || null;

  const [note, setNote] = useState('');

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentee" userPhoto={user.profilePicture} onBack={() => navigate(-1)}>
      <div className="flex flex-col items-center gap-4 pb-4 mt-6">
          <h1 className="text-2xl font-bold text-[#00212C]">Confirm Booking</h1>

          <div className="bg-[#C5DCE8] rounded-2xl p-8 flex flex-col items-center gap-4 w-full max-w-lg text-center">
            <p className="text-[#00212C]">
              You've scheduled a mentorship session with {mentorName} for
            </p>

            {selectedTime ? (
              <>
                <p className="font-bold text-[#00212C] text-lg">{selectedTime.day}</p>
                <p className="font-bold text-[#00212C] text-lg">{selectedTime.time}</p>
              </>
            ) : (
              <p className="font-bold text-[#00212C] text-lg">— time to be confirmed —</p>
            )}

            <p className="text-sm text-[#00212C]">
              Your mentor has been notified that the session is scheduled. You will both be
              reminded of the session 24 hours and 15 minutes before the session begins.
            </p>

            <p className="text-sm text-[#00212C]">
              You can share any additional information or specific questions you have
              with {mentorName} before your session here. This helps your mentor understand
              what you need help with specifically.
            </p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-white w-full rounded-lg p-3 text-sm text-[#00212C] resize-none h-28 border-none outline-none"
            
            />

            <button
              onClick={() => navigate('/mentee/sessions', { state: { mentor } })}
              className="bg-[#003F55] text-white font-semibold px-6 py-2 rounded-lg text-sm w-full"
            >
              Confirm and Go to Dashboard
            </button>
          </div>
        </div>
    </PageLayoutDashboard>
  );
};

export default MenteeBooking;
