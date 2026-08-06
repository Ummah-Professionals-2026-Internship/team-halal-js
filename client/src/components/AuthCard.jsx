import React from 'react';

const AuthCard = ({ title, children }) => {
  return (
    <div
      className="relative z-10 w-full max-w-[640px] h-auto rounded-3xl box-border p-6 sm:p-10 flex flex-col items-center justify-center gap-6
        bg-[#F3EDED]/85 backdrop-blur-xl backdrop-saturate-150 border border-white/60
        shadow-[0_4px_12px_rgba(13,59,79,0.12),0_24px_50px_-10px_rgba(13,59,79,0.32)]"
    >
      <h2 className="text-2xl sm:text-3xl md:text-[36px] font-extrabold tracking-tight text-slate-900 text-center m-0 w-full leading-tight">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default AuthCard;
