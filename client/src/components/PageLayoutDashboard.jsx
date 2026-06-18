import React from 'react'
import Navbar from './Navbar'

const PageLayoutDashboard = ({ children, onBack, userName, userRole, userPhoto, onPhotoUpdate}) => {
  return (
    <div className="h-screen flex flex-col bg-[#f6f6f6] overflow-hidden">
      <Navbar userName={userName} userRole={userRole} userPhoto={userPhoto} onPhotoUpdate={onPhotoUpdate} />
      <div className="flex-1 flex flex-col w-full px-4 py-3 overflow-hidden">
        {children}
      </div>
        <button className="bg-[#003F55] text-white px-6 py-2 rounded font-bold shadow mx-12 mb-4 w-auto self-end">
          Get Help
        </button>
      
    </div>
  )
}
export default PageLayoutDashboard
