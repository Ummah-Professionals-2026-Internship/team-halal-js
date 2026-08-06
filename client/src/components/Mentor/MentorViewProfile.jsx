import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayoutDashboard from '../PageLayoutDashboard'
import SectionHeading from '../SectionHeading'
import SearchableSelect from '../SearchableSelect'
import useCurrentUser from '../useCurrentUser'
import { MAJORS_LIST, INDUSTRIES_LIST, UNIVERSITIES_LIST, CAREER_CATEGORIES, POPULAR_CAREERS, POPULAR_INDUSTRIES } from '../../constants/lists'
import { MENTOR_SERVICES } from '../../constants/services'
import { updateMentorProfile } from '../../api-calls/mentors'
import { getPhotoUrl } from '../../utils/photoUrl'

const inputClass = "border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  linkedinUrl: '',
  university: '',
  majors: [],
  jobTitle: '',
  employer: '',
  industry: '',
  yearsOfProfExp: '',
  customMeetingLink: '',
  additionalInfo: '',
  volunteeringFor: [],
}

const MentorViewProfile = () => {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const { user, refreshUser } = useCurrentUser()
  const photo = getPhotoUrl(user?.profilePicture)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user.firstName) return
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      linkedinUrl: user.linkedinUrl || '',
      university: user.university || '',
      majors: user.majors || [],
      jobTitle: user.mentorProfile?.jobTitle || '',
      employer: user.mentorProfile?.employer || '',
      industry: user.mentorProfile?.industry || '',
      yearsOfProfExp: user.mentorProfile?.yearsOfProfExp ?? '',
      customMeetingLink: user.mentorProfile?.customMeetingLink || '',
      additionalInfo: user.additionalInfo || '',
      volunteeringFor: (user.mentorProfile?.volunteeringFor || []).filter(id => MENTOR_SERVICES.some(s => s.id === id)),
    })
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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

  if (!user.firstName) {
    return (
      <PageLayoutDashboard userName="" userRole="Mentor" userPhoto={null} onPhotoUpdate={refreshUser}>
        <div className="max-w-6xl mx-auto w-full pt-10 text-center text-sm text-slate-400">Loading ...</div>
      </PageLayoutDashboard>
    );
  }

  const name = `${formData.firstName} ${formData.lastName}`.trim()
  const title = [formData.jobTitle, formData.employer].filter(Boolean).join(' at ')
  const education = [formData.majors?.[0], formData.university].filter(Boolean).join(' from ')

  return (
    <PageLayoutDashboard userName={name} userRole="Mentor" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser} onBack={() => navigate(-1)}>
      <div className="max-w-6xl mx-auto w-full pb-4">

        <div className="mb-6 mt-2">
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">Your Mentor Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* What mentees see */}
          <div className="lg:sticky lg:top-4">
            <SectionHeading title="What mentees see" subtitle="A preview of your public profile card." className="mb-4" />
            <div className="max-w-sm mx-auto bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              {photo && !imgError
                ? <img src={photo} alt={name} onError={() => setImgError(true)} className="w-20 h-20 rounded-full object-cover mx-auto" />
                : <div className="w-20 h-20 rounded-full bg-[#003F55] text-white flex items-center justify-center font-bold text-xl mx-auto">{name?.[0]?.toUpperCase() ?? '?'}</div>
              }
              <p className="font-bold text-[#00212C] text-lg text-center mt-3">{name}</p>
              {title && <p className="text-sm text-[#00212C] text-center">{title}</p>}
              {education && <p className="text-sm text-[#00212C] text-center">({education})</p>}

              {formData.volunteeringFor.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {formData.volunteeringFor.map(id => {
                    const service = MENTOR_SERVICES.find(s => s.id === id)
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 bg-[#fdbb36]/20 text-[#00212C] text-xs font-semibold px-2.5 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-[#fdbb36]" />
                        {service?.label || id}
                      </span>
                    )
                  })}
                </div>
              )}

              {formData.linkedinUrl && (
                <a
                  href={/^https?:\/\//i.test(formData.linkedinUrl) ? formData.linkedinUrl : `https://${formData.linkedinUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs text-[#003F55] underline text-center mt-3 truncate"
                >
                  LinkedIn
                </a>
              )}

              <div className="mt-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bio</p>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 min-h-[80px] text-sm text-slate-700 whitespace-pre-wrap">
                  {formData.additionalInfo || <span className="text-slate-400">No bio added yet.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div>
            <SectionHeading title="View or Update Your Information" className="mb-4" />
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">

              <div className="mb-4">
                <label className={labelClass}>LinkedIn URL</label>
                <input name="linkedinUrl" type="text" value={formData.linkedinUrl} onChange={handleChange} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} className={inputClass} required />
                </div>
              </div>

              <div className="mb-5">
                <label className={labelClass}>Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} required />
              </div>

              <div className="mb-4 pt-4 border-t border-slate-100">
                <label className={labelClass}>Years of Professional Experience</label>
                <input name="yearsOfProfExp" type="number" min="0" value={formData.yearsOfProfExp} onChange={handleChange} className={inputClass} />
              </div>

              <div className="mb-4">
                <label className={labelClass}>Employer</label>
                <input name="employer" type="text" value={formData.employer} onChange={handleChange} className={inputClass} />
              </div>

              <div className="mb-4">
                <SearchableSelect
                  label="Job Title"
                  name="jobTitle"
                  value={formData.jobTitle}
                  categories={CAREER_CATEGORIES}
                  quickPills={POPULAR_CAREERS}
                  placeholder="Type or select job title..."
                  onChange={handleChange}
                  strictMatch={false}
                />
              </div>

              <SearchableSelect
                label="Industry"
                name="industry"
                value={formData.industry}
                options={INDUSTRIES_LIST}
                quickPills={POPULAR_INDUSTRIES}
                placeholder="Type to search industry..."
                onChange={handleChange}
              />

              <SearchableSelect
                label="University"
                name="university"
                value={formData.university}
                options={UNIVERSITIES_LIST}
                placeholder="Type to search university..."
                onChange={handleChange}
              />

              <SearchableSelect
                label="Major(s)"
                name="majors"
                value={formData.majors}
                options={MAJORS_LIST}
                placeholder="Type to search major..."
                onChange={handleChange}
                isMulti={true}
              />

              {/* Video Meeting Link Card */}
              <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-center text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🎥</span>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Video Meeting Link <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                  When a mentee schedules a session with you, this link will be automatically attached to the calendar invite as your meeting location.
                </p>
                <input
                  type="url"
                  name="customMeetingLink"
                  value={formData.customMeetingLink}
                  onChange={handleChange}
                  placeholder="e.g. https://zoom.us/j/123456789 or https://meet.google.com/..."
                  className="border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors w-full text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                  💡 <strong>Note:</strong> Accepts personal Zoom, Google Meet, Teams, or Webex links. If left blank, Google Meet will automatically generate unique links for your sessions (if your Google Calendar is connected).
                </p>
                {!user?.calendarAccess && !formData.customMeetingLink.trim() && (
                  <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
                    <span>⚠️</span>
                    <span><strong>Attention:</strong> You have not connected Google Calendar or set a video link. Please add a video meeting link or connect your calendar to allow mentees to book sessions.</span>
                  </div>
                )}
              </div>

              <div className="mb-5 pt-4 border-t border-slate-100">
                <label className={labelClass}>Services You Offer</label>
                <div className="flex flex-col gap-0.5">
                  {MENTOR_SERVICES.map(service => (
                    <label key={service.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50 group transition-colors">
                      <input
                        type="checkbox"
                        value={service.id}
                        checked={formData.volunteeringFor.includes(service.id)}
                        onChange={handleCheckbox}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">{service.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-5 pt-4 border-t border-slate-100">
                <label className={labelClass}>Bio</label>
                <textarea
                  name="additionalInfo"
                  className={`${inputClass} resize-none`}
                  rows={4}
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  placeholder="Share your goals, areas of expertise, or what you hope to offer..."
                />
              </div>

              {message && (
                <p className={`text-xs font-medium mb-4 rounded-lg px-3 py-2 border ${
                  message.includes('successfully')
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                    : 'text-red-600 bg-red-50 border-red-100'
                }`}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="bg-[#007CA6] hover:bg-[#006080] disabled:opacity-50 text-white w-full py-2.5 rounded-lg font-semibold text-sm transition-colors"
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
