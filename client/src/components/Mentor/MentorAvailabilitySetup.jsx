import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageLayout from '../PageLayout'
import googleCalIcon from '../../assets/google-cal-icon.png'
import AvailabilityPick from '../availability/AvailabilityPick'
import { createMentorProfile } from '../../api-calls/mentors'
import { disconnectGoogle } from '../../api-calls/auth'
import { uploadProfilePicture } from '../../api-calls/upload'

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

const MentorAvailabilitySetup = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [frequency, setFrequency] = useState('')
  const [calendarAccess, setCalendarAccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)
  const [picMessage, setPicMessage] = useState('')
  const [profilePictureName, setProfilePictureName] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  

  useEffect(() => {
    const savedTemp = localStorage.getItem('mentorStep3Temp')
    if (savedTemp) {
      const parsed = JSON.parse(savedTemp)
      if (parsed.frequency) setFrequency(parsed.frequency)
      localStorage.removeItem('mentorStep3Temp')
    }
  }, [])

  useEffect(() => {
    if (searchParams.get('calendarConnected') === 'true') {
      setCalendarAccess(true)
    }
  }, [searchParams])

  const handleConnectCalendar = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please log in again to connect your calendar.')
      return;
    }
    localStorage.setItem('mentorStep3Temp', JSON.stringify({ frequency }))
    window.location.href = `${apiBaseUrl}/api/auth/google?token=${token}`
  }

  const handleDisconnectCalendar = async () => {
    try {
      await disconnectGoogle();
      setCalendarAccess(false)
    } catch (err) {
      console.error(err)
      alert('Error disconnecting calendar.')
    }
  }

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    e.target.value = ''
    setUploadingPic(true)
    setPicMessage('Uploading picture...')

    const fData = new FormData()
    fData.append('profilePicture', file)

    try {
      const data = await uploadProfilePicture(fData)
      setProfilePicture(data.filePath)
      setProfilePictureName(file.name)
      setPicMessage('')
    } catch (err) {
      console.error(err)
      setPicMessage('Error uploading picture.')
    } finally {
      setUploadingPic(false)
    }
  }

  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)
    const saved = JSON.parse(localStorage.getItem('mentorStep2') ?? '{}')
    const toSave = { ...saved, frequency, calendarAccess, profilePicture }

    try {
      await createMentorProfile(toSave);
      localStorage.removeItem('mentorStep1')
      localStorage.removeItem('mentorStep2')
      localStorage.removeItem('mentorResumeData')
      localStorage.removeItem('mentorStep3Temp')
      navigate('/mentor-dashboard')
    } catch (error) {
      alert('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <PageLayout onBack={() => navigate('/mentor/career-setup')}>
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

        {/* Google Calendar Connection Card */}
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-left shadow-sm">
          <div className="flex items-center gap-3">
            <img src={googleCalIcon} alt="Google Calendar" className="w-10 h-10 object-contain shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-slate-800">Google Calendar Sync</h4>
              <p className="text-xs text-slate-500">Link your calendar to simplify scheduling.</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={calendarAccess ? handleDisconnectCalendar : handleConnectCalendar}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
              calendarAccess 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {calendarAccess ? '✓ Connected' : 'Connect'}
          </button>
        </div>
        
        <AvailabilityPick />
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-[#007CA6] text-white w-full py-3 rounded font-bold disabled:opacity-50"
        >
          {loading ? 'Saving Profile...' : 'Confirm and Start Matching'}
        </button>
      </div>
    </PageLayout>
  )
}

export default MentorAvailabilitySetup
