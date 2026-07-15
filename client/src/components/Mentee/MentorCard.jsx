import React from 'react';
import { useNavigate } from 'react-router-dom';

const MentorCard = ({ mentor, bg, recommended, onSchedule }) => {
  const navigate = useNavigate();
  const name = `${mentor.firstName} ${mentor.lastName}`;
  const title = [mentor.mentorProfile?.jobTitle, mentor.mentorProfile?.employer]
    .filter(Boolean).join(' at ');
  const education = [mentor.majors?.[0], mentor.university]
    .filter(Boolean).join(' from ');
  const topics = mentor.mentorProfile?.volunteeringFor || [];

  return (
    <div className={`flex items-center gap-4 rounded-xl p-4 w-full ${bg}`}>
      {mentor.profilePicture
        ? <img src={mentor.profilePicture} alt={name} className="w-16 h-16 rounded-full object-cover shrink-0" />
        : <div className="w-16 h-16 rounded-full bg-gray-300 shrink-0" />
      }

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-[#00212C] text-base">{name}</p>
          {recommended && (
            <span className="inline-flex items-center gap-1 bg-[#fdbb36]/20 text-[#00212C] text-xs font-semibold px-2 py-0.5 rounded-full">
              ★ Recommended
            </span>
          )}
        </div>
        {title && <p className="text-sm text-[#00212C]">{title}</p>}
        {education && <p className="text-sm text-[#00212C]">({education})</p>}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {topics.map(topic => (
              <span key={topic} className="inline-flex items-center gap-1.5 bg-[#fdbb36]/15 text-[#00212C] text-xs font-semibold px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#fdbb36]" />
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="flex flex-col text-sm items-end">
          <button onClick={() => navigate('/mentee/mentor-profile', { state: { mentor } })} className="text-[#003F55] underline">View Profile</button>
          {mentor.linkedinUrl && (
            <a
              href={/^https?:\/\//i.test(mentor.linkedinUrl) ? mentor.linkedinUrl : `https://${mentor.linkedinUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#003F55] underline"
            >
              LinkedIn
            </a>
          )}
        </div>
        <button
          onClick={() => onSchedule(mentor, recommended)}
          className="bg-[#003F55] text-white font-semibold px-5 py-2 rounded-lg text-sm shrink-0"
        >
          Schedule Meeting
        </button>
      </div>
    </div>
  );
};

export default MentorCard;
