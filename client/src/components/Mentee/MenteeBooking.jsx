import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageLayoutDashboard from '../PageLayoutDashboard';
import useCurrentUser from '../useCurrentUser';
import { createSession } from '../../api-calls/sessions';

const MenteeBooking = () => {
  const { user } = useCurrentUser();
  const userName = `${user.firstName} ${user.lastName}`;
  const { state } = useLocation();
  const navigate = useNavigate();
  const mentor = state?.mentor;
  const mentorName = mentor ? `${mentor.firstName} ${mentor.lastName}` : 'your mentor';
  const selectedTime = state?.selectedTime || null;

  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    if (!mentor || !selectedTime) {
      setError("Missing booking information. Please go back and select a slot.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createSession({
        scheduledTime: selectedTime.date,
        mentorId: mentor._id,
        service: selectedTime.service,
        details: note
      });
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
              Your mentor will be notified that the session is scheduled. A meeting link will be generated automatically.
            </p>

            <p className="text-sm text-[#00212C]">
              You can share any additional information or specific questions you have
              with {mentorName} before your session here.
            </p>

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
              className={`font-semibold px-6 py-2 rounded-lg text-sm w-full transition-colors ${
                loading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-[#003F55] text-white hover:bg-[#002b3a] cursor-pointer'
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

