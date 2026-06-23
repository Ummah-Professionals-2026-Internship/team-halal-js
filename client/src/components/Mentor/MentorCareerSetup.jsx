import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'
import SearchableSelect from '../SearchableSelect'
import { INDUSTRIES_LIST } from '../../constants/lists'

const MentorCareerSetup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    jobTitle: '',
    employer: '',
    industry: '',
    yearsOfProfExp: '',
    additionalInfo: '',
  })

  useEffect(() => {
    const savedResume = localStorage.getItem('mentorResumeData')
    if (savedResume) {
      const parsed = JSON.parse(savedResume)
      setFormData(prev => ({
        ...prev,
        jobTitle: parsed.jobTitle || prev.jobTitle
      }))
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const step1 = JSON.parse(localStorage.getItem('mentorStep1') ?? '{}')
    localStorage.setItem('mentorStep2', JSON.stringify({ ...step1, ...formData }))
    navigate('/mentor/availability-setup')
  }

  return (
    <PageLayout onBack={() => navigate('/mentor/profile-setup')}>
      <Card title="Create Your Mentor Profile">
        <form onSubmit={handleSubmit} className="w-full text-left">

          <label className="block mb-1">Employer</label>
          <input
            type="text"
            name="employer"
            value={formData.employer}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
            required
          />

          <label className="block mb-1">Job Title</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
            required
          />

          <SearchableSelect
            label="Industry"
            name="industry"
            value={formData.industry}
            options={INDUSTRIES_LIST}
            placeholder="Type to search industry..."
            onChange={handleChange}
            required
          />

          <label className="block mb-1">Years of Experience</label>
          <input
            type="number"
            name="yearsOfProfExp"
            min="0"
            value={formData.yearsOfProfExp}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
            required
          />

          <label className="block mb-1 text-sm text-center">
            Any additional information you would like to share with mentees?
          </label>
          <textarea
            name="additionalInfo"
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            rows={4}
            value={formData.additionalInfo}
            onChange={handleChange}
          />

          <button type="submit" className="bg-[#007CA6] px-5 py-2 w-full rounded font-semibold mt-2 text-white">
            Next
          </button>
        </form>
      </Card>
    </PageLayout>
  )
}

export default MentorCareerSetup
