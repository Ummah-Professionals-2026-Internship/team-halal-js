import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'

const MentorInfoForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    linkedinProfile: '',
    name: '',
    email: '',
    experienceLevel: '',
    employer: '',
    jobTitle: '',
    industry: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('mentorStep1', JSON.stringify(formData))
    navigate('/nextpageMentor')
  }

  return (
    <PageLayout onBack={() => navigate(-1)}>
      <Card title="Create Your Mentor Profile">
        <div className="w-full text-left">
          <form onSubmit={handleSubmit}>

            <label className="block mb-1">LinkedIn URL</label>
            <div className="flex border border-gray-300 rounded w-full mb-3 overflow-hidden">
              <input
                type="text"
                name="linkedinProfile"
                value={formData.linkedinProfile}
                onChange={handleChange}
                className="flex-1 px-3 py-1.5 outline-none text-sm"
              />
              <label htmlFor="linkedin-upload" className="cursor-pointer px-4 py-2 flex items-center">
                <i className="ri-upload-2-line text-xl" />
              </label>
            </div>

            <label className="block mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            />

            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            />

            <label className="block mb-1">Experience Level</label>
            <input
              type="text"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            />

            <label className="block mb-1">Employer</label>
            <input
              type="text"
              name="employer"
              value={formData.employer}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            />

            <label className="block mb-1">Job Title</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            />

            <label className="block mb-1">Industry</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            />

            <button type="submit" className="bg-[#007CA6] px-5 py-2 w-full rounded font-semibold mt-2">
              Next
            </button>
          </form>
        </div>
      </Card>
    </PageLayout>
  )
}

export default MentorInfoForm
