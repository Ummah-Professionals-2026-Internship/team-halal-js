import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'

const INDUSTRIES_LIST = [
  'Aerospace',
  'Agriculture',
  'Automotive',
  'Biotechnology',
  'Construction',
  'Consulting',
  'Education',
  'Energy',
  'Entertainment',
  'Finance',
  'Government',
  'Healthcare',
  'Hospitality',
  'Information Technology',
  'Insurance',
  'Legal',
  'Manufacturing',
  'Media',
  'Non-profit',
  'Real Estate',
  'Retail',
  'Software Engineering / Technology',
  'Telecommunications',
  'Transportation'
]

const NextPageMentor = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    jobTitle: '',
    employer: '',
    industry: '',
    yearsOfProfExp: '',
    additionalInfo: '',
  })

  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const step1 = JSON.parse(localStorage.getItem('mentorStep1') ?? '{}')
    localStorage.setItem('mentorStep2', JSON.stringify({ ...step1, ...formData }))
    navigate('/mentor-availability')
  }

  const filteredIndustries = INDUSTRIES_LIST.filter((ind) =>
    ind.toLowerCase().includes(formData.industry.toLowerCase())
  )

  return (
    <PageLayout onBack={() => navigate(-1)}>
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

          <div className="relative mb-3">
            <label className="block mb-1">Industry</label>
            <input
              name="industry"
              type="text"
              value={formData.industry}
              onChange={handleChange}
              onFocus={() => setShowIndustryDropdown(true)}
              onBlur={() => setTimeout(() => setShowIndustryDropdown(false), 200)}
              placeholder="Type to search industry..."
              className="border border-gray-300 rounded px-3 py-1.5 w-full text-sm bg-white"
              required
            />
            {showIndustryDropdown && filteredIndustries.length > 0 && (
              <div className="absolute z-10 w-full max-h-40 overflow-y-auto bg-white border border-gray-300 rounded mt-1 shadow-lg">
                {filteredIndustries.map((ind) => (
                  <div
                    key={ind}
                    onMouseDown={() => {
                      setFormData((prev) => ({ ...prev, industry: ind }))
                      setShowIndustryDropdown(false)
                    }}
                    className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {ind}
                  </div>
                ))}
              </div>
            )}
          </div>

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

export default NextPageMentor
