import React, { useState, useEffect } from 'react'
import PageLayoutDashboard from '../PageLayoutDashboard'
import SectionHeading from '../SectionHeading'
import SearchableSelect from '../SearchableSelect'
import useCurrentUser from '../useCurrentUser'
import { MAJORS_LIST, UNIVERSITIES_LIST } from '../../constants/lists'
import { MENTOR_SERVICES } from '../../constants/services'
import { updateMenteeProfile } from '../../api-calls/mentees'

const inputClass = "border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

const ACADEMIC_STATUS_OPTIONS = [
  'Freshman (Year 1)',
  'Sophomore (Year 2)',
  'Junior (Year 3)',
  'Senior (Year 4)',
  'Graduate Student',
  'Not in College (Working)',
  'Internship',
  'Other',
]

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  linkedinUrl: '',
  university: '',
  majors: [],
  academicStatus: '',
  desiredCareer: '',
  desiredServices: [],
  additionalInfo: '',
}

const MenteeViewProfile = () => {
  const { user, refreshUser } = useCurrentUser()
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
      academicStatus: user.menteeProfile?.academicStatus || '',
      desiredCareer: user.menteeProfile?.desiredCareer || '',
      desiredServices: (user.menteeProfile?.desiredServices || []).filter(id => MENTOR_SERVICES.some(s => s.id === id)),
      additionalInfo: user.additionalInfo || '',
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
      desiredServices: checked
        ? [...prev.desiredServices, value]
        : prev.desiredServices.filter(v => v !== value)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await updateMenteeProfile(formData)
      refreshUser()
      setMessage('Profile updated successfully.')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!user.firstName) return <div>Loading ...</div>

  const name = `${formData.firstName} ${formData.lastName}`.trim()
  const education = [formData.majors?.[0], formData.university].filter(Boolean).join(' from ')

  return (
    <PageLayoutDashboard userName={name} userRole="Mentee" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser}>
      <div className="max-w-6xl mx-auto w-full pb-4">

        <div className="mb-6 mt-2">
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">Your Mentee Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* What mentors see */}
          <div>
            <SectionHeading title="What mentors see" className="mb-4" />
            <div className="bg-[#C5DCE8] rounded-xl p-6">
              {user.profilePicture
                ? <img src={user.profilePicture} alt={name} className="w-20 h-20 rounded-full object-cover mx-auto" />
                : <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto" />
              }
              <p className="font-bold text-[#00212C] text-lg text-center mt-3">{name}</p>
              {formData.academicStatus && <p className="text-sm text-[#00212C] text-center">{formData.academicStatus}</p>}
              {education && <p className="text-sm text-[#00212C] text-center">({education})</p>}
              {formData.desiredCareer && <p className="text-sm text-[#00212C] text-center">Goal: {formData.desiredCareer}</p>}

              {formData.desiredServices.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {formData.desiredServices.map(id => {
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
                <p className="text-xs font-semibold text-[#00212C] mb-1">Additional Info:</p>
                <div className="bg-white rounded-lg p-3 min-h-20 text-sm text-slate-700 whitespace-pre-wrap">
                  {formData.additionalInfo || <span className="text-slate-400">No additional info added yet.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div>
            <SectionHeading title="View or Update Your Information" className="mb-4" />
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 p-5">

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

              <div className="mb-4">
                <label className={labelClass}>Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass} required />
              </div>

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

              <div className="mb-4">
                <label className={labelClass}>Current Academic Year</label>
                <select name="academicStatus" value={formData.academicStatus} onChange={handleChange} className={inputClass}>
                  <option value="">Select an option</option>
                  {ACADEMIC_STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className={labelClass}>Desired Future Career</label>
                <input name="desiredCareer" type="text" value={formData.desiredCareer} onChange={handleChange} className={inputClass} />
              </div>

              <div className="mb-4">
                <label className={labelClass}>What are you looking for in a mentor?</label>
                <div className="flex flex-col gap-0.5">
                  {MENTOR_SERVICES.map(service => (
                    <label key={service.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50 group transition-colors">
                      <input
                        type="checkbox"
                        value={service.id}
                        checked={formData.desiredServices.includes(service.id)}
                        onChange={handleCheckbox}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">{service.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className={labelClass}>Additional Info</label>
                <textarea
                  name="additionalInfo"
                  className={`${inputClass} resize-none`}
                  rows={4}
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  placeholder="Share what you're hoping to get out of mentorship..."
                />
              </div>

              {message && (
                <p className={`text-xs font-medium mb-4 ${message.includes('successfully') ? 'text-emerald-600' : 'text-red-600'}`}>
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

export default MenteeViewProfile
