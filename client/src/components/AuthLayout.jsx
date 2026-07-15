import React from 'react';
import { Link } from 'react-router-dom';
import wordmark from '../assets/white-horizontal-C2p6e4w- 1.svg';
import heroPhoto from '../assets/background-pic.jpg';

const FEATURES = [
  'Personalized mentor matching',
  'Flexible, mentor-led scheduling',
  'Built for every career path',
];

const AuthLayout = ({ children }) => {
  return (
    <div className="w-screen min-h-screen flex flex-col md:flex-row relative overflow-x-hidden bg-[#00202b]">
      {/* Full-bleed hero photo, tinted with a navy-to-pale-blue duotone gradient
          so the brand colors stay in play instead of the raw photo colors */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroPhoto}
          alt=""
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00202b]/92 via-[#0c4a63]/78 to-[#93d5e7]/45" />
      </div>

      {/* Brand panel — content only; the shared photo+overlay shows through behind it */}
      <div className="relative z-10 md:w-[44%] lg:w-[40%] shrink-0 flex flex-col justify-between px-10 py-10 md:py-14 min-h-[280px] md:min-h-screen box-border">
        <Link to="/login" className="inline-block w-fit">
          <img src={wordmark} alt="Ummah Professionals" className="h-9 md:h-11 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]" />
        </Link>

        <div className="mt-8 md:mt-0">
          <h1 className="text-white text-3xl md:text-[40px] font-extrabold tracking-wide leading-tight mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            Where experience meets ambition.
          </h1>
          <p className="text-[#e3f3f8] text-base md:text-lg leading-relaxed max-w-md drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
            Ummah Professionals connects mentees with experienced mentors for real career guidance — one relationship at a time.
          </p>
        </div>

        <ul className="mt-10 hidden md:flex flex-col gap-3">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-white text-sm font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 shrink-0">
                <svg className="w-3 h-3 text-white" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Form panel */}
      <main className="relative z-10 flex-1 flex justify-center items-center py-10 px-5 box-border">
        <div className="w-full flex flex-col items-center gap-5">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
