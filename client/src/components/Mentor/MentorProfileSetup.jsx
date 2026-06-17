import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'
import SearchableSelect from '../SearchableSelect'
import { STATES_LIST, MAJORS_LIST } from '../../constants/lists'

const MentorProfileSetup = () => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('mentorStep1', JSON.stringify(formData))
    navigate('/mentor/career-setup')
  }

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
