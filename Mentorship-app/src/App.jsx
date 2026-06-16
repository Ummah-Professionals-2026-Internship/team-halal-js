import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MentorMenteeProfile from './MentorMenteeProfile'
import MentorInfoForm from './components/Mentor/MentorInfoForm'
import MenteeInfoForm from './components/Mentee/MenteeInfoForm'
import NextPageMentee from './components/Mentee/NextPageMentee'
import NextPageMentor from './components/Mentor/NextPageMentor'
import MentorAvailabilityForm from './components/Mentor/MentorAvailabilityForm'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MentorMenteeProfile />} />

      <Route path="/mentor-info" element={<MentorInfoForm />} />
      <Route path="/mentee-info" element={<MenteeInfoForm />} />
      <Route path="/nextpageMentee" element={<NextPageMentee />} />
      <Route path="/nextpageMentor" element={<NextPageMentor />} />
      <Route path="/mentor-availability" element={<MentorAvailabilityForm />} />
    </Routes>
  )
}

export default App