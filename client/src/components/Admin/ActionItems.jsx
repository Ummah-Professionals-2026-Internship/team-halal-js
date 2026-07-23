import React from 'react'

const ActionItems = () => {
  return (
    <div className="flex-1 border border-gray-200 rounded-xl p-5 bg-white">
      <h2 className="font-bold text-[#00212C] text-center mb-4">Action Items</h2>

      <p className="font-semibold text-sm text-[#00212C] mb-2">Active Help Requests</p>
      <div className="bg-[#C5DCE8] rounded-lg p-3 mb-4 flex justify-between items-center gap-3">
        <div>
          <p className="font-semibold text-sm text-[#00212C]">Question About Technical Issue from Zaid (Mentee):</p>
          <p className="text-sm text-[#00212C]">"Issue with Scheduling Process"</p>
          <p className="text-xs text-gray-500 mt-1">Submitted 3 hours ago</p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button className="bg-[#003F55] text-white text-xs px-4 py-1.5 rounded">View</button>
          <button className="bg-[#003F55] text-white text-xs px-4 py-1.5 rounded">Respond</button>
        </div>
      </div>

      <p className="font-semibold text-sm text-[#00212C] mb-2">Negative Feedback</p>
      <div className="bg-[#C5DCE8] rounded-lg p-3 flex justify-between items-center gap-3">
        <p className="text-sm text-[#00212C]">2/5 for Usefulness of Session from X</p>
        <button className="bg-[#003F55] text-white text-xs px-4 py-1.5 rounded shrink-0">Follow Up</button>
      </div>
    </div>
  )
}

export default ActionItems
