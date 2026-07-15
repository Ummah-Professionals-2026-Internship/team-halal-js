import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cancelSession } from '../../api-calls/sessions'

const formatCountdown = (daysUntil) => {
  if (daysUntil === 0) return 'Today'
  if (daysUntil === 1) return 'Tomorrow'
  if (daysUntil > 1) return `In ${daysUntil} days`
  if (daysUntil === -1) return 'Yesterday'
  return `${Math.abs(daysUntil)} days ago`
}
const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

const SessionCard = ({ sessionId, mentee, scheduledTime, link, status = 'scheduled', service, details }) => {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const name = `${mentee?.firstName ?? ''} ${mentee?.lastName ?? ''}`.trim()
  const initial = mentee?.firstName?.[0]?.toUpperCase() ?? '?'
  const photo = mentee?.profilePicture

  const when = new Date(scheduledTime)
  const dateStr = when.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const daysUntil = Math.round((startOfDay(when) - startOfDay(new Date())) / 86400000)

  const beyond48hrs = when.getTime() > Date.now() + 48 * 60 * 60 * 1000
  const canReschedule = status === 'scheduled' && beyond48hrs
  const canCancel = status === 'scheduled' && beyond48hrs
  const [cancelling, setCancelling] = useState(false)

  const handleReschedule = () => {
    if (!canReschedule) return
    navigate('/mentee/schedule', { state: { mentor: mentee, rescheduleSessionId: sessionId } })
  }

  const handleCancel = async () => {
    if (!canCancel) return
    if (!window.confirm('Are you sure you want to cancel this scheduled session? This will notify the other participant.')) {
      return
    }
    setCancelling(true)
    try {
      await cancelSession(sessionId)
      alert('Session successfully cancelled.')
      window.location.reload()
    } catch (err) {
      alert(err.message || 'Failed to cancel session.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {photo ? (
            <img src={photo} alt={name} className="w-11 h-11 rounded-full object-cover shrink-0"></img>
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#003F55] text-white flex items-center justify-center font-bold shrink-0">
              {initial}
            </div>
          )}

          <div className="min-w-0">
            <p className="font-bold text-[#00212C] text-sm truncate">{name}</p>
            {service && (
              <p className="text-xs text-slate-500 capitalize mt-0.5">{service}</p>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className={`inline-block rounded-full text-[11px] font-bold px-2.5 py-1 ${
            daysUntil < 0 ? 'bg-slate-200 text-slate-600' : 'bg-[#fdbb36] text-[#00212C]'
          }`}>
            {formatCountdown(daysUntil)}
          </span>
          <p className="text-xs text-slate-500 mt-1.5">{dateStr}</p>
          <p className="text-xs text-slate-500">{timeStr}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <div className="flex gap-2">
          <button
            onClick={handleReschedule}
            disabled={!canReschedule}
            title={!canReschedule && status === 'scheduled' ? 'Sessions can only be rescheduled at least 48 hours in advance' : undefined}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              canReschedule
                ? 'text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer'
                : 'text-slate-300 border border-slate-100 cursor-not-allowed'
            }`}
          >
            Reschedule
          </button>
          <button
            onClick={handleCancel}
            disabled={!canCancel || cancelling}
            title={!canCancel && status === 'scheduled' ? 'Sessions can only be cancelled at least 48 hours in advance' : undefined}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              canCancel && !cancelling
                ? 'text-red-600 border border-red-200 hover:bg-red-50 cursor-pointer'
                : 'text-red-300 border border-red-100 cursor-not-allowed'
            }`}
          >
            {cancelling ? 'Cancelling...' : 'Cancel'}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            View Details
          </button>
        </div>
        <a
          href={link || undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!link}
          className={`text-xs font-bold px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            link
              ? 'text-[#00212C] bg-[#fdbb36] hover:brightness-95 cursor-pointer'
              : 'text-slate-400 bg-slate-100 cursor-not-allowed pointer-events-none'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
          {link ? 'Join Meeting' : 'No link yet'}
        </a>
      </div>

      {/* Details Modal */}
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
                  <p className="font-semibold text-slate-900 mt-1 text-xs">{dateStr}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Time</span>
                  <p className="font-semibold text-slate-900 mt-1 text-xs">{timeStr}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Meeting Link</span>
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#007CA6] font-semibold underline break-all block mt-1 text-xs"
                  >
                    {link}
                  </a>
                ) : (
                  <p className="text-slate-400 mt-1 text-xs">No link available yet</p>
                )}
              </div>

              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Session Notes</span>
                <p className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs italic mt-1.5 text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {details ? `"${details}"` : 'No additional notes provided.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Status</span>
                <span className={`inline-block rounded-full text-[10px] font-bold px-2.5 py-0.5 mt-1.5 capitalize ${
                  status === 'scheduled' ? 'bg-emerald-100 text-emerald-800' :
                  status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {status}
                </span>
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

export default SessionCard
