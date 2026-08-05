import { MENTOR_SERVICES } from '../../constants/services';

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
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center w-full">
      {recommended && (
        <span className="self-start inline-flex items-center gap-1 bg-[#fdbb36]/20 text-[#00212C] text-xs font-semibold px-2 py-0.5 rounded-full mb-3">
          ★ Recommended
        </span>
      )}

      {mentor.profilePicture
        ? <img src={mentor.profilePicture} alt={name} className="w-24 h-24 rounded-full object-cover" />
        : <div className="w-24 h-24 rounded-full bg-[#003F55] text-white flex items-center justify-center font-bold text-2xl">{name?.[0]?.toUpperCase() ?? '?'}</div>
      }

      <p className="font-bold text-[#00212C] text-xl text-center mt-3">{name}</p>
      {title && <p className="text-sm text-[#00212C] text-center mt-1">{title}</p>}
      {education && <p className="text-sm text-[#00212C] text-center">({education})</p>}
      {experience && <p className="text-sm text-[#00212C] text-center mt-1">{experience}</p>}

      {topics.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {topics.map(id => {
            const service = MENTOR_SERVICES.find(s => s.id === id);
            return (
              <span key={id} className="inline-flex items-center gap-1.5 bg-[#fdbb36]/20 text-[#00212C] text-xs font-semibold px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#fdbb36]" />
                {service?.label || id}
              </span>
            );
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
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1.5">{mentor.firstName}'s Bio</p>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-[#00212C] whitespace-pre-wrap max-h-32 overflow-y-auto">{mentor.additionalInfo}</div>
        </div>
      )}
    </div>
  );
};

export default MentorProfileCard;
