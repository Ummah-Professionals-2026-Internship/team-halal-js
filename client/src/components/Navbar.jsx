import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Navbar = () => {
  return (
    <header className="w-full h-[126px] bg-[#003F55] flex justify-between items-center px-[42px] box-border">
      <Link to="/login" className="flex items-center cursor-pointer">
        <img src={logo} className="h-[74px] w-auto object-contain" alt="Ummah Professionals Logo" />
      </Link>
    </header>
  );
};

export default Navbar;
