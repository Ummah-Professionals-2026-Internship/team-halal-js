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
  const [mySessionsWithMentor, setMySessionsWithMentor] = useState([])
  const [myConflicts, setMyConflicts] = useState([])
  const [conflictInfo, setConflictInfo] = useState({})
  const [bookedSlots, setBookedSlots] = useState([])

  useEffect(() => {
    if (!mentor?._id) return;
    apiFetch('/api/sessions/mentee')
      .then(r => r.json())
      .then(data => {
        const scheduled = data.filter(s => s.status === 'scheduled');
        const mentorId = String(mentor._id);
        setMySessionsWithMentor(
          scheduled.filter(s => String(s.mentor?._id || s.mentor) === mentorId).map(s => toDateSlotId(s.scheduledTime))
        );
        const others = scheduled.filter(s => String(s.mentor?._id || s.mentor) !== mentorId);
        setMyConflicts(others.map(s => toDateSlotId(s.scheduledTime)));
        const info = {};
        others.forEach(s => {
          const slotId = toDateSlotId(s.scheduledTime);
          const m = s.mentor;
          info[slotId] = m ? `${m.firstName || ''} ${m.lastName || ''}`.trim() : 'another mentor';
        });
        setConflictInfo(info);
      })
      .catch(() => {})
  }, [mentor?._id])

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
                sessions={mySessionsWithMentor}
                conflicts={myConflicts}
                mentorBusy={bookedSlots.filter(s => !mySessionsWithMentor.includes(s))}
                conflictInfo={conflictInfo}
                sessionMentorName={mentorName}
                readOnly
                onSlotSelect={setSelectedSlot}
                selectedSlot={selectedSlot}
              />

              {selectedSlot ? (
                <div className="text-center">
                  <p className="font-semibold text-[#00212C] text-sm">Selected Meeting Time:</p>
                  <p className="font-bold text-[#003F55] text-base mt-1">
                    {(() => {
                      const parts = selectedSlot.split('-');
                      const date = new Date(parts.slice(0,3).join('-') + 'T00:00:00');
                      return `${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} @ ${parts.slice(3).join('-')}`;
                    })()}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-semibold text-[#00212C] text-sm">Selected Meeting Time:</p>
                  <p className="font-bold text-gray-500 text-base mt-1">
                    Please select a slot above
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  if (!selectedSlot) return;
                  const parts = selectedSlot.split('-');
                  const datePart = parts.slice(0, 3).join('-');
                  const timePart = parts.slice(3).join('-');
                  const match = timePart.match(/^(\d+)\s*(AM|PM)$/i);
                  let hours = 0;
                  if (match) {
                    hours = parseInt(match[1], 10);
                    const ampm = match[2].toUpperCase();
                    if (ampm === 'PM' && hours !== 12) {
                      hours += 12;
                    } else if (ampm === 'AM' && hours === 12) {
                      hours = 0;
                    }
                  }

                  const scheduledDate = new Date(`${datePart}T00:00:00`);
                  scheduledDate.setHours(hours, 0, 0, 0);

                  const formattedDay = scheduledDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  
                  const formattedTime = scheduledDate.toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit'
                  });

                  navigate('/mentee/booking', {
                    state: {
                      mentor,
                      selectedTime: {
                        day: formattedDay,
                        time: formattedTime,
                        date: scheduledDate.toISOString(),
                        service: mentor.volunteeringFor?.[0] || 'mentorship program'
                      }
                    }
                  });
                }}
                disabled={!selectedSlot}
                className={`font-semibold py-2 rounded-lg text-sm w-full transition-colors ${
                  selectedSlot 
                    ? 'bg-[#003F55] text-white hover:bg-[#002b3a] cursor-pointer' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-40'
                }`}
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
