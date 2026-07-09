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
  const rescheduleSessionId = state?.rescheduleSessionId || null;
  const recommended = state?.recommended || false;
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
            {rescheduleSessionId ? `Reschedule Your Session With ${mentorName}` : `Schedule a Mentorship Session With ${mentorName}`}
          </h1>

          <div className="flex w-full max-w-4xl gap-6 items-center">
            {mentor && <MentorProfileCard mentor={mentor} recommended={recommended} />}

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

              <div className="text-center">
                <p className="font-bold text-[#00212C] text-base">Auto-Selected Meeting Time:</p>
                <div className="bg-[#FFFCF0] rounded-lg px-4 py-2 mt-2 mx-auto inline-block">
                  {selectedSlot ? (
                    <p className="font-bold text-[#00212C] text-base">
                      {(() => {
                        const parts = selectedSlot.split('-');
                        const date = new Date(parts.slice(0,3).join('-') + 'T00:00:00');
                        const time = parts.slice(3).join('-');
                        const [hourStr, period] = time.split(' ');
                        let hour = parseInt(hourStr, 10);
                        if (period === 'PM' && hour !== 12) hour += 12;
                        if (period === 'AM' && hour === 12) hour = 0;
                        const endHour24 = (hour + 1) % 24;
                        const endPeriod = endHour24 >= 12 ? 'PM' : 'AM';
                        const endHour12 = endHour24 % 12 === 0 ? 12 : endHour24 % 12;
                        return (
                          <>
                            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            <br />
                            {time}- {endHour12} {endPeriod}
                          </>
                        );
                      })()}
                    </p>
                  ) : (
                    <p className="font-bold text-gray-500 text-base">Please select a slot above</p>
                  )}
                </div>
                <p className="text-sm text-[#00212C] mt-2">Click to Select Another Time<br />on The Calendar</p>
              </div>

              <button
                onClick={() => navigate('/mentee/booking', { state: { mentor, selectedSlot, rescheduleSessionId } })}
                disabled={!selectedSlot}
                className={`font-bold py-2.5 rounded-lg text-sm w-full transition ${
                  selectedSlot
                    ? 'bg-[#fdbb36] text-[#00212C] hover:brightness-95 cursor-pointer'
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
