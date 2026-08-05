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
  const isMentor = user?.role === 'mentor';
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

    const [timePart, period] = time.split(' ');
    const [hStr, mStr = '0'] = timePart.split(':');
    let hour = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    const totalMinutes = hour * 60 + minutes + 30;
    const endHour24 = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endPeriod = endHour24 >= 12 ? 'PM' : 'AM';
    const endHour12 = endHour24 % 12 === 0 ? 12 : endHour24 % 12;
    const endTime = `${endHour12}:${String(endMinutes).padStart(2, '0')} ${endPeriod}`;

    return { day, time, endTime };
  })() : null;

  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseScheduledTime = (slot) => {
    const parts = slot.split('-');
    const dateStr = parts.slice(0, 3).join('-');
    const timeStr = parts.slice(3).join('-');
    const [timePart, period] = timeStr.split(' ');
    const [hStr, mStr = '0'] = timePart.split(':');
    let hour = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return new Date(`${dateStr}T${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`).toISOString();
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
      navigate(user?.role === 'mentor' ? '/mentor-dashboard' : '/mentee/sessions', { state: { mentor } });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to schedule the session.");
    } finally {
      setLoading(false);
    }
  };

  const mentorInitial = mentor?.firstName?.[0]?.toUpperCase() ?? '?';

  return (
    <PageLayoutDashboard userName={userName} userRole={user?.role === 'mentor' ? 'Mentor' : 'Mentee'} userPhoto={user.profilePicture} onBack={() => navigate(-1)}>
      <div className="max-w-lg mx-auto w-full mt-6 flex flex-col gap-6 pb-4">
        <div>
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">{rescheduleSessionId ? 'Confirm Reschedule' : 'Confirm Booking'}</h1>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            {mentor?.profilePicture ? (
              <img src={mentor.profilePicture} alt={mentorName} className="w-12 h-12 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#003F55] text-white flex items-center justify-center font-bold shrink-0">
                {mentorInitial}
              </div>
            )}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{isMentor ? 'Mentee' : 'Mentor'}</p>
              <p className="font-bold text-[#00212C] text-base">{mentorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fdbb36]/15 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#003F55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              {selectedTime ? (
                <>
                  <p className="font-bold text-[#00212C] text-sm">{selectedTime.day}</p>
                  <p className="text-sm text-slate-500">{selectedTime.time} – {selectedTime.endTime}</p>
                </>
              ) : (
                <p className="font-semibold text-slate-400 text-sm">— time to be confirmed —</p>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3 leading-relaxed">
            {isMentor
              ? 'We will notify the mentee that a session is scheduled. You will both be reminded of the session 24 hours and 15 minutes before the session begins.'
              : 'Your mentor will be notified that a session is scheduled. You will both be reminded of the session 24 hours and 15 minutes before the session begins.'}
          </p>

          {!isMentor && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Additional Info <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Share any additional information or specific questions you have with {mentorName} before your session. You can edit this later as well.
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={loading}
                placeholder="Anything you'd like your mentor to know ahead of time..."
                className="border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white resize-none h-28 focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
              />
            </div>
          )}

          {error && (
            <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 font-medium text-xs">{error}</p>
          )}

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
