import React from 'react';
import { NAV_ITEMS } from '../adminUtils';

const NAV_ICONS = {
  'Dashboard': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  'Feedback': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  'Help Requests': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'Sessions': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

const PeopleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
  </svg>
);

const Gauge = ({ value, label, color }) => {
  const numeric = value === '—' ? 0 : Number(value);
  const pct = Math.max(0, Math.min(100, (numeric / 5) * 100));

  return (
    <div className="flex flex-col items-center gap-2 2xl:gap-3">
      <div
        className="w-20 h-20 2xl:w-28 2xl:h-28 3xl:w-36 3xl:h-36 rounded-full flex items-center justify-center transition-all"
        style={{ background: `conic-gradient(${color} ${pct}%, #eef2f6 ${pct}%)` }}
      >
        <div className="w-17 h-17 2xl:w-24 2xl:h-24 3xl:w-31 3xl:h-31 rounded-full bg-white flex flex-col items-center justify-center leading-none">
          <span className="text-xl 2xl:text-3xl 3xl:text-4xl font-extrabold text-[#00212C]">{value}</span>
          <span className="text-[9px] 2xl:text-xs 3xl:text-sm font-semibold text-slate-400 mt-0.5">out of 5</span>
        </div>
      </div>
      <span className="text-sm 2xl:text-lg 3xl:text-xl font-semibold text-slate-600">{label}</span>
    </div>
  );
};

const AdminSidebar = ({ activeNav, onNavChange, mentorCount, menteeCount, sessionAnalytics }) => (
  <aside className="w-56 2xl:w-72 3xl:w-84 shrink-0 flex flex-col gap-6 2xl:gap-8">
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 2xl:p-6 3xl:p-8">
      <p className="text-xs 2xl:text-sm 3xl:text-base font-bold text-slate-400 uppercase tracking-wider mb-3 2xl:mb-4 px-1">Go To</p>
      <nav className="flex flex-col gap-1 2xl:gap-2">
        {NAV_ITEMS.map(item => (
          <button
            key={item}
            onClick={() => onNavChange(item)}
            className={`flex items-center gap-2.5 2xl:gap-3.5 text-left px-3 2xl:px-4.5 3xl:px-6 py-2.5 2xl:py-3.5 3xl:py-4 rounded-lg 2xl:rounded-xl text-sm 2xl:text-base 3xl:text-lg font-semibold transition-colors ${
              activeNav === item
                ? 'bg-[#fdbb36] text-[#00212C]'
                : 'text-[#00212C] hover:bg-slate-100'
            }`}
          >
            <span className="[&>svg]:w-4 [&>svg]:h-4 [&>svg]:2xl:w-5 [&>svg]:2xl:h-5 [&>svg]:3xl:w-6 [&>svg]:3xl:h-6">
              {NAV_ICONS[item]}
            </span>
            {item}
          </button>
        ))}
        <button
          onClick={() => onNavChange('Mentors')}
          className={`flex items-center justify-between px-3 2xl:px-4.5 3xl:px-6 py-2.5 2xl:py-3.5 3xl:py-4 rounded-lg 2xl:rounded-xl text-sm 2xl:text-base 3xl:text-lg font-semibold transition-colors ${
            activeNav === 'Mentors' ? 'bg-[#fdbb36] text-[#00212C]' : 'text-[#00212C] hover:bg-slate-100'
          }`}
        >
          <span className="flex items-center gap-2.5 2xl:gap-3.5 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:2xl:w-5 [&>svg]:2xl:h-5 [&>svg]:3xl:w-6 [&>svg]:3xl:h-6">
            <PeopleIcon />Mentors
          </span>
          <span className={`text-xs 2xl:text-sm font-bold rounded-full px-2 2xl:px-3 py-0.5 ${activeNav === 'Mentors' ? 'bg-white/50' : 'bg-slate-100 text-slate-500'}`}>{mentorCount}</span>
        </button>
        <button
          onClick={() => onNavChange('Mentees')}
          className={`flex items-center justify-between px-3 2xl:px-4.5 3xl:px-6 py-2.5 2xl:py-3.5 3xl:py-4 rounded-lg 2xl:rounded-xl text-sm 2xl:text-base 3xl:text-lg font-semibold transition-colors ${
            activeNav === 'Mentees' ? 'bg-[#fdbb36] text-[#00212C]' : 'text-[#00212C] hover:bg-slate-100'
          }`}
        >
          <span className="flex items-center gap-2.5 2xl:gap-3.5 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:2xl:w-5 [&>svg]:2xl:h-5 [&>svg]:3xl:w-6 [&>svg]:3xl:h-6">
            <PeopleIcon />Mentees
          </span>
          <span className={`text-xs 2xl:text-sm font-bold rounded-full px-2 2xl:px-3 py-0.5 ${activeNav === 'Mentees' ? 'bg-white/50' : 'bg-slate-100 text-slate-500'}`}>{menteeCount}</span>
        </button>
      </nav>
    </div>

    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 2xl:p-7 3xl:p-9">
      <p className="text-sm 2xl:text-lg 3xl:text-xl font-bold text-[#00212C] mb-4 2xl:mb-6">Session Analytics</p>
      <div className="flex flex-col gap-6 2xl:gap-8 items-center">
        <Gauge value={sessionAnalytics.quality ?? '—'} label="Quality" color="#007CA6" />
        <Gauge value={sessionAnalytics.usefulness ?? '—'} label="Usefulness" color="#22b573" />
      </div>
    </div>
  </aside>
);

export default AdminSidebar;
