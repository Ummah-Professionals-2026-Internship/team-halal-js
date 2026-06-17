import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'
import SearchableSelect from '../SearchableSelect'
import { MAJORS_LIST, UNIVERSITIES_LIST } from '../../constants/lists'

const API = import.meta.env.VITE_API_URL || ''

const MenteeAcademicSetup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    university: '',
    majors: '',
    academicStatus: '',
    desiredCareer: '',
    calendarAccess: false,
    profilePicture: null,
    additionalInfo: '',
  })
  const [loading, setLoading] = useState(false)

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
    if (loading) return
    setLoading(true)

    const oldData = JSON.parse(localStorage.getItem('menteeStep1')) || {}
    const pictureName = formData.profilePicture ? formData.profilePicture.name : null
    const toSave = {
      ...oldData,
      ...formData,
      profilePicture: pictureName,
    }

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(API + '/api/mentees', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(toSave),
      })

      if (response.ok) {
        localStorage.removeItem('menteeStep1')
        navigate('/mentee-dashboard')
      } else {
        alert('Failed to save profile')
        setLoading(false)
      }
    } catch (error) {
      alert('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <PageLayout onBack={() => navigate(-1)}>
      <Card title="Finalize Mentee Profile">
        <form onSubmit={handleSubmit} className="w-full text-left">

          <SearchableSelect
            label="University / Institution"
            name="university"
            value={formData.university}
            options={UNIVERSITIES_LIST}
            placeholder="Type to search university..."
            onChange={handleChange}
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

          <label className="block mb-1">Current Academic Year</label>
          <select
            name="academicStatus"
            value={formData.academicStatus}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
            required
          >
            <option value=""></option>
            <option value="Freshman (Year 1)">Freshman (Year 1)</option>
            <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
            <option value="Junior (Year 3)">Junior (Year 3)</option>
            <option value="Senior (Year 4)">Senior (Year 4)</option>
            <option value="Graduate Student">Graduate Student</option>
            <option value="Not in College (Working)">Not in College (Working)</option>
            <option value="Internship">Internship</option>
            <option value="Other">Other</option>
          </select>
          
          <label className="block mb-1">Desired Future Career</label>
          <input
            name="desiredCareer"
            type="text"
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
            value={formData.desiredCareer}
            onChange={handleChange}
            required
          />



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
            <p className="text-gray-400 text-xs mt-1">This helps schedule mentorship sessions more effectively</p>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm">Upload a Profile Picture?</label>
            <label className="cursor-pointer text-sm text-[#0D3B5E] underline">
              Upload
              <input name="profilePicture" type="file" accept="image/*" className="hidden" onChange={handleChange} />
            </label>
          </div>

          <label className="block mb-1 text-sm text-center">Any additional information you would like to share with mentors?</label>
          <textarea
            name="additionalInfo"
            className="border border-gray-300 rounded px-3 py-1.5 w-full mb-3 text-sm bg-white"
            rows={4}
            value={formData.additionalInfo}
            onChange={handleChange}
          />

          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#007CA6] text-white px-5 py-2 w-full rounded font-semibold mt-2 disabled:opacity-50"
          >
            {loading ? 'Saving Profile...' : 'Start Matching'}
          </button>
        </form>
      </Card>
    </PageLayout>
  )
}

export default MenteeAcademicSetup
