import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';
import MentorProfileCard from './MentorProfileCard';
import AvailabilityPick from '../availability/AvailabilityPick';
import { apiFetch } from '../../api-calls/client';

const toDateSlotId = (scheduledTime) => {
  const d = new Date(scheduledTime);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const h = d.getHours();
  const timeStr = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`;
  return `${dateStr}-${timeStr}`;
};

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
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [mySessions, setMySessions] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])

  useEffect(() => {
    apiFetch('/api/sessions/mentee')
      .then(r => r.json())
      .then(data => setMySessions(data.filter(s => s.status === 'scheduled').map(s => toDateSlotId(s.scheduledTime))))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!mentor?._id) return;
    apiFetch(`/api/sessions/mentor/${mentor._id}/booked`)
      .then(r => r.json())
      .then(data => setBookedSlots(data.map(s => toDateSlotId(s.scheduledTime))))
      .catch(() => {})
  }, [mentor?._id])

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentee" userPhoto={user.profilePicture} onBack={() => navigate(-1)}>
      <div className="flex flex-col items-center gap-4 pb-4">
          <h1 className="text-2xl font-bold text-[#00212C]">
            Schedule a Mentorship Session With {mentorName}
          </h1>

          <div className="flex w-full max-w-4xl gap-6 items-center">
            {mentor && <MentorProfileCard mentor={mentor} />}

            <div className="flex-1 bg-[#C5DCE8] rounded-2xl p-4 flex flex-col gap-3">
              <AvailabilityPick
                title={`${mentorName}'s Availability`}
                mentorSlots={mentorSlots}
                sessions={mySessions}
                conflicts={bookedSlots.filter(s => !mySessions.includes(s))}
                readOnly
                onSlotSelect={setSelectedSlot}
                selectedSlot={selectedSlot}
              />

              <button
                onClick={() => navigate('/mentee/booking', { state: { mentor, selectedSlot } })}
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
