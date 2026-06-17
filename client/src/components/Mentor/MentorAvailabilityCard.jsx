import React from 'react'
import AvailabilityPick from '../availability/AvailabilityPick'

const MentorAvailabilityCard = () => {
  return (
    <div className="w-1/2 bg-[#8ACBDB] p-4 rounded-xl">
      <AvailabilityPick title="Mentoring Hours" />
      <button className="bg-white p-4 m-auto mt-4">Submit new hours</button>
    </div>
  )
}

export default MentorAvailabilityCard
