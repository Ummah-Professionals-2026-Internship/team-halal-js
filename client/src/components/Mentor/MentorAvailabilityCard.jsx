import { useState, useEffect} from 'react'
import AvailabilityPick from '../availability/AvailabilityPick'
import SectionHeading from '../SectionHeading'
import useCurrentUser from '../useCurrentUser'
import { apiFetch } from '../../api-calls/client'

const MentorAvailabilityCard = () => {
  const {user}=useCurrentUser()
  const [slots, setSlots] = useState(user?.manualAvailabilitySlots||[])
  const [saved, setSaved] = useState(false)
  

  const handleChange = (next) => {
    setSlots(next)
    setSaved(false)
  }

  const handleSubmit = async() => {
    if (slots.length === 0) return
    
    await apiFetch('/api/mentors/me',{
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({manualAvailabilitySlots:slots})
     })
    setSaved(true)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <SectionHeading
        title="Mentoring Hours"
        subtitle="Drag across the grid to set when you're available."
        className="mb-4"
      />

      <div className="rounded-xl bg-[#8ACBDB]/25 p-3">
        <AvailabilityPick title="" onChange={handleChange}  initialSlots={user?.manualAvailabilitySlots || []}/>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {slots.length > 0 ? (
            <>
              <span className="font-bold text-[#00212C]">{slots.length}</span> hour
              {slots.length === 1 ? '' : 's'} selected
            </>
          ) : (
            'No hours selected yet'
          )}
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={slots.length === 0}
          className="bg-[#fdbb36] text-[#00212C] font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saved ? '✓ Hours Submitted' : 'Submit New Hours'}
        </button>
      </div>
    </div>
  )
}

export default MentorAvailabilityCard
