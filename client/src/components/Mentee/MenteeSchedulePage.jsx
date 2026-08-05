import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';
import MentorProfileCard from './MentorProfileCard';
import BookSessionModal from './BookSessionModal';
import { apiFetch } from '../../api-calls/client';

const toDateSlotId = (scheduledTime) => {
  const d = new Date(scheduledTime);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const h = d.getHours();
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const min = d.getMinutes() < 30 ? '00' : '30';
  return `${dateStr}-${h12}:${min} ${period}`;
};

const expandLegacyTimeLabel = (label) => {
  if (label.includes(':')) return [label];
  const match = label.match(/^(\d+)\s*(AM|PM)$/);
  if (!match) return [label];
  const [, hStr, period] = match;
  return [`${hStr}:00 ${period}`, `${hStr}:30 ${period}`];
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
  const mentorSlots = (calendarDoc?.manualAvailabilitySlots||[]).flatMap(
    slot => expandLegacyTimeLabel(slot.startTime).map(t => `${slot.day}-${t}`)
  )
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showBookModal, setShowBookModal] = useState(false)
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
      <div className="max-w-2xl mx-auto w-full mt-6 flex flex-col gap-4 pb-4">
        <div>
          <div className="w-10 h-1.5 rounded-full bg-[#fdbb36] mb-2" />
          <h1 className="text-xl font-bold text-[#00212C]">
            {rescheduleSessionId ? `Reschedule Your Session With ${isMentorRescheduling ? `${menteeDoc?.firstName} ${menteeDoc?.lastName}` : mentorName}` : `Schedule a Mentorship Session With ${mentorName}`}
          </h1>
        </div>

        {calendarDoc && <MentorProfileCard mentor={calendarDoc} recommended={recommended} />}

        <button
          type="button"
          onClick={() => setShowBookModal(true)}
          className="bg-[#003F55] text-white font-bold py-3 rounded-lg text-sm w-full hover:brightness-110 transition cursor-pointer"
        >
          {rescheduleSessionId ? 'Choose a New Time' : 'Choose Your Time'}
        </button>
      </div>

      {showBookModal && (
        <BookSessionModal
          calendarOwnerName={calendarOwnerName}
          mentorSlots={mentorSlots}
          sessions={mySessionsWithMentor}
          conflicts={myConflicts}
          mentorBusy={bookedSlots.filter(s => !mySessionsWithMentor.includes(s))}
          conflictInfo={conflictInfo}
          selectedSlot={selectedSlot}
          onSlotSelect={setSelectedSlot}
          onClose={() => setShowBookModal(false)}
          onConfirm={() => navigate('/mentee/booking', { state: { mentor: calendarDoc, selectedSlot, rescheduleSessionId } })}
        />
      )}
    </PageLayoutDashboard>
  );
};

export default MenteeSchedulePage;
