import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'

const API = import.meta.env.VITE_API_URL

const NextPageMentee = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    desiredIndustry: '',
    desiredCareer: '',
    lookingFor: '',
    calendarAccess: false,
    profilePicture: null,
    referralSource: '',
    additionalInfo: '',
  })

  const handleChange = (e) => {
    const { name, type, value, checked, files } = e.target
    let newValue = value
    if (type === 'checkbox') newValue = checked
    if (type === 'file') newValue = files[0]
    setFormData(function(prev) {
      return { ...prev, [name]: newValue }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const oldData = JSON.parse(localStorage.getItem('menteeStep1')) || {}
    // TODO: upload image to cloud storage and store the returned URL instead of just the filename
    const pictureName = formData.profilePicture ? formData.profilePicture.name : null
    const toSave = {
      ...oldData,
      ...formData,
      profilePicture: pictureName,
    }

    try {
      const response = await fetch(API + '/api/mentees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      })

      if (response.ok) {
        localStorage.removeItem('menteeStep1')
        alert('Profile saved successfully!')
      } else {
        alert('Failed to save profile')
      }
    } catch (error) {
      alert('Something went wrong')
    }
  }

  return (
    <PageLayout onBack={() => navigate(-1)}>
      <Card title="Finalize Mentee Profile">
        <form onSubmit={handleSubmit} className="w-full text-left">
          <label className="block mb-1">Desired Industry</label>
          <input
            name="desiredIndustry"
            type="text"
            
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            value={formData.desiredIndustry}
            onChange={handleChange}
          />

          <label className="block mb-1">Desired Future Career</label>
          <input
            name="desiredCareer"
            type="text"
            
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            value={formData.desiredCareer}
            onChange={handleChange}
          />

          <div className="flex justify-between mb-3">
            <div className="w-40">
              <label className="block mb-1">Looking For</label>
              <select
                name="lookingFor"
                value={formData.lookingFor}
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
          
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <label htmlFor="calendarAccess" className="text-sm">Allow Google Calendar Access?</label>
              <input
                name="calendarAccess"
                type="checkbox"
                id="calendarAccess"
                className="w-4 h-4 accent-gray-400"
                checked={formData.calendarAccess}
                onChange={handleChange}
              />
            </div>
            <p className="text-gray-400 text-xs mt-1">This helps schedule mentorships sessions more effectively</p>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm">Upload a Profile Picture?</label>
            <label className="cursor-pointer text-sm text-[#0D3B5E] underline">
              Upload
              <input name="profilePicture" type="file" accept="image/*" className="hidden" onChange={handleChange} />
            </label>
          </div>

          <label className="block mb-1">How did you hear about this service?</label>
          <select
            name="referralSource"
            value={formData.referralSource}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
          >
            <option value=""></option>
            <option value="Social Media">Social Media</option>
            <option value="Friend or Family">Friend or Family</option>

          </select>

          <label className="block mb-1 text-sm text-center">Any additional information you would like to share with mentors?</label>
          <textarea
            name="additionalInfo"
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm"
            rows={4}
            value={formData.additionalInfo}
            onChange={handleChange}
          />

          <button type="submit" className="bg-[#007CA6] text-white px-5 py-2 w-full rounded font-semibold mt-2">
            Start Matching
          </button>
        </form>
      </Card>
    </PageLayout>
  )
}

export default NextPageMentee
