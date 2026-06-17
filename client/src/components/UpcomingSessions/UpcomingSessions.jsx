import React from 'react'
import SessionCard from './SessionCard'

const upcomingSessions = [
  { id: 1, name: 'Zainab Khan', topic: 'Resume Advice', date: 'Saturday June 5th', time: '6:30 P.M.', daysUntil: 2 },
  { id: 2, name: 'Yasmin Yusuf', topic: 'Career Advice', date: 'Saturday June 29th', time: '7:00 P.M.', daysUntil: 6 },
]

const UpcomingSessions = () => {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-center text-[#00212C] mb-4">Upcoming Sessions</h2>
      {upcomingSessions.length > 0
        ? upcomingSessions.map(session => <SessionCard key={session.id} {...session} />)
        : <p className="text-center text-gray-500 text-sm">No upcoming sessions.</p>
      }

      <h2 className="text-xl font-bold text-center text-[#00212C] mt-8 mb-2">Completed Sessions</h2>
      <p className="text-center text-gray-500 text-sm">No Completed Sessions so far.</p>
    </div>
  )
}

export default UpcomingSessions
