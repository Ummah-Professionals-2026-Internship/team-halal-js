import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'
import SearchableSelect from '../SearchableSelect'
import { STATES_LIST, MAJORS_LIST } from '../../constants/lists'
import { uploadResume } from '../../api-calls/upload'

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

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-2 mt-5 mb-3">
    <span className="w-1.5 h-1.5 rounded-sm bg-[#fdbb36] shrink-0" />
    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap">{label}</span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
)

const inputClass = "border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

const MentorProfileSetup = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    resume: null,
    resumePath: '',
    resumeName: '',
    gender: '',
    state: '',
    university: '',
    majors: [],
    linkedinUrl: '',
    phone: '',
    referralSource: '',
    volunteeringFor: [],
  })
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

  const handleChange = (e) => {
    const { name, type, value, files } = e.target
    let newValue = type === 'file' ? files[0] : value
    if (name === 'phone') {
      newValue = formatPhoneNumber(newValue)
    }
    setFormData({ ...formData, [name]: newValue })
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

  const handleResumeChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    e.target.value = ''

    setUploading(true)
    setUploadMessage('Uploading and parsing resume...')

    const fData = new FormData()
    fData.append('resume', file)

    try {
      const data = await uploadResume(fData);
      const { filePath, parsedData } = data

      setFormData(prev => {
        let parsedMajors = prev.majors;
        if (parsedData.majors) {
          parsedMajors = Array.isArray(parsedData.majors) ? parsedData.majors : [parsedData.majors];
        }
        return {
          ...prev,
          resume: file,
          resumePath: filePath,
          resumeName: file.name,
          phone: parsedData.phone ? formatPhoneNumber(parsedData.phone) : prev.phone,
          linkedinUrl: parsedData.linkedinUrl || prev.linkedinUrl,
          university: parsedData.university || prev.university,
          majors: parsedMajors
        };
      })

      const storedCareer = {
        jobTitle: parsedData.desiredCareer || '',
        resumePath: filePath,
        resumeName: file.name
      }
      localStorage.setItem('mentorResumeData', JSON.stringify(storedCareer))

      setUploadMessage('Resume parsed! Fields pre-filled below.')
    } catch (err) {
      console.error(err)
      setUploadMessage('Error uploading file. You can still enter details manually.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.resumePath) {
      setError('Please upload your resume before continuing.');
      return;
    }
    if (!formData.gender) {
      setError('Please select your gender.');
      return;
    }
    if (!formData.referralSource) {
      setError('Please let us know how you heard about us.');
      return;
    }
    if (!formData.majors.length) {
      setError('Please select at least one major.');
      return;
    }
    setError('');
    const toSave = {
      ...formData,
      resume: formData.resumePath || ''
    }
    localStorage.setItem('mentorStep1', JSON.stringify(toSave));
    navigate('/mentor/career-setup');
  }

  return (
    <PageLayout onBack={() => navigate('/login')} backVariant="accent">
      <Card>
        <div className="w-full text-left">

          {/* Brand accent */}
          <div className="w-10 h-1.5 rounded-full bg-[#fdbb36] mx-auto mb-4" />

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  s === 1 ? 'bg-[#007CA6] text-white' : 'bg-slate-100 text-slate-400'
                }`}>{s}</div>
                {s < 3 && <div className="w-10 h-0.5 rounded-full bg-slate-100" />}
              </React.Fragment>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center mb-5">Step 1 of 3 — Profile Setup</p>
          <h2 className="text-xl font-bold text-slate-800 text-center mb-5">Create Your Mentor Profile</h2>

          <form onSubmit={handleSubmit}>

            {/* Resume Upload */}
            <div className={`mb-5 p-4 rounded-xl border-2 border-dashed transition-colors text-center ${
              formData.resumePath
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-slate-50 border-slate-200 hover:border-[#007CA6]/40'
            }`}>
              <div className="flex flex-col items-center gap-1 mb-3">
                <svg className={`w-6 h-6 ${formData.resumePath ? 'text-emerald-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs font-semibold text-slate-700">
                  {formData.resumePath ? 'Resume uploaded' : 'Upload your resume first'}
                </p>
                <p className="text-[10px] text-slate-400">PDF, DOC, DOCX, or TXT — we'll auto-fill your details</p>
              </div>
              <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                uploading ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-[#007CA6] hover:bg-[#006080] text-white'
              }`}>
                {uploading ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading...
                  </>
                ) : formData.resumePath ? 'Replace File' : 'Choose File'}
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  name="resume"
                  onChange={handleResumeChange}
                  disabled={uploading}
                />
              </label>
              {(uploadMessage || formData.resumeName) && (
                <p className={`text-[10px] mt-2 font-medium ${formData.resumePath ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {uploadMessage || (formData.resumeName && `✓ ${formData.resumeName}`)}
                </p>
              )}
            </div>

            {/* Personal Info */}
            <SectionDivider label="Personal Info" />

            <div className="mb-4">
              <label className={labelClass}>Gender</label>
              <div className="flex gap-3">
                {['male', 'female'].map(option => (
                  <label key={option} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                    formData.gender === option
                      ? 'border-[#007CA6] bg-[#007CA6]/5 text-[#007CA6]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={formData.gender === option}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass}>Phone Number</label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(XXX) XXX-XXXX"
                maxLength={14}
                className={inputClass}
                required
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>State</label>
              <select name="state" value={formData.state} onChange={handleChange} className={inputClass} required>
                <option value="">Select state</option>
                {STATES_LIST.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Education */}
            <SectionDivider label="Education" />

            <div className="mb-4">
              <label className={labelClass}>Alma Mater / University</label>
              <input
                name="university"
                type="text"
                value={formData.university}
                onChange={handleChange}
                placeholder="e.g. Stanford University"
                className={inputClass}
                required
              />
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

            {/* Online Presence */}
            <SectionDivider label="Online Presence" />

            <div className="mb-4">
              <label className={labelClass}>LinkedIn URL</label>
              <input
                type="text"
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedinUrl}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Volunteer Services */}
            <SectionDivider label="Volunteer Services" />

            <p className="text-xs text-slate-500 mb-3">Select all services you'd like to offer mentees.</p>
            <div className="mb-4 flex flex-col gap-0.5">
              {['healthcare service', 'mentorship program', 'resume review', 'mock interview', 'general career advice'].map(service => (
                <label key={service} className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-50 group transition-colors">
                  <input
                    type="checkbox"
                    name="volunteeringFor"
                    value={service}
                    checked={formData.volunteeringFor.includes(service)}
                    onChange={handleCheckbox}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.volunteeringFor.includes(service)
                      ? 'bg-[#007CA6] border-[#007CA6]'
                      : 'border-slate-300 group-hover:border-[#007CA6]/50'
                  }`}>
                    {formData.volunteeringFor.includes(service) && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-slate-700 capitalize">{service}</span>
                </label>
              ))}
            </div>

            {/* Discovery */}
            <SectionDivider label="Discovery" />

            <div className="mb-5">
              <label className={labelClass}>How did you hear about us?</label>
              <select name="referralSource" value={formData.referralSource} onChange={handleChange} className={inputClass}>
                <option value="" disabled hidden>Select an option</option>
                <option value="Social Media">Social Media</option>
                <option value="Friend or Family">Friend or Family</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="bg-[#007CA6] hover:bg-[#006080] text-white w-full py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              Next: Career Details
            </button>
          </form>
        </div>
      </Card>
    </PageLayout>
  )
}

export default MentorProfileSetup
