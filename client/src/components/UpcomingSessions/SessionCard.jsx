import React from 'react'

const SessionCard = ({ name, topic, date, time, daysUntil }) => {
  return (
    <div className="bg-[#8ACBDB] rounded-xl p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 shrink-0" />
          <div>
            <p className="font-bold text-[#00212C] text-sm">Meeting with {name}</p>
            <p className="text-[#00212C] text-sm">for {topic}</p>
          </div>
        </div>
        <div className="text-center text-sm text-[#00212C] shrink-0">
          <p>Session in {daysUntil} days</p>
          <p>{date}</p>
          <p>{time}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="bg-[#007CA6] text-white text-xs px-3 py-1.5 rounded-lg">Cancel/Reschedule</button>
          <button className="bg-[#007CA6] text-white text-xs px-3 py-1.5 rounded-lg">View Details</button>
        </div>
        <button className="bg-[#007CA6] text-white text-xs px-3 py-1.5 rounded-lg">Join Meeting</button>
      </div>
    </div>
  )
}

export default SessionCard
