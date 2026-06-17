import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'

const MAJORS_LIST = [
  'Accounting',
  'Art & Design',
  'Biology',
  'Biomedical Engineering',
  'Business Administration',
  'Chemical Engineering',
  'Chemistry',
  'Civil Engineering',
  'Communications',
  'Computer Engineering',
  'Computer Science',
  'Cybersecurity',
  'Data Science',
  'Economics',
  'Electrical Engineering',
  'Finance',
  'Information Technology',
  'Marketing',
  'Mathematics',
  'Mechanical Engineering',
  'Nursing',
  'Physics',
  'Political Science',
  'Psychology',
  'Pre-Law',
  'Pre-Med',
  'Software Engineering'
]

const MentorInfoForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    gender: '',
    state: '',
    university: '',
    majors: '',
    linkedinUrl: '',
    phone: '',
    referralSource: '',
  })

  const [showMajorDropdown, setShowMajorDropdown] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('mentorStep1', JSON.stringify(formData))
    navigate('/nextpageMentor')
  }

  const filteredMajors = MAJORS_LIST.filter((m) =>
    m.toLowerCase().includes(formData.majors.toLowerCase())
  )

  return (
    <PageLayout onBack={() => navigate(-1)}>
      <Card title="Create Your Mentor Profile">
        <div className="w-full text-left">
          <form onSubmit={handleSubmit}>

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
              {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <label className="block mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
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

            <div className="relative mb-3">
              <label className="block mb-1">Majors (s)</label>
              <input
                name="majors"
                type="text"
                value={formData.majors}
                onChange={handleChange}
                onFocus={() => setShowMajorDropdown(true)}
                onBlur={() => setTimeout(() => setShowMajorDropdown(false), 200)}
                placeholder="Type to search major..."
                className="border border-gray-300 rounded px-3 py-1.5 w-full text-sm bg-white"
                required
              />
              {showMajorDropdown && filteredMajors.length > 0 && (
                <div className="absolute z-10 w-full max-h-40 overflow-y-auto bg-white border border-gray-300 rounded mt-1 shadow-lg">
                  {filteredMajors.map((m) => (
                    <div
                      key={m}
                      onMouseDown={() => {
                        setFormData((prev) => ({ ...prev, majors: m }))
                        setShowMajorDropdown(false)
                      }}
                      className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>

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

export default MentorInfoForm
