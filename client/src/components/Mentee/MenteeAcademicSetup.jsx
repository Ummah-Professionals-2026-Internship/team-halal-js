import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'
import SearchableSelect from '../SearchableSelect'
import { MAJORS_LIST, UNIVERSITIES_LIST, MENTORSHIP_TAGS } from '../../constants/lists'
import googleCalIcon from '../../assets/google-cal-icon.png'
import { disconnectGoogle } from '../../api-calls/auth'
import { createMenteeProfile } from '../../api-calls/mentees'
import { uploadProfilePicture } from '../../api-calls/upload'

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

const MenteeAcademicSetup = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    university: '',
    majors: [],
    academicStatus: '',
    desiredCareer: '',
    lookingFor: [],
    calendarAccess: false,
    profilePicture: null,
    additionalInfo: '',
  })

  useEffect(() => {
    const savedTemp = localStorage.getItem('menteeStep2Temp');
    if (savedTemp) {
      const { formData: savedFormData, profilePictureName: savedPicName } = JSON.parse(savedTemp);
      if (savedFormData) setFormData(savedFormData);
      if (savedPicName) setProfilePictureName(savedPicName);
      localStorage.removeItem('menteeStep2Temp');
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('calendarConnected') === 'true') {
      setFormData(prev => ({ ...prev, calendarAccess: true }));
    }
  }, [searchParams]);

  const handleConnectCalendar = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in again to connect your calendar.');
      return;
    }
    localStorage.setItem('menteeStep2Temp', JSON.stringify({ formData, profilePictureName }));
    window.location.href = `${apiBaseUrl}/api/auth/google?token=${token}`;
  };

  const handleDisconnectCalendar = async () => {
    try {
      await disconnectGoogle();
      setFormData(prev => ({ ...prev, calendarAccess: false }));
    } catch (err) {
      console.error(err);
      alert('Error disconnecting calendar.');
    }
  };

  useEffect(() => {
    const savedResume = localStorage.getItem('menteeResumeData')
    if (savedResume) {
      const parsed = JSON.parse(savedResume)
      setFormData(prev => {
        let parsedMajors = prev.majors;
        if (parsed.majors) {
          parsedMajors = Array.isArray(parsed.majors) ? parsed.majors : [parsed.majors];
        }
        return {
          ...prev,
          university: parsed.university || prev.university,
          majors: parsedMajors,
          desiredCareer: parsed.desiredCareer || prev.desiredCareer
        };
      })
    }
  }, [])

  const [loading, setLoading] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)
  const [picMessage, setPicMessage] = useState('')
  const [profilePictureName, setProfilePictureName] = useState('')

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    let newValue = value
    if (type === 'checkbox') newValue = checked
    setFormData(function(prev) {
      return { ...prev, [name]: newValue }
    })
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
      const data = await uploadProfilePicture(fData);
      setFormData(prev => ({
        ...prev,
        profilePicture: data.filePath
      }))
      setProfilePictureName(file.name)
      setPicMessage('')
    } catch (err) {
      console.error(err)
      setPicMessage('Error uploading picture.')
    } finally {
      setUploadingPic(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    const oldData = JSON.parse(localStorage.getItem('menteeStep1')) || {}
    const toSave = {
      ...oldData,
      ...formData
    }

    try {
      await createMenteeProfile(toSave);
      localStorage.removeItem('menteeStep1')
      localStorage.removeItem('menteeResumeData')
      localStorage.removeItem('menteeStep2Temp')
      navigate('/mentee-dashboard')
    } catch (error) {
      console.error(error)
      alert('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <PageLayout onBack={() => navigate(-1)}>
      <Card title="Finalize Mentee Profile">
        <form onSubmit={handleSubmit} className="w-full text-left">

          <SearchableSelect
            label="University / Institution"
            name="university"
            value={formData.university}
            options={UNIVERSITIES_LIST}
            placeholder="Type to search university..."
            onChange={handleChange}
            required
          />

          <SearchableSelect
            label="Major(s)"
            name="majors"
            value={formData.majors}
            options={MAJORS_LIST}
            placeholder="Type to search major..."
            onChange={handleChange}
            required
            isMulti={true}
          />

          <label className="block mb-1">Current Academic Year</label>
          <select
            name="academicStatus"
            value={formData.academicStatus}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
            required
          >
            <option value=""></option>
            <option value="Freshman (Year 1)">Freshman (Year 1)</option>
            <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
            <option value="Junior (Year 3)">Junior (Year 3)</option>
            <option value="Senior (Year 4)">Senior (Year 4)</option>
            <option value="Graduate Student">Graduate Student</option>
            <option value="Not in College (Working)">Not in College (Working)</option>
            <option value="Internship">Internship</option>
            <option value="Other">Other</option>
          </select>
          
          <label className="block mb-1">Desired Future Career</label>
          <input
            name="desiredCareer"
            type="text"
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
            value={formData.desiredCareer}
            onChange={handleChange}
            required
          />



          <SearchableSelect
            label="What are you looking for in a mentor?"
            name="lookingFor"
            value={formData.lookingFor}
            options={MENTORSHIP_TAGS}
            placeholder="Select all that apply..."
            onChange={handleChange}
            isMulti={true}
          />

          {/* Google Calendar Connection Card */}
          <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <img src={googleCalIcon} alt="Google Calendar" className="w-10 h-10 object-contain shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Google Calendar Sync</h4>
                <p className="text-xs text-slate-500">Link your calendar to simplify scheduling.</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={formData.calendarAccess ? handleDisconnectCalendar : handleConnectCalendar}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
                formData.calendarAccess 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {formData.calendarAccess ? '✓ Connected' : 'Connect'}
            </button>
          </div>
          
          {/* Profile Picture Upload Card */}
          <div className="mb-6 p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <label className="block text-sm font-semibold text-slate-700 mb-3 text-center">
              Profile Picture
            </label>
            
            <div className="relative w-28 h-28 mx-auto mb-3">
              <label 
                className={`relative flex flex-col items-center justify-center w-full h-full rounded-full border-2 border-dashed ${
                  formData.profilePicture ? 'border-transparent' : 'border-slate-300 hover:border-[#007CA6]'
                } bg-white transition-all cursor-pointer overflow-hidden group`}
              >
                <input 
                  name="profilePicture" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleProfilePictureChange}
                  disabled={uploadingPic}
                />
                
                {formData.profilePicture ? (
                  <>
                    <img 
                      src={apiBaseUrl + formData.profilePicture} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                    {/* Hover camera overlay */}
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

                {/* Uploading Spinner */}
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

            {/* Helper messages / filename display */}
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

          <label className="block mb-1 text-sm text-center">Any additional information you would like to share with mentors?</label>
          <textarea
            name="additionalInfo"
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
            rows={4}
            value={formData.additionalInfo}
            onChange={handleChange}
          />

          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#007CA6] text-white px-5 py-2 w-full rounded font-semibold mt-2 disabled:opacity-50"
          >
            {loading ? 'Saving Profile...' : 'Start Matching'}
          </button>
        </form>
      </Card>
    </PageLayout>
  )
}

export default MenteeAcademicSetup
