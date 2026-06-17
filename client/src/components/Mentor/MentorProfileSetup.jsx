import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'
import SearchableSelect from '../SearchableSelect'
import { STATES_LIST, MAJORS_LIST } from '../../constants/lists'

const API = import.meta.env.VITE_API_URL || ''

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

const MentorProfileSetup = () => {
  const navigate = useNavigate()
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

    // Reset value immediately so selecting the same file triggers onChange again
    e.target.value = ''

    setUploading(true)
    setUploadMessage('Uploading and parsing resume...')

    const token = localStorage.getItem('token')
    const fData = new FormData()
    fData.append('resume', file)

    try {
      const response = await fetch(API + '/api/upload/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fData
      })

      if (response.ok) {
        const data = await response.json()
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

        setUploadMessage('Resume parsed! Fields pre-filled.')
      } else {
        setUploadMessage('Upload failed. You can still enter details manually.')
      }
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
    localStorage.setItem('mentorStep1', JSON.stringify(toSave))
    navigate('/mentor/career-setup')
  }

  return (
    <PageLayout onBack={() => navigate(-1)}>
      <Card title="Create Your Mentor Profile">
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

            <label className="block mb-1">Alma Mater / University</label>
            <input
              name="university"
              type="text"
              value={formData.university}
              onChange={handleChange}
              placeholder="e.g. Stanford University"
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
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

            <label className="block mb-1">LinkedIn URL</label>
            <input
              type="text"
              name="linkedinUrl"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedinUrl}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
              required
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

export default MentorProfileSetup
