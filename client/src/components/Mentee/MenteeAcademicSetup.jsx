import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'
import SearchableSelect from '../SearchableSelect'
import { MAJORS_LIST, UNIVERSITIES_LIST } from '../../constants/lists'
import { MENTOR_SERVICES } from '../../constants/services'
import AvailabilityPick from '../availability/AvailabilityPick'
import googleCalIcon from '../../assets/google-cal-icon.png'
import { disconnectGoogle, getMe } from '../../api-calls/auth'
import { createMenteeProfile } from '../../api-calls/mentees'
import { uploadProfilePicture } from '../../api-calls/upload'

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-2 mt-5 mb-3">
    <span className="w-1.5 h-1.5 rounded-sm bg-[#fdbb36] shrink-0" />
    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap">{label}</span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
)

const inputClass = "border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

const MenteeAcademicSetup = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    university: '',
    majors: [],
    academicStatus: '',
    desiredCareer: '',
    desiredServices: [],
    calendarAccess: false,
    profilePicture: '',
    manualAvailabilitySlots: [],
    additionalInfo: '',
  })
  const [profilePictureName, setProfilePictureName] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)
  const [picMessage, setPicMessage] = useState('')

  useEffect(() => {
    const savedTemp = localStorage.getItem('menteeStep2Temp');
    if (savedTemp) {
      const { formData: savedFormData, profilePictureName: savedPicName } = JSON.parse(savedTemp);
      if (savedFormData) setFormData(savedFormData);
      if (savedPicName) setProfilePictureName(savedPicName);
      localStorage.removeItem('menteeStep2Temp');
      return;
    }
    getMe()
      .then(data => {
        if (data?.profilePicture) {
          setFormData(prev => ({ ...prev, profilePicture: data.profilePicture }));
        }
      })
      .catch(() => {});
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
        };
      })
    }
  }, [])
  const [manualAvailabilitySlots, setManualAvailabilitySlots] = useState([])

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    let newValue = value
    if (type === 'checkbox') newValue = checked
    setFormData(function(prev) {
      return { ...prev, [name]: newValue }
    })
  }

  const handleCheckbox = (e) => {
    const { name, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
        ? [...prev[name], value]
        : prev[name].filter(v => v !== value)
    }))
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
      ...formData,
      manualAvailabilitySlots,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
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
    <PageLayout onBack={() => navigate('/mentee/profile-setup')} backVariant="accent">
      <Card>
        <div className="w-full text-left">

          {/* Brand accent */}
          <div className="w-10 h-1.5 rounded-full bg-[#fdbb36] mx-auto mb-4" />

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  s < 2
                    ? 'bg-emerald-500 text-white'
                    : s === 2
                    ? 'bg-[#007CA6] text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {s < 2 ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                {s < 2 && (
                  <div className="w-10 h-0.5 rounded-full bg-emerald-300" />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center mb-5">Step 2 of 2 — Academic & Preferences</p>
          <h2 className="text-xl font-bold text-slate-800 text-center mb-5">Academic & Mentorship Preferences</h2>

          <form onSubmit={handleSubmit} className="w-full">

            <SectionDivider label="Academic Details" />

            <div className="mb-4">
              <SearchableSelect
                label="University / Institution"
                name="university"
                value={formData.university}
                options={UNIVERSITIES_LIST}
                placeholder="Type to search university..."
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Current Academic Year</label>
                <select
                  name="academicStatus"
                  value={formData.academicStatus}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select Academic Year</option>
                  <option value="Freshman (Year 1)">Freshman (Year 1)</option>
                  <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
                  <option value="Junior (Year 3)">Junior (Year 3)</option>
                  <option value="Senior (Year 4)">Senior (Year 4)</option>
                  <option value="Graduate Student">Graduate Student</option>
                  <option value="Not in College (Working)">Not in College (Working)</option>
                  <option value="Internship">Internship</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className={labelClass}>Desired Future Career</label>
                <input
                  name="desiredCareer"
                  type="text"
                  placeholder="e.g. Software Engineer, Data Scientist"
                  className={inputClass}
                  value={formData.desiredCareer}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <SectionDivider label="Mentorship & Scheduling" />

            <div className="mb-4">
              <label className={labelClass}>What services are you looking for?</label>
              <div className="flex flex-col gap-1.5">
                {MENTOR_SERVICES.map(service => (
                  <label key={service.id} className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 group transition-colors">
                    <input
                      type="checkbox"
                      name="desiredServices"
                      value={service.id}
                      checked={formData.desiredServices.includes(service.id)}
                      onChange={handleCheckbox}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      formData.desiredServices.includes(service.id)
                        ? 'bg-[#007CA6] border-[#007CA6]'
                        : 'border-slate-300 group-hover:border-[#007CA6]/50'
                    }`}>
                      {formData.desiredServices.includes(service.id) && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{service.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Google Calendar Connection Card */}
            <div className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <img src={googleCalIcon} alt="Google Calendar" className="w-9 h-9 object-contain shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Google Calendar Sync</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Link your calendar to simplify scheduling.</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={formData.calendarAccess ? handleDisconnectCalendar : handleConnectCalendar}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all shrink-0 ${
                  formData.calendarAccess 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-[#007CA6] text-white border-transparent hover:bg-[#006080]'
                }`}
              >
                {formData.calendarAccess ? '✓ Connected' : 'Connect'}
              </button>
            </div>

            {/* Manual Availability */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Your Availability</p>
              <AvailabilityPick onChange={setManualAvailabilitySlots} />
            </div>

            <SectionDivider label="Profile Photo & Extra Info" />

            {/* Profile Picture Upload Card */}
            <div className="mb-5 p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
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
                        src={formData.profilePicture.startsWith('http') ? formData.profilePicture : apiBaseUrl + formData.profilePicture} 
                        referrerPolicy="no-referrer"
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

            <div className="mb-6">
              <label className={labelClass}>Any additional information you would like to share with mentors?</label>
              <textarea
                name="additionalInfo"
                className={inputClass}
                rows={4}
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Share your goals, specific areas you want guidance on, or any background context..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#007CA6] hover:bg-[#006080] text-white w-full py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving Profile...' : 'Complete Profile & Start Matching'}
            </button>
          </form>
        </div>
      </Card>
    </PageLayout>
  )
}

export default MenteeAcademicSetup
