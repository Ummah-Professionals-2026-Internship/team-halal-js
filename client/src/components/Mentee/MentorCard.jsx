import React from 'react';
import CompatibilityRing from './CompatibilityRing';

const MentorCard = ({ mentor, bg, selected, onSchedule }) => {
  const name = `${mentor.firstName} ${mentor.lastName}`;
  const title = [mentor.mentorProfile?.jobTitle, mentor.mentorProfile?.employer]
    .filter(Boolean).join(' at ');
  const education = [mentor.majors?.[0], mentor.university]
    .filter(Boolean).join(' from ');
  const topics = mentor.volunteeringFor || [];

  return (
    <div className={`flex items-center gap-4 rounded-xl p-4 w-full ${bg} ${selected ? 'ring-2 ring-[#007CA6]' : ''}`}>
      <div className="flex flex-col items-center gap-1 shrink-0 w-20">
        {mentor.profilePicture
          ? <img src={mentor.profilePicture} alt={name} className="w-16 h-16 rounded-full object-cover" />
          : <div className="w-16 h-16 rounded-full bg-gray-300" />
        }
        <button className="text-xs text-[#003F55] underline">View Profile</button>
        {mentor.linkedinUrl && (
          <a href={mentor.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs text-[#003F55] underline">LinkedIn</a>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#00212C] text-base">{name}</p>
        {title && <p className="text-sm text-[#00212C]">{title}</p>}
        {education && <p className="text-sm text-[#00212C]">({education})</p>}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-1">
            {topics.map(topic => (
              <span key={topic} className="flex items-center gap-1 text-sm text-[#00212C]">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {typeof mentor.compatibilityScore === 'number' && (
        <div className="flex flex-col items-center gap-1 shrink-0">
          <CompatibilityRing score={mentor.compatibilityScore} />
          <span className="text-[10px] text-[#00212C] font-medium">Match</span>
        </div>
      )}

      <button
        onClick={() => onSchedule(mentor)}
        className="bg-[#003F55] text-white font-semibold px-5 py-2 rounded-lg text-sm shrink-0"
      >
        Schedule Meeting
      </button>
    </div>
  );
};

export default MentorCard;
