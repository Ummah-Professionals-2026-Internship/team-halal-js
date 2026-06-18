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

    // Clear input value immediately so same-name files trigger onChange next time
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
    <PageLayout onBack={() => navigate(-1)}>
      <Card title="Create Your Mentee Profile">
        <div className="w-full text-left">
          <form onSubmit={handleSubmit}>

            {/* Resume Upload Box */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center sm:text-left">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Upload Your Resume</h3>
              <p className="text-xs text-slate-500 mb-3">Please upload your resume file (PDF, DOC, DOCX, or TXT) to get started.</p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="cursor-pointer bg-[#007CA6] hover:bg-[#006080] text-white px-4 py-2 rounded text-xs font-semibold tracking-wide transition-colors whitespace-nowrap">
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

            <div className="mb-3">
              <label className="block mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-1.5 w-full text-sm bg-white"
                required
              >
                <option value=""></option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <label className="block mb-1">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
              required
            >
              <option value="">Select State</option>
              {STATES_LIST.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <label className="block mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(XXX) XXX-XXXX"
              maxLength={14}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
              required
            />

            <label className="block mb-1">LinkedIn URL (Optional)</label>
            <input
              type="text"
              name="linkedinUrl"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedinUrl}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
            />

            <label className="block mb-1">How did you hear about this service?</label>
            <select
              name="referralSource"
              value={formData.referralSource}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
              required
            >
              <option value=""></option>
              <option value="Social Media">Social Media</option>
              <option value="Friend or Family">Friend or Family</option>
              <option value="Other">Other</option>
            </select>

            <button type="submit" className="bg-[#007CA6] px-5 py-2 w-full rounded font-semibold mt-2 text-white">
              Next
            </button>
          </form>
        </div>
      </Card>
    </PageLayout>
  )
}

export default MenteeProfileSetup
