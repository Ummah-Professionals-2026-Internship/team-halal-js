import AvailabilityPick from '../availability/AvailabilityPick';

const formatSelectedSlot = (selectedSlot) => {
  const parts = selectedSlot.split('-');
  const date = new Date(parts.slice(0, 3).join('-') + 'T00:00:00');
  const time = parts.slice(3).join('-');
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
  const endLabel = `${endHour12}:${String(endMinutes).padStart(2, '0')} ${endPeriod}`;
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    time,
    endLabel,
  };
};

const BookSessionModal = ({
  calendarOwnerName,
  mentorSlots,
  sessions,
  conflicts,
  mentorBusy,
  conflictInfo,
  selectedSlot,
  onSlotSelect,
  onClose,
  onConfirm,
}) => {
  const formatted = selectedSlot ? formatSelectedSlot(selectedSlot) : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-5xl max-h-[92vh] mt-4 overflow-y-auto shadow-2xl flex flex-col gap-4"
        style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
      >
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#00212C]">Book a Session with {calendarOwnerName}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>
        </div>

        <AvailabilityPick
          title={`${calendarOwnerName}'s Availability`}
          availabilityLabel={`${calendarOwnerName}'s Availability`}
          mentorSlots={mentorSlots}
          sessions={sessions}
          conflicts={conflicts}
          mentorBusy={mentorBusy}
          conflictInfo={conflictInfo}
          sessionMentorName={calendarOwnerName}
          readOnly
          onSlotSelect={onSlotSelect}
          selectedSlot={selectedSlot}
        />

        <div className="bg-[#FFFCF0] border border-[#fdbb36]/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#fdbb36]/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#003F55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Auto-Selected Meeting Time</p>
            {formatted ? (
              <p className="font-bold text-[#00212C] text-sm">
                {formatted.day} &middot; {formatted.time}–{formatted.endLabel}
              </p>
            ) : (
              <p className="font-semibold text-slate-400 text-sm">Please select a slot above</p>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 text-center -mt-2">Click to select another time on the calendar</p>

        <button
          onClick={onConfirm}
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
  );
};

export default BookSessionModal;
