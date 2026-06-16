import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'

const MenteeInfoForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    resume: null,
    name: '',
    phone: '',
    university: '',
    major: '',
    academicStanding: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, resume: e.target.files[0] })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const savedData = {
      ...formData,
      resume: formData.resume?.name || null,
    }
    localStorage.setItem('menteeStep1', JSON.stringify(savedData))
    navigate('/nextpageMentee')
  }

  return (
    <PageLayout onBack={() => navigate(-1)}>
      <Card title="Create Your Mentee Profile">
        <div className="w-full text-left">
          <form onSubmit={handleSubmit}>

            <label className="block mb-1">Upload Your Resume</label>
            <div className="flex border border-gray-300 rounded w-full mb-3 overflow-hidden">
              <input
                type="text"
                readOnly
                value={formData.resume ? formData.resume.name : ''}
                className="flex-1 px-4 py-1.5 outline-none text-sm"
              />
              <label htmlFor="resume-upload" className="cursor-pointer px-4 py-2 flex items-center">
                <i className="ri-upload-2-line text-xl" />
              </label>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <label className="block mb-1">Name</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            />

            <label className="block mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            />

            <label className="block mb-1">University/Institution</label>
            <input
              name="university"
              type="text"
              value={formData.university}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            />

            <label className="block mb-1">Major</label>
            <input
              name="major"
              type="text"
              value={formData.major}
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            />

            <label className="block mb-1">Academic Standing</label>
            <input
              name="academicStanding"
              type="text"
              value={formData.academicStanding}
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

export default MenteeInfoForm
