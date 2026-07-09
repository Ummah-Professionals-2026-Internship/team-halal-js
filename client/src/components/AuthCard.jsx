import React from 'react';

const AuthCard = ({ title, children }) => {
  return (
    <div
      className="relative z-10 w-full max-w-[627px] min-h-[643px] h-auto rounded-2xl box-border p-6 pb-10 flex flex-col items-center justify-center gap-8
        bg-[#F3EDED]/80 backdrop-blur-xl backdrop-saturate-150 border border-white/50
        shadow-[0_2px_6px_rgba(13,59,79,0.10),0_20px_45px_-10px_rgba(13,59,79,0.30)]"
    >
      <h2 className="text-3xl md:text-[40px] font-extrabold tracking-wide text-black text-center m-0 w-full leading-[44px] md:leading-[56px]">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default AuthCard;
