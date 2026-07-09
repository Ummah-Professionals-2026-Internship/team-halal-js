import React from 'react'

const AdminSessionCard = () => {
  return (
    <div className="bg-[#C5DCE8] rounded-xl p-6 flex flex-col items-center gap-6 w-64">
      <h2 className="font-bold text-[#00212C] text-center text-sm">
        Mentorship Session Ratings Averages
      </h2>
      <div className="flex flex-col items-center gap-1">
        <div className="w-20 h-20 rounded-full bg-[#4caf6e] flex items-center justify-center text-white text-2xl font-bold">
         
        </div>
        <span className="text-sm text-[#00212C]">Quality</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-20 h-20 rounded-full bg-[#4caf6e] flex items-center justify-center text-white text-2xl font-bold">
        
        </div>
        <span className="text-sm text-[#00212C]">Usefulness</span>
      </div>
    </div>
  )
}

export default AdminSessionCard
