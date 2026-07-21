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
  
  const isMentorRescheduling = user?.role === 'mentor';
  const mentorDoc = isMentorRescheduling ? user : state?.mentor;
  const menteeDoc = isMentorRescheduling ? state?.mentor : user;

  const rescheduleSessionId = state?.rescheduleSessionId || null;
  const recommended = state?.recommended || false;
  const mentorName = mentorDoc ? `${mentorDoc.firstName} ${mentorDoc.lastName}` : 'Mentor';
  const menteeName = menteeDoc ? `${menteeDoc.firstName} ${menteeDoc.lastName}` : 'Mentee';
  // When a mentor reschedules, they need to see the mentee's manual calendar to pick a time the mentee is free
  const calendarDoc = isMentorRescheduling ? menteeDoc : mentorDoc;
  const calendarOwnerName = isMentorRescheduling ? menteeName : mentorName;
  const mentorSlots = (calendarDoc?.manualAvailabilitySlots||[]).map(
    slot => `${slot.day}-${slot.startTime}`
  )
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [mySessionsWithMentor, setMySessionsWithMentor] = useState([])
  const [myConflicts, setMyConflicts] = useState([])
  const [conflictInfo, setConflictInfo] = useState({})
  const [bookedSlots, setBookedSlots] = useState([])

  useEffect(() => {
    if (!mentorDoc?._id || !menteeDoc?._id) return;
    const endpoint = isMentorRescheduling ? '/api/sessions' : '/api/sessions/mentee';
    apiFetch(endpoint)
      .then(r => r.json())
      .then(data => {
        const scheduled = data.filter(s => s.status === 'scheduled');
        const partnerId = String(isMentorRescheduling ? menteeDoc._id : mentorDoc._id);
        
        const mySessions = scheduled.filter(s => {
          const sPartner = isMentorRescheduling ? s.mentee : s.mentor;
          return String(sPartner?._id || sPartner) === partnerId;
        });
        setMySessionsWithMentor(mySessions.map(s => toDateSlotId(s.scheduledTime)));
        
        const others = scheduled.filter(s => {
          const sPartner = isMentorRescheduling ? s.mentee : s.mentor;
          return String(sPartner?._id || sPartner) !== partnerId;
        });
        setMyConflicts(others.map(s => toDateSlotId(s.scheduledTime)));
        
        const info = {};
        others.forEach(s => {
          const slotId = toDateSlotId(s.scheduledTime);
          const p = isMentorRescheduling ? s.mentee : s.mentor;
          info[slotId] = p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : 'another user';
        });
        setConflictInfo(info);
      })
      .catch(() => {})
  }, [mentorDoc?._id, menteeDoc?._id, isMentorRescheduling])

  useEffect(() => {
    // Shows as grey/unavailable on the calendar without revealing who the other booking is with
    if (!calendarDoc?._id) return;
    const endpoint = isMentorRescheduling
      ? `/api/sessions/mentee/${calendarDoc._id}/booked`
      : `/api/sessions/mentor/${calendarDoc._id}/booked`;
    apiFetch(endpoint)
      .then(r => r.json())
      .then(data => setBookedSlots(data.map(s => toDateSlotId(s.scheduledTime))))
      .catch(() => {})
  }, [calendarDoc?._id, isMentorRescheduling])

  return (
    <PageLayoutDashboard userName={userName} userRole={isMentorRescheduling ? 'Mentor' : 'Mentee'} userPhoto={user.profilePicture} onBack={() => navigate(-1)}>
      <div className="max-w-4xl mx-auto w-full mt-6 flex flex-col gap-6 pb-4">
        <div>
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">
            {rescheduleSessionId ? `Reschedule Your Session With ${isMentorRescheduling ? `${menteeDoc?.firstName} ${menteeDoc?.lastName}` : mentorName}` : `Schedule a Mentorship Session With ${mentorName}`}
          </h1>
        </div>

        <div className="flex w-full gap-6 items-start">
          {calendarDoc && <MentorProfileCard mentor={calendarDoc} recommended={recommended} />}

          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
            <AvailabilityPick
              title={`${calendarOwnerName}'s Availability`}
              availabilityLabel={`${calendarOwnerName}'s Availability`}
              mentorSlots={mentorSlots}
              sessions={mySessionsWithMentor}
              conflicts={myConflicts}
              mentorBusy={bookedSlots.filter(s => !mySessionsWithMentor.includes(s))}
              conflictInfo={conflictInfo}
              sessionMentorName={calendarOwnerName}
              readOnly
              onSlotSelect={setSelectedSlot}
              selectedSlot={selectedSlot}
            />

            <div className="bg-[#FFFCF0] border border-[#fdbb36]/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fdbb36]/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#003F55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Auto-Selected Meeting Time</p>
                {selectedSlot ? (
                  <p className="font-bold text-[#00212C] text-sm">
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
                          {' '}&middot;{' '}
                          {time}–{endHour12} {endPeriod}
                        </>
                      );
                    })()}
                  </p>
                ) : (
                  <p className="font-semibold text-slate-400 text-sm">Please select a slot above</p>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center -mt-2">Click to select another time on the calendar</p>

            <button
              onClick={() => navigate('/mentee/booking', { state: { mentor: calendarDoc, selectedSlot, rescheduleSessionId } })}
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
