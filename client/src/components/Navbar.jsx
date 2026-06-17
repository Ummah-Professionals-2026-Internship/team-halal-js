import React from 'react';
import logo from '../assets/logo.svg';

const Navbar = () => {
  return (
    <header className="w-full h-[126px] bg-[#003F55] flex justify-between items-center px-[42px] box-border">
      <div className="flex items-center">
        <img src={logo} className="h-[74px] w-auto object-contain" alt="Ummah Professionals Logo" />
      </div>
    </header>
  );
};

export default Navbar;
