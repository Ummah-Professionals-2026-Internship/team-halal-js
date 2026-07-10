import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../PageLayout'
import Card from '../Card'
import SearchableSelect from '../SearchableSelect'
import { INDUSTRIES_LIST } from '../../constants/lists'

const inputClass = "border border-slate-200 rounded-lg px-3 py-2 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#007CA6]/20 focus:border-[#007CA6] transition-colors"
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

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
    <PageLayout onBack={() => navigate('/mentor/profile-setup')} backVariant="accent">
      <Card>
        <div className="w-full text-left">

          {/* Brand accent */}
          <div className="w-10 h-1.5 rounded-full bg-[#fdbb36] mx-auto mb-4" />

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  s < 2
                    ? 'bg-emerald-500 text-white'
                    : s === 2
                    ? 'bg-[#007CA6] text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {s < 2 ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                {s < 3 && (
                  <div className={`w-10 h-0.5 rounded-full ${s < 2 ? 'bg-emerald-300' : 'bg-slate-100'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center mb-5">Step 2 of 3 — Career Details</p>
          <h2 className="text-xl font-bold text-slate-800 text-center mb-5">Your Career Background</h2>

          <form onSubmit={handleSubmit} className="w-full">

            <div className="mb-4">
              <label className={labelClass}>Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                className={inputClass}
                required
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>Employer</label>
              <input
                type="text"
                name="employer"
                value={formData.employer}
                onChange={handleChange}
                placeholder="e.g. Google"
                className={inputClass}
                required
              />
            </div>

            <SearchableSelect
              label="Industry"
              name="industry"
              value={formData.industry}
              options={INDUSTRIES_LIST}
              placeholder="Type to search industry..."
              onChange={handleChange}
              required
            />

            <div className="mb-4">
              <label className={labelClass}>Years of Professional Experience</label>
              <input
                type="number"
                name="yearsOfProfExp"
                min="0"
                value={formData.yearsOfProfExp}
                onChange={handleChange}
                placeholder="e.g. 5"
                className={inputClass}
                required
              />
            </div>

            <div className="mb-5">
              <label className={labelClass}>Anything else you'd like mentees to know?</label>
              <textarea
                name="additionalInfo"
                className={`${inputClass} resize-none`}
                rows={4}
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Share your goals, areas of expertise, or what you hope to offer..."
              />
            </div>

            <button
              type="submit"
              className="bg-[#007CA6] hover:bg-[#006080] text-white w-full py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              Next: Set Availability
            </button>
          </form>
        </div>
      </Card>
    </PageLayout>
  )
}

export default MentorCareerSetup
