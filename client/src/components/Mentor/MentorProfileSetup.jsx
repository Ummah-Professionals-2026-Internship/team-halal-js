import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'
import SearchableSelect from '../SearchableSelect'
import { STATES_LIST, MAJORS_LIST, UNIVERSITIES_LIST } from '../../constants/lists'
import { MENTOR_SERVICES } from '../../constants/services'
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
    if (!formData.gender) {
      setError('Please select your gender.');
      return;
    }
    if (!formData.university) {
      setError('Please select your university from the list.');
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

            {/* Resume Upload Box — Highlighted Recommended Step */}
            <div className="mb-6 p-4 md:p-5 bg-gradient-to-br from-[#007CA6]/10 via-sky-50 to-emerald-50/60 rounded-2xl border-2 border-[#007CA6]/30 text-left transition-all shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-xl shrink-0">💡</span>
                <div>
                  <h3 className="text-sm font-bold text-[#003F55] uppercase tracking-wide">
                    Recommended First Step — Upload Resume
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Uploading your resume is the fastest way to build your profile! Our system auto-parses your contact info, Alma Mater, major, and job title to pre-fill the form.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#007CA6]/15 flex flex-col sm:flex-row items-center gap-3">
                <label className="cursor-pointer bg-[#007CA6] hover:bg-[#006080] text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors whitespace-nowrap shadow-sm">
                  {uploading ? 'Parsing Resume...' : formData.resumePath ? '✓ Change Resume' : 'Upload Resume (PDF, DOCX)'}
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
                <span className="text-xs font-medium text-slate-700 truncate max-w-xs">
                  {uploadMessage ? uploadMessage : (formData.resumeName ? `Attached: ${formData.resumeName}` : 'No resume file chosen yet')}
                </span>
              </div>
            </div>

            {/* Personal Info */}
            <SectionDivider label="Personal Info" />

            <div className="mb-4">
              <label className={labelClass}>
                Gender <span className="text-red-500 font-bold">*</span>
              </label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>
                  Phone Number <span className="text-red-500 font-bold">*</span>
                </label>
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

              <div>
                <label className={labelClass}>
                  State <span className="text-red-500 font-bold">*</span>
                </label>
                <select name="state" value={formData.state} onChange={handleChange} className={inputClass} required>
                  <option value="" disabled hidden>Select State</option>
                  {STATES_LIST.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Education */}
            <SectionDivider label="Education" />

            <SearchableSelect
              label="Alma Mater / University"
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
              isMulti={true}
              required
            />

            {/* Online Presence */}
            <SectionDivider label="Online Presence" />

            <div className="mb-4">
              <label className={labelClass}>
                LinkedIn URL <span className="text-red-500 font-bold">*</span>
              </label>
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

            <label className="block text-sm font-semibold text-slate-700 mb-1">
              What services can you offer mentees? <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">Select all services you'd like to offer.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
              {MENTOR_SERVICES.map(service => {
                const isSelected = formData.volunteeringFor.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => {
                      const e = { target: { name: 'volunteeringFor', value: service.id, checked: !isSelected } };
                      handleCheckbox(e);
                    }}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#007CA6] bg-[#007CA6]/10 shadow-sm ring-1 ring-[#007CA6]'
                        : 'border-slate-200 bg-white hover:border-[#007CA6]/40 hover:bg-slate-50/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#007CA6] text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {service.icon === 'bulb' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />}
                            {service.icon === 'document' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                            {service.icon === 'chat' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
                          </svg>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#007CA6] border-[#007CA6] text-white' : 'border-slate-300'}`}>
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-bold text-[#00202b] mb-0.5">{service.label}</p>
                      <p className="text-[11px] text-slate-500 leading-snug">{service.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Discovery */}
            <SectionDivider label="Discovery" />

            <div className="mb-5">
              <label className={labelClass}>
                How did you hear about us? <span className="text-red-500 font-bold">*</span>
              </label>
              <select name="referralSource" value={formData.referralSource} onChange={handleChange} className={inputClass} required>
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
              className="bg-[#007CA6] hover:bg-[#006080] text-white w-full py-3 rounded-xl font-bold text-base shadow-sm transition-colors cursor-pointer"
            >
              Continue to Step 2 →
            </button>
          </form>
        </div>
      </Card>
    </PageLayout>
  )
}

export default MentorProfileSetup
