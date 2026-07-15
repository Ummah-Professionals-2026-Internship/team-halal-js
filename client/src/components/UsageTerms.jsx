import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayoutDashboard from './PageLayoutDashboard'
import useCurrentUser from './useCurrentUser'
import logo from '../assets/logo.svg'

const UsageTerms = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useCurrentUser()
  const isLoggedIn = !!localStorage.getItem('token') && !!user?._id

  const handleBack = () => {
    navigate(-1)
  }

  const content = (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-left text-[#00212C]">
      <h1 className="text-2xl font-bold text-[#003F55] mb-4">Terms of Use</h1>
      <p className="text-xs text-slate-400 mb-6">Last updated: July 14, 2026</p>
      
      <div className="flex flex-col gap-6 text-sm text-slate-600 leading-relaxed">
        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">1. Terms of Service</h2>
          <p>By accessing or using our mentorship application, you agree to comply with and be bound by these Terms of Use. If you do not agree to these terms, please do not use the application.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">2. Mentorship Integrity & Behavior</h2>
          <p>Our platform facilitates voluntary academic and career mentorship. All users (both Mentors and Mentees) must act professionally, respect scheduling agreements, and communicate in a respectful and honorable manner.</p>
        </section>

        <section className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
          <h2 className="font-bold text-[#003F55] text-base mb-2">3. SMS Terms & Conditions</h2>
          <p className="mb-2">When you opt in to receive text alerts (SMS or WhatsApp) from our application, the following terms apply:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1.5 mt-2">
            <li>You authorize the mentorship application to send automated booking alerts, cancellations, and calendar reminders.</li>
            <li>Message and data rates may apply depending on your mobile carrier plan.</li>
            <li>Message frequency will vary based on your session scheduling activity.</li>
            <li>You can unsubscribe from SMS alerts at any time by changing your preferences inside the Notification Center, or by replying <strong>STOP</strong> directly to any message.</li>
            <li>For help with text notifications, reply <strong>HELP</strong> to any message or visit our Support center.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">4. User Account & Security</h2>
          <p>You are responsible for maintaining the confidentiality of your credentials and account information. You agree to immediately notify us of any unauthorized use of your account.</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 text-base mb-2">5. Limitation of Liability</h2>
          <p>Our platform facilitates connections between Mentors and Mentees. We are not liable for the content, advice, or outcome of any mentorship session scheduled through the application.</p>
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

export default UsageTerms
