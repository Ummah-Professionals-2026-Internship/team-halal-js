import React from 'react';

const PersonRow = ({ label, person }) => {
  const name = `${person?.firstName ?? 'Unknown'} ${person?.lastName ?? ''}`.trim();
  const initial = person?.firstName?.[0]?.toUpperCase() ?? '?';
  return (
    <div>
      <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2.5 mt-1.5">
        {person?.profilePicture ? (
          <img src={person.profilePicture} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#003F55] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {initial}
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-900 text-xs">{name}</p>
          <p className="text-[11px] text-slate-500">{person?.email || 'No email provided'}</p>
        </div>
      </div>
    </div>
  );
};

const SessionDetailsModal = ({ session, onClose }) => {
  const when = new Date(session.scheduledTime);
  const dateStr = when.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const timeStr = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#00212C]">Session Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>
        </div>

        <PersonRow label="Mentor" person={session.mentor} />
        <PersonRow label="Mentee" person={session.mentee} />

        <div>
          <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Service Type</span>
          <p className="font-semibold text-slate-900 mt-1 capitalize text-xs">{session.service}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Date</span>
            <p className="font-semibold text-slate-900 mt-1 text-xs">{dateStr}</p>
          </div>
          <div>
            <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Time</span>
            <p className="font-semibold text-slate-900 mt-1 text-xs">{timeStr}</p>
          </div>
        </div>

        <div>
          <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Meeting Link</span>
          {session.link ? (
            <a href={session.link} target="_blank" rel="noopener noreferrer" className="text-[#007CA6] font-semibold underline break-all block mt-1 text-xs">
              {session.link}
            </a>
          ) : (
            <p className="text-slate-400 mt-1 text-xs">No link available yet</p>
          )}
        </div>

        <div>
          <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Session Notes</span>
          <p className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs italic mt-1.5 text-slate-600 whitespace-pre-wrap leading-relaxed">
            {session.details ? `"${session.details}"` : 'No additional notes provided.'}
          </p>
        </div>

        <div>
          <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Status</span>
          <span className={`inline-block rounded-full text-[10px] font-bold px-2.5 py-0.5 mt-1.5 capitalize ${
            session.status === 'scheduled' ? 'bg-[#fdbb36]/20 text-[#00212C]' :
            session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
            'bg-red-100 text-red-700'
          }`}>
            {session.status}
          </span>
        </div>

        <button
          onClick={onClose}
          className="bg-[#003F55] text-white font-semibold py-2 rounded-lg text-sm w-full mt-1"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SessionDetailsModal;
