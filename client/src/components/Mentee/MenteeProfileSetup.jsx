import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'
import { STATES_LIST } from '../../constants/lists'
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

const MenteeProfileSetup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    resume: null,
    resumePath: '',
    resumeName: '',
    gender: '',
    state: '',
    phone: '',
    linkedinUrl: '',
    referralSource: ''
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

      setFormData(prev => ({
        ...prev,
        resume: file,
        resumePath: filePath,
        resumeName: file.name,
        phone: parsedData.phone ? formatPhoneNumber(parsedData.phone) : prev.phone,
        linkedinUrl: parsedData.linkedinUrl || prev.linkedinUrl
      }))

      const storedAcademic = {
        university: parsedData.university || '',
        majors: parsedData.majors ? (Array.isArray(parsedData.majors) ? parsedData.majors : [parsedData.majors]) : [],
        desiredCareer: parsedData.desiredCareer || '',
        resumePath: filePath,
        resumeName: file.name
      }
      localStorage.setItem('menteeResumeData', JSON.stringify(storedAcademic))

      setUploadMessage('Resume parsed! Fields pre-filled.')
    } catch (err) {
      console.error(err)
      setUploadMessage('Error uploading file. You can still enter details manually.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const toSave = {
      ...formData,
      resume: formData.resumePath || ''
    }
    localStorage.setItem('menteeStep1', JSON.stringify(toSave))
    navigate('/mentee/academic-setup')
  }

  return (
    <PageLayout onBack={() => navigate(-1)} backVariant="accent">
      <Card>
        <div className="w-full text-left">

          {/* Brand accent */}
          <div className="w-10 h-1.5 rounded-full bg-[#fdbb36] mx-auto mb-4" />

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  s === 1
                    ? 'bg-[#007CA6] text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {s}
                </div>
                {s < 2 && (
                  <div className="w-10 h-0.5 rounded-full bg-slate-100" />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center mb-5">Step 1 of 2 — Personal Details</p>
          <h2 className="text-xl font-bold text-slate-800 text-center mb-5">Create Your Mentee Profile</h2>

          <form onSubmit={handleSubmit} className="w-full">

            {/* Resume Upload Box */}
            <SectionDivider label="Resume Upload" />
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center sm:text-left transition-colors">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Upload Your Resume</h3>
              <p className="text-xs text-slate-500 mb-3">Upload your resume (PDF, DOC, DOCX, or TXT) to automatically fill out details.</p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="cursor-pointer bg-[#007CA6] hover:bg-[#006080] text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors whitespace-nowrap">
                  {uploading ? 'Uploading...' : 'Choose File'}
                  <input 
                    id="resume-upload"
                    type="file" 
                    accept=".pdf,.doc,.docx,.txt" 
                    className="hidden" 
                    name="resume"
                    onChange={handleResumeChange}
                    required={!formData.resumePath}
                    disabled={uploading}
                  />
                </label>
                <span className="text-xs text-slate-600 font-medium truncate max-w-xs">
                  {uploadMessage ? uploadMessage : (formData.resumeName || 'No file selected')}
                </span>
              </div>
            </div>

            <SectionDivider label="Personal Information" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="" disabled hidden>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="" disabled hidden>Select State</option>
                  {STATES_LIST.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
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

              <div>
                <label className={labelClass}>LinkedIn URL (Optional)</label>
                <input
                  type="text"
                  name="linkedinUrl"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className={labelClass}>How did you hear about this service?</label>
              <select
                name="referralSource"
                value={formData.referralSource}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="" disabled hidden>Select an option</option>
                <option value="Social Media">Social Media</option>
                <option value="Friend or Family">Friend or Family</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-[#007CA6] hover:bg-[#006080] text-white w-full py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              Next Step
            </button>
          </form>
        </div>
      </Card>
    </PageLayout>
  )
}

export default MenteeProfileSetup
