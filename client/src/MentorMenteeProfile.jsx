import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from './components/PageLayout'
import Card from './components/Card'

const MentorMenteeProfile = () => {
  const [role, setRole] = useState('')
  const navigate = useNavigate()

  return (
    <PageLayout onBack={() => navigate('/')}>
      <Card title="Are you a professional looking to mentor or a student seeking mentorship?">
        <div className="flex flex-col w-full gap-4">
          <button
            onClick={() => navigate('/mentor/profile-setup')}
            className="bg-[#007CA6] px-5 py-4 w-full rounded font-semibold"
          >
            Mentor
          </button>
          <button
            onClick={() => navigate('/mentee/profile-setup')}
            className="bg-[#007CA6] px-5 py-4 w-full rounded font-semibold"
          >
            Mentee
          </button>
        </div>
      </Card>
    </PageLayout>
  )
}

export default MentorMenteeProfile
