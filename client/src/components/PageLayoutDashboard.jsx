import { useState } from 'react'
import Navbar from './Navbar'
import GetHelp from './GetHelp'

const PageLayoutDashboard = ({ children, userName, userRole, userPhoto, onPhotoUpdate, onBack }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#f6f6f6] overflow-hidden">
      {showHelp && <GetHelp onClose={() => setShowHelp(false)} />}
      <Navbar userName={userName} userRole={userRole} userPhoto={userPhoto} onPhotoUpdate={onPhotoUpdate} />

      <div className="flex-1 w-full overflow-y-auto px-4 py-4">
        {children}
      </div>

      <div className="shrink-0 flex justify-between px-6 py-3 border-t border-slate-200 bg-[#f6f6f6]">
        {onBack
          ? <button onClick={onBack} className="bg-[#003F55] text-white px-6 py-2 rounded font-bold shadow">Back</button>
          : <div />
        }
        <button onClick={() => setShowHelp(true)} className="inline-flex items-center gap-2 bg-[#003F55] hover:bg-[#00212C] text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow transition-colors">
          <svg className="w-5 h-5 text-[#fdbb36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 17.25h.007v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Get Help
        </button>
      </div>
    </div>
  )
}

export default PageLayoutDashboard
