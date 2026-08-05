import SessionCard from './SessionCard'
import CompletedSessionCard from './CompletedSessionCard'
import SectionHeading from '../SectionHeading'
import useSessions from './useSessions'

const CountBadge = ({ count }) => (
  <span className="shrink-0 rounded-full bg-[#fdbb36]/15 px-3 py-1 text-xs font-bold text-[#00212C]">
    {count}
  </span>
)

const EmptyState = ({ text }) => (
  <div className="bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center">
    <p className="text-sm text-slate-400">{text}</p>
  </div>
)

const UpcomingSessions = ({ showCompleted = true }) => {
  const {sessions} = useSessions();
  const isPast = s => new Date(s.scheduledTime) < new Date();
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && !isPast(s));
  const completedSessions = sessions
    .filter(s => s.status === 'completed' || (s.status === 'scheduled' && isPast(s)))
    .sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SectionHeading
          title="Upcoming Sessions"
          right={<CountBadge count={upcomingSessions.length} />}
          className="mb-4"
        />
        <div className="max-h-80 overflow-y-auto pr-1 -mr-1">
          {upcomingSessions.length > 0
            ? upcomingSessions.map(session => <SessionCard key={session._id} sessionId={session._id} mentee={session.mentee} {...session} />)
            : <EmptyState text="No upcoming sessions yet." />}
        </div>
      </div>

      {showCompleted && (
        <div>
          <SectionHeading title="Completed Sessions" className="mb-4" />
          <div className="max-h-80 overflow-y-auto pr-1 -mr-1 flex flex-col gap-3">
            {completedSessions.length > 0
              ? completedSessions.map(session => <CompletedSessionCard key={session._id} mentee={session.mentee} service={session.service} scheduledTime={session.scheduledTime} details={session.details} />)
              : <EmptyState text="No completed sessions so far." />}
          </div>
        </div>
      )}
    </div>
  )
}

export default UpcomingSessions
