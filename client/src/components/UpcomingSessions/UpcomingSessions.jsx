import React from 'react'
import SessionCard from './SessionCard'

const UpcomingSessions = ({ sessions = [] }) => {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-center text-[#00212C] mb-4">Upcoming Sessions</h2>
      {sessions.length > 0
        ? sessions.map(session => <SessionCard key={session.id} {...session} />)
        : <p className="text-center text-gray-500 text-sm">No upcoming sessions.</p>
      }

      <h2 className="text-xl font-bold text-center text-[#00212C] mt-8 mb-2">Completed Sessions</h2>
      <p className="text-center text-gray-500 text-sm">No Completed Sessions so far.</p>
    </div>
  )
}

export default UpcomingSessions
