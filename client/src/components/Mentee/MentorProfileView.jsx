import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageLayoutDashboard from '../PageLayoutDashboard'
import useCurrentUser from '../useCurrentUser'
import { MENTOR_SERVICES } from '../../constants/services'

const MentorProfileView = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user, refreshUser } = useCurrentUser()
  const mentor = state?.mentor

  if (!mentor) {
    navigate('/mentee-dashboard', { replace: true })
    return null
  }

  const userName = `${user.firstName} ${user.lastName}`
  const name = `${mentor.firstName} ${mentor.lastName}`
  const title = [mentor.mentorProfile?.jobTitle, mentor.mentorProfile?.employer].filter(Boolean).join(' at ')
  const education = [mentor.majors?.[0], mentor.university].filter(Boolean).join(' from ')
  const experience = [
    mentor.mentorProfile?.yearsOfProfExp ? `${mentor.mentorProfile.yearsOfProfExp} Years of Experience` : null,
    mentor.mentorProfile?.industry
  ].filter(Boolean).join(' | ')
  const topics = mentor.mentorProfile?.volunteeringFor || []

  return (
    <PageLayoutDashboard userName={userName} userRole="Mentee" userPhoto={user.profilePicture} onPhotoUpdate={refreshUser} onBack={() => navigate(-1)}>
      <div className="max-w-2xl mx-auto w-full pb-4">

        <div className="mb-6 mt-2">
          <div className="w-12 h-1.5 rounded-full bg-[#fdbb36] mb-3" />
          <h1 className="text-2xl font-bold text-[#00212C]">Mentor Profile</h1>
        </div>

        <div className="bg-[#C5DCE8] rounded-xl p-6 flex flex-col items-center">
          {mentor.profilePicture
            ? <img src={mentor.profilePicture} alt={name} className="w-24 h-24 rounded-full object-cover" />
            : <div className="w-24 h-24 rounded-full bg-gray-300" />
          }

          <p className="font-bold text-[#00212C] text-xl text-center mt-3">{name}</p>
          {title && <p className="text-sm text-[#00212C] text-center mt-1">{title}</p>}
          {education && <p className="text-sm text-[#00212C] text-center">({education})</p>}
          {experience && <p className="text-sm text-[#00212C] text-center mt-1">{experience}</p>}

          {topics.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {topics.map(id => {
                const service = MENTOR_SERVICES.find(s => s.id === id)
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 bg-[#fdbb36]/20 text-[#00212C] text-xs font-semibold px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#fdbb36]" />
                    {service?.label || id}
                  </span>
                )
              })}
            </div>
          )}

          {mentor.linkedinUrl && (
            <a
              href={/^https?:\/\//i.test(mentor.linkedinUrl) ? mentor.linkedinUrl : `https://${mentor.linkedinUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[#003F55] underline mt-3"
            >
              LinkedIn
            </a>
          )}

          {mentor.additionalInfo && (
            <div className="w-full mt-4">
              <p className="font-semibold text-[#00212C] text-sm text-center mb-1">{mentor.firstName}'s Bio:</p>
              <div className="bg-white rounded-lg p-3 text-sm text-[#00212C] whitespace-pre-wrap">{mentor.additionalInfo}</div>
            </div>
          )}
        </div>
      </div>
    </PageLayoutDashboard>
  )
}

export default MentorProfileView
