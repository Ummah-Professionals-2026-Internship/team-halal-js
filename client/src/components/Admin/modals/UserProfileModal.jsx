import React from 'react';

const UserProfileModal = ({ person, onClose }) => {
  const isMentor = person.role === 'mentor';
  const name = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() || 'Unnamed User';
  const initial = person.firstName?.[0]?.toUpperCase() ?? '?';
  const title = isMentor
    ? [person.mentorProfile?.jobTitle, person.mentorProfile?.employer].filter(Boolean).join(' at ')
    : person.menteeProfile?.academicStatus;
  const education = [person.majors?.[0], person.university].filter(Boolean).join(' from ');
  const experience = isMentor
    ? [
        person.mentorProfile?.yearsOfProfExp ? `${person.mentorProfile.yearsOfProfExp} Years of Experience` : null,
        person.mentorProfile?.industry
      ].filter(Boolean).join(' | ')
    : person.menteeProfile?.desiredCareer ? `Goal: ${person.menteeProfile.desiredCareer}` : '';
  const tags = isMentor ? (person.mentorProfile?.volunteeringFor || []) : (person.menteeProfile?.desiredServices || []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center gap-1 relative">
        <button onClick={onClose} className="absolute top-4 right-5 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>

        {person.profilePicture ? (
          <img src={person.profilePicture} alt={name} className="w-20 h-20 rounded-full object-cover mt-2" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#003F55] text-white flex items-center justify-center font-bold text-xl mt-2">
            {initial}
          </div>
        )}
        <p className="font-bold text-[#00212C] text-lg text-center mt-2">{name}</p>
        <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">{isMentor ? 'Mentor' : 'Mentee'}</p>
        {title && <p className="text-sm text-[#00212C] text-center mt-1">{title}</p>}
        {education && <p className="text-sm text-[#00212C] text-center">({education})</p>}
        {experience && <p className="text-sm text-[#00212C] text-center mt-1">{experience}</p>}

        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 bg-[#fdbb36]/20 text-[#00212C] text-xs font-semibold px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#fdbb36]" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {person.linkedinUrl && (
          <a
            href={/^https?:\/\//i.test(person.linkedinUrl) ? person.linkedinUrl : `https://${person.linkedinUrl}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[#003F55] underline mt-3"
          >
            LinkedIn
          </a>
        )}

        <p className="text-xs text-slate-400 mt-3">{person.email}</p>

        {person.additionalInfo && (
          <div className="w-full mt-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1.5">Bio</p>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-[#00212C] whitespace-pre-wrap w-full">
              {person.additionalInfo}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="bg-[#003F55] text-white font-semibold py-2 rounded-lg text-sm w-full mt-5"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UserProfileModal;
