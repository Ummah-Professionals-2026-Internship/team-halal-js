import React from 'react';

const AuthCard = ({ title, children }) => {
  return (
    <div className="w-[90%] max-w-[627px] min-h-[643px] h-auto bg-[#F3EDED] shadow-[0px_4px_4px_rgba(206,196,178,0.50)] rounded-[12px] box-border p-6 pb-10 flex flex-col items-center justify-center gap-8 md:w-[627px]">
      <h2 className="text-3xl md:text-[40px] font-bold text-black text-center m-0 w-full leading-[44px] md:leading-[56px]">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default AuthCard;
