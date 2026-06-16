import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'

const NextPageMentor = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    volunteeringFor: '',
    majors: '',
    almaMater: '',
    countyState: '',
    additionalInfo: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const step1 = JSON.parse(localStorage.getItem('mentorStep1') ?? '{}')
    localStorage.setItem('mentorStep2', JSON.stringify({ ...step1, ...formData }))
    navigate('/mentor-availability')
  }

  return (
    <PageLayout onBack={() => navigate(-1)}>
      <Card title="Create Your Mentor Profile">
        <form onSubmit={handleSubmit} className="w-full text-left">

          <div className="flex justify-between mb-3">
            <div className="w-40">
              <label className="block mb-1">Volunteering For</label>
              <select
                name="volunteeringFor"
                value={formData.volunteeringFor}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-1.5 w-full text-sm"
              >
                <option value=""></option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Gender</label>
              <p className="py-1.5 text-sm text-gray-700">M | F</p>
            </div>
          </div>

          <label className="block mb-1">Majors</label>
          <input
            name="majors"
            type="text"
            value={formData.majors}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
          />

          <label className="block mb-1">Alma Mater</label>
          <input
            name="almaMater"
            type="text"
            value={formData.almaMater}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
          />

          <label className="block mb-1">County, State</label>
          <input
            name="countyState"
            type="text"
            value={formData.countyState}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
          />

          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm">Add profile picture?</label>
            {/* TODO: integrate LinkedIn OAuth to fetch profile photo from LinkedIn */}
            <button type="button" className="text-sm text-[#0D3B5E] underline">
              Upload from LinkedIn
            </button>
          </div>

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

          <button type="submit" className="bg-[#007CA6] px-5 py-2 w-full rounded font-semibold mt-2">
            Next
          </button>
        </form>
      </Card>
    </PageLayout>
  )
}

export default NextPageMentor
