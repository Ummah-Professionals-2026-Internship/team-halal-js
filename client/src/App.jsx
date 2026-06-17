import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import MentorMenteeProfile from './MentorMenteeProfile';
import MentorInfoForm from './components/Mentor/MentorInfoForm';
import NextPageMentor from './components/Mentor/NextPageMentor';
import MentorAvailabilityForm from './components/Mentor/MentorAvailabilityForm';
import MenteeInfoForm from './components/Mentee/MenteeInfoForm';
import NextPageMentee from './components/Mentee/NextPageMentee';
import MentorDashboard from './components/Mentor/MentorDashboard';
import MenteeDashboard from './components/Mentee/MenteeDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Profile Wizard Routes */}
        <Route path="/create-profile" element={<MentorMenteeProfile />} />
        <Route path="/mentor-info" element={<MentorInfoForm />} />
        <Route path="/nextpageMentor" element={<NextPageMentor />} />
        <Route path="/mentor-availability" element={<MentorAvailabilityForm />} />
        <Route path="/mentee-info" element={<MenteeInfoForm />} />
        <Route path="/nextpageMentee" element={<NextPageMentee />} />
        
        {/* Dashboard Routes */}
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        <Route path="/mentee-dashboard" element={<MenteeDashboard />} />

        {/* Redirect any other path to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
