import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Navbar = ({ userName, userRole, userPhoto }) => {
  return (
    <header className="w-full h-[126px] bg-[#003F55] flex justify-between items-center px-[42px] box-border">
      <Link to="/login" className="flex items-center cursor-pointer">
        <img src={logo} className="h-[74px] w-auto object-contain" alt="Ummah Professionals Logo" />
      </Link>
      {userName && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white font-semibold text-base">
              {userName} · {userRole}
            </p>
            <p className="text-[#8ACBDB] text-sm cursor-pointer hover:underline">View Profile</p>
          </div>
          {userPhoto
            ? <img src={userPhoto} alt={userName} className="w-12 h-12 rounded-full object-cover shrink-0" />
            : <div className="w-12 h-12 rounded-full bg-gray-400 shrink-0 flex items-center justify-center text-white text-lg font-bold">
                {userName?.[0] ?? '?'}
              </div>
          }
        </div>
      )}
    </header>
  );
};

export default Navbar;
