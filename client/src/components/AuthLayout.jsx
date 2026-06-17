import React from 'react';
import Navbar from './Navbar';

const AuthLayout = ({ children }) => {
  return (
    <div className="w-screen min-h-screen flex flex-col bg-[#93D5E7] relative overflow-x-hidden">
      <Navbar />
      <main className="flex-1 flex justify-center items-center relative py-10 px-5 box-border">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
