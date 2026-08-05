import { useNavigate } from 'react-router-dom';

const RescheduleRequestModal = ({ item, onClose }) => {
  const navigate = useNavigate();
  const session = item.session;
  const mentee = session?.mentee;
  const menteeName = `${mentee?.firstName ?? ''} ${mentee?.lastName ?? ''}`.trim();
  const when = session ? new Date(session.scheduledTime) : null;
  const dateStr = when?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = when?.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const handleReschedule = () => {
    navigate('/mentee/schedule', {
      state: { mentor: mentee, rescheduleSessionId: session?._id },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#00212C]">Reschedule Requested</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>
        </div>

        {session && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm">
            <p className="font-semibold text-[#00212C]">Session with {menteeName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{dateStr} at {timeStr}</p>
          </div>
        )}

        <p className="text-sm text-slate-700">{item.notification.message}</p>

        <button
          onClick={handleReschedule}
          className="bg-[#fdbb36] text-[#00212C] font-semibold py-2.5 rounded-lg text-sm w-full hover:brightness-95 transition cursor-pointer"
        >
          Reschedule
        </button>
      </div>
    </div>
  );
};

export default RescheduleRequestModal;
