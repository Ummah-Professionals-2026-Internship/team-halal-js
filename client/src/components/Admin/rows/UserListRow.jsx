import React from 'react';

const UserListRow = ({ person, onView }) => {
  const name = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() || 'Unnamed User';
  const initial = person.firstName?.[0]?.toUpperCase() ?? '?';
  const subtitle = person.role === 'mentor'
    ? [person.mentorProfile?.jobTitle, person.mentorProfile?.employer].filter(Boolean).join(' at ')
      || [person.majors?.[0], person.university].filter(Boolean).join(' from ')
    : [person.menteeProfile?.academicStatus, person.university].filter(Boolean).join(' at ')
      || (person.majors?.[0] ? `Studying ${person.majors[0]}` : '');

  return (
    <div className="flex items-center justify-between gap-4 px-6 2xl:px-8 py-4 2xl:py-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors">
      <div className="flex items-center gap-3 2xl:gap-4.5 min-w-0">
        {person.profilePicture ? (
          <img src={person.profilePicture} alt={name} className="w-11 h-11 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-11 h-11 2xl:w-14 2xl:h-14 3xl:w-16 3xl:h-16 rounded-full bg-[#003F55] text-white flex items-center justify-center font-bold text-base 2xl:text-xl 3xl:text-2xl shrink-0">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-bold text-[#00212C] text-sm 2xl:text-base 3xl:text-lg truncate">{name}</p>
          {subtitle && <p className="text-xs 2xl:text-sm 3xl:text-base text-slate-500 truncate">{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={() => onView(person)}
        className="shrink-0 bg-[#fdbb36] text-[#00212C] font-semibold text-sm 2xl:text-base 3xl:text-lg px-5 2xl:px-7 py-2 2xl:py-3 rounded-lg 2xl:rounded-xl hover:brightness-95 transition"
      >
        View
      </button>
    </div>
  );
};

export default UserListRow;
