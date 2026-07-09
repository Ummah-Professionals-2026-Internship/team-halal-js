import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';
import { createSession, rescheduleSession } from '../../api-calls/sessions';

const MenteeBooking = () => {
  const { user } = useCurrentUser();
  const userName = `${user.firstName} ${user.lastName}`;
  const { state } = useLocation();
  const navigate = useNavigate();
  const mentor = state?.mentor;
  const mentorName = mentor ? `${mentor.firstName} ${mentor.lastName}` : 'your mentor';
  const rawSlot = state?.selectedSlot || null;
  const rescheduleSessionId = state?.rescheduleSessionId || null;
  const selectedTime = rawSlot ? (() => {
    const parts = rawSlot.split('-');
    const dateStr = parts.slice(0, 3).join('-');
    const time = parts.slice(3).join('-');
    const dateObj = new Date(dateStr + 'T00:00:00');
    const day = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const [hourStr, period] = time.split(' ');
    let hour = parseInt(hourStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    const endHour24 = (hour + 1) % 24;
    const endPeriod = endHour24 >= 12 ? 'PM' : 'AM';
    const endHour12 = endHour24 % 12 === 0 ? 12 : endHour24 % 12;
    const endTime = `${endHour12} ${endPeriod}`;

    return { day, time, endTime };
  })() : null;

  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseScheduledTime = (slot) => {
    const parts = slot.split('-');
    const dateStr = parts.slice(0, 3).join('-');
    const timeStr = parts.slice(3).join('-');
    const [hourStr, period] = timeStr.split(' ');
    let hour = parseInt(hourStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`).toISOString();
  };

  const handleConfirm = async () => {
    if (!mentor?._id || !rawSlot) {
      setError("Missing booking information. Please go back and select a slot.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (rescheduleSessionId) {
        await rescheduleSession(rescheduleSessionId, {
          scheduledTime: parseScheduledTime(rawSlot),
          service: 'mentorship program',
          details: note,
        });
      } else {
        await createSession({
          mentorId: mentor._id,
          scheduledTime: parseScheduledTime(rawSlot),
          service: 'mentorship program',
          details: note,
        });
      }
      navigate('/mentee/sessions', { state: { mentor } });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to schedule the session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentee" userPhoto={user.profilePicture} onBack={() => navigate(-1)}>
      <div className="flex flex-col items-center gap-4 pb-4 mt-6">
          <h1 className="text-2xl font-bold text-[#00212C]">{rescheduleSessionId ? 'Confirm Reschedule' : 'Confirm Booking'}</h1>

          <div className="bg-[#C5DCE8] rounded-2xl p-8 flex flex-col gap-4 w-full max-w-lg text-left">
            <p className="text-[#00212C]">
              {rescheduleSessionId
                ? `You're about to reschedule your mentorship session with ${mentorName} to`
                : `You're about to schedule a mentorship session with ${mentorName} on`}
            </p>

            {selectedTime ? (
              <p className="font-bold text-[#00212C] text-lg">
                {selectedTime.day} {selectedTime.time}- {selectedTime.endTime}
              </p>
            ) : (
              <p className="font-bold text-[#00212C] text-lg">— time to be confirmed —</p>
            )}

            <p className="text-sm text-[#00212C]">
              Your mentor will be notified that a session is scheduled. You will both be reminded of the session 24 hours and 15 minutes before the session begins.
            </p>

            <p className="text-sm text-[#00212C]">
              (Optional) Share any additional information or specific questions you have with {mentorName} before your session here. This helps your mentor understand what you need help with specifically. You can edit this later as well.
            </p>

            <p className="font-semibold text-[#00212C] text-sm">Additional Info:</p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              className="bg-white w-full rounded-lg p-3 text-sm text-[#00212C] resize-none h-28 border-none outline-none"
            />

            {error && <p className="text-red-600 font-semibold text-xs mt-1">{error}</p>}

            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`font-bold px-6 py-2.5 rounded-lg text-sm w-full transition ${
                loading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-[#fdbb36] text-[#00212C] hover:brightness-95 cursor-pointer'
              }`}
            >
              {loading ? 'Booking Session...' : 'Confirm and Go to Dashboard'}
            </button>
          </div>
        </div>
    </PageLayoutDashboard>
  );
};

export default MenteeBooking;
