import MentorAvailabilityCard from './MentorAvailabilityCard';

const ChangeAvailabilityModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] mt-8 overflow-y-auto shadow-2xl flex flex-col gap-4" style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-[#00212C]">Change Your Availability</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>
      </div>

      <MentorAvailabilityCard />
    </div>
  </div>
);

export default ChangeAvailabilityModal;
