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
  const [error, setError] = useState('');
  

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
      setError('Please log in again to connect your calendar.')
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
      setError('Error disconnecting calendar.')
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
      setError('Something went wrong. Please try again.')
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

        {/* Profile Picture Upload Card */}
        <div className="mb-6 p-5 bg-white border border-gray-200 rounded-xl text-center shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Profile Picture
          </label>

          <div className="relative w-28 h-28 mx-auto mb-3">
            <label
              className={`relative flex flex-col items-center justify-center w-full h-full rounded-full border-2 border-dashed ${
                profilePicture ? 'border-transparent' : 'border-slate-300 hover:border-[#007CA6]'
              } bg-white transition-all cursor-pointer overflow-hidden group`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
                disabled={uploadingPic}
              />

              {profilePicture ? (
                <>
                  <img
                    src={apiBaseUrl + profilePicture}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] text-white font-medium">Change Photo</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-[#007CA6] transition-colors">
                  <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Add Photo</span>
                </div>
              )}

              {uploadingPic && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-[#007CA6] mb-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-[9px] text-[#007CA6] font-semibold">Uploading...</span>
                </div>
              )}
            </label>
          </div>

          <div className="text-center">
            {picMessage ? (
              <p className="text-xs font-medium text-slate-500">{picMessage}</p>
            ) : profilePictureName ? (
              <p className="text-xs font-semibold text-emerald-600 truncate max-w-xs mx-auto">
                ✓ {profilePictureName}
              </p>
            ) : (
              <p className="text-xs text-slate-400">Square images work best (JPG, PNG, GIF)</p>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

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
