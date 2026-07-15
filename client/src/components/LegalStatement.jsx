import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayoutDashboard from './PageLayoutDashboard'
import useCurrentUser from './useCurrentUser'
import logo from '../assets/logo.svg'

const LegalStatement = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useCurrentUser()
  const isLoggedIn = !!localStorage.getItem('token') && !!user?._id

  const handleBack = () => {
    navigate(-1)
  }

  const content = (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-left text-[#00212C]">
      <h1 className="text-2xl font-bold text-[#003F55] mb-4">Privacy Policy</h1>
      <p className="text-xs text-slate-400 mb-6">Last updated: July 14, 2026</p>
      
      <div className="flex flex-col gap-6 text-sm text-slate-600 leading-relaxed">
        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when creating a profile, scheduling a session, or communicating through our application. This includes your name, email address, timezone, profile picture, and phone number.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">2. How We Use Your Information</h2>
          <p>We use your information to operate, maintain, and provide the features of this mentorship platform. This includes facilitating bookings, sending scheduled calendar events, and sending notifications via email and text messages.</p>
        </section>

        <section className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
          <h2 className="font-bold text-[#003F55] text-base mb-2">3. SMS & Mobile Communications</h2>
          <p className="mb-2">If you opt in to receive text alerts (SMS or WhatsApp) from our application, you agree to receive automated messages at the phone number provided. Consent is not a condition of purchase or usage.</p>
          <p className="font-semibold text-slate-800 mt-2">Mobile phone numbers collected for the purpose of SMS notifications and opt-in consent will NOT be shared, sold, or rented to third-parties, affiliates, or partners for marketing or promotional purposes under any circumstances.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">4. Third-Party Integrations</h2>
          <p>Our app integrates with Google Calendar and Twilio to schedule sessions and send notifications. Your data is only shared with these platforms to fulfill these specific integration features.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">5. Your Choices</h2>
          <p>You can update your communication preferences or opt-out of SMS and email alerts at any time through your Notification Center page.</p>
        </section>

        <section className="pt-4 border-t flex justify-end">
          <button 
            onClick={handleBack}
            className="px-6 py-2 bg-[#003F55] text-white rounded font-bold shadow hover:bg-[#00212C] transition-colors cursor-pointer text-xs"
          >
            Go Back
          </button>
        </section>
      </div>
    </div>
  )

  if (isLoggedIn) {
    const userName = `${user.firstName} ${user.lastName}`
    const userRole = user.role === 'mentor' ? 'Mentor' : 'Mentee'
    return (
      <PageLayoutDashboard userName={userName} userRole={userRole} userPhoto={user.profilePicture} onPhotoUpdate={refreshUser} onBack={handleBack}>
        <div className="mt-4 pb-6">{content}</div>
      </PageLayoutDashboard>
    )
  }

  // Guest view layout
  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col items-center">
      <header className="w-full h-[126px] bg-gradient-to-b from-[#0c4a63] to-[#00303f] flex items-center px-[42px] box-border shadow-[0_4px_18px_rgba(0,0,0,0.25)] shrink-0">
        <img src={logo} className="h-[74px] w-auto object-contain cursor-pointer" alt="Ummah Professionals Logo" onClick={() => navigate('/login')} />
      </header>
      <div className="flex-1 w-full max-w-4xl px-4 py-8 overflow-y-auto">
        {content}
      </div>
    </div>
  )
}

export default LegalStatement
