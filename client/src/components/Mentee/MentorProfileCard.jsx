import React from 'react';

const MentorProfileCard = ({ mentor, recommended }) => {
  const name = `${mentor.firstName} ${mentor.lastName}`;
  const title = [mentor.mentorProfile?.jobTitle, mentor.mentorProfile?.employer]
    .filter(Boolean).join(' at ');
  const education = [mentor.majors?.[0], mentor.university]
    .filter(Boolean).join(' from ');
  const experience = [
    mentor.mentorProfile?.yearsOfProfExp ? `${mentor.mentorProfile.yearsOfProfExp} Years of Experience` : null,
    mentor.mentorProfile?.industry
  ].filter(Boolean).join(' | ');
  const topics = mentor.mentorProfile?.volunteeringFor || [];

  return (
    <div className="flex flex-col items-center bg-[#C5DCE8] rounded-xl p-6 w-64 shrink-0">
      {recommended && (
        <span className="self-start inline-flex items-center gap-1 bg-[#fdbb36]/20 text-[#00212C] text-xs font-semibold px-2 py-0.5 rounded-full mb-3">
          ★ Recommended
        </span>
      )}

      {mentor.profilePicture
        ? <img src={mentor.profilePicture} alt={name} className="w-24 h-24 rounded-full object-cover mb-3" />
        : <div className="w-24 h-24 rounded-full bg-gray-300 mb-3" />
      }

      <p className="font-bold text-[#00212C] text-base text-center">{name}</p>
      {title && <p className="text-sm text-[#00212C] text-center mt-1">{title}</p>}
      {education && <p className="text-sm text-[#00212C] text-center">({education})</p>}
      {experience && <p className="text-sm text-[#00212C] text-center mt-1">{experience}</p>}

      {mentor.additionalInfo && (
        <div className="w-full mt-3">
          <p className="font-semibold text-[#00212C] text-sm text-center mb-1">{mentor.firstName}'s Bio:</p>
          <div className="bg-white rounded-lg p-2 text-xs text-[#00212C]">{mentor.additionalInfo}</div>
        </div>
      )}

      {mentor.linkedinUrl && (
        <a href={mentor.linkedinUrl} target="_blank" rel="noreferrer" className="text-sm text-[#003F55] underline mt-3">
          LinkedIn
        </a>
      )}

      {topics.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {topics.map(topic => (
            <span key={topic} className="inline-flex items-center gap-1.5 bg-[#fdbb36]/15 text-[#00212C] text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#fdbb36]" />
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorProfileCard;
