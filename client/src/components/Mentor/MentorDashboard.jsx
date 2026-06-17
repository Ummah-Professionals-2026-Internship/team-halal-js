import React, { useState, useEffect } from 'react';
import PageLayoutDashboard from '../PageLayoutDashboard';
import UpcomingSessions from '../UpcomingSessions/UpcomingSessions';
import MentorAvailabilityCard from './MentorAvailabilityCard';

const API = import.meta.env.VITE_API_URL || ''

const MentorDashboard = () => {
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`${API}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setUserName(`${data.firstName} ${data.lastName}`))
      .catch(() => {})
  }, [])

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentor">
      <h1 className="text-2xl font-bold text-center text-[#00212C] mb-6 mt-10">Dashboard</h1>
      <div className="flex items-start gap-6 w-full px-2">
        <MentorAvailabilityCard />
        <div className="flex-1 min-w-0">
          <UpcomingSessions />
        </div>
      </div>
    </PageLayoutDashboard>
  );
};

export default MentorDashboard;
