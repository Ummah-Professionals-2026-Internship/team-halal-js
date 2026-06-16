import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'

const API = import.meta.env.VITE_API_URL

const MentorAvailabilityForm = () => {
  const navigate = useNavigate()
  const [frequency, setFrequency] = useState('')
  const [calendarAccess, setCalendarAccess] = useState(false)

  const handleSubmit = async () => {
    const saved = JSON.parse(localStorage.getItem('mentorStep2') ?? '{}')
    const toSave = { ...saved, frequency, calendarAccess }

    try {
      const response = await fetch(API + '/api/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      })
      if (response.ok) {
        localStorage.removeItem('mentorStep1')
        localStorage.removeItem('mentorStep2')
        alert('Profile saved successfully!')
      } else {
        alert('Failed to save profile')
      }
    } catch (error) {
      alert('Something went wrong')
    }
  }

  return (
    <PageLayout onBack={() => navigate(-1)}>
      <div className="bg-[#f5eeee] w-full max-w-162.5 rounded-lg px-10 py-7 text-center shadow-sm">
        <h1 className="text-3xl font-extrabold mb-5">Select Your Availability</h1>

        <div className="flex justify-center items-center gap-5 mb-5">
          <p className="text-base">How often do you want to meet with mentees?</p>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-44 border border-gray-300 rounded-md px-3 py-2 bg-white outline-none text-sm"
          >
            <option value="">Select</option>
            <option>Weekly</option>
            <option>Biweekly</option>
            <option>Monthly</option>
          </select>
        </div>

        <div className="flex justify-center items-start gap-6 mb-5">
          <div className="text-left">
            <p className="text-base font-medium">Allow Access to Google Calendar?</p>
            <p className="text-xs text-gray-500 mt-1">
              This helps make scheduling your available times for mentoring easier.
            </p>
          </div>
          <input
            type="checkbox"
            checked={calendarAccess}
            onChange={(e) => setCalendarAccess(e.target.checked)}
            className="w-5 h-5 mt-1 accent-[#007CA6]"
          />
        </div>


        <button onClick={handleSubmit} className="bg-[#007CA6] text-white w-full py-3 rounded font-bold">
          Confirm and Start Matching
        </button>
      </div>
    </PageLayout>
  )
}

export default MentorAvailabilityForm
