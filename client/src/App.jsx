import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import MentorMenteeProfile from './MentorMenteeProfile';
import MentorProfileSetup from './components/Mentor/MentorProfileSetup';
import MentorCareerSetup from './components/Mentor/MentorCareerSetup';
import MentorAvailabilitySetup from './components/Mentor/MentorAvailabilitySetup';
import MenteeProfileSetup from './components/Mentee/MenteeProfileSetup';
import MenteeAcademicSetup from './components/Mentee/MenteeAcademicSetup';
import MentorDashboard from './components/Mentor/MentorDashboard';
import MenteeDashboard from './components/Mentee/MenteeDashboard';
import MenteeSchedulePage from './components/Mentee/MenteeSchedulePage';
import MenteeBooking from './components/Mentee/MenteeBooking';
import MenteeSessionsDashboard from './components/Mentee/MenteeSessionsDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Profile Wizard Routes */}
        <Route path="/create-profile" element={<MentorMenteeProfile />} />
        <Route path="/mentor/profile-setup" element={<MentorProfileSetup />} />
        <Route path="/mentor/career-setup" element={<MentorCareerSetup />} />
        <Route path="/mentor/availability-setup" element={<MentorAvailabilitySetup />} />
        <Route path="/mentee/profile-setup" element={<MenteeProfileSetup />} />
        <Route path="/mentee/academic-setup" element={<MenteeAcademicSetup />} />
        
        {/* Dashboard Routes */}
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        <Route path="/mentee-dashboard" element={<MenteeDashboard />} />
        <Route path="/mentee/schedule" element={<MenteeSchedulePage />} />
        <Route path="/mentee/booking" element={<MenteeBooking />} />
        <Route path="/mentee/sessions" element={<MenteeSessionsDashboard />} />

        {/* Redirect any other path to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
