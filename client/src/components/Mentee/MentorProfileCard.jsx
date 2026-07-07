import React from 'react';

const MentorProfileCard = ({ mentor }) => {
  const name = `${mentor.firstName} ${mentor.lastName}`;
  const title = [mentor.mentorProfile?.jobTitle, mentor.mentorProfile?.employer]
    .filter(Boolean).join(' at ');
  const education = [mentor.majors?.[0], mentor.university]
    .filter(Boolean).join(' from ');
  const topics = mentor.volunteeringFor || [];

  return (
    <div className="flex flex-col items-center bg-[#C5DCE8] rounded-xl p-6 w-64 shrink-0">
      {mentor.profilePicture
        ? <img src={mentor.profilePicture} alt={name} className="w-24 h-24 rounded-full object-cover mb-3" />
        : <div className="w-24 h-24 rounded-full bg-gray-300 mb-3" />
      }

      <p className="font-bold text-[#00212C] text-base text-center">{name}</p>
      {title && <p className="text-sm text-[#00212C] text-center mt-1">{title}</p>}
      {education && <p className="text-sm text-[#00212C] text-center">({education})</p>}

      {topics.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {topics.map(topic => (
            <span key={topic} className="flex items-center gap-1 text-sm text-[#00212C]">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-1 mt-4">
        <button className="text-sm text-[#003F55] underline">View Profile</button>
        {mentor.linkedinUrl && (
          <a href={mentor.linkedinUrl} target="_blank" rel="noreferrer" className="text-sm text-[#003F55] underline">
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
};

export default MentorProfileCard;
