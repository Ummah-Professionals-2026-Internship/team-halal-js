import { useState } from 'react'

const CompletedSessionCard = ({ mentee, scheduledTime, service, details }) => {
  const [showModal, setShowModal] = useState(false)
  const name = `${mentee?.firstName ?? ''} ${mentee?.lastName ?? ''}`.trim()
  const initial = mentee?.firstName?.[0]?.toUpperCase() ?? '?'
  const photo = mentee?.profilePicture

  const when = new Date(scheduledTime)
  const dateStr = when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const timeStr = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3.5">
      <div className="flex items-center gap-3">
        {photo ? (
          <img src={photo} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0 grayscale-[30%]"></img>
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-300 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-700 text-sm truncate">{name}</p>
          <p className="text-[11px] text-slate-400 capitalize truncate">{service}</p>
        </div>
        <span className="shrink-0 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
          Completed
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
        <p className="text-[11px] text-slate-400">{dateStr} · {timeStr}</p>
        <button
          onClick={() => setShowModal(true)}
          className="text-[11px] font-semibold text-slate-500 hover:text-[#003F55] transition-colors cursor-pointer"
        >
          View Details
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 text-left">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-base font-bold text-[#00212C]">Session Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-4 text-sm text-slate-700">
              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Participant</span>
                <div className="flex items-center gap-2.5 mt-1.5">
                  {photo ? (
                    <img src={photo} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0"></img>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#003F55] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {initial}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900 text-xs">{name}</p>
                    <p className="text-[11px] text-slate-500">{mentee?.email || 'No email provided'}</p>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Service Type</span>
                <p className="font-semibold text-slate-900 mt-1 capitalize text-xs">{service || 'Mentorship Program'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Date</span>
                  <p className="font-semibold text-slate-900 mt-1 text-xs">
                    {when.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Time</span>
                  <p className="font-semibold text-slate-900 mt-1 text-xs">{timeStr}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Session Notes</span>
                <p className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs italic mt-1.5 text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {details ? `"${details}"` : 'No additional notes provided.'}
                </p>
              </div>
            </div>

            <div className="mt-2 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="bg-[#003F55] hover:bg-[#002B3B] text-white font-semibold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompletedSessionCard
