import { useNavigate } from 'react-router-dom'

const formatCountdown = (daysUntil) => {
  if (daysUntil <= 0) return 'Today'
  if (daysUntil === 1) return 'Tomorrow'
  return `In ${daysUntil} days`
}
const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

const SessionCard = ({ sessionId, mentee, scheduledTime, link, status = 'scheduled' }) => {
  const navigate = useNavigate()
  const name = `${mentee?.firstName ?? ''} ${mentee?.lastName ?? ''}`.trim()
  const initial = mentee?.firstName?.[0]?.toUpperCase() ?? '?'
  const photo = mentee?.profilePicture

  const when = new Date(scheduledTime)
  const dateStr = when.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const daysUntil = Math.round((startOfDay(when) - startOfDay(new Date())) / 86400000)

  const beyond48hrs = when.getTime() > Date.now() + 48 * 60 * 60 * 1000
  const canReschedule = status === 'scheduled' && beyond48hrs

  const handleReschedule = () => {
    if (!canReschedule) return
    navigate('/mentee/schedule', { state: { mentor: mentee, rescheduleSessionId: sessionId } })
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {photo ? (
            <img src={photo} alt={name} className="w-11 h-11 roundeded-full object-cover shrink-0"></img>
          ) : (<div className="w-11 h-11 rounded-full bg-[#003F55] text-white flex items-center justify-center font-bold shrink-0">
            {initial}
          </div>
          )}

          <div className="min-w-0">
            <p className="font-bold text-[#00212C] text-sm truncate">{name}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-block rounded-full bg-[#fdbb36] text-[#00212C] text-[11px] font-bold px-2.5 py-1">
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
          <button className="text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
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
    </div>
  )
}

export default SessionCard
