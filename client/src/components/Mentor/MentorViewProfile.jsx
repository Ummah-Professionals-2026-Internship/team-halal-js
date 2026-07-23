import React, { useState, useEffect } from 'react'
import PageLayoutDashboard from '../PageLayoutDashboard'
import SectionHeading from '../SectionHeading'
import SearchableSelect from '../SearchableSelect'
import useCurrentUser from '../useCurrentUser'
import { STATES_LIST, MAJORS_LIST, INDUSTRIES_LIST } from '../../constants/lists'
import { MENTOR_SERVICES } from '../../constants/services'
import { updateMentorProfile } from '../../api-calls/mentors'
import { uploadResume } from '../../api-calls/upload'

const inputClass = "border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

const formatPhoneNumber = (value) => {
  if (!value) return value
  let phoneNumber = value.replace(/[^\d]/g, '')
  if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
    phoneNumber = phoneNumber.slice(1)
  }
  const len = phoneNumber.length
  if (len < 4) return phoneNumber
  if (len < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  state: '',
  referralSource: '',
  linkedinUrl: '',
  websiteUrl: '',
  resume: '',
  university: '',
  majors: [],
  jobTitle: '',
  employer: '',
  industry: '',
  yearsOfProfExp: '',
  additionalInfo: '',
  volunteeringFor: [],
  customMeetingLink: '',
  maxMentees: '',
  frequency: '',
  notificationPreferences: { email: true, sms: true, inApp: true },
}

const MentorViewProfile = () => {
  const { user, refreshUser } = useCurrentUser()
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user.firstName) return
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      state: user.state || '',
      referralSource: user.referralSource || '',
      linkedinUrl: user.linkedinUrl || '',
      websiteUrl: user.websiteUrl || '',
      resume: user.resume || '',
      university: user.university || '',
      majors: user.majors || [],
      jobTitle: user.mentorProfile?.jobTitle || '',
      employer: user.mentorProfile?.employer || '',
      industry: user.mentorProfile?.industry || '',
      yearsOfProfExp: user.mentorProfile?.yearsOfProfExp ?? '',
      additionalInfo: user.additionalInfo || '',
      volunteeringFor: (user.mentorProfile?.volunteeringFor || []).filter(id => MENTOR_SERVICES.some(s => s.id === id)),
      customMeetingLink: user.mentorProfile?.customMeetingLink || '',
      maxMentees: user.mentorProfile?.maxMentees ?? '',
      frequency: user.mentorProfile?.frequency || '',
      notificationPreferences: {
        email: user.notificationPreferences?.email ?? true,
        sms: user.notificationPreferences?.sms ?? true,
        inApp: user.notificationPreferences?.inApp ?? true,
      },
    })
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    let val = value
    if (name === 'phone') val = formatPhoneNumber(value)
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [name]: checked
      }
    }))
  }

  const handleCheckbox = (e) => {
    const { value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      volunteeringFor: checked
        ? [...prev.volunteeringFor, value]
        : prev.volunteeringFor.filter(v => v !== value)
    }))
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('resume', file)

    setUploadingResume(true)
    setMessage('')
    try {
      const data = await uploadResume(fd)
      setFormData(prev => ({ ...prev, resume: data.resumePath }))
      setMessage('Resume uploaded successfully.')
    } catch (err) {
      setMessage(err.message || 'Resume upload failed.')
    } finally {
      setUploadingResume(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await updateMentorProfile(formData)
      refreshUser()
      setMessage('Profile updated successfully.')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!user.firstName) return <div className="p-8 text-center text-slate-500">Loading profile...</div>

  const name = `${formData.firstName} ${formData.lastName}`.trim()
  const title = [formData.jobTitle, formData.employer].filter(Boolean).join(' at ')
  const education = [formData.majors?.[0], formData.university].filter(Boolean).join(' from ')

  return (
    <PageLayoutDashboard userName={name} userRole="Mentor" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser}>
      <div className="max-w-6xl mx-auto w-full pb-8">

        <div className="mb-6 mt-2">
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">Your Mentor Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* What mentees see */}
          <div>
            <SectionHeading title="What mentees see" className="mb-4" />
            <div className="bg-[#C5DCE8] rounded-xl p-6 shadow-sm">
              {user.profilePicture
                ? <img src={user.profilePicture} alt={name} className="w-24 h-24 rounded-full object-cover mx-auto shadow-md" />
                : <div className="w-24 h-24 rounded-full bg-slate-300 mx-auto" />
              }
              <p className="font-bold text-[#00212C] text-xl text-center mt-3">{name}</p>
              {title && <p className="text-sm font-medium text-[#00212C] text-center mt-0.5">{title}</p>}
              {education && <p className="text-xs text-slate-700 text-center mt-0.5">({education})</p>}
              {formData.state && <p className="text-xs font-semibold text-[#007CA6] text-center mt-1">Location: {formData.state}</p>}

              {formData.volunteeringFor.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {formData.volunteeringFor.map(id => {
                    const service = MENTOR_SERVICES.find(s => s.id === id)
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 bg-[#fdbb36]/30 text-[#00212C] text-xs font-semibold px-3 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-[#fdbb36]" />
                        {service?.label || id}
                      </span>
                    )
                  })}
                </div>
              )}

              <div className="flex justify-center gap-4 mt-4 text-xs font-semibold">
                {formData.linkedinUrl && (
                  <a
                    href={/^https?:\/\//i.test(formData.linkedinUrl) ? formData.linkedinUrl : `https://${formData.linkedinUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#007CA6] bg-white px-3 py-1.5 rounded-lg shadow-sm hover:underline transition-all"
                  >
                    LinkedIn Profile
                  </a>
                )}
                {formData.websiteUrl && (
                  <a
                    href={/^https?:\/\//i.test(formData.websiteUrl) ? formData.websiteUrl : `https://${formData.websiteUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#007CA6] bg-white px-3 py-1.5 rounded-lg shadow-sm hover:underline transition-all"
                  >
                    Portfolio / Website
                  </a>
                )}
                {formData.resume && (
                  <a
                    href={formData.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-700 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:underline transition-all"
                  >
                    View Resume
                  </a>
                )}
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold text-[#00212C] mb-1">Bio:</p>
                <div className="bg-white rounded-lg p-3 min-h-[80px] text-sm text-slate-700 whitespace-pre-wrap shadow-inner">
                  {formData.additionalInfo || <span className="text-slate-400 italic">No bio added yet.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div>
            <SectionHeading title="View or Update Your Information" className="mb-4" />
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">

              {/* Personal Info */}
              <div className="border-b border-slate-100 pb-4 space-y-3">
                <h3 className="text-xs font-bold text-[#00212C] uppercase tracking-wider">Personal Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} className={inputClass} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input name="phone" type="text" value={formData.phone} onChange={handleChange} placeholder="(555) 000-0000" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>US State</label>
                    <select name="state" value={formData.state} onChange={handleChange} className={inputClass}>
                      <option value="">Select State</option>
                      {STATES_LIST.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>How did you hear about us?</label>
                    <select name="referralSource" value={formData.referralSource} onChange={handleChange} className={inputClass}>
                      <option value="">Select Option</option>
                      <option value="Search engine (Google, etc.)">Search engine (Google, etc.)</option>
                      <option value="Word of mouth / Friend">Word of mouth / Friend</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Campus / Event">Campus / Event</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional & Links */}
              <div className="border-b border-slate-100 pb-4 space-y-3">
                <h3 className="text-xs font-bold text-[#00212C] uppercase tracking-wider">Professional Info & Links</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>LinkedIn URL</label>
                    <input name="linkedinUrl" type="text" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..." className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Portfolio / GitHub Link</label>
                    <input name="websiteUrl" type="text" value={formData.websiteUrl} onChange={handleChange} placeholder="https://github.com/..." className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Resume Document</label>
                  {formData.resume && (
                    <div className="flex items-center gap-2 mb-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
                      <span className="font-semibold text-[#00212C]">Current Resume:</span>
                      <a
                        href={formData.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#007CA6] font-semibold underline hover:text-[#006080] transition-colors"
                      >
                        View Current Resume ↗
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                      className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#007CA6]/10 file:text-[#007CA6] hover:file:bg-[#007CA6]/20 cursor-pointer"
                    />
                    {uploadingResume && <span className="text-xs text-slate-500">Uploading...</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input name="jobTitle" type="text" value={formData.jobTitle} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Employer</label>
                    <input name="employer" type="text" value={formData.employer} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <SearchableSelect
                  label="Industry"
                  name="industry"
                  value={formData.industry}
                  options={INDUSTRIES_LIST}
                  placeholder="Type to search industry..."
                  onChange={handleChange}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Years of Professional Exp.</label>
                    <input name="yearsOfProfExp" type="number" min="0" value={formData.yearsOfProfExp} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>University</label>
                    <input name="university" type="text" value={formData.university} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <SearchableSelect
                  label="Major(s)"
                  name="majors"
                  value={formData.majors}
                  options={MAJORS_LIST}
                  placeholder="Type to search major..."
                  onChange={handleChange}
                  isMulti={true}
                />
              </div>

              {/* Mentorship & Availability Settings */}
              <div className="border-b border-slate-100 pb-4 space-y-3">
                <h3 className="text-xs font-bold text-[#00212C] uppercase tracking-wider">Mentorship & Session Preferences</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Max Mentees Capacity</label>
                    <input name="maxMentees" type="number" min="1" max="20" value={formData.maxMentees} onChange={handleChange} placeholder="e.g. 3" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Meeting Cadence</label>
                    <select name="frequency" value={formData.frequency} onChange={handleChange} className={inputClass}>
                      <option value="">Select Cadence</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-weekly">Bi-weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Custom Meeting Link (Zoom, Meet, etc.)</label>
                  <input name="customMeetingLink" type="text" value={formData.customMeetingLink} onChange={handleChange} placeholder="https://meet.google.com/..." className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Services You Offer</label>
                  <div className="flex flex-col gap-1">
                    {MENTOR_SERVICES.map(service => (
                      <label key={service.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          value={service.id}
                          checked={formData.volunteeringFor.includes(service.id)}
                          onChange={handleCheckbox}
                          className="w-4 h-4 rounded text-[#007CA6]"
                        />
                        <span className="text-sm text-slate-700">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <h3 className="text-xs font-bold text-[#00212C] uppercase tracking-wider">Notification Preferences</h3>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" name="email" checked={formData.notificationPreferences.email} onChange={handleNotificationChange} className="w-4 h-4 rounded" />
                    Email Alerts
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" name="sms" checked={formData.notificationPreferences.sms} onChange={handleNotificationChange} className="w-4 h-4 rounded" />
                    SMS / WhatsApp
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox" name="inApp" checked={formData.notificationPreferences.inApp} onChange={handleNotificationChange} className="w-4 h-4 rounded" />
                    In-App Alerts
                  </label>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className={labelClass}>Bio</label>
                <textarea
                  name="additionalInfo"
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  placeholder="Share your background, areas of expertise, or mentorship goals..."
                />
              </div>

              {message && (
                <p className={`text-xs font-medium ${message.includes('successfully') ? 'text-emerald-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="bg-[#007CA6] hover:bg-[#006080] disabled:opacity-50 text-white w-full py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageLayoutDashboard>
  )
}

export default MentorViewProfile

