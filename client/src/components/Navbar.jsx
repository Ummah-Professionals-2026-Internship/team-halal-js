import React from 'react';
import logo from '../assets/logo.svg';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="logo-container">
        <img src={logo} className="navbar-logo" alt="Ummah Professionals Logo" />
      </div>
    </header>
  );
};

export default Navbar;
